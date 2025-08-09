"""Define a custom Plant Disease Detection Multi-Agent System.

This module implements a multi-step agent system for plant disease detection,
analysis, and treatment recommendations using LangGraph.
"""

from __future__ import annotations

import os
import asyncio
from typing import Literal
from datetime import UTC, datetime

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END, START
from langgraph.prebuilt import create_react_agent
from langgraph.types import Command

from dotenv import load_dotenv

# Import all the modular components
from agent.configuration import Configuration
from agent.state import InputState, State, ChatState
from agent.schemas import ImageAnalysisResult
from agent.tools import (
    plant_disease_detection,
    search_plant_info,
    search_products,
    web_search,
    generate_search_query,
    store_final_response_in_supabase
)
from agent.utils import load_chat_model
from agent import prompts

load_dotenv()

def qa_agent_node(state: ChatState) -> dict:
    """QA agent node that handles user questions."""
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    # Create context from available state information
    context = ""
    if hasattr(state, 'plant_type') and state.plant_type and state.plant_type != "Unknown":
        context += f"\nPlant type: {state.plant_type}"
    if hasattr(state, 'overview') and state.overview:
        context += f"\nDisease overview: {state.overview}"
    if hasattr(state, 'treatment') and state.treatment:
        context += f"\nTreatment: {state.treatment}"
    if hasattr(state, 'recommendations') and state.recommendations:
        context += f"\nRecommendations: {state.recommendations}"
    
    prompt = prompts.QA_AGENT_PROMPT
    if context:
        prompt += f"\n\nCurrent Diagnosis Context:{context}"
    
    system_message = SystemMessage(content=prompt)
    
    
    messages = [system_message] + state.messages
    tools = [search_plant_info, search_products, web_search]
    qa_agent = create_react_agent(
        model,
        tools,
    )
    
    response = qa_agent.invoke({"messages": messages})
    
    return {"messages": response["messages"]}

def route_after_start(state: InputState) -> str:
    """Route based on task type."""
    return "qa_agent" if state.task_type == "qa" else "image_analysis"

def image_analysis_node(state: State) -> State:
    """Analyze image and update state with findings."""
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    structured_llm = model.with_structured_output(ImageAnalysisResult)
    
    analysis_prompt = prompts.IMAGE_ANALYSIS_PROMPT.format(
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


def retriever_agent_node(state: State) -> Command[str]:
    """Retriever agent node that intelligently gathers information."""
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    # Determine task and query based on current retrieval task
    task_mapping = {
        "overview": {
            "query": state.overview_query,
            "context": f"Plant: {state.plant_type}, Predictions: {state.top_predictions}",
            "next_node": "overview_generation"
        },
        "treatment": {
            "query": state.treatment_query,
            "context": f"Plant: {state.plant_type}, Overview: {state.overview[:200]}...",
            "next_node": "treatment_generation"
        },
        "recommendation": {
            "query": state.recommendation_query,
            "context": f"Plant: {state.plant_type}, Treatment: {state.treatment[:200]}...",
            "next_node": "recommendation_generation"
        }
    }
    
    current_task = task_mapping[state.current_retrieval_task]
    
    tools = [search_plant_info, search_products, web_search]

    system_prompt = prompts.RETRIEVER_AGENT_PROMPT.format(
        task_type=state.current_retrieval_task,
        query=current_task["query"],
        context=current_task["context"],
    )
    system_message = SystemMessage(content=system_prompt)
    
    retriever_agent = create_react_agent(
        model,
        tools,
    )
    
    # Run the retriever agent with system message
    result = retriever_agent.invoke({
        "messages": [system_message, HumanMessage(content=current_task["query"])]
    })
    
    # Extract context from the messages
    retrieval_context = result["messages"][-1].content
    
    return Command(
        update={
            "retrieval_context": retrieval_context,
            "current_retrieval_task": state.current_retrieval_task
        },
        goto=current_task["next_node"]
    )

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

def overview_query_generation_node(state: State) -> Command[Literal["retriever_agent"]]:
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
        update={
            "overview_query": query,
            "current_retrieval_task": "overview"
        },
        goto="retriever_agent"
    )

def overview_generation_node(state: State) -> Command[Literal["treatment_query_generation"]]:
    """Generate overview using retrieved context."""
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    prompt = f"""{prompts.RAG_SYSTEM_PROMPTS['overview']}

Retrieved Information:
{state.retrieval_context}

Original Query: {state.overview_query}
"""
    
    response = model.invoke([HumanMessage(content=prompt)])
    
    return Command(
        update={"overview": response.content},
        goto="treatment_query_generation"    
    )

