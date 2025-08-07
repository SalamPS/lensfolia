"""This module provides tools for plant disease detection and information retrieval.

It includes tools for:
- Plant disease detection using YOLOv8 and classification
- Searching plant disease information from knowledge base
- Searching product recommendations
- Web search for additional information
- Query generation and structured response creation
- Storing final responses in Supabase database
"""

from typing import Dict, List
from datetime import UTC, datetime
import json

from langchain_core.tools import tool
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableConfig
from langchain_tavily import TavilySearch
from supabase.client import Client, create_client

from agent.configuration import Configuration
from agent.pipeline import DetectionPipeline
from agent.utils import load_chat_model
from agent.retrieval import get_retriever_for_plant_info, get_retriever_for_products
from agent import prompts


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
       
        config: RunnableConfig = {"configurable": {}}
        
        # Use the new retrieval module
        retriever = get_retriever_for_plant_info(config)
        results = retriever.invoke(query)
        
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
       
        config: RunnableConfig = {"configurable": {}}
        
        # Use the new retrieval module
        retriever = get_retriever_for_products(config)
        results = retriever.invoke(query)
        
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
        config = Configuration()
        search = TavilySearch(
            api_key=config.tavily_api_key,
            max_results=3
        )
        results = search.invoke(query)
        return str(results)
    except Exception as e:
        return f"Web search error: {str(e)}"


@tool
def generate_search_query(topic: str, focus_area: str) -> str:
    """Generate optimized search query for plant disease information."""
    prompt = prompts.QUERY_GENERATION_PROMPT.format(topic=topic, focus_area=focus_area)
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    response = model.invoke([HumanMessage(content=prompt)])
    return response.content.strip()


@tool
def store_final_response_in_supabase(
    diagnoses_ref: str,
    created_by: str,
    is_plant_leaf: bool,
    has_disease: bool,
    annotated_image: str,
    cropped_images: list,
    overview: str,
    treatment: str,
    recommendations: str,
) -> dict:
    """Store final response data in Supabase database."""
    try:
        # Get configuration
        config = Configuration.from_context()
        
        # Create Supabase client
        supabase: Client = create_client(config.supabase_url, config.supabase_anon_key)
        
        # Prepare data for upsert
        data = {
            "diagnoses_ref": diagnoses_ref,
            "created_by": created_by,
            "is_plant_leaf": is_plant_leaf,
            "has_disease": has_disease,
            "annotated_image": annotated_image,
            "cropped_images": json.dumps(cropped_images),
            "overview": overview,
            "treatment": treatment,
            "recommendations": recommendations
        }
        
        # Perform upsert operation
        result = supabase.table("diagnoses_result").insert(data).execute()

        return {
            "status": "success",
            "message": "Data successfully stored in Supabase",
            "data": result.data
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to store data in Supabase: {str(e)}",
            "data": None
        }


# List of all available tools
TOOLS = [
    plant_disease_detection,
    search_plant_info,
    search_products,
    web_search,
    generate_search_query,
    store_final_response_in_supabase,
]
