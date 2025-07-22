from contextlib import asynccontextmanager
from typing import Dict, List, cast
from fastapi import FastAPI, Request
from langchain_core.messages import AIMessage, AIMessageChunk, BaseMessage, HumanMessage
from langgraph.graph.graph import CompiledGraph
from pydantic import BaseModel, UUID4, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from starlette.responses import StreamingResponse
from .runnable import get_simple_chat_agent


@asynccontextmanager
async def lifespan(*_):
    agent = get_simple_chat_agent()
    sessions = dict()
    gemini = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    yield {
        "agent": agent,
        "gemini": gemini,
        "sessions": sessions,
    }


app = FastAPI(lifespan=lifespan)


class ChatRequest(BaseModel):
    session_id: UUID4 = Field()
    prompt: str = Field()


@app.post('/chat')
async def chat(body: ChatRequest, request: Request) -> AIMessage:
    sessions = cast(Dict[str, List[BaseMessage]], request.state.sessions)
    agent = cast(CompiledGraph, request.state.agent)
    model = cast(ChatGoogleGenerativeAI, request.state.gemini)
    session_id = str(body.session_id)
    messages = cast(List[BaseMessage], sessions.get(session_id))
    if messages is None:
        messages = []
        sessions[session_id] = messages

    message = HumanMessage(body.prompt)
    messages.append(message)

    result = await agent.ainvoke({"messages": messages}, {"configurable": {"thread_id": session_id, "model": model}})
    response = result["messages"][-1]
    messages.append(response)

    return response


@app.post('/stream')
async def stream(body: ChatRequest, request: Request) -> StreamingResponse:
    sessions = cast(Dict[str, List[BaseMessage]], request.state.sessions)
    agent = cast(CompiledGraph, request.state.agent)
    model = cast(ChatGoogleGenerativeAI, request.state.gemini)
    session_id = str(body.session_id)
    messages = cast(List[BaseMessage], sessions.get(session_id))
    print(messages)
    if messages is None:
        messages = []
        sessions[session_id] = messages

    message = HumanMessage(body.prompt)
    messages.append(message)

    stream = agent.astream({"messages": messages}, {"configurable": {"thread_id": session_id, "model": model}}, stream_mode='values')

    async def gen():
        nonlocal messages
        content = ""
        async for chunk in stream:
            response = cast(AIMessageChunk, chunk["messages"][-1])
            if isinstance(response, AIMessageChunk):
                content += str(response.content)
            yield response.model_dump_json()

        messages.append(AIMessage(content))

    return StreamingResponse(gen())
