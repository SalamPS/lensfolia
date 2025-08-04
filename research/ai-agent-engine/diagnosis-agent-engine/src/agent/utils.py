"""Utility & helper functions."""

from langchain.chat_models import init_chat_model
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langgraph.prebuilt import create_react_agent
from supabase.client import Client, create_client
from datetime import UTC, datetime

from .configuration import Configuration, Config

# Initialize services
def get_supabase_client() -> Client:
    """Initialize and return Supabase client."""
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY)

def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    """Initialize and return Google embeddings."""
    return GoogleGenerativeAIEmbeddings(
        api_key=Config.GOOGLE_API_KEY,
        model=Config.EMBEDDING_MODEL
    )

def get_vector_store() -> SupabaseVectorStore:
    """Initialize and return Supabase vector store."""
    supabase = get_supabase_client()
    embeddings = get_embeddings()
    
    return SupabaseVectorStore(
        client=supabase,
        embedding=embeddings,
        table_name="documents",
        query_name="match_documents",
    )

def get_message_text(msg: BaseMessage) -> str:
    """Get the text content of a message."""
    content = msg.content
    if isinstance(content, str):
        return content
    elif isinstance(content, dict):
        return content.get("text", "")
    else:
        txts = [c if isinstance(c, str) else (c.get("text") or "") for c in content]
        return "".join(txts).strip()

def load_chat_model(fully_specified_name: str) -> BaseChatModel:
    """Load a chat model from a fully specified name.

    Args:
        fully_specified_name (str): String in the format 'provider/model'.
    """
    provider, model = fully_specified_name.split("/", maxsplit=1)
    return init_chat_model(model, model_provider=provider)

def create_retriever_agent():
    """Create a retriever agent with access to document search and web search tools."""
    from .tools import search_plant_info, search_products, web_search
    
    configuration = Configuration.from_context()
    model = load_chat_model(configuration.model)
    
    # Tools available to the retriever agent
    retriever_tools = [search_plant_info, search_products, web_search]
    
    # Create the react agent
    retriever_agent = create_react_agent(
        model,
        retriever_tools,
        state_modifier=configuration.retriever_agent_prompt.format(
            system_time=datetime.now(tz=UTC).isoformat()
        )
    )
    
    return retriever_agent
