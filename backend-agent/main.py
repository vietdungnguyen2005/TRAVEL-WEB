import os
import logging
import json
from typing import Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prometheus_fastapi_instrumentator import Instrumentator

from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool
from langchain_core.messages import AIMessage, HumanMessage

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

logger = logging.getLogger("backend-agent")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_env(name: str) -> Optional[str]:
    value = os.getenv(name)
    if value is None:
        return None
    value = value.strip()
    return value or None


def _require_env(name: str) -> str:
    value = _get_env(name)
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


# ---------------------------------------------------------------------------
# Qdrant Cloud
# ---------------------------------------------------------------------------
_QDRANT: Optional[QdrantClient] = None
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "documents")


def _get_qdrant() -> QdrantClient:
    global _QDRANT
    if _QDRANT is not None:
        return _QDRANT
    url = _require_env("QDRANT_URL")
    api_key = _require_env("QDRANT_API_KEY")
    _QDRANT = QdrantClient(url=url, api_key=api_key, timeout=30)
    return _QDRANT


# ---------------------------------------------------------------------------
# RDS PostgreSQL (metadata / conversation history)
# ---------------------------------------------------------------------------
_DB_POOL = None


def _get_db():
    global _DB_POOL
    if _DB_POOL is not None:
        return _DB_POOL
    import psycopg2
    from psycopg2 import pool
    _DB_POOL = pool.SimpleConnectionPool(
        minconn=1,
        maxconn=5,
        host=_require_env("RDS_HOST"),
        port=int(os.getenv("RDS_PORT", "5432")),
        dbname=os.getenv("RDS_DBNAME", "aiplatform"),
        user=_require_env("RDS_USER"),
        password=_require_env("RDS_PASSWORD"),
    )
    return _DB_POOL


