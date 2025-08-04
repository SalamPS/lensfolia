from __future__ import annotations

import json
import os
from dataclasses import dataclass, field, fields
from typing import Dict, List, Literal, cast, Annotated, Any, Callable, Optional, Sequence
from typing_extensions import Annotated
import base64

from langchain_core.runnables import ensure_config
from langchain.chat_models import init_chat_model
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage, AIMessage, AnyMessage, HumanMessage
from langchain_core.tools import tool
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_tavily import TavilySearch
from supabase.client import Client, create_client
from pydantic import BaseModel, Field

from langgraph.config import get_config
from langgraph.graph import StateGraph, add_messages, END, START
from langgraph.prebuilt import ToolNode, create_react_agent
from langgraph.managed import IsLastStep
from langgraph.types import Command

from datetime import UTC, datetime
from agent.pipeline import DetectionPipeline

from dotenv import load_dotenv

load_dotenv()

# Configuration
class Config:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") 
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    PRODUCT_COLLECTION_NAME = "lensfolia_collection"
    EMBEDDING_MODEL = "models/gemini-embedding-001"

# Initialize services
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY)
embeddings = GoogleGenerativeAIEmbeddings(
    api_key=Config.GOOGLE_API_KEY,
    model=Config.EMBEDDING_MODEL
)
vector_store = SupabaseVectorStore(
    client=supabase,
    embedding=embeddings,
    table_name="documents",
    query_name="match_documents",
)

# System prompts
IMAGE_ANALYSIS_PROMPT = """You are an expert plant pathologist. Analyze the provided image and determine:

1. Is this a plant leaf image?
2. If yes, does the leaf show signs of disease or damage?
3. If diseased, describe the visible symptoms in detail (spots, discoloration, patterns, etc.)
4. What plant type do you think this might be?
5. What potential diseases could cause these symptoms?

Be specific about visual symptoms you observe. Current time: {system_time}"""

QUERY_GENERATION_PROMPT = """You are an expert at generating search queries for plant disease information.
Generate a precise search query to find relevant information about: {topic}

Focus on: {focus_area}

Return only the search query, nothing else."""

RAG_SYSTEM_PROMPTS = {
    "overview": """You are a plant disease expert. Based on the retrieved information, provide a comprehensive overview of the detected plant disease including:
    - Disease identification and confirmation
    - Symptoms description
    - Causes and conditions that promote the disease
    - Affected plant parts
    - Disease progression
    
    Be thorough and scientific in your explanation.""",
    
    "treatment": """You are a plant treatment specialist. Based on the retrieved information, provide detailed treatment recommendations including:
    - Immediate treatment steps
    - Cultural practices to control the disease
    - Preventive measures
    - Application timing and methods
    - Safety considerations
    
    Focus on practical, actionable advice.""",
    
    "product": """You are a plant care product specialist. Based on the retrieved information, recommend specific products for treating the identified disease including:
    - Product names and active ingredients
    - Application instructions
    - Dosage and frequency
    - Product images (ALWAYS include image links from the retrieved documents)
    - Where to purchase or availability
    
    IMPORTANT: Always include product image links in your response when available in the retrieved documents."""
}

@dataclass(kw_only=True)
class Configuration:
    """The configuration for the agent."""
    
    model: Annotated[str, {"__template_metadata__": {"kind": "llm"}}] = field(
        default="google_genai/gemini-2.5-flash",
        metadata={"description": "The name of the language model to use."},
    )

    @classmethod
    def from_context(cls) -> Configuration:
        """Create a Configuration instance from a RunnableConfig object."""
        try:
            config = get_config()
        except RuntimeError:
            config = None
        config = ensure_config(config)
        configurable = config.get("configurable") or {}
        _fields = {f.name for f in fields(cls) if f.init}
        return cls(**{k: v for k, v in configurable.items() if k in _fields})

