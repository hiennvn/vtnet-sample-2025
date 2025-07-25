from typing import Dict, Optional, cast
from langchain_core.documents import Document
from pydantic import BaseModel, Field
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters.markdown import MarkdownTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from qdrant_client import models
from app import consts


class ExtractedQueries(BaseModel):
    queries: list[str] = Field(description="List of queries to extract from the document")


class RAG:
    def __init__(self):       
        client = QdrantClient(consts.QDRANT_URL)
        self.collection_name = "documents"

        is_collection_existed = client.collection_exists(self.collection_name)
        if not is_collection_existed:
            client.create_collection(
                collection_name="documents",
                vectors_config=VectorParams(size=768, distance=Distance.COSINE),
            )
        self.client = client
        self.vector_store = QdrantVectorStore(
            client=client,
            embedding=OllamaEmbeddings(model="nomic-embed-text", base_url=consts.OLLAMA_BASE_URL),
            collection_name="documents"
        )

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
        )

    def ingest_documents(self, file_paths: list[str], metadata: Optional[Dict] = None):
        for file_path in file_paths:
            loader = TextLoader(file_path)
            docs = loader.load()
            
            if file_path.endswith('.md'):
                splitter = MarkdownTextSplitter(chunk_size=1000, chunk_overlap=200)
                chunks = splitter.split_documents(docs)

                if metadata:
                    for chunk in chunks:
                        chunk.metadata.update(metadata)

                ids = self.vector_store.add_documents(chunks)
                return ids

    async def query_documents(self, query: str, k: int = 5, filter: Optional[models.Filter] = None) -> list[Document]:
        return await self.vector_store.asimilarity_search(
            query=query,
            k=k,
            filter=filter,
        )

    async def query_documents2(self, query: str, k: int = 5) -> list[Document]:
        extract_query_prompt = f"""
            You are a helpful assistant and let's determine and enrich the query to get the most relevant documents.
            The query is: {query}
        """
        queries = cast(ExtractedQueries, await self.llm.with_structured_output(ExtractedQueries).ainvoke(extract_query_prompt))

        documents: list[Document] = []

        for query in queries.queries:
            results = await self.vector_store.asimilarity_search(query, k=k)
            documents.extend(results)

        hashmap = {}
        for doc in documents:
            hashmap[doc.id or "undefined"] = doc

        return list(hashmap.values())

    def remove_documents_by_source(self, source: str):
        scroll_filter=models.Filter(
            must=models.FieldCondition(
                key='metadata.source',
                match=models.MatchValue(value=source)
            )
        )
        result = self.client.delete(
            collection_name=self.collection_name,
            points_selector=scroll_filter,
            wait=True
        )

        return result
