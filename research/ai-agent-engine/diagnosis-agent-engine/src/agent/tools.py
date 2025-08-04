"""Tools for plant disease detection and information retrieval."""

from typing import List, Dict
from datetime import UTC, datetime

from langchain_core.tools import tool
from langchain_core.messages import HumanMessage
from langchain_tavily import TavilySearch

from agent.configuration import Configuration, Config
from agent.schemas import PlantDiseaseResponse
from agent.utils import get_vector_store, load_chat_model
from agent.pipeline import DetectionPipeline

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
        vector_store = get_vector_store()
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
        vector_store = get_vector_store()
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
    configuration = Configuration.from_context()
    prompt = configuration.query_generation_prompt.format(topic=topic, focus_area=focus_area)
    
    model = load_chat_model(configuration.model)
    
    response = model.invoke([HumanMessage(content=prompt)])
    return response.content.strip()

@tool(return_direct=True, response_format="content_and_artifact", args_schema=PlantDiseaseResponse)
def create_structured_response(**tool_args):
    """Create the final structured response."""
    return "Here is your plant disease analysis:", tool_args

# List of all tools for easy import
TOOLS = [
    plant_disease_detection,
    search_plant_info,
    search_products,
    web_search,
    generate_search_query,
    create_structured_response
]