# Pydantic models for structured output
class PlantDiseaseResponse(BaseModel):
    """Final structured response for plant disease detection"""
    
    is_plant_leaf: bool = Field(description="Whether the image contains a plant leaf")
    has_disease: bool = Field(description="Whether disease was detected on the leaf")
    plant_type: str = Field(description="Identified plant type or 'Unknown'")
    disease_name: str = Field(description="Identified disease name or 'None detected'")
    confidence_score: float = Field(description="Overall confidence in the diagnosis (0-1)")
    
    # Detection results
    total_detections: int = Field(description="Number of objects detected")
    top_predictions: List[Dict] = Field(description="Top predictions for each detected object")
    cropped_images: List[Dict] = Field(description="Cropped images with base64 data and classification", default_factory=list)
    
    # Analysis results
    image_analysis: str = Field(description="Initial image analysis results")
    overview: str = Field(description="Disease overview and information")
    treatment: str = Field(description="Treatment recommendations")
    products: str = Field(description="Recommended products with image links")
    
    # Metadata
    processed_at: str = Field(description="Processing timestamp")
    annotated_image: str = Field(description="Base64 encoded annotated image", default="")

# Tools
@tool
def plant_disease_detection(image_url: str) -> dict:
    """Detect plant diseases in an image using YOLOv8 and classification."""
    try:
        pipeline = DetectionPipeline(
            detection_model_path="src/agent/models/detection/yolov8.onnx",
            classifier_model_dir="src/agent/models/classification"
        )
        return pipeline.process(image_url)
    except Exception as e:
        return {
            "error": str(e),
            "metadata": {
                "timestamp": datetime.now(tz=UTC).isoformat(),
                "status": "error"
            }
        }

@tool
def search_plant_info(query: str) -> List[Dict]:
    """Search plant disease information from knowledge base."""
    try:
        filter_dict = {"doc_type": "plant_info"}
        results = vector_store.similarity_search(query, k=5, filter=filter_dict)
        return [
            {
                "content": doc.page_content,
                "metadata": doc.metadata
            }
            for doc in results
        ]
    except Exception as e:
        return [{"error": str(e)}]

@tool
def search_products(query: str) -> List[Dict]:
    """Search product recommendations from knowledge base."""
    try:
        filter_dict = {"doc_type": "product"}
        results = vector_store.similarity_search(query, k=5, filter=filter_dict)
        return [
            {
                "content": doc.page_content,
                "metadata": doc.metadata
            }
            for doc in results
        ]
    except Exception as e:
        return [{"error": str(e)}]

@tool
def web_search(query: str) -> str:
    """Search the web for additional plant disease information."""
    try:
        search = TavilySearch(
            api_key=Config.TAVILY_API_KEY,
            max_results=3
        )
        results = search.invoke(query)
        return str(results)
    except Exception as e:
        return f"Web search error: {str(e)}"

@tool
def generate_search_query(topic: str, focus_area: str) -> str:
    """Generate optimized search query for plant disease information."""
    prompt = QUERY_GENERATION_PROMPT.format(topic=topic, focus_area=focus_area)
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    response = model.invoke([HumanMessage(content=prompt)])
    return response.content.strip()

@tool(return_direct=True, response_format="content_and_artifact", args_schema=PlantDiseaseResponse)
def create_structured_response(**tool_args):
    """Create the final structured response."""
    return "Here is your plant disease analysis:", tool_args

# State definition
@dataclass
class InputState:
    """Defines the input state for the agent."""
    
    messages: Annotated[Sequence[AnyMessage], add_messages] = field(default_factory=list)
    image_url: str = field(default="")

@dataclass  
class State(InputState):
    """Represents the complete state of the agent."""
    
    is_last_step: IsLastStep = field(default=False)
    
    # Analysis results
    is_plant_leaf: bool = field(default=False)
    has_disease: bool = field(default=False)
    plant_type: str = field(default="Unknown")
    image_analysis: str = field(default="")
    
    # Detection results
    detection_results: Dict[str, Any] = field(default_factory=dict)
    top_predictions: List[Dict] = field(default_factory=list)
    confidence_score: float = field(default=0.0)
    
    # Retrieval results
    overview: str = field(default="")
    treatment: str = field(default="")
    products: str = field(default="")
    
    # Search queries
    overview_query: str = field(default="")
    treatment_query: str = field(default="")
    product_query: str = field(default="")
    
    # Final response
    disease_name: str = field(default="None detected")
    final_response_saved: bool = field(default=False)

def load_chat_model(fully_specified_name: str) -> BaseChatModel:
    """Load a chat model from a fully specified name."""
    provider, model = fully_specified_name.split("/", maxsplit=1)
    return init_chat_model(model, model_provider=provider)

class ImageAnalysisResult(BaseModel):
    """Structured output for image analysis"""
    is_plant_leaf: bool = Field(description="Whether the image contains a plant leaf")
    has_disease: bool = Field(description="Whether disease signs are visible on the leaf")
    plant_type: str = Field(description="Identified plant type or 'Unknown'")
    analysis: str = Field(description="Detailed visual analysis of the image")
    confidence: float = Field(description="Confidence in the analysis (0-1)", ge=0, le=1)

def image_analysis_node(state: State) -> State:
    """Analyze image and update state with findings."""
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    structured_llm = model.with_structured_output(ImageAnalysisResult)
    
    analysis_prompt = """You are an expert plant pathologist. Analyze this image:

1. Is this a plant leaf?
2. If yes, are there visible disease signs (spots, discoloration, wilting, lesions)?
3. What plant type is this?
4. Provide detailed visual analysis

Current time: {system_time}"""
    
    message = {
        "role": "user",
        "content": [
            {"type": "text", "text": analysis_prompt.format(system_time=datetime.now(tz=UTC).isoformat())},
            {"type": "image", "source_type": "url", "url": state.image_url}
        ]
    }
    
    result = structured_llm.invoke([message])
    
    return {
        "is_plant_leaf": result.is_plant_leaf,
        "has_disease": result.has_disease,
        "plant_type": result.plant_type,
        "image_analysis": result.analysis,
        "confidence_score": result.confidence
    }

# New router node with conditional logic
def route_after_analysis(state: State) -> str:
    """Route based on image analysis results."""
    if state.is_plant_leaf and state.has_disease:
        return "continue_detection"
    else:
        return "skip_detection"

def plant_disease_detection_node(state: State) -> Command[Literal["overview_query_generation"]]:
    """Run plant disease detection on the image."""
    try:
        # Call the detection pipeline
        detection_result = plant_disease_detection.invoke(state.image_url)
        
        # Extract top predictions
        top_predictions = []
        confidence_score = 0.0
        
        if "cropped_images" in detection_result:
            for i, crop in enumerate(detection_result["cropped_images"]):
                if "classification" in crop:
                    predictions = [
                        {
                            "label": pred["label"],
                            "confidence": pred["confidence"]
                        } for pred in crop["classification"][:3]  # Top 3
                    ]
                    top_predictions.append({
                        "object_id": i,
                        "predictions": predictions
                    })
                    # Use highest confidence as overall score
                    if predictions:
                        confidence_score = max(confidence_score, predictions[0]["confidence"])
        
        return Command(
            update={
                "detection_results": detection_result,
                "top_predictions": top_predictions,
                "confidence_score": confidence_score
            },
            goto="overview_query_generation"
        )
        
    except Exception as e:
        return Command(
            update={
                "detection_results": {"error": str(e)},
                "top_predictions": [],
                "confidence_score": 0.0
            },
            goto="create_final_response"
        )

