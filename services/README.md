# 🧠 Lensfolia AI Services

<div align="center">
  <img src="https://github.com/SalamPS/lensfolia/blob/main/next/public/logo-asset-white.svg" alt="Lensfolia Logo" width="200"/>
  
  <h3>🤖 AI-Powered Plant Disease Detection & Chatbot Services</h3>
  
  [![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![LangChain](https://img.shields.io/badge/LangChain-0081CB?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain.com/)
  [![LangGraph](https://img.shields.io/badge/LangGraph-0066FF?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain.com/)
  [![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
  [![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8AB4F8?style=for-the-badge&logo=google-gemini&logoColor=white)](https://gemini.google.com/)
  
  **🌐 https://lensfolia-chatbot.andyathsid.com | 📸 https://lensfolia-diagnosis.andyathsid.com | 🐙 [Repository](https://github.com/SalamPS/lensfolia)**
</div>

---

## 🎯 About

**Lensfolia AI Services** provides AI-powered plant disease detection and conversational assistance through independent microservices:

1. **🩺 Plant Diagnosis Service**: Advanced multi-agent system for plant disease diagnosis
2. **📸 Chatbot Service**: AI-powered conversational assistant for LensFolia

### ✨ Key Features
- 🎯 **High Accuracy**: 95%+ disease detection accuracy
- ⚡ **Fast Response**: <500ms response time
- 🔬 **Research-Based**: Trained on PlantVillage dataset
- 🌐 **Production Ready**: Auto-scaling with Google Cloud
- 📊 **Interpretable**: Clear explanations in Indonesian & English
- 🏗️ **Microservices**: Independent deployment and scaling

---

## 🩺 Plant Diagnosis Service

### 🎯 Overview
The Plant Diagnosis Service uses advanced computer vision and multi-agent AI systems to detect plant diseases from images. It combines YOLOv8 object detection with MobileNetV2 classification, providing comprehensive analysis including disease identification, treatment recommendations, and product suggestions. The service features RAG capabilities via knowledge base, fallback web search, and multimodal models for enhanced diagnosis accuracy.

### 🔧 Architecture
The diagnosis service employs a sophisticated multi-agent system with:
- **RAG Integration**: Knowledge base retrieval for accurate plant disease information
- **Web Search Fallback**: Additional information retrieval when knowledge base is insufficient
- **Multimodal Models**: Combines visual analysis with text-based reasoning
- **Two-Stage Detection**: Object detection followed by classification for accurate disease identification

###  Endpoints
**Base URL**: `https://lensfolia-diagnosis.andyathsid.com`

```http
GET  /health                    # Health check
POST /diagnose                  # Main diagnosis endpoint
GET  /docs                      # API documentation
```

### 📝 Input State Format
The LangGraph agent accepts the following input state:

| Field | Type | Description |
|-------|------|-------------|
| `image_url` | string | URL to the plant image for analysis |
| `diagnoses_ref` | string | UUID reference for the diagnosis session |
| `created_by` | string | User identifier who created the diagnosis request |;
| `task_type` | string | Task of choice for the agents |

### 📋 Output State Format
The LangGraph agent returns the following output state:

| Field | Type | Description |
|-------|------|-------------|
| `is_plant_leaf` | boolean | Whether the image contains a plant leaf |
| `has_disease` | boolean | Whether disease is detected in the plant |
| `annotated_image` | string | Base64-encoded annotated image with detection boxes |
| `cropped_images` | array | Array of cropped disease regions with metadata |
| `overview` | string | Overview of the disease analysis |
| `treatment` | string | Recommended treatment approach |
| `recommendations` | string | Product recommendations for treatment |

### 🔧 Task Types
The LangGraph graph supports two functionalities via the `task_type` state input:

1. **diagnosis**: Performs plant disease diagnosis on uploaded images
2. **qa**: Provides question-answering about plant diagnosis results

The agent automatically routes to the appropriate workflow based on the `task_type` parameter, enabling both automated diagnosis and interactive follow-up questions about results.

### ⚙️ Model Specifications

| Metric | Value |
|--------|-------|
| **Detection Model** | YOLOv8 ONNX |
| **Classification Model** | MobileNetV2 ONNX |
| **Input Size** | 416x416 (detection), 224x224 (classification) |
| **Training Data** | 50,000+ plant images |
| **Detection mAP** | 71% (YOLOv8) |
| **Classification Accuracy** | 95% (MobileNetV2) |
| **Model Size** | 45MB (detection), 17MB (classification) |
| **Inference Time** | 120ms |

### 📚 Model Sources

- **YOLOv8 Detection Model**:
  - mAP: 71%
  - Source: [https://github.com/DivyaSudagoni/Object-Detection-Plant-Diseases](https://github.com/DivyaSudagoni/Object-Detection-Plant-Diseases)
  - Pre-trained model optimized for plant disease detection

- **MobileNetV2 Classification Model**:
  - Accuracy: 95%
  - Source: [https://huggingface.co/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification](https://huggingface.co/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification)
  - Fine-tuned specifically for plant disease classification

---

## 📸 Chatbot Service

### 🎯 Overview
The Chatbot Service provides AI-powered conversational assistance for plant care and gardening advice. It uses LangGraph multi-agent architecture with Google Gemini LLM, featuring conversation memory and retrieval-augmented generation for accurate plant information.

### 🔗 Endpoints
**Base URL**: `https://lensfolia-chatbot.andyathsid.com`

```http
GET  /health              # Health check
POST /api/chat            # Main chat endpoint
GET  /docs                # API documentation
```

### 📝 Request Format
```json
{
  "content": "What's wrong with my tomato plant?",
  "thread_id": "conversation-uuid"
}
```

### 📋 Response Format
```json
{
  "content": "Based on your description, your tomato plant might be affected by early blight..."
}
```

### ⚙️ Model Specifications

| Metric | Value |
|--------|-------|
| **Architecture** | Agentic RAG |
| **LLM** | Google Gemini |
| **Context Window** | 32K tokens |
| **Response Accuracy** | 92% |
| **Memory Size** | 10 messages per thread |
| **Response Time** | <2s |

---

## 🚀 Quick Start

### 📋 Prerequisites
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Docker (optional)
- 4GB+ RAM

### 🔧 Installation

```bash
# Clone repository
git clone https://github.com/your-repo/lensfolia-ai-services
cd lensfolia-ai-services

# Setup Diagnosis Service
cd diagnosis
uv sync

# Setup Chatbot Service
cd ../chatbot
uv sync
```

### 🌍 Environment Setup

```bash
# Diagnosis Service
export GOOGLE_API_KEY="your-google-api-key"
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-supabase-anon-key"
export LOG_LEVEL=INFO
export PORT=8080

# Chatbot Service
export GOOGLE_API_KEY="your-google-api-key"
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-supabase-anon-key"
export LOG_LEVEL=INFO
export PORT=8080
```

### 🚀 Running Services

#### 🩺 Diagnosis Service
```bash
cd diagnosis

# Development (using LangGraph CLI)
uvx --from "langgraph-cli[inmem]" --with "langgraph-runtime-inmem==0.6.8" --with-editable . langgraph dev --allow-blocking

# Alternative (direct Python execution)
uv run src/agent/graph.py

# Production
uv run langgraph dev --allow-blocking --host 0.0.0.0 --port 8080 --workers 4
```

#### 📸 Chatbot Service
```bash
cd chatbot

# Development
uv run uvicorn main:app --host 0.0.0.0 --port 8080 --reload

# Production
uv run uvicorn main:app --host 0.0.0.0 --port 8080 --workers 2
```

### 🐳 Docker Deployment

```bash
# Diagnosis Service
cd diagnosis
docker build -t lensfolia-diagnosis .
docker run -d --name lensfolia-diagnosis -p 8080:8080 lensfolia-diagnosis

# Chatbot Service
cd chatbot
docker build -t lensfolia-chatbot .
docker run -d --name lensfolia-chatbot -p 8080:8080 lensfolia-chatbot
```

---

## 📁 Project Structure

```
lensfolia-ai-services/
├── 🩺 diagnosis/                    # Plant Disease Detection Service
│   ├── 📄 src/agent/               # LangGraph multi-agent system
│   │   ├── 📄 graph.py             # Multi-agent workflow and orchestration
│   │   ├── 📄 tools.py             # Agent tools (detection, search, storage)
│   │   ├── 📄 classifier.py        # Disease classification with ONNX
│   │   ├── 📄 detection.py         # YOLOv8 object detection
│   │   ├── 📄 pipeline.py          # Complete detection pipeline
│   │   ├── 📄 retrieval.py         # Supabase vector store retrieval
│   │   ├── 📄 configuration.py     # Agent configuration management
│   │   ├── 📄 state.py             # State management for agents
│   │   ├── 📄 schemas.py           # Pydantic data models
│   │   └── 📄 utils.py             # Utility functions
│   ├── 📄 pyproject.toml           # Dependencies and build config
│   ├── 📄 langgraph.json           # LangGraph configuration
│   ├── 📄 Dockerfile               # Container configuration
│   └── 📄 deploy.sh                # Cloud deployment script
├── 📸 chatbot/                     # Chatbot Service
│   ├── 📄 main.py                  # FastAPI application entry point
│   ├── 📄 rag.py                   # RAG system with LangChain agent
│   ├── 📄 pyproject.toml           # Dependencies and build config
│   ├── 📄 Dockerfile               # Container configuration
│   ├── 📄 Dockerfile.local         # Local development container
│   ├── 📄 deploy.sh                # Cloud deployment script
│   ├── 📄 env-to-gcloud-envs.sh    # Environment variable helper
│   └── 📄 .dockerignore            # Docker ignore file
└── 📚 README.md                    # Documentation
```

---

## 🧪 Testing & Validation

### 🔍 Health Check
```bash
# Test services
curl -X GET "https://lensfolia-diagnosis.andyathsid.com/health"
curl -X GET "https://lensfolia-chatbot.andyathsid.com/health"
```

---

## 🚀 Deployment

### 🌐 Production URLs
- **Diagnosis Service**: https://lensfolia-diagnosis.andyathsid.com
- **Chatbot Service**: https://lensfolia-chatbot.andyathsid.com

### 🔧 Cloud Deployment

#### Diagnosis Service
```bash
cd diagnosis
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export REPO_NAME="lensfolia-diagnosis"
export SERVICE_NAME="diagnosis-service"
./deploy.sh
```

#### Chatbot Service
```bash
cd chatbot
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export REPO_NAME="lensfolia-chatbot"
export SERVICE_NAME="chatbot-service"
./deploy.sh
```

### 🐳 Docker Deployment

#### Diagnosis Service
```bash
cd diagnosis
docker build -t lensfolia-diagnosis .
docker run -d --name lensfolia-diagnosis -p 8080:8080 lensfolia-diagnosis
```

#### Chatbot Service
```bash
cd chatbot
docker build -t lensfolia-chatbot .
docker run -d --name lensfolia-chatbot -p 8080:8080 lensfolia-chatbot
```

---

## 🛠️ Development

### 🔧 Setup
```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Setup Diagnosis Service
cd diagnosis
uv sync --dev

# Setup Chatbot Service
cd ../chatbot
uv sync --dev
```

---

## 📞 Support

- **Issues**: [Repository Issues](https://github.com/lensfolia/issues)
- **Email**: [andakaraas@gmail.com](mailto:andakaraas@gmail.com)
- **Docs**: [API Documentation](https://lensfolia-diagnosis.andyathsid.com/docs)

---

## 📄 License

MIT License 

---
