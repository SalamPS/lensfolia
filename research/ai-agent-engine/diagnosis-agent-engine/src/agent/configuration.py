"""Define the configurable parameters for the agent."""

from __future__ import annotations

import os
from dataclasses import dataclass, field, fields
from typing import Annotated

from langchain_core.runnables import ensure_config
from langgraph.config import get_config

from . import prompts

@dataclass(kw_only=True)
class Configuration:
    """The configuration for the agent."""

    # System prompts stored as class fields
    system_prompt: str = field(
        default=prompts.SYSTEM_PROMPT,
        metadata={
            "description": "The system prompt to use for the agent's interactions."
        },
    )
    
    image_analysis_prompt: str = field(
        default=prompts.IMAGE_ANALYSIS_PROMPT,
        metadata={
            "description": "The prompt for image analysis and disease detection."
        },
    )
    
    query_generation_prompt: str = field(
        default=prompts.QUERY_GENERATION_PROMPT,
        metadata={
            "description": "The prompt for generating search queries."
        },
    )
    
    rag_system_prompts: dict = field(
        default_factory=lambda: prompts.RAG_SYSTEM_PROMPTS,
        metadata={
            "description": "System prompts for different RAG operations."
        },
    )
    
    retriever_agent_prompt: str = field(
        default=prompts.RETRIEVER_AGENT_PROMPT,
        metadata={
            "description": "The prompt for the retriever agent."
        },
    )

    # Model configuration
    model: Annotated[str, {"__template_metadata__": {"kind": "llm"}}] = field(
        default="google_genai/gemini-2.5-flash",
        metadata={
            "description": "The name of the language model to use for the agent's main interactions. "
            "Should be in the form: provider/model-name."
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


# Environment configuration constants
class Config:
    """Environment configuration constants."""
    
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") 
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    PRODUCT_COLLECTION_NAME = "lensfolia_collection"
    EMBEDDING_MODEL = "models/gemini-embedding-001"
