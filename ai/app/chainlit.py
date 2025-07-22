from typing import Dict, Optional, cast
import chainlit as cl
from chainlit.types import AskActionResponse
from langchain_core.messages import AIMessage, HumanMessage, BaseMessage
from app.runnable import get_chat_agent, python_repl_tool
from chainlit.data.sql_alchemy import SQLAlchemyDataLayer
from langchain.schema.runnable.config import RunnableConfig
from app import consts
from app.mcp import mcp_client
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph.graph import CompiledGraph
from langgraph.types import Command


gemini = ChatGoogleGenerativeAI(model="gemini-2.5-flash")


@cl.set_starters #type: ignore
async def set_starters():
    return [
        cl.Starter(
            label="Kubernetes assistant",
            message="Hi, let's start with me.",
            icon="/public/k8s.png",
        ),

        cl.Starter(
            label="Knowledge assistant",
            message="You are a knowledge assistant. You can help me with knowledge related questions. Data should be shown in a table format as much as possible. Must not use kubectl in this.",
            icon="/public/knowledge-hub.png",
        ),
    ]


@cl.on_chat_start
async def on_chat_start():
    cl.user_session.set("messages", [])

    try:
        tools = await mcp_client.get_tools()
    except Exception:
        tools = []

    tools += [
        python_repl_tool,
    ]
    agent = await get_chat_agent(
        tools=tools,
    )
    model = gemini.bind_tools(tools)
    cl.user_session.set("model", model)
    cl.user_session.set("agent", agent)
    

@cl.on_message
async def on_message(message: cl.Message):
    agent = cast(CompiledGraph, cl.user_session.get("agent"))
    model = cl.user_session.get("model")

    config = RunnableConfig(
        configurable={"thread_id": cl.context.session.id, "model": model},
        callbacks=[cl.LangchainCallbackHandler()],
    )

    interrupt = None

    messages = cast(list[BaseMessage], cl.user_session.get("messages"))
    messages.append(HumanMessage(content=message.content, id=message.id))
    cl.user_session.set("messages", messages)

    response = cl.Message(content="")

    stream = agent.astream(
        {"messages": messages},
        config=config,
        stream_mode=['messages', 'updates'],
    )

    while stream:
        async for stream_mode, pack in stream:
            if stream_mode == 'messages':
                msg, metadata = cast(tuple[BaseMessage, dict], pack)
                if (
                    msg.content
                    and not isinstance(msg, HumanMessage)
                    and metadata["langgraph_node"] == "final"
                ):
                    await response.stream_token(cast(str, msg.content))
                stream = None

            else:
                if '__interrupt__' in pack: #type: ignore
                    interrupt = pack['__interrupt__'][0] #type: ignore
                    res = cast(AskActionResponse, await cl.AskActionMessage(
                        content=interrupt.value, #type: ignore
                        actions=[
                            cl.Action(name="continue", payload={"value": "continue"}, label="Continue"),
                            cl.Action(name="cancel", payload={"value": "cancel"}, label="Cancel"),
                        ],
                    ).send())

                    if res['payload']['value'] == 'cancel':
                        cmd = Command(resume=False, update={
                            "messages": [
                                HumanMessage("I don't want to continue"),
                            ]
                        })

                    else:
                        cmd = Command(
                            resume=True,
                            update={
                                "messages": [HumanMessage(content="I don't want to use tool")]
                            }
                        )

                    stream = agent.astream(
                        cmd,
                        config=config,
                        stream_mode=['messages', 'updates'],
                    )

                else:
                    stream = None

    messages.append(AIMessage(content=response.content, id=response.id))
    cl.user_session.set("messages", messages)

    await response.send()


@cl.data_layer
def get_data_layer():
    return SQLAlchemyDataLayer(conninfo=consts.DATABASE_URL)


@cl.oauth_callback #type: ignore
def oauth_callback(provider_id: str, token: str, raw_user_data: Dict[str, str], default_user: cl.User) -> Optional[cl.User]:
  if default_user.identifier in consts.ADMIN_USERS:
    default_user.metadata["is_admin"] = True

  return default_user

