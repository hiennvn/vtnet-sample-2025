from typing import Callable, List, Literal, Optional, Tuple

from langchain_core.documents import Document
from langchain_core.runnables import chain
from langgraph.graph.graph import CompiledGraph
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage, RemoveMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import MessagesState
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt
from typing import Annotated
from langchain_core.tools import tool
from langchain_experimental.utilities import PythonREPL
from qdrant_client import models

from app.store import RAG


repl = PythonREPL()


class VTNetMessageState(MessagesState):
    sources: list[str]


@tool
def python_repl_tool(
    code: Annotated[str, "The python code to execute to generate your chart."],
):
    """Use this to execute python code. If you want to see the output of a value,
    you should print it out with `print(...)`. This is visible to the user."""
    try:
        result = repl.run(code)
    except BaseException as e:
        return f"Failed to execute. Error: {repr(e)}"
    result_str = f"Successfully executed:\n```python\n{code}\n```\nStdout: {result}"
    return (
        result_str + "\n\nIf you have completed all tasks, respond with FINAL ANSWER."
    )


@chain
async def get_similarity_documents(input: dict) -> Tuple[str, list[Document]]:
    """Get similarity documents"""

    rag = RAG()
    query = input['query']
    k = input.get('k', 10)
    filter = input.get('filter')
    docs = await rag.query_documents(query, k, filter)

    return '\n'.join([f'''
        <context>
            <source>{doc.metadata['source']}</source>
            <content>{doc.page_content}</content>
        </context>
    ''' for doc in docs]), docs
    


async def call_model(state: VTNetMessageState, config: dict):
    model = config['configurable']['model']
    project_id = config['configurable']['project_id']
    messages = state["messages"]
    messages += [SystemMessage(
        content="""
        You are a helpful and knowledgeable AI assistant.

        Your primary goal is to answer user questions using only the content provided in the retrieved documents.

        You must strictly follow these rules:
        - Do not answer questions using your own knowledge or external information.
        - Only rely on the content of the retrieved documents.
        - If the information is not found in the documents, say: “I couldn’t find relevant information in the documents provided.”
        - Provide clear, concise, and accurate answers.
        - Do not speculate or hallucinate facts.
        - If the user asks follow-up questions, always ground your responses in the newly retrieved documents.
        - Maintain a professional, neutral, and helpful tone.

        You are not a general-purpose assistant — you serve only to interpret and respond based on retrieved context.

        Your outputs should be short and precise unless asked to elaborate.
        """
    )] + messages

    last_message = messages[-1]
    if isinstance(last_message, HumanMessage):
        content = last_message.content
        filter = models.Filter(
            must=models.FieldCondition(
                key="metadata.project_id",
                match=models.MatchValue(value=project_id)
            )
        )
        context, docs = await get_similarity_documents.ainvoke({'query': content, 'k': 5, 'filter': filter})
        last_message.content = f'''
        Base on context which provided, let's anwser this question of the user

        <question>
            {content}
        </question>

        <contexts>
            {context}
        </contexts>
        '''
        messages[-1] = last_message
        sources = [doc.metadata['source'] for doc in docs]
    else:
        sources = []

    response = model.invoke(messages)
    return {"messages": [response], "sources": list(set(sources))}


def call_final_model(state: VTNetMessageState, config: dict):
    model = config['configurable']['model']
    messages = state["messages"]
    last_ai_message = messages[-1]
    response = model.invoke(
        [
            SystemMessage("""
                Rewrite this in the voice of a Site Reliability Engineer
                Do not use any emojis.
                Keeping complete information of the original message.
            """),
            HumanMessage(last_ai_message.content),
        ]
    )
    response.id = last_ai_message.id
    return {"messages": [
        RemoveMessage(str(last_ai_message.id)),
        response,
    ]}


def router(state: VTNetMessageState) -> Literal["tools", "final"]:
    messages = state["messages"]
    last_message = messages[-1]
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        permit = interrupt(f"Tool {last_message.tool_calls[0]['name']} will be called? Are you sure?")
        if permit:
            return "tools"
        else:
            return "final"

    return "final"


async def get_chat_agent(tools: Optional[List[Callable]] = None) -> CompiledGraph:
    tool_node = ToolNode(tools=tools or [])

    builder = StateGraph(VTNetMessageState)

    builder.add_node("agent", call_model) #type: ignore
    builder.add_node("tools", tool_node)
    builder.add_node("final", call_final_model) #type: ignore

    builder.add_edge(START, "agent")
    builder.add_conditional_edges(
        "agent",
        router,
    )

    builder.add_edge("tools", "agent")
    builder.add_edge("final", END)

    graph = builder.compile(checkpointer=InMemorySaver())
    return graph


def get_simple_chat_agent(tools: Optional[List[Callable]] = None) -> CompiledGraph:
    tool_node = ToolNode(tools=tools or [])

    builder = StateGraph(VTNetMessageState)

    builder.add_node("call_model", call_model) #type: ignore
    builder.add_node("tools", tool_node)

    builder.add_edge("tools", "call_model")
    builder.add_conditional_edges(
        "call_model",
        tools_condition,
    )
    builder.set_entry_point("call_model")

    graph = builder.compile(checkpointer=InMemorySaver())
    return graph
