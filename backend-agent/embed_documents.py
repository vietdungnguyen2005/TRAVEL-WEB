"""
Embed documents into Qdrant Cloud vector database.

Usage:
    python embed_documents.py --folder ./docs --collection documents
    python embed_documents.py --folder ./docs --embedding-provider openai
"""
import os
import argparse
import uuid
from pathlib import Path
from typing import List

from dotenv import load_dotenv

load_dotenv()

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct


def load_documents(folder_path: str) -> List:
    documents = []
    folder = Path(folder_path)
    if not folder.exists():
        print(f"Folder not found: {folder_path}")
        return documents
    for pdf_file in folder.glob("**/*.pdf"):
        print(f"Loading PDF: {pdf_file.name}")
        loader = PyPDFLoader(str(pdf_file))
        documents.extend(loader.load())
    for txt_file in folder.glob("**/*.txt"):
        print(f"Loading TXT: {txt_file.name}")
        loader = TextLoader(str(txt_file), encoding="utf-8")
        documents.extend(loader.load())
    print(f"Loaded {len(documents)} documents")
    return documents


def split_documents(documents: List, chunk_size: int = 1000, chunk_overlap: int = 200) -> List:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )
    chunks = splitter.split_documents(documents)
    print(f"Split into {len(chunks)} chunks")
    return chunks


def _get_embeddings(provider: str):
    if provider == "bedrock":
        from langchain_aws import BedrockEmbeddings
        return BedrockEmbeddings(
            model_id=os.getenv("BEDROCK_EMBEDDING_MODEL", "amazon.titan-embed-text-v2:0"),
            region_name=os.getenv("AWS_REGION", "ap-southeast-1"),
        ), int(os.getenv("EMBED_DIM", "1024"))
    else:
        from langchain_openai import OpenAIEmbeddings
        return OpenAIEmbeddings(
            model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
        ), 1536


def embed_to_qdrant(chunks: List, collection: str, embedding_provider: str):
    url = os.environ["QDRANT_URL"]
    api_key = os.environ["QDRANT_API_KEY"]
    client = QdrantClient(url=url, api_key=api_key, timeout=60)

    embeddings, dim = _get_embeddings(embedding_provider)

    # Create collection if not exists
    collections = [c.name for c in client.get_collections().collections]
    if collection not in collections:
        print(f"Creating Qdrant collection: {collection} (dim={dim})")
        client.create_collection(
            collection_name=collection,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )

    batch_size = 64
    for start in range(0, len(chunks), batch_size):
        batch = chunks[start : start + batch_size]
        texts = [c.page_content for c in batch]
        vectors = embeddings.embed_documents(texts)
        points = []
        for i, (chunk, vec) in enumerate(zip(batch, vectors)):
            payload = {
                "text": chunk.page_content[:2000],
                "source": chunk.metadata.get("source", "unknown"),
                "page": chunk.metadata.get("page", 0),
            }
            points.append(PointStruct(id=str(uuid.uuid4()), vector=vec, payload=payload))
        client.upsert(collection_name=collection, points=points)
        print(f"  Uploaded {min(start + batch_size, len(chunks))}/{len(chunks)} chunks")

    info = client.get_collection(collection)
    print(f"Done! Collection '{collection}' has {info.points_count} points")


def main():
    parser = argparse.ArgumentParser(description="Embed documents into Qdrant Cloud")
    parser.add_argument("--folder", default="./docs", help="Folder containing documents")
    parser.add_argument("--collection", default="documents", help="Qdrant collection name")
    parser.add_argument("--embedding-provider", default="bedrock", choices=["bedrock", "openai"])
    parser.add_argument("--chunk-size", type=int, default=1000)
    parser.add_argument("--chunk-overlap", type=int, default=200)
    args = parser.parse_args()

    print("=" * 60)
    print("Document Embedding -> Qdrant Cloud")
    print("=" * 60)

    documents = load_documents(args.folder)
    if not documents:
        print("No documents found.")
        return

    chunks = split_documents(documents, args.chunk_size, args.chunk_overlap)
    embed_to_qdrant(chunks, args.collection, args.embedding_provider)


if __name__ == "__main__":
    main()
