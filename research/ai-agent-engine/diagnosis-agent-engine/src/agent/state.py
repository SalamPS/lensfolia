"""Define the state structures for the agent."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Any, Sequence, Annotated

from langchain_core.messages import AnyMessage
from langgraph.graph import add_messages
from langgraph.managed import IsLastStep


@dataclass
class InputState:
    """Defines the input state for the agent, representing a narrower interface to the outside world.

    This class is used to define the initial state and structure of incoming data.
    """
    
    messages: Annotated[Sequence[AnyMessage], add_messages] = field(default_factory=list)
    """
    Messages tracking the primary execution state of the agent.

    Typically accumulates a pattern of:
    1. HumanMessage - user input
    2. AIMessage with .tool_calls - agent picking tool(s) to use to collect information
    3. ToolMessage(s) - the responses (or errors) from the executed tools
    4. AIMessage without .tool_calls - agent responding in unstructured format to the user
    5. HumanMessage - user responds with the next conversational turn

    Steps 2-5 may repeat as needed.

    The `add_messages` annotation ensures that new messages are merged with existing ones,
    updating by ID to maintain an "append-only" state unless a message with the same ID is provided.
    """
    
    image_url: str = field(default="")
    """URL of the image to be analyzed for plant diseases."""

    diagnoses_ref: str = field(default="")
    """Reference ID for the diagnosis request."""
    
    created_by: str = field(default="")
    """ID of the user who created the diagnosis request."""
    
    task_type: str = field(default="diagnosis")
    """Type of task: 'diagnosis' or 'qa'."""
    
    user_id: str = field(default="")
    """User ID for memory management."""
    
    thread_id: str = field(default="")
    """Thread ID for session management."""
    
    diagnosis_memory: dict = field(default_factory=dict)
    """Cached diagnosis result from memory store."""

@dataclass
class ChatState(InputState):
    """State for QA conversations, inheriting core fields from InputState."""
    is_last_step: IsLastStep = field(default=False)
    is_plant_leaf: bool = field(default=False)
    has_disease: bool = field(default=False)
    image_analysis: str = field(default="")
    top_predictions: List[Dict] = field(default_factory=list)
    confidence_score: float = field(default=0.0)
    overview: str = field(default="")
    treatment: str = field(default="")
    recommendations: str = field(default="")

@dataclass
class State(ChatState):
    """Represents the complete state of the agent, extending InputState with additional attributes.

    This class can be used to store any information needed throughout the agent's lifecycle.
    """
    
    plant_type: str = field(default="Unknown")
    """Identified plant type or 'Unknown' if not determined."""
    
    detection_results: Dict[str, Any] = field(default_factory=dict)
    """Results from the plant disease detection pipeline."""
    
    overview_query: str = field(default="")
    """Generated search query for disease overview information."""
    
    treatment_query: str = field(default="")
    """Generated search query for treatment information."""
    
    recommendation_query: str = field(default="")
    """Generated search query for treatment recommendations."""
    
    current_retrieval_task: str = field(default="")
    """Current retrieval task: 'overview', 'treatment', or 'product'."""
    
    retrieval_context: str = field(default="")
    """Context retrieved by the retriever agent for the current task."""
    
    disease_name: str = field(default="None detected")
    """Identified disease name or 'None detected'."""
    
    final_response_saved: bool = field(default=False)
