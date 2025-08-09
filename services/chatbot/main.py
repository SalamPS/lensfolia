from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, List, Dict
from rag import agent_executor

app = FastAPI()

conversation_memory: Dict[str, List[Dict[str, Any]]] = {}
MAX_MEMORY_PER_THREAD = 10  

class ChatRequest(BaseModel):
    content: str = Field(..., description="Message content")
    thread_id: str = Field(..., description="Conversation thread identifier")

class ChatResponse(BaseModel):
    content: str = Field(..., description="Response content")

def add_to_memory(thread_id: str, message: Dict[str, Any]) -> None:
    """Add a message to the conversation memory"""
    if thread_id not in conversation_memory:
        conversation_memory[thread_id] = []
    
    conversation_memory[thread_id].append(message)
    
    if len(conversation_memory[thread_id]) > MAX_MEMORY_PER_THREAD:
        conversation_memory[thread_id] = conversation_memory[thread_id][-MAX_MEMORY_PER_THREAD:]

def get_conversation_history(thread_id: str) -> List[Dict[str, Any]]:
    """Get conversation history for a thread"""
    return conversation_memory.get(thread_id, [])

def format_chat_history_for_agent(history: List[Dict[str, Any]]) -> str:
    """Format conversation history for the agent"""
    if not history:
        return ""
    
    formatted_history = []
    for msg in history:
        formatted_history.append(f"User: {msg['content']}")
    
    return "\n".join(formatted_history)

@app.get("/health")
async def health():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    try:
        user_message = {
            "content": payload.content
        }
        
        add_to_memory(payload.thread_id, user_message)
        
        conversation_history = get_conversation_history(payload.thread_id)
  
        previous_messages = [{"content": msg['content']} for msg in conversation_history if msg.get('content')]
        chat_history_str = format_chat_history_for_agent(previous_messages)
        
        agent_input = {
            "input": payload.content,
            "chat_history": chat_history_str
        }
        
        try:
            agent_response = agent_executor.invoke(agent_input)
            bot_content = agent_response.get('output', 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.')
        except Exception as e:
            bot_content = f"Maaf, terjadi kesalahan dalam memproses permintaan Anda: {str(e)}"
        
        bot_message = {
            "content": bot_content
        }
        
        add_to_memory(payload.thread_id, bot_message)
        
        return ChatResponse(content=bot_content)
        
    except Exception as e:
        return ChatResponse(content=f"Terjadi kesalahan server: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)