def treatment_query_generation_node(state: State) -> Command[Literal["retriever_agent"]]:
    """Generate search query for treatment information."""
    
    topic = f"{state.plant_type} disease treatment " + state.overview_query
    
    query = generate_search_query.invoke({
        "topic": topic,
        "focus_area": "treatment methods, remedies, control measures"
    })
    
    return Command(
        update={
            "treatment_query": query,
            "current_retrieval_task": "treatment"
        },
        goto="retriever_agent"
    )

def treatment_generation_node(state: State) -> Command[Literal["recommendation_query_generation"]]:
    """Generate treatment recommendations using retrieved context."""
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    prompt = f"""{prompts.RAG_SYSTEM_PROMPTS['treatment']}

Retrieved Information:
{state.retrieval_context}

Disease Overview: {state.overview}

Original Query: {state.treatment_query}
"""
    
    response = model.invoke([HumanMessage(content=prompt)])
    
    return Command(
        update={"treatment": response.content},
        goto="recommendation_query_generation"
    )

def recommendation_query_generation_node(state: State) -> Command[Literal["retriever_agent"]]:
    """Generate search query for product recommendations."""
    
    topic = f"products fungicide pesticide for {state.plant_type} disease treatment"
    
    query = generate_search_query.invoke({
        "topic": topic,
        "focus_area": "products, fungicides, pesticides"
    })
    
    return Command(
        update={
            "recommendation_query": query,
            "current_retrieval_task": "recommendation"
        },
        goto="retriever_agent"
    )

def recommendation_generation_node(state: State) -> Command[Literal["create_final_response"]]:
    """Generate treatment recommendations using retrieved context."""
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    
    prompt = f"""{prompts.RAG_SYSTEM_PROMPTS['recommendation']}

Retrieved Information:
{state.retrieval_context}

Treatment Plan: {state.treatment}

Original Query: {state.recommendation_query}
"""
    
    response = model.invoke([HumanMessage(content=prompt)])
    
    return Command(
        update={"recommendations": response.content},
        goto="create_final_response"
    )


def create_final_response_node(state: State) -> dict:
    """Create the final structured response and return state values."""
    
    # Handle cases where no disease was detected
    if not state.has_disease or not state.is_plant_leaf:
        overview = "No plant disease detected in the image." if not state.has_disease else "No plant leaf detected in the image."
        treatment = "No treatment needed."
        recommendations = "No treatment recommendations available."
    else:
        overview = state.overview or "Disease analysis could not be completed."
        treatment = state.treatment or "Treatment recommendations not available."
        recommendations = state.recommendations or "Treatment recommendations not available."
    
    # Extract annotated image from detection results
    annotated_image = ""
    if state.detection_results and "detection_result" in state.detection_results:
        annotated_image = state.detection_results["detection_result"]
    
    # Extract cropped images with base64 data and reformat
    cropped_images = []
    if state.detection_results and "cropped_images" in state.detection_results:
        for crop in state.detection_results["cropped_images"]:
            # Get the top classification if available
            label = ""
            confidence = 0.0
            if crop.get("classification"):
                # Get the first classification result
                top_pred = crop["classification"][0]
                label = top_pred["label"]
                confidence = top_pred["confidence"]
                
            cropped_images.append({
                "base64_image": crop["base64_image"],
                "label": label,
                "confidence": confidence
            })
    
    # Format the response to match the desired structure
    final_response = {
        "is_plant_leaf": state.is_plant_leaf,
        "has_disease": state.has_disease,
        "annotated_image": annotated_image,
        "cropped_images": cropped_images,
        "overview": overview,
        "treatment": treatment,
        "recommendations": recommendations,
        "diagnoses_ref": state.diagnoses_ref,
        "created_by": state.created_by,
    }
    
    # Save the structured response to JSON file
    timestamp = datetime.now(tz=UTC).strftime("%Y%m%d_%H%M%S")
    output_filename = f"plant_disease_analysis_{timestamp}.json"
    output_path = os.path.join("src/agent/outputs", output_filename)
    
    # Create outputs directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Save the complete structured response
    # try:
    #     with open(output_path, 'w', encoding='utf-8') as f:
    #         json.dump(final_response, f, indent=2, ensure_ascii=False)
    #     print(f"📄 Analysis saved to: {output_path}")
    # except Exception as e:
    #     print(f"❌ Error saving analysis: {e}")
    
    # Store the response in Supabase
    try:
        supabase_result = store_final_response_in_supabase.invoke({
            "diagnoses_ref": final_response.get("diagnoses_ref"),
            "created_by": final_response.get("created_by"),
            "is_plant_leaf": final_response.get("is_plant_leaf", False),
            "has_disease": final_response.get("has_disease", False),
            "annotated_image": final_response.get("annotated_image", ""),
            "cropped_images": final_response.get("cropped_images", []),
            "overview": final_response.get("overview", ""),
            "treatment": final_response.get("treatment", ""),
            "recommendations": final_response.get("recommendations", ""),
        })
        if supabase_result.get("status") == "success":
            print("✅ Response successfully stored in Supabase")
        else:
            print(f"⚠️  Failed to store response in Supabase: {supabase_result.get('message')}")
    except Exception as e:
        print(f"❌ Error storing response in Supabase: {e}")
    
    # Return the response as state values
    return {
        "is_plant_leaf": state.is_plant_leaf,
        "has_disease": state.has_disease,
        "annotated_image": annotated_image,
        "cropped_images": cropped_images,
        "overview": overview,
        "treatment": treatment,
        "recommendations": recommendations,
        "diagnoses_ref": state.diagnoses_ref,
        "created_by": state.created_by,
    }