def overview_query_generation_node(state: State) -> Command[Literal["overview_rag"]]:
    """Generate search query for disease overview information."""
    
    # Create topic from predictions
    topic_parts = []
    for pred_group in state.top_predictions:
        if pred_group["predictions"]:
            top_pred = pred_group["predictions"][0]["label"]
            topic_parts.append(top_pred)
    
    topic = f"{state.plant_type} " + " ".join(topic_parts) if topic_parts else f"{state.plant_type} disease"
    
    query = generate_search_query.invoke({
        "topic": topic,
        "focus_area": "disease overview, symptoms, identification"
    })
    
    return Command(
        update={"overview_query": query},
        goto="overview_rag"
    )

def overview_rag_node(state: State) -> Command[Literal["treatment_query_generation"]]:
    """Perform RAG for disease overview information."""
    
    # Search for plant disease information
    search_results = search_plant_info.invoke(state.overview_query)
    
    # Also try web search for additional context
    web_results = web_search.invoke(state.overview_query)
    
    # Create context from results
    context = ""
    for result in search_results:
        if "content" in result:
            context += f"Source: {result.get('metadata', {}).get('plant_name', 'Unknown')}\n"
            context += f"{result['content']}\n\n"
    
    context += f"Web search results: {web_results}\n"
    
    # Generate overview using RAG
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    prompt = f"{RAG_SYSTEM_PROMPTS['overview']}\n\nContext:\n{context}\n\nQuery: {state.overview_query}\n\nProvide a comprehensive overview:"
    
    response = model.invoke([HumanMessage(content=prompt)])
    
    return Command(
        update={"overview": response.content},
        goto="treatment_query_generation"
    )

def treatment_query_generation_node(state: State) -> Command[Literal["treatment_rag"]]:
    """Generate search query for treatment information."""
    
    topic = f"{state.plant_type} disease treatment " + state.overview_query
    
    query = generate_search_query.invoke({
        "topic": topic,
        "focus_area": "treatment methods, remedies, control measures"
    })
    
    return Command(
        update={"treatment_query": query},
        goto="treatment_rag"
    )

def treatment_rag_node(state: State) -> Command[Literal["product_query_generation"]]:
    """Perform RAG for treatment recommendations."""
    
    search_results = search_plant_info.invoke(state.treatment_query)
    web_results = web_search.invoke(state.treatment_query)
    
    context = ""
    for result in search_results:
        if "content" in result:
            context += f"Source: {result.get('metadata', {}).get('section', 'Unknown')}\n"
            context += f"{result['content']}\n\n"
    
    context += f"Web search results: {web_results}\n"
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    prompt = f"{RAG_SYSTEM_PROMPTS['treatment']}\n\nContext:\n{context}\n\nOverview: {state.overview}\n\nQuery: {state.treatment_query}\n\nProvide detailed treatment recommendations:"
    
    response = model.invoke([HumanMessage(content=prompt)])
    
    return Command(
        update={"treatment": response.content},
        goto="product_query_generation"
    )

def product_query_generation_node(state: State) -> Command[Literal["product_rag"]]:
    """Generate search query for product recommendations."""
    
    topic = f"products fungicide pesticide for {state.plant_type} disease treatment"
    
    query = generate_search_query.invoke({
        "topic": topic,
        "focus_area": "products, fungicides, pesticides, brands"
    })
    
    return Command(
        update={"product_query": query},
        goto="product_rag"
    )

def product_rag_node(state: State) -> Command[Literal["create_final_response"]]:
    """Perform RAG for product recommendations."""
    
    search_results = search_products.invoke(state.product_query)
    web_results = web_search.invoke(state.product_query)
    
    context = ""
    for result in search_results:
        if "content" in result:
            context += f"Product: {result.get('metadata', {}).get('product_name', 'Unknown')}\n"
            context += f"{result['content']}\n\n"
    
    context += f"Web search results: {web_results}\n"
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    prompt = f"{RAG_SYSTEM_PROMPTS['product']}\n\nContext:\n{context}\n\nTreatment plan: {state.treatment}\n\nQuery: {state.product_query}\n\nProvide specific product recommendations with image links:"
    
    response = model.invoke([HumanMessage(content=prompt)])
    
    return Command(
        update={"products": response.content},
        goto="create_final_response"
    )

