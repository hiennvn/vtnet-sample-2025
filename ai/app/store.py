from typing import List, cast
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
        client = QdrantClient(":memory:")

        client.create_collection(
            collection_name="documents",
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )
        self.vector_store = QdrantVectorStore(
            client=client,
            embedding=OllamaEmbeddings(model="nomic-embed-text", base_url=consts.OLLAMA_BASE_URL),
            collection_name="documents"
        )

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
        )

    async def ingest_documents(self, file_paths: list[str]):
        for file_path in file_paths:
            loader = TextLoader(file_path)
            docs = await loader.aload()
            
            if file_path.endswith('.yaml'):
                await self.vector_store.aadd_documents(docs)

            elif file_path.endswith('.md'):
                splitter = MarkdownTextSplitter(chunk_size=1000, chunk_overlap=200)
                chunks = splitter.split_documents(docs)

                await self.vector_store.aadd_documents(chunks)

    async def query_documents(self, query: str, k: int = 5) -> list[Document]:
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

    def remove_documents_by_source(self, source: str) -> List[str]:
        deleted_ids = []
        while True:
            docs = self.vector_store.similarity_search(
                query="",
                k=100,
                filter=models.Filter(
                    must=models.FieldCondition(key="source", match=models.MatchValue(value=source))
                )
            ) #type:ignore
            if len(docs) == 0:
                break
            ids = [doc.id for doc in docs if doc.id]
            self.vector_store.delete(ids) #type:ignore
            deleted_ids.extend(ids)

        return deleted_ids
