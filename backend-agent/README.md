# Backend Agent - FastAPI + LangChain

AI backend service với RAG (Retrieval-Augmented Generation) capabilities.

## 🎯 Features

- **FastAPI REST API** - Fast, modern web framework
- **LangChain Integration** - AI agent với tool support
- **Pinecone Vector Search** - Semantic document search
- **OpenAI LLM** - GPT-4o-mini for chat
- **CORS Enabled** - Ready for frontend integration

## 📝 API Endpoints

### GET /health
Health check endpoint

**Response:**
```json
{"status": "ok"}
```

### POST /chat
Chat with AI agent

**Request:**
```json
{
  "message": "Công ty có chính sách làm việc từ xa không?"
}
```

**Response:**
```json
{
  "reply": "Theo tài liệu nội bộ, công ty cho phép làm việc từ xa tối đa 3 ngày/tuần..."
}
```

## 🚀 Local Development

### Install dependencies
```bash
pip install -r requirements.txt
```

### Run server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Access API docs
http://localhost:8000/docs

## 🔧 Configuration

Environment variables in `.env`:
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
PINECONE_API_KEY=...
PINECONE_INDEX=quickstart
```

## 📦 Embedding Documents

```bash
# Embed documents to Pinecone
python embed_documents.py --folder ../docs --index-name quickstart
```

## 🐳 Docker

```bash
docker build -t ai-platform-backend .
docker run -p 8000:80 -e OPENAI_API_KEY=sk-... ai-platform-backend
```

## 🧪 Testing

```bash
curl http://localhost:8000/health
curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{"message":"Hello!"}'
```