def create_final_response_node(state: State) -> Command[Literal["__end__"]]:
    """Create the final structured response."""
    
    # Handle cases where no disease was detected
    if not state.has_disease or not state.is_plant_leaf:
        overview = "No plant disease detected in the image." if not state.has_disease else "No plant leaf detected in the image."
        treatment = "No treatment needed."
        products = "No products recommended."
    else:
        overview = state.overview or "Disease analysis could not be completed."
        treatment = state.treatment or "Treatment recommendations not available."
        products = state.products or "Product recommendations not available."
    
    # Extract annotated image from detection results
    annotated_image = ""
    if state.detection_results and "detection_result" in state.detection_results:
        annotated_image = state.detection_results["detection_result"]
    
    # Extract cropped images with base64 data
    cropped_images = []
    if state.detection_results and "cropped_images" in state.detection_results:
        cropped_images = state.detection_results["cropped_images"]
    
    # Determine disease name from top predictions
    disease_name = "None detected"
    if state.top_predictions and state.top_predictions[0]["predictions"]:
        disease_name = state.top_predictions[0]["predictions"][0]["label"]
    
    # Create structured response
    response_data = PlantDiseaseResponse(
        is_plant_leaf=state.is_plant_leaf,
        has_disease=state.has_disease,
        plant_type=state.plant_type,
        disease_name=disease_name,
        confidence_score=state.confidence_score,
        total_detections=len(state.top_predictions),
        top_predictions=state.top_predictions,
        cropped_images=cropped_images,
        image_analysis=state.image_analysis,
        overview=overview,
        treatment=treatment,
        products=products,
        processed_at=datetime.now(tz=UTC).isoformat(),
        annotated_image=annotated_image
    )
    
    # Use the structured output tool
    result = create_structured_response.invoke(response_data.model_dump())
    
    # Save the structured response to JSON file
    timestamp = datetime.now(tz=UTC).strftime("%Y%m%d_%H%M%S")
    output_filename = f"plant_disease_analysis_{timestamp}.json"
    output_path = os.path.join("src/agent/outputs", output_filename)
    
    # Create outputs directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Save the complete structured response
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(response_data.model_dump(), f, indent=2, ensure_ascii=False)
        print(f"📄 Analysis saved to: {output_path}")
    except Exception as e:
        print(f"❌ Error saving analysis: {e}")
    
    # Extract the actual tool response content
    final_message = ""
    if isinstance(result, tuple) and len(result) == 2:
        # Tool returns (content, artifact)
        final_message = result[0]
        artifact_data = result[1]
    else:
        final_message = str(result)
        artifact_data = response_data.model_dump()
    
    return Command(
        update={
            "messages": [AIMessage(content=final_message)],
            "disease_name": disease_name,
            "confidence_score": state.confidence_score
        },
        goto="__end__"
    )

# Build the graph
builder = StateGraph(State, input_schema=InputState, context_schema=Configuration)

# Add nodes (remove router)
builder.add_node("image_analysis", image_analysis_node)
builder.add_node("plant_disease_detection", plant_disease_detection_node)
builder.add_node("overview_query_generation", overview_query_generation_node)
builder.add_node("overview_rag", overview_rag_node)
builder.add_node("treatment_query_generation", treatment_query_generation_node)
builder.add_node("treatment_rag", treatment_rag_node)
builder.add_node("product_query_generation", product_query_generation_node)
builder.add_node("product_rag", product_rag_node)
builder.add_node("create_final_response", create_final_response_node)

# Set entry point
builder.add_edge(START, "image_analysis")

# Route directly from image_analysis
builder.add_conditional_edges(
    "image_analysis",
    route_after_analysis,
    {
        "continue_detection": "plant_disease_detection",
        "skip_detection": "create_final_response"
    }
)

# Rest of edges remain the same
builder.add_edge("plant_disease_detection", "overview_query_generation")
builder.add_edge("overview_query_generation", "overview_rag")
builder.add_edge("overview_rag", "treatment_query_generation")
builder.add_edge("treatment_query_generation", "treatment_rag")
builder.add_edge("treatment_rag", "product_query_generation")
builder.add_edge("product_query_generation", "product_rag")
builder.add_edge("product_rag", "create_final_response")
builder.add_edge("create_final_response", END)

graph = builder.compile(name="Plant Disease Detection Multi-Agent System")

async def stream_graph_execution():
    """Stream the graph execution to see every process step-by-step"""
    print("=== Streaming Plant Disease Detection Process ===")
    image_url = "https://plantvillage-production-new.s3.amazonaws.com/image/99416/file/default-eb4701036f717c99bf95001c1a8f7b40.jpg"
    initial_state = {
        "messages": [HumanMessage(content="Analyze this plant leaf for diseases")],
        "image_url": image_url
    }
    
    # Use stream_mode="updates" to see only what each node changes
    async for chunk in graph.astream(
        initial_state, 
        stream_mode="updates"
    ):
        # chunk is a dictionary where key = node name, value = updates
        for node_name, node_updates in chunk.items():
            print(f"\n{'='*60}")
            print(f"🔄 EXECUTING NODE: {node_name}")
            print(f"{'='*60}")
            
            # Format and display the updates from this node
            if node_name == "image_analysis":
                print(f"🔍 Image Analysis Results:")
                print(f"   • Plant detected: {node_updates.get('is_plant_leaf', False)}")
                print(f"   • Disease detected: {node_updates.get('has_disease', False)}")
                print(f"   • Plant type identified: {node_updates.get('plant_type', 'Unknown')}")
                print(f"   • Analysis summary: {node_updates.get('image_analysis', '')[0:350]}...")
                
            elif node_name == "plant_disease_detection":
                print(f"🔬 Disease Detection Results:")
                print(f"   • Total detections: {len(node_updates.get('top_predictions', []))}")
                if node_updates.get('top_predictions'):
                    top_pred = node_updates['top_predictions'][0]['predictions'][0]
                    print(f"   • Top prediction: {top_pred['label']} ({top_pred['confidence']:.2f})")
                print(f"   • Confidence score: {node_updates.get('confidence_score', 0):.2f}")
                
            elif node_name == "overview_query_generation":
                print(f"📝 Generated Overview Query:")
                print(f"   • {node_updates.get('overview_query', '')}")
                
            elif node_name == "overview_rag":
                print(f"📚 Disease Overview Results:")
                print(f"   • Overview summary: {node_updates.get('overview', '')[0:350]}...")
                
            elif node_name == "treatment_query_generation":
                print(f"📝 Generated Treatment Query:")
                print(f"   • {node_updates.get('treatment_query', '')}")
                
            elif node_name == "treatment_rag":
                print(f"💊 Treatment Recommendations:")
                print(f"   • Treatment summary: {node_updates.get('treatment', '')[0:350]}...")
                
            elif node_name == "product_query_generation":
                print(f"📝 Generated Product Query:")
                print(f"   • {node_updates.get('product_query', '')}")
                
            elif node_name == "product_rag":
                print(f"🛒 Product Recommendations:")
                print(f"   • Products summary: {node_updates.get('products', '')[0:350]}...")
                
            elif node_name == "create_final_response":
                print(f"✅ Final Response Created")
                print(f"   • Disease name: {node_updates.get('disease_name', 'N/A')}")
                print(f"   • Confidence: {node_updates.get('confidence_score', 0):.2f}")
                
            # Small delay to make the streaming more visible
            await asyncio.sleep(0.3)

if __name__ == "__main__":
    import asyncio
    asyncio.run(stream_graph_execution())
