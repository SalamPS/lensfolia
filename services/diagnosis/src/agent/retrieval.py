"""Manage the configuration of Supabase vector store retrieval.

This module provides functionality to create and manage retrievers for Supabase
vector store backend, implementing the context manager pattern from the 
retrieval-agent-engine.

The module supports filtering results and proper resource lifecycle management.
"""

from contextlib import contextmanager
from typing import Generator

from langchain_core.embeddings import Embeddings
from langchain_core.runnables import RunnableConfig
from langchain_core.vectorstores import VectorStoreRetriever
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from supabase.client import Client, create_client

from agent.configuration import Configuration


def make_google_embeddings(model: str, api_key: str) -> Embeddings:
    """Create Google Generative AI embeddings instance.
    
    Args:
        model: The embedding model identifier (e.g., "models/gemini-embedding-001")
        api_key: Google API key for authentication
        
    Returns:
        GoogleGenerativeAIEmbeddings instance
        
    Raises:
        ValueError: If the API key is missing or invalid
    """
    if not api_key:
        raise ValueError("Google API key is required for embedding creation")
    
    return GoogleGenerativeAIEmbeddings(
        model=model,
        google_api_key=api_key
    )


@contextmanager
def make_supabase_retriever(
    config: RunnableConfig,
    search_kwargs: dict = None,
    table_name: str = "documents",
    query_name: str = "match_documents"
) -> Generator[VectorStoreRetriever, None, None]:
    """Create a Supabase vector store retriever with proper resource management.
    
    Args:
        config: RunnableConfig containing configuration parameters
        search_kwargs: Additional search parameters for the retriever
        table_name: Name of the Supabase table containing documents
        query_name: Name of the stored procedure for similarity search
        
    Yields:
        VectorStoreRetriever: Configured Supabase vector store retriever
        
    Raises:
        ValueError: If required configuration is missing
    """
    # Extract configuration from RunnableConfig
    configurable = config.get("configurable", {}) if config else {}
    
    # Get configuration values with fallbacks to Configuration defaults
    configuration = Configuration()
    
    supabase_url = configurable.get("supabase_url", configuration.supabase_url)
    supabase_anon_key = configurable.get("supabase_anon_key", configuration.supabase_anon_key)
    google_api_key = configurable.get("google_api_key", configuration.google_api_key)
    embedding_model = configurable.get("embedding_model", configuration.embedding_model)
    
    # Validate required parameters
    if not supabase_url or not supabase_anon_key:
        raise ValueError("Supabase URL and anonymous key are required for vector store initialization")
    
    if not google_api_key:
        raise ValueError("Google API key is required for embedding creation")
    
    # Create Supabase client
    supabase_client: Client = create_client(supabase_url, supabase_anon_key)
    
    # Create embeddings
    embeddings = make_google_embeddings(embedding_model, google_api_key)
    
    # Create vector store
    vector_store = SupabaseVectorStore(
        client=supabase_client,
        embedding=embeddings,
        table_name=table_name,
        query_name=query_name,
    )
    
    # Set up search kwargs
    final_search_kwargs = search_kwargs or {}
    
    try:
        # Yield the retriever
        yield vector_store.as_retriever(search_kwargs=final_search_kwargs)
    finally:
        # Cleanup: Close any resources if needed
        # Note: Supabase client doesn't require explicit cleanup in most cases
        # but this is where we would handle it if needed
        pass


@contextmanager
def make_retriever(
    config: RunnableConfig,
) -> Generator[VectorStoreRetriever, None, None]:
    """Create a retriever for the agent, based on the current configuration.
    
    This is the main entry point that follows the same pattern as the 
    retrieval-agent-engine but specifically for Supabase.
    
    Args:
        config: RunnableConfig containing all necessary configuration parameters
        
    Yields:
        VectorStoreRetriever: Configured retriever instance
        
    Raises:
        ValueError: If required configuration is missing or invalid
    """
    # For the diagnosis agent, we only support Supabase, so we directly
    # delegate to the Supabase-specific implementation
    with make_supabase_retriever(config) as retriever:
        yield retriever


def get_retriever_for_plant_info(config: RunnableConfig) -> VectorStoreRetriever:
    """Get a retriever specifically configured for plant information.
    
    This is a convenience function that creates a retriever with plant-specific
    search filters.
    
    Args:
        config: RunnableConfig containing configuration parameters
        
    Returns:
        VectorStoreRetriever: Configured retriever for plant information
    """
    import asyncio
    
    # Ensure we have an event loop in the current thread
    # This is needed for async operations in threaded contexts 
    try:
        asyncio.get_event_loop()
    except RuntimeError:
        # No event loop in current thread, create one
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    search_kwargs = {"filter": {"doc_type": "plant_info"}}
    
    # Since we can't return a context manager directly, we create the retriever
    # and return it. The caller is responsible for resource management.
    configurable = config.get("configurable", {}) if config else {}
    configuration = Configuration()
    
    supabase_url = configurable.get("supabase_url", configuration.supabase_url)
    supabase_anon_key = configurable.get("supabase_anon_key", configuration.supabase_anon_key)
    google_api_key = configurable.get("google_api_key", configuration.google_api_key)
    embedding_model = configurable.get("embedding_model", configuration.embedding_model)
    
    if not supabase_url or not supabase_anon_key or not google_api_key:
        raise ValueError("Required configuration missing for retriever creation")
    
    supabase_client: Client = create_client(supabase_url, supabase_anon_key)
    embeddings = make_google_embeddings(embedding_model, google_api_key)
    
    vector_store = SupabaseVectorStore(
        client=supabase_client,
        embedding=embeddings,
        table_name="documents",
        query_name="match_documents",
    )
    
    return vector_store.as_retriever(search_kwargs=search_kwargs)


def get_retriever_for_products(config: RunnableConfig) -> VectorStoreRetriever:
    """Get a retriever specifically configured for product information.
    
    This is a convenience function that creates a retriever with product-specific
    search filters.
    
    Args:
        config: RunnableConfig containing configuration parameters
        
    Returns:
        VectorStoreRetriever: Configured retriever for product information
    """
    import asyncio
    
    # Ensure we have an event loop in the current thread
    # This is needed for async operations in threaded contexts (e.g., react agents)
    try:
        asyncio.get_event_loop()
    except RuntimeError:
        # No event loop in current thread, create one
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    search_kwargs = {"filter": {"doc_type": "product"}}
    
    configurable = config.get("configurable", {}) if config else {}
    configuration = Configuration()
    
    supabase_url = configurable.get("supabase_url", configuration.supabase_url)
    supabase_anon_key = configurable.get("supabase_anon_key", configuration.supabase_anon_key)
    google_api_key = configurable.get("google_api_key", configuration.google_api_key)
    embedding_model = configurable.get("embedding_model", configuration.embedding_model)
    
    if not supabase_url or not supabase_anon_key or not google_api_key:
        raise ValueError("Required configuration missing for retriever creation")
    
    supabase_client: Client = create_client(supabase_url, supabase_anon_key)
    embeddings = make_google_embeddings(embedding_model, google_api_key)
    
    vector_store = SupabaseVectorStore(
        client=supabase_client,
        embedding=embeddings,
        table_name="documents",
        query_name="match_documents",
    )
    
    return vector_store.as_retriever(search_kwargs=search_kwargs)