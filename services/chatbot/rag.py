# import basics
import os
from dotenv import load_dotenv

# import langchain
from langchain.agents import AgentExecutor
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.chat_models import init_chat_model
from langchain_core.messages import AIMessage, HumanMessage
from langchain.agents import create_tool_calling_agent
from langchain import hub
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import tool
from supabase.client import Client, create_client

# load environment variables
load_dotenv()  

class Config:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") 
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    PRODUCT_COLLECTION_NAME = "lensfolia_collection"
    EMBEDDING_MODEL = "models/gemini-embedding-001"
    CHAT_MODEL = "gemini-2.5-flash"
    MODEL_PROVIDER = "google_genai"

###############################   INITIALIZE EMBEDDINGS MODEL  #################################################################################################

embeddings = GoogleGenerativeAIEmbeddings(
    api_key=Config.GOOGLE_API_KEY,
    model=Config.EMBEDDING_MODEL
)

###############################   INITIALIZE SUPABASE VECTOR STORE   #############################################################################################

supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY)

vector_store = SupabaseVectorStore(
    client=supabase,
    embedding=embeddings,
    table_name="documents",
    query_name="match_documents",
)

###############################   INITIALIZE CHAT MODEL   #######################################################################################################

llm = init_chat_model(
    model=Config.CHAT_MODEL,
    model_provider=Config.MODEL_PROVIDER,
    temperature=0
)

       
# pulling prompt from hub
prompt = PromptTemplate.from_template("""
Anda adalah asisten cerdas untuk aplikasi LensFolia, yang membantu menjawab pertanyaan seputar:
- Dr. Lensi (diagnosis penyakit tanaman)
- Lenskipledia (ensiklopedia penyakit tanaman dan produk)
- Lensi Diskusi (forum komunitas)

Anda akan menerima sebuah pertanyaan (query) dan riwayat percakapan (chat history).
Tugas Anda adalah menggunakan alat `search_faq` untuk mengambil informasi relevan dari basis data pengetahuan dan memberikan jawaban yang ringkas, jelas, dan akurat dalam Bahasa Indonesia.

**Instruksi penting:**
- Gunakan informasi yang diambil dari basis data pengetahuan sebagai sumber utama.
- Jika Anda tidak menemukan jawabannya, katakan "Saya tidak tahu" dan jangan membuat informasi baru.
- Jangan menjawab di luar topik aplikasi LensFolia.
- Gunakan bahasa yang ramah, jelas, dan mudah dipahami.
- Selalu pertimbangkan riwayat percakapan untuk memberikan jawaban yang kontekstual dan relevan.
- Jika riwayat percakapan menyebutkan nama pengguna atau informasi pribadi, gunakan informasi tersebut dalam respons Anda.
     
                                       
Pertanyaan pengguna:
{input}

Riwayat percakapan:
{chat_history}

Scratchpad (catatan internal):
{agent_scratchpad}
""")


# creating the retriever tool
@tool
def search_faq(query, k=3):
    """Search FAQ documents only using metadata filter"""
    filter_dict = {"doc_type": "faq"}
    return vector_store.similarity_search(query, k=k, filter=filter_dict)

# combining all tools
tools = [search_faq]

# initiating the agent
agent = create_tool_calling_agent(llm, tools, prompt)

# create the agent executor
agent_executor = AgentExecutor(agent=agent, tools=tools)
