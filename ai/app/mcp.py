from app import consts
from langchain_mcp_adapters.client import MultiServerMCPClient


mcp_connections = {}
mcp_connections['kubectl'] = {
    "command": "npx",
    "args": ["mcp-server-kubernetes"],
    "transport": "stdio",
    "encoding": "utf8",
    "encoding_error_handler": "ignore",
    "env": None,
    "cwd": None,
    "session_kwargs": None,
}


if consts.GRAFANA_API_KEY and consts.GRAFANA_URL:
    mcp_connections['grafana'] = {
        "transport": "stdio",
        "command": "docker",
        "args": ["run", "--rm", "-i", "-e", "GRAFANA_URL", "-e", "GRAFANA_API_KEY", "mcp/grafana", "-t", "stdio"],
        "env": {
            "GRAFANA_URL": consts.GRAFANA_URL,
            "GRAFANA_API_KEY": consts.GRAFANA_API_KEY
        },
        "encoding": "utf8",
        "encoding_error_handler": "ignore",
        "session_kwargs": None,
        "cwd": None,
    }

mcp_client = MultiServerMCPClient(mcp_connections)
