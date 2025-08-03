from __future__ import annotations

import json
from dataclasses import dataclass, field, fields
from typing import Dict, List, Literal, cast, Annotated, Any, Callable, Optional, Sequence
from typing_extensions import Annotated

from langchain_core.runnables import ensure_config
from langchain.chat_models import init_chat_model
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage, AIMessage, AnyMessage, HumanMessage
from langchain_core.tools import tool

from langgraph.config import get_config
from langgraph.graph import StateGraph, add_messages, END
from langgraph.prebuilt import ToolNode
from langgraph.managed import IsLastStep

from datetime import UTC, datetime
from agent.pipeline import DetectionPipeline

from dotenv import load_dotenv

load_dotenv()

# System prompt for the agent
SYSTEM_PROMPT = """You are a helpful plant disease diagnosis assistant. 

You have access to a plant_disease_detection tool that can:
1. Detect plant parts in images using object detection
2. Classify diseases on each detected part
3. Return the top 3 predictions for each detection

The tool will return:
- An annotated image showing detections
- Detailed classification results for each detected object
- Processing metadata

Current time: {system_time}
"""

@dataclass(kw_only=True)
class Configuration:
    """The configuration for the agent."""

    system_prompt: str = field(
        default=SYSTEM_PROMPT,
        metadata={
            "description": "The system prompt to use for the agent's interactions."
        },
    )

    model: Annotated[str, {"__template_metadata__": {"kind": "llm"}}] = field(
        default="google_genai/gemini-2.5-flash",
        metadata={
            "description": "The name of the language model to use for the agent's main interactions."
        },
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

# --- Detection Tool ---
@tool
def plant_disease_detection(image_url: str) -> dict:
    """Detect plant diseases in an image using YOLOv8 and classification.
    
    Args:
        image_url: URL of the image to analyze
        
    Returns:
        Dictionary with detection results including:
        - detection_result: annotated image
        - cropped_images: list of detected objects with classifications
        - metadata: processing info
    """
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

# Register tools
TOOLS: List[Callable[..., Any]] = [plant_disease_detection]

@dataclass
class InputState:
    """Defines the input state for the agent."""

    messages: Annotated[Sequence[AnyMessage], add_messages] = field(
        default_factory=list
    )
    """Messages tracking the primary execution state of the agent."""
    
    image_data: str = field(default="")
    """Base64 encoded image data that tools can access."""

@dataclass
class State(InputState):
    """Represents the complete state of the agent."""

    is_last_step: IsLastStep = field(default=False)
    """Indicates whether the current step is the last one."""
    
    detection_results: Dict[str, Any] = field(default_factory=dict)
    """Stores plant disease detection results including:
        - detection_result: annotated image
        - cropped_images: list of detected objects with classifications
        - metadata: processing info
    """

def load_chat_model(fully_specified_name: str) -> BaseChatModel:
    """Load a chat model from a fully specified name."""
    provider, model = fully_specified_name.split("/", maxsplit=1)
    return init_chat_model(model, model_provider=provider)

# NEW: First model node that forces tool call
def first_model(state: State) -> Dict[str, List[AIMessage]]:
    """First model call that forces the plant disease detection tool to be called."""
    return {
        "messages": [
            AIMessage(
                content="I'll analyze your plant image for diseases using my detection tool.",
                tool_calls=[
                    {
                        "name": "plant_disease_detection",
                        "args": {
                            "image_url": state.image_data,
                        },
                        "id": "plant_detection_001",
                    }
                ],
            )
        ]
    }

def should_continue(state: State) -> Literal["end", "continue"]:
    """Determine whether to continue with more tool calls or end."""
    messages = state.messages
    last_message = messages[-1]
    # If there is no function call, then we finish
    if not isinstance(last_message, AIMessage) or not last_message.tool_calls:
        return "end"
    # Otherwise if there is, we continue
    else:
        return "continue"

async def call_model(state: State) -> Dict[str, List[AIMessage]]:
    """Call the LLM powering our agent."""
    configuration = Configuration.from_context()

    # Initialize the model with tool binding
    model = load_chat_model(configuration.model).bind_tools(TOOLS)

    # Format the system prompt
    system_message = configuration.system_prompt.format(
        system_time=datetime.now(tz=UTC).isoformat()
    )

    # Prepare messages
    messages = [{"role": "system", "content": system_message}]
    messages.extend(state.messages)

    # Get the model's response
    response = cast(
        AIMessage,
        await model.ainvoke(messages),
    )

    # Handle the case when it's the last step and the model still wants to use a tool
    if state.is_last_step and response.tool_calls:
        return {
            "messages": [
                AIMessage(
                    id=response.id,
                    content="Sorry, I could not find an answer to your question in the specified number of steps.",
                )
            ]
        }

    return {"messages": [response]}

# Custom ToolNode that can access state
class ImageToolNode(ToolNode):
    """Custom ToolNode that passes image data from state to tools."""
    
    def __init__(self, tools):
        super().__init__(tools)
    
    async def ainvoke(self, state: State, config=None):
        """Invoke tools with access to state image data."""
        # Get the last message with tool calls
        last_message = state.messages[-1]
        if not isinstance(last_message, AIMessage) or not last_message.tool_calls:
            return {"messages": []}
        
        # Process tool calls
        tool_messages = []
        for tool_call in last_message.tool_calls:
            if tool_call["name"] == "plant_disease_detection":
                try:
                    # Use image_data from state instead of tool call args
                    result = plant_disease_detection.invoke(state.image_data)
                    # Store full results in state
                    state.detection_results = result
                    
                    # Create simplified response with top 3 predictions per object
                    simplified = {
                        "total_detections": len(result.get("cropped_images", [])),
                        "predictions": [],
                        "timestamp": datetime.now(tz=UTC).isoformat()
                    }
                    
                    for i, crop in enumerate(result.get("cropped_images", [])):
                        if "classification" in crop:
                            simplified["predictions"].append({
                                "object_id": i,
                                "top_predictions": [
                                    {
                                        "label": pred["label"],
                                        "confidence": pred["confidence"]
                                    } for pred in crop["classification"]
                                ]
                            })
                    
                    tool_messages.append({
                        "role": "tool",
                        "content": json.dumps(simplified),
                        "tool_call_id": tool_call["id"]
                    })
                except Exception as e:
                    tool_messages.append({
                        "role": "tool", 
                        "content": json.dumps({
                            "status": "error",
                            "error": str(e),
                            "timestamp": datetime.now(tz=UTC).isoformat()
                        }),
                        "tool_call_id": tool_call["id"]
                    })
        
        return {"messages": tool_messages, "detection_results": state.detection_results}

# Define the graph
builder = StateGraph(State, input_schema=InputState, context_schema=Configuration)

# Define nodes
builder.add_node("first_agent", first_model)  # NEW: First node that forces tool call
builder.add_node("agent", call_model)
builder.add_node("action", ImageToolNode(TOOLS))

# Set the entrypoint as first_agent (instead of call_model)
builder.add_edge("__start__", "first_agent")

# After first_agent, always go to action (tool execution)
builder.add_edge("first_agent", "action")

# Add conditional edges from agent
builder.add_conditional_edges(
    "agent",
    should_continue,
    {
        "continue": "action",
        "end": "__end__",
    }
)

# After action, go back to agent for reasoning
builder.add_edge("action", "agent")

# Compile the graph
graph = builder.compile(name="Plant Disease Detection Agent")

# --- Usage Example ---
async def test_agent():
    """Test the agent with an image."""
    print("=== Testing Forced Tool Call Plant Disease Agent ===")
    
    image_url = "https://plantvillage-production-new.s3.amazonaws.com/image/99416/file/default-eb4701036f717c99bf95001c1a8f7b40.jpg"
    
    initial_state = {
        "messages": [HumanMessage(content="What plant disease does my apple plant have?")],
        "image_data": image_url
    }
    
    async def print_stream(stream):
        async for s in stream:
            message = s["messages"][-1]
            if isinstance(message, tuple):
                print(message)
            else:
                message.pretty_print()

    await print_stream(graph.astream(initial_state, stream_mode="values"))

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_agent())