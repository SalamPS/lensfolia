"""Define the configurable parameters for the agent."""

from __future__ import annotations

import os
from dataclasses import dataclass, field, fields
from typing import Annotated, ClassVar

from dotenv import load_dotenv
from langchain_core.runnables import ensure_config
from langgraph.config import get_config
from langgraph.store.memory import InMemoryStore
from langgraph.store.base import BaseStore


# Load environment variables from .env file
load_dotenv()


@dataclass(kw_only=True)
class Configuration:
    """The configuration for the agent."""
    
    # Class variable to hold the singleton memory store instance
    _memory_store_instance: ClassVar[BaseStore] = None
    
    model: Annotated[str, {"__template_metadata__": {"kind": "llm"}}] = field(
        default="google_genai/gemini-2.5-flash",
        metadata={"description": "The name of the language model to use."},
    )
    
    # API Keys and URLs from environment variables
    google_api_key: str = field(
        default_factory=lambda: os.getenv("GOOGLE_API_KEY", ""),
        metadata={"description": "Google Generative AI API key"}
    )
    
    supabase_url: str = field(
        default_factory=lambda: os.getenv("SUPABASE_URL", ""),
        metadata={"description": "Supabase project URL"}
    )
    
    supabase_anon_key: str = field(
        default_factory=lambda: os.getenv("SUPABASE_ANON_KEY", ""),
        metadata={"description": "Supabase anonymous key"}
    )
    
    tavily_api_key: str = field(
        default_factory=lambda: os.getenv("TAVILY_API_KEY", ""),
        metadata={"description": "Tavily search API key"}
    )
    
    # Static configuration
    product_collection_name: str = field(
        default="lensfolia_collection",
        metadata={"description": "Name of the product collection"}
    )
    
    embedding_model: str = field(
        default="models/gemini-embedding-001",
        metadata={"description": "Embedding model identifier"}
    )
    
    # Memory store for long-term persistence - use singleton instance
    memory_store: Annotated[BaseStore, {"default": InMemoryStore()}] = field(
        default_factory=lambda: Configuration._get_memory_store_instance(),
        metadata={"description": "Memory store for user data persistence"}
    )
    
    @classmethod
    def _get_memory_store_instance(cls) -> BaseStore:
        """Get or create the singleton memory store instance."""
        if cls._memory_store_instance is None:
            cls._memory_store_instance = InMemoryStore()
        return cls._memory_store_instance

    @classmethod
    def from_context(cls) -> Configuration:
        """Create a Configuration instance from a RunnableConfig object."""
        try:
            config = get_config()
        except RuntimeError as e:
            config = None
        
        try:
            config = ensure_config(config)
        except Exception as e:
            raise
        
        configurable = config.get("configurable") or {}
        
        _fields = {f.name for f in fields(cls) if f.init}
        
        try:
            result = cls(**{k: v for k, v in configurable.items() if k in _fields})
            return result
        except Exception as e:
            raise