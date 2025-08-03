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
from langgraph.graph import StateGraph, add_messages
from langgraph.prebuilt import ToolNode
from langgraph.managed import IsLastStep

from datetime import UTC, datetime
from agent.classifier import PlantDiseaseClassifier

from dotenv import load_dotenv

load_dotenv()

# System prompt for the agent
SYSTEM_PROMPT = """You are a helpful plant disease diagnosis assistant. 

User will always provide an image url to InputState.image_data. You have to call the plant_disease_classifier tool to analyze the image and return the results.

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

# --- Diagnosis Tool ---
@tool
def plant_disease_classifier(image_url: str) -> dict:
    """Classify the plant disease in an image an image classification model.
    
    Args:
        image_url: URL of the image to analyze
        
    Returns:
        Dictionary with:
        - predictions: List of classification results with label and confidence
        - metadata: Analysis timestamp and status
    """
    try:
        classifier = PlantDiseaseClassifier("mobilenet_v2")
        results = classifier.predict(image_url, top_k=3)
        
        return {
            "predictions": results,
            "metadata": {
                "timestamp": datetime.now(tz=UTC).isoformat(),
                "status": "success",
                "model": "mobilenet_v2"
            }
        }
    except Exception as e:
        return {
            "predictions": [],
            "metadata": {
                "timestamp": datetime.now(tz=UTC).isoformat(),
                "status": f"error: {str(e)}",
                "model": "mobilenet_v2"
            }
        }

# Register tools
TOOLS: List[Callable[..., Any]] = [plant_disease_classifier]

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
    
    classification_results: Dict[str, Any] = field(default_factory=dict)
    """Stores plant disease classification results including:
        - predictions: List of classification results
        - metadata: Analysis timestamp and status
    """

def load_chat_model(fully_specified_name: str) -> BaseChatModel:
    """Load a chat model from a fully specified name."""
    provider, model = fully_specified_name.split("/", maxsplit=1)
    return init_chat_model(model, model_provider=provider)

async def call_model(state: State) -> Dict[str, List[AIMessage]]:
    """Call the LLM powering our agent."""
    configuration = Configuration.from_context()

    # Initialize the model with tool binding
    model = load_chat_model(configuration.model).bind_tools(TOOLS)

    # Format the system prompt
    system_message = configuration.system_prompt.format(
        system_time=datetime.now(tz=UTC).isoformat()
    )

    # Prepare messages - include info about available image data
    messages = [{"role": "system", "content": system_message}]
    
    # Add context about image availability
    if state.image_data:
        context_msg = "Note: There is image data available in the state that can be analyzed."
        messages.append({"role": "system", "content": context_msg})
    
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
            if tool_call["name"] == "plant_disease_classifier":
                try:
                    result = plant_disease_classifier(state.image_data)
                    tool_messages.append({
                        "role": "tool",
                        "content": json.dumps(result),
                        "tool_call_id": tool_call["id"]
                    })
                except Exception as e:
                    tool_messages.append({
                        "role": "tool", 
                        "content": f"Error: {str(e)}",
                        "tool_call_id": tool_call["id"]
                    })
        
        return {"messages": tool_messages}

# Define the graph
builder = StateGraph(State, input_schema=InputState, context_schema=Configuration)

# Define nodes
builder.add_node(call_model)
builder.add_node("tools", ImageToolNode(TOOLS))

# Set the entrypoint
builder.add_edge("__start__", "call_model")

def route_model_output(state: State) -> Literal["__end__", "tools"]:
    """Determine the next node based on the model's output."""
    last_message = state.messages[-1]
    if not isinstance(last_message, AIMessage):
        raise ValueError(f"Expected AIMessage, but got {type(last_message).__name__}")
    
    # If there is no tool call, then we finish
    if not last_message.tool_calls:
        return "__end__"
    # Otherwise we execute the requested actions
    return "tools"

# Add conditional edges
builder.add_conditional_edges("call_model", route_model_output)
builder.add_edge("tools", "call_model")

# Compile the graph
graph = builder.compile(name="ReAct Image Agent")

# --- Usage Example ---
async def test_agent():
    """Test the agent with an image."""
    print("=== Testing Custom ReAct Image Agent ===")
    
    # Test direct tool usage
    print("Direct tool test:")
    image_url = "https://plantvillage-production-new.s3.amazonaws.com/image/99416/file/default-eb4701036f717c99bf95001c1a8f7b40.jpg"
    tool_result = plant_disease_classifier.invoke(image_url)
    print("Disease classification results:", tool_result)
    
    # Test agent usage
    print("\nAgent test:")
    initial_state = {
        "messages": [HumanMessage(content="What plant disease does my apple plant have here from this leaf?")],
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
