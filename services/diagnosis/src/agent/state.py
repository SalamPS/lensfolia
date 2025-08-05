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

@dataclass  
class State(InputState):
    """Represents the complete state of the agent, extending InputState with additional attributes.

    This class can be used to store any information needed throughout the agent's lifecycle.
    """
    
    is_last_step: IsLastStep = field(default=False)
    """
    Indicates whether the current step is the last one before the graph raises an error.

    This is a 'managed' variable, controlled by the state machine rather than user code.
    It is set to 'True' when the step count reaches recursion_limit - 1.
    """
    
    # Analysis results
    is_plant_leaf: bool = field(default=False)
    """Whether the analyzed image contains a plant leaf."""
    
    has_disease: bool = field(default=False)
    """Whether disease was detected on the leaf."""
    
    plant_type: str = field(default="Unknown")
    """Identified plant type or 'Unknown' if not determined."""
    
    image_analysis: str = field(default="")
    """Detailed analysis results from the initial image analysis."""
    
    # Detection results
    detection_results: Dict[str, Any] = field(default_factory=dict)
    """Results from the plant disease detection pipeline."""
    
    top_predictions: List[Dict] = field(default_factory=list)
    """Top predictions for each detected object in the image."""
    
    confidence_score: float = field(default=0.0)
    """Overall confidence score for the diagnosis (0-1)."""
    
    # Retrieval results
    overview: str = field(default="")
    """Generated disease overview and information."""
    
    treatment: str = field(default="")
    """Generated treatment recommendations."""
    
    recommendations: str = field(default="")
    """Generated treatment recommendations."""
    
    # Search queries
    overview_query: str = field(default="")
    """Generated search query for disease overview information."""
    
    treatment_query: str = field(default="")
    """Generated search query for treatment information."""
    
    recommendation_query: str = field(default="")
    """Generated search query for treatment recommendations."""
    
    # Retriever state
    current_retrieval_task: str = field(default="")
    """Current retrieval task: 'overview', 'treatment', or 'product'."""
    
    retrieval_context: str = field(default="")
    """Context retrieved by the retriever agent for the current task."""
    
    # Final response
    disease_name: str = field(default="None detected")
    """Identified disease name or 'None detected'."""
    
    final_response_saved: bool = field(default=False)

    # Additional attributes can be added here as needed.
    # Common examples include:
    # retrieved_documents: List[Document] = field(default_factory=list)
    # extracted_entities: Dict[str, Any] = field(default_factory=dict)
    # api_connections: Dict[str, Any] = field(default_factory=dict)