# Conditional routing from retriever_agent based on current task
def route_from_retriever(state: State) -> str:
    """Route from retriever agent to appropriate generation node."""
    return f"{state.current_retrieval_task}_generation"

# Build the graph
builder = StateGraph(State, input_schema=InputState, context_schema=Configuration)

# Add QA nodes
builder.add_node("qa_agent", qa_agent_node)
builder.add_edge("qa_agent", END)

# Add all nodes
builder.add_node("image_analysis", image_analysis_node)
builder.add_node("plant_disease_detection", plant_disease_detection_node)
builder.add_node("retriever_agent", retriever_agent_node) 
builder.add_node("overview_query_generation", overview_query_generation_node)
builder.add_node("overview_generation", overview_generation_node)
builder.add_node("treatment_query_generation", treatment_query_generation_node)
builder.add_node("treatment_generation", treatment_generation_node)  
builder.add_node("recommendation_query_generation", recommendation_query_generation_node)
builder.add_node("recommendation_generation", recommendation_generation_node)
builder.add_node("create_final_response", create_final_response_node)

# Set conditional entry point
builder.add_conditional_edges(
    START,
    route_after_start,
    {
        "qa_agent": "qa_agent",
        "image_analysis": "image_analysis"
    }
)

# Route directly from image_analysis
builder.add_conditional_edges(
    "image_analysis",
    route_after_analysis,
    {
        "continue_detection": "plant_disease_detection",
        "skip_detection": "create_final_response"
    }
)

# Linear flow with retriever agent
builder.add_edge("plant_disease_detection", "overview_query_generation")
builder.add_edge("overview_query_generation", "retriever_agent")
builder.add_edge("overview_generation", "treatment_query_generation")
builder.add_edge("treatment_query_generation", "retriever_agent")
builder.add_edge("treatment_generation", "recommendation_query_generation")
builder.add_edge("recommendation_query_generation", "retriever_agent")
builder.add_edge("recommendation_generation", "create_final_response")
builder.add_edge("create_final_response", END)

# Conditional routing from retriever_agent based on current task
builder.add_conditional_edges(
    "retriever_agent",
    route_from_retriever,
    {
        "overview_generation": "overview_generation",
        "treatment_generation": "treatment_generation", 
        "recommendation_generation": "recommendation_generation"
    }
)

graph = builder.compile(
    name="Plant Disease Detection Multi-Agent System",
)

