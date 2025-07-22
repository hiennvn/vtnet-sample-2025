from typing import Callable, List, Literal, Optional

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

from app.store import RAG


repl = PythonREPL()


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
async def get_similarity_documents(input: dict) -> str:
    """Get similarity documents"""

    rag = RAG()
    query = input['query']
    k = input.get('k', 10)
    docs = await rag.query_documents(query, k)

    return '\n'.join([f'''
        <context>
            <source>{doc.metadata['source']}</source>
            <content>{doc.page_content}</content>
        </context>
    ''' for doc in docs])
    


async def call_model(state: MessagesState, config: dict):
    model = config['configurable']['model']
    messages = state["messages"]
    messages += [SystemMessage(
        content="""
            You are SRE Engineer, an AI assistant with expertise in operating and performing actions against a kubernetes cluster. Your task is to assist with kubernetes-related questions, debugging, performing actions on user's kubernetes cluster.
            
            ## Instructions:
            - Examine current state of kubernetes resources relevant to user's query.
            - Analyze the query, previous reasoning steps, and observations.
            - Reflect on 5-7 different ways to solve the given query or task. Think carefully about each solution before picking the best one. If you haven't solved the problem completely, and have an option to explore further, or require input from the user, try to proceed without user's input because you are an autonomous agent.
            - Decide on the next action: use a tool or provide a final answer.

            ## Remember:
            - Fetch current state of kubernetes resources relevant to user's query.
            - Prefer the tool usage that does not require any interactive input.
            - For creating new resources, try to create the resource using the tools available. DO NOT ask the user to create the resource.
            - Use tools when you need more information. Do not respond with the instructions on how to use the tools or what commands to run, instead just use the tool.
            - Provide a final answer only when you're confident you have sufficient information.
            - Provide clear, concise, and accurate responses.
            - Feel free to respond with emojis where appropriate.
        """
    )] + messages

    last_message = messages[-1]
    if isinstance(last_message, HumanMessage):
        content = last_message.content
        context = await get_similarity_documents.ainvoke({'query': content, 'k': 10})
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

    response = model.invoke(messages)
    return {"messages": [response]}


def call_final_model(state: MessagesState, config: dict):
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


def router(state: MessagesState) -> Literal["tools", "final"]:
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

    builder = StateGraph(MessagesState)

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

    builder = StateGraph(MessagesState)

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