def _init_db_tables():
    """Create tables if not present."""
    pool = _get_db()
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id SERIAL PRIMARY KEY,
                    user_message TEXT NOT NULL,
                    ai_reply TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE TABLE IF NOT EXISTS kafka_events (
                    id SERIAL PRIMARY KEY,
                    topic TEXT NOT NULL,
                    payload JSONB NOT NULL,
                    ingested_at TIMESTAMPTZ DEFAULT NOW()
                );
            """)
            conn.commit()
    finally:
        pool.putconn(conn)


def _save_conversation(user_msg: str, ai_reply: str):
    try:
        pool = _get_db()
        conn = pool.getconn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO conversations (user_message, ai_reply) VALUES (%s, %s)",
                    (user_msg, ai_reply),
                )
                conn.commit()
        finally:
            pool.putconn(conn)
    except Exception:
        logger.warning("Could not save conversation to RDS", exc_info=True)


# ---------------------------------------------------------------------------
# LLM — supports bedrock (primary), google, openai
# ---------------------------------------------------------------------------
_LLM = None


def _get_llm():
    global _LLM
    if _LLM is not None:
        return _LLM

    provider = (_get_env("LLM_PROVIDER") or "bedrock").lower()

    if provider == "bedrock":
        from langchain_aws import ChatBedrockConverse
        _LLM = ChatBedrockConverse(
            model_id=os.getenv("BEDROCK_MODEL_ID", "meta.llama3-70b-instruct-v1:0"),
            region_name=os.getenv("AWS_REGION", "ap-southeast-1"),
            temperature=0,
            max_tokens=2048,
        )
    elif provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        _LLM = ChatGoogleGenerativeAI(
            model=os.getenv("GOOGLE_MODEL", "gemini-pro"),
            google_api_key=_require_env("GOOGLE_API_KEY"),
            temperature=0,
            convert_system_message_to_human=True,
        )
    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        _LLM = ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=0,
        )
    else:
        raise RuntimeError(f"Unsupported LLM_PROVIDER: {provider}")

    return _LLM


# ---------------------------------------------------------------------------
# Embeddings — Amazon Titan via Bedrock (default) or OpenAI
# ---------------------------------------------------------------------------
_EMBEDDINGS = None
EMBED_DIM = int(os.getenv("EMBED_DIM", "1024"))


def _get_embeddings():
    global _EMBEDDINGS
    if _EMBEDDINGS is not None:
        return _EMBEDDINGS

    provider = (_get_env("EMBEDDING_PROVIDER") or "bedrock").lower()

    if provider == "bedrock":
        from langchain_aws import BedrockEmbeddings
        _EMBEDDINGS = BedrockEmbeddings(
            model_id=os.getenv("BEDROCK_EMBEDDING_MODEL", "amazon.titan-embed-text-v2:0"),
            region_name=os.getenv("AWS_REGION", "ap-southeast-1"),
        )
    else:
        from langchain_openai import OpenAIEmbeddings
        _EMBEDDINGS = OpenAIEmbeddings(
            model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
        )
    return _EMBEDDINGS


# ---------------------------------------------------------------------------
# LangGraph Tools
# ---------------------------------------------------------------------------

@tool("RAG_Search", description="Search internal knowledge base for relevant documents")
def search_vector_db(query: str) -> str:
    """Query Qdrant Cloud for relevant document chunks."""
    try:
        client = _get_qdrant()
        embeddings = _get_embeddings()
        vector = embeddings.embed_query(query)
        results = client.search(
            collection_name=QDRANT_COLLECTION,
            query_vector=vector,
            limit=5,
            with_payload=True,
        )
        if not results:
            return "No relevant documents found."
        docs = []
        for pt in results:
            text = pt.payload.get("text", "")[:500] if pt.payload else ""
            source = pt.payload.get("source", "unknown") if pt.payload else "unknown"
            docs.append(f"[{source}] (score={pt.score:.3f}): {text}")
        return "\n---\n".join(docs)
    except Exception as exc:
        return f"Vector search unavailable: {exc}"


@tool("Query_Logs", description="Query recent platform events/logs from database")
def query_recent_events(topic: str = "all") -> str:
    """Retrieve the most recent Kafka-ingested events from RDS."""
    try:
        pool = _get_db()
        conn = pool.getconn()
        try:
            with conn.cursor() as cur:
                if topic == "all":
                    cur.execute(
                        "SELECT topic, payload, ingested_at FROM kafka_events ORDER BY ingested_at DESC LIMIT 20"
                    )
                else:
                    cur.execute(
                        "SELECT topic, payload, ingested_at FROM kafka_events WHERE topic = %s ORDER BY ingested_at DESC LIMIT 20",
                        (topic,),
                    )
                rows = cur.fetchall()
            if not rows:
                return "No recent events found."
            lines = [f"[{r[2]}] {r[0]}: {json.dumps(r[1], default=str)[:300]}" for r in rows]
            return "\n".join(lines)
        finally:
            pool.putconn(conn)
    except Exception as exc:
        return f"Event query failed: {exc}"


# ---------------------------------------------------------------------------
# LangGraph Agent
# ---------------------------------------------------------------------------
_AGENT = None


def _get_agent():
    global _AGENT
    if _AGENT is not None:
        return _AGENT
    _AGENT = create_react_agent(
        _get_llm(),
        tools=[search_vector_db, query_recent_events],
    )
    return _AGENT


# ---------------------------------------------------------------------------
# Kafka Consumer (background task)
# ---------------------------------------------------------------------------
_KAFKA_RUNNING = False


async def _kafka_consumer_loop():
    """Background coroutine that consumes Kafka events and stores them in RDS."""
    global _KAFKA_RUNNING
    import asyncio
    bootstrap = _get_env("KAFKA_BOOTSTRAP_SERVERS")
    if not bootstrap:
        logger.info("KAFKA_BOOTSTRAP_SERVERS not set — Kafka consumer disabled")
        return

    from confluent_kafka import Consumer, KafkaError
    topics = (os.getenv("KAFKA_TOPICS") or "app-logs,otel-traces,otel-metrics,processed-events").split(",")
    conf = {
        "bootstrap.servers": bootstrap,
        "group.id": os.getenv("KAFKA_GROUP_ID", "ai-agent-consumer"),
        "auto.offset.reset": "latest",
        "enable.auto.commit": True,
    }
    consumer = Consumer(conf)
    consumer.subscribe(topics)
    _KAFKA_RUNNING = True
    logger.info("Kafka consumer started on topics: %s", topics)

    try:
        while _KAFKA_RUNNING:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                await asyncio.sleep(0.1)
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                logger.error("Kafka error: %s", msg.error())
                continue
            try:
                payload = json.loads(msg.value().decode("utf-8"))
            except (json.JSONDecodeError, UnicodeDecodeError):
                payload = {"raw": msg.value().decode("utf-8", errors="replace")}
            try:
                pool = _get_db()
                conn = pool.getconn()
                try:
                    with conn.cursor() as cur:
                        cur.execute(
                            "INSERT INTO kafka_events (topic, payload) VALUES (%s, %s)",
                            (msg.topic(), json.dumps(payload, default=str)),
                        )
                        conn.commit()
                finally:
                    pool.putconn(conn)
            except Exception:
                logger.warning("Failed to store Kafka event", exc_info=True)
    finally:
        consumer.close()
        logger.info("Kafka consumer stopped")


# ---------------------------------------------------------------------------
# Application Lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    # Init RDS tables (best-effort)
    try:
        _init_db_tables()
        logger.info("RDS tables initialized")
    except Exception:
        logger.warning("RDS not available — will retry on first use", exc_info=True)

    # Start Kafka consumer as background task
    kafka_task = asyncio.create_task(_kafka_consumer_loop())
    yield
    # Shutdown
    global _KAFKA_RUNNING
    _KAFKA_RUNNING = False
    kafka_task.cancel()
    try:
        await kafka_task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="AI Platform Backend", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app, endpoint="/metrics")


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health() -> dict:
    checks: dict[str, str] = {"api": "ok"}
    # Qdrant
    try:
        _get_qdrant().get_collections()
        checks["qdrant"] = "ok"
    except Exception as exc:
        checks["qdrant"] = f"error: {exc}"
    # RDS
    try:
        pool = _get_db()
        conn = pool.getconn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
        finally:
            pool.putconn(conn)
        checks["rds"] = "ok"
    except Exception as exc:
        checks["rds"] = f"error: {exc}"
    status = "ok" if all(v == "ok" for v in checks.values()) else "degraded"
    return {"status": status, "checks": checks}


@app.post("/chat")
async def chat(body: ChatRequest):
    try:
        agent = _get_agent()
        result: Any = agent.invoke({"messages": [HumanMessage(content=body.message)]})
        messages = result.get("messages", []) if isinstance(result, dict) else []
        reply = str(result)
        for msg in reversed(messages):
            if isinstance(msg, AIMessage):
                reply = msg.content
                break
        _save_conversation(body.message, reply)
        return {"reply": reply}
    except Exception as exc:
        error_msg = str(exc)
        if "429" in error_msg or "throttl" in error_msg.lower():
            raise HTTPException(status_code=503, detail="LLM rate limit exceeded. Please retry later.")
        if "401" in error_msg or "credentials" in error_msg.lower():
            raise HTTPException(status_code=503, detail="LLM authentication error. Check credentials.")
        raise HTTPException(status_code=500, detail=f"Error: {error_msg}")


@app.post("/chat-mock")
async def chat_mock(body: ChatRequest):
    """Mock endpoint for testing without LLM credentials."""
    return {
        "reply": (
            f"[Mock] Received: '{body.message[:100]}'. "
            "This is a mock response. Set LLM_PROVIDER and credentials to enable real AI."
        )
    }