async def stream_graph_execution():
    """Stream the graph execution to see every process step-by-step"""
    print("=== Streaming Plant Disease Detection Process ===")
    image_url = "https://plantvillage-production-new.s3.amazonaws.com/image/99416/file/default-eb4701036f717c99bf95001c1a8f7b40.jpg"
    
    # Test diagnosis workflow first
    print("\n" + "="*60)
    print("🌿 DIAGNOSIS WORKFLOW TEST")
    print("="*60)
    
    diagnosis_config = {
        "configurable": {
            "thread_id": "diagnosis_session_002"
        }
    }
    
    diagnosis_initial_state = {
        "messages": [HumanMessage(content="Analyze this plant leaf for diseases")],
        "image_url": image_url,
        "diagnoses_ref": "32af0ef8-bd5d-4074-8733-99d5f393910d",
        "created_by": "05e5fc52-e58a-4213-b560-7ead5aa6c2e7",
        "task_type": "diagnosis",
        "thread_id": "diagnosis_session_002",   
    }
    
    # Run diagnosis workflow
    async for chunk in graph.astream(
        diagnosis_initial_state,
        diagnosis_config,
        stream_mode="updates",
    ):
        # chunk is a dictionary where key = node name, value = updates
        for node_name, node_updates in chunk.items():
            print(f"\n{'='*60}")
            print(f"🔄 EXECUTING NODE: {node_name}")
            print(f"{'='*60}")
            
            # Format and display the updates from this node
            if node_name == "image_analysis":
                print(f"🔍 Image Analysis Results:")
                print(f"   • Plant detected: {node_updates.get('is_plant_leaf', False) if node_updates else False}")
                print(f"   • Disease detected: {node_updates.get('has_disease', False) if node_updates else False}")
                print(f"   • Plant type identified: {node_updates.get('plant_type', 'Unknown') if node_updates else 'Unknown'}")
                
            elif node_name == "plant_disease_detection":
                print(f"🔬 Disease Detection Results:")
                print(f"   • Total detections: {len(node_updates.get('top_predictions', []) if node_updates else [])}")
                if node_updates and node_updates.get('top_predictions'):
                    top_pred = node_updates['top_predictions'][0]['predictions'][0]
                    print(f"   • Top prediction: {top_pred['label']} ({top_pred['confidence']:.2f})")
                print(f"   • Confidence score: {node_updates.get('confidence_score', 0) if node_updates else 0:.2f}")
                
            elif node_name == "overview_query_generation":
                print(f"📝 Generated Overview Query:")
                print(f"   • {(node_updates.get('overview_query', '') if node_updates else '')}")
                
            elif node_name == "retriever_agent":
                print(f"🔍 Retriever Agent Results:")
                print(f"   • Task: {(node_updates.get('current_retrieval_task', 'Unknown') if node_updates else 'Unknown')}")
                
            elif node_name == "overview_generation":
                print(f"📚 Disease Overview Generated:")
                print(f"   • Overview length: {len(node_updates.get('overview', '') if node_updates else '')} characters")
                
            elif node_name == "treatment_query_generation":
                print(f"📝 Generated Treatment Query:")
                print(f"   • {(node_updates.get('treatment_query', '') if node_updates else '')}")
                
            elif node_name == "treatment_generation":
                print(f"💊 Treatment Recommendations Generated:")
                print(f"   • Treatment length: {len(node_updates.get('treatment', '') if node_updates else '')} characters")
                
            elif node_name == "recommendation_query_generation":
                print(f"📝 Generated Recommendation Query:")
                print(f"   • {(node_updates.get('recommendation_query', '') if node_updates else '')}")
                
            elif node_name == "recommendation_generation":
                print(f"📋 Treatment Recommendations Generated:")
                print(f"   • Recommendations length: {len(node_updates.get('recommendations', '') if node_updates else '')} characters")
                
            elif node_name == "create_final_response":
                print(f"✅ Final Response Created")
                if node_updates and "final_response" in node_updates:
                    response = node_updates["final_response"]
                    print(f"   • Is plant leaf: {response.get('is_plant_leaf', False)}")
                    print(f"   • Has disease: {response.get('has_disease', False)}")
                    print(f"   • Number of cropped images: {len(response.get('cropped_images', []))}")
                
            # Small delay to make the streaming more visible
            await asyncio.sleep(0.3)
    
    # Test QA workflow
    print("\n" + "="*60)
    print("💬 INTERACTIVE QA WORKFLOW")
    print("="*60)
    print("You can now ask questions.")
    print("Type 'quit' to exit the conversation.\n")
    
    qa_config = {
        "configurable": {
            "thread_id": "diagnosis_session_002"
        }
    }

    while True:
        try:
            user_input = input("\n  Your question (or 'quit' to exit): ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Exiting interactive QA session. Goodbye!")
                break
                
            if not user_input:
                continue
                
            current_state = {
                "task_type": "qa",
                "thread_id": "diagnosis_session_002",
            }
            
            # Add the new user message to the conversation
            current_state["messages"] = [HumanMessage(content=user_input)]
            
            print(f"\n{'='*60}")
            print(f"🔄 Processing your question: {user_input}")
            print(f"{'='*60}")
            
            async for chunk in graph.astream(
                current_state,
                qa_config,
                stream_mode="updates",
            ):
               
                for node_name, node_updates in chunk.items():
                    print(f"\n{'='*60}")
                    print(f"🔄 EXECUTING NODE: {node_name}")
                    print(f"{'='*60}")
                    
                    if node_name == "qa_agent":
                        print(f"🤖 QA Agent Response:")
                        if node_updates and node_updates.get("messages"):
                            response = node_updates["messages"][-1].content
                            print(f"   • Response: {response[:200]}...")
                        else:
                            print(f"   • No response generated")
                    
                  
                    await asyncio.sleep(0.3)
                    
        except KeyboardInterrupt:
            print("\n\n👋 Exiting interactive QA session. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error processing your question: {e}")
            continue
            
if __name__ == "__main__":
    asyncio.run(stream_graph_execution())