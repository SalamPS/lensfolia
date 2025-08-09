"""Define a custom Plant Disease Detection Multi-Agent System.

This module implements a multi-step agent system for plant disease detection,
analysis, and treatment recommendations using LangGraph.
"""

from __future__ import annotations

import os
import asyncio
from typing import Literal
from datetime import UTC, datetime
import json

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END, START
from langgraph.prebuilt import create_react_agent
from langgraph.types import Command

from dotenv import load_dotenv

from agent.configuration import Configuration
from agent.state import InputState, State, ChatState
from agent.schemas import ImageAnalysisResult
from agent.tools import (
    plant_disease_detection,
    search_plant_info,
    search_products,
    web_search,
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


def overview_agent_node(state: State) -> Command[Literal["treatment_agent"]]:
    """Overview agent node that generates disease overview using tools."""
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    # Create context from available state information
    context_parts = []
    if state.plant_type and state.plant_type != "Unknown":
        context_parts.append(f"Plant type: {state.plant_type}")
    if hasattr(state, 'image_analysis') and state.image_analysis:
        context_parts.append(f"Image analysis: {state.image_analysis}")
    if state.top_predictions:
        predictions_text = []
        for pred in state.top_predictions:
            if pred["predictions"]:
                object_predictions = [f"{p['label']} ({p['confidence']:.2f})" for p in pred["predictions"]]
                predictions_text.append(f"Object {pred['object_id'] + 1}: {', '.join(object_predictions)}")
        context_parts.append(f"Detected diseases: {'; '.join(predictions_text)}")
    if state.confidence_score:
        context_parts.append(f"Overall confidence score: {state.confidence_score:.2f}")
    
    context = "\n".join(context_parts)
    
    # Format the prompt with available information
    prompt = prompts.OVERVIEW_AGENT_PROMPT.format(
        plant_type=state.plant_type,
        top_predictions=state.top_predictions,
        confidence_score=state.confidence_score
    )
    
    system_message = SystemMessage(content=prompt)
    
    # Create the agent with tools
    tools = [search_plant_info, search_products, web_search]
    overview_agent = create_react_agent(
        model,
        tools,
    )
    
    # Run the agent with system message
    result = overview_agent.invoke({
        "messages": [system_message, HumanMessage(content=context)]
    })
    
    # Extract the response
    overview = result["messages"][-1].content
    
    return Command(
        update={"overview": overview},
        goto="treatment_agent"
    )

def treatment_agent_node(state: State) -> Command[Literal["recommendation_agent"]]:
    """Treatment agent node that generates treatment recommendations using tools."""
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    # Create context from available state information
    context_parts = []
    if state.plant_type and state.plant_type != "Unknown":
        context_parts.append(f"Plant type: {state.plant_type}")
    if hasattr(state, 'image_analysis') and state.image_analysis:
        context_parts.append(f"Image analysis: {state.image_analysis}")
    if state.overview:
        context_parts.append(f"Disease overview: {state.overview[:200]}...")
    if state.top_predictions:
        predictions_text = []
        for pred in state.top_predictions:
            if pred["predictions"]:
                object_predictions = [f"{p['label']} ({p['confidence']:.2f})" for p in pred["predictions"]]
                predictions_text.append(f"Object {pred['object_id'] + 1}: {', '.join(object_predictions)}")
        context_parts.append(f"Detected diseases: {'; '.join(predictions_text)}")
    
    context = "\n".join(context_parts)
    
    # Format the prompt with available information
    prompt = prompts.TREATMENT_AGENT_PROMPT.format(
        plant_type=state.plant_type,
        overview=state.overview,
        top_predictions=state.top_predictions
    )
    
    system_message = SystemMessage(content=prompt)
    
    # Create the agent with tools
    tools = [search_plant_info, search_products, web_search]
    treatment_agent = create_react_agent(
        model,
        tools,
    )
    
    # Run the agent with system message
    result = treatment_agent.invoke({
        "messages": [system_message, HumanMessage(content=context)]
    })
    
    # Extract the response
    treatment = result["messages"][-1].content
    
    return Command(
        update={"treatment": treatment},
        goto="recommendation_agent"
    )

def recommendation_agent_node(state: State) -> Command[Literal["create_final_response"]]:
    """Recommendation agent node that generates product recommendations using tools."""
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    # Create context from available state information
    context_parts = []
    if state.plant_type and state.plant_type != "Unknown":
        context_parts.append(f"Plant type: {state.plant_type}")
    if hasattr(state, 'image_analysis') and state.image_analysis:
        context_parts.append(f"Image analysis: {state.image_analysis}")
    if state.treatment:
        context_parts.append(f"Treatment recommendations: {state.treatment[:200]}...")
    if state.top_predictions:
        predictions_text = []
        for pred in state.top_predictions:
            if pred["predictions"]:
                object_predictions = [f"{p['label']} ({p['confidence']:.2f})" for p in pred["predictions"]]
                predictions_text.append(f"Object {pred['object_id'] + 1}: {', '.join(object_predictions)}")
        context_parts.append(f"Detected diseases: {'; '.join(predictions_text)}")
    
    context = "\n".join(context_parts)
    
    # Format the prompt with available information
    prompt = prompts.RECOMMENDATION_AGENT_PROMPT.format(
        plant_type=state.plant_type,
        treatment=state.treatment,
        top_predictions=state.top_predictions
    )
    
    system_message = SystemMessage(content=prompt)
    
    # Create the agent with tools
    tools = [search_plant_info, search_products, web_search]
    recommendation_agent = create_react_agent(
        model,
        tools,
    )
    
    # Run the agent with system message
    result = recommendation_agent.invoke({
        "messages": [system_message, HumanMessage(content=context)]
    })
    
    # Extract the response
    recommendations = result["messages"][-1].content
    
    return Command(
        update={"recommendations": recommendations},
        goto="create_final_response"
    )

def plant_disease_detection_node(state: State) -> Command[Literal["overview_agent"]]:
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
            goto="overview_agent"
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
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(final_response, f, indent=2, ensure_ascii=False)
        print(f"📄 Analysis saved to: {output_path}")
    except Exception as e:
        print(f"❌ Error saving analysis: {e}")
    
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

# Build the graph
builder = StateGraph(State, input_schema=InputState, context_schema=Configuration)

# Add QA nodes
builder.add_node("qa_agent", qa_agent_node)
builder.add_edge("qa_agent", END)

# Add all nodes
builder.add_node("image_analysis", image_analysis_node)
builder.add_node("plant_disease_detection", plant_disease_detection_node)
builder.add_node("overview_agent", overview_agent_node)
builder.add_node("treatment_agent", treatment_agent_node)
builder.add_node("recommendation_agent", recommendation_agent_node)
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

# Linear flow with new agents
builder.add_edge("plant_disease_detection", "overview_agent")
builder.add_edge("overview_agent", "treatment_agent")
builder.add_edge("treatment_agent", "recommendation_agent")
builder.add_edge("recommendation_agent", "create_final_response")
builder.add_edge("create_final_response", END)

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
                
            elif node_name == "overview_agent":
                print(f"📚 Disease Overview Generated:")
                overview = node_updates.get('overview', '') if node_updates else ''
                print(f"   • Overview: {overview[:200]}{'...' if len(overview) > 200 else ''}")
                
            elif node_name == "treatment_agent":
                print(f"💊 Treatment Recommendations Generated:")
                treatment = node_updates.get('treatment', '') if node_updates else ''
                print(f"   • Treatment: {treatment[:200]}{'...' if len(treatment) > 200 else ''}")
                
            elif node_name == "recommendation_agent":
                print(f"📋 Product Recommendations Generated:")
                recommendations = node_updates.get('recommendations', '') if node_updates else ''
                print(f"   • Recommendations: {recommendations[:200]}{'...' if len(recommendations) > 200 else ''}")
                
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