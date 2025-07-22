import os
from pathlib import Path


BASE_DIR = Path(os.getcwd())

DATABASE_URL = os.getenv("POSTGRES_URL", os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"))

ADMIN_USERS = os.getenv("ADMIN_USERS", "").split(",")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

OAUTH_GOOGLE_CLIENT_ID = os.getenv("OAUTH_GOOGLE_CLIENT_ID")
OAUTH_GOOGLE_CLIENT_SECRET = os.getenv("OAUTH_GOOGLE_CLIENT_SECRET")
CHAINLIT_AUTH_SECRET = os.getenv("CHAINLIT_AUTH_SECRET")

GRAFANA_URL: str = os.getenv("GRAFANA_URL", "http://host.docker.internal:3000")
GRAFANA_API_KEY = os.getenv("GRAFANA_API_KEY")

OLLAMA_BASE_URL= os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
