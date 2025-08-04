"""Plant Disease Detection Multi-Agent System Graph."""

from __future__ import annotations

import json
import os
from typing import Dict, Literal, cast
from datetime import UTC, datetime

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.graph import StateGraph, END, START
from langgraph.types import Command
from dotenv import load_dotenv

from agent.configuration import Configuration
from agent.state import InputState, State
from agent.schemas import ImageAnalysisResult, PlantDiseaseResponse
from agent.tools import (
    plant_disease_detection, 
    generate_search_query, 
    create_structured_response
)
from agent.utils import load_chat_model, create_retriever_agent

load_dotenv()

def image_analysis_node(state: State) -> State:
    """Analyze image and update state with findings."""
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    structured_llm = model.with_structured_output(ImageAnalysisResult)
    
    analysis_prompt = configuration.image_analysis_prompt.format(
        system_time=datetime.now(tz=UTC).isoformat()
    )
    
    message = {
        "role": "user",
        "content": [
            {"type": "text", "text": analysis_prompt},
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
    """Perform RAG for disease overview information using retriever agent."""
    
    retriever_agent = create_retriever_agent()
    
    # Let the agent decide how to retrieve information
    retrieval_query = f"""Find comprehensive information about: {state.overview_query}
    
    Focus on: disease identification, symptoms, causes, affected plant parts, and disease progression.
    
    Plant type: {state.plant_type}
    Detected predictions: {[pred['predictions'][0]['label'] for pred in state.top_predictions if pred['predictions']]}
    """
    
    # Run the retriever agent
    result = retriever_agent.invoke({
        "messages": [HumanMessage(content=retrieval_query)]
    })
    
    # Extract the context from agent's response
    context = result["messages"][-1].content
    
    # Generate overview using the retrieved context
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    prompt = f"""{configuration.rag_system_prompts['overview']}

Retrieved Information:
{context}

Original Query: {state.overview_query}

Provide a comprehensive overview:"""
    
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
    """Perform RAG for treatment recommendations using retriever agent."""
    
    retriever_agent = create_retriever_agent()
    
    retrieval_query = f"""Find detailed treatment information for: {state.treatment_query}
    
    Focus on: treatment methods, remedies, control measures, application timing, and preventive practices.
    
    Plant type: {state.plant_type}
    Disease context: {state.overview[:200]}...
    """
    
    result = retriever_agent.invoke({
        "messages": [HumanMessage(content=retrieval_query)]
    })
    
    context = result["messages"][-1].content
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    prompt = f"""{configuration.rag_system_prompts['treatment']}

Retrieved Information:
{context}

Disease Overview: {state.overview}
Original Query: {state.treatment_query}

Provide detailed treatment recommendations:"""
    
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
    """Perform RAG for product recommendations using retriever agent."""
    
    retriever_agent = create_retriever_agent()
    
    retrieval_query = f"""Find specific product recommendations for: {state.product_query}
    
    Focus on: product names, active ingredients, application instructions, dosage, and availability.
    IMPORTANT: Include product image links when available.
    
    Plant type: {state.plant_type}
    Treatment context: {state.treatment[:200]}...
    """
    
    result = retriever_agent.invoke({
        "messages": [HumanMessage(content=retrieval_query)]
    })
    
    context = result["messages"][-1].content
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    prompt = f"""{configuration.rag_system_prompts['product']}

Retrieved Information:
{context}

Treatment Plan: {state.treatment}
Original Query: {state.product_query}

Provide specific product recommendations with image links:"""
    
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

# Add nodes
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

# Add edges for the main flow
builder.add_edge("plant_disease_detection", "overview_query_generation")
builder.add_edge("overview_query_generation", "overview_rag")
builder.add_edge("overview_rag", "treatment_query_generation")
builder.add_edge("treatment_query_generation", "treatment_rag")
builder.add_edge("treatment_rag", "product_query_generation")
builder.add_edge("product_query_generation", "product_rag")
builder.add_edge("product_rag", "create_final_response")
builder.add_edge("create_final_response", END)

# Compile the graph
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
            import asyncio
            await asyncio.sleep(0.3)

if __name__ == "__main__":
    import asyncio
    asyncio.run(stream_graph_execution())
