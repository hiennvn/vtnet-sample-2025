import os
from pathlib import Path


BASE_DIR = Path(os.getcwd())

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant:6333")

OLLAMA_BASE_URL= os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")

GRAFANA_URL: str = os.getenv("GRAFANA_URL", "http://host.docker.internal:3000")
GRAFANA_API_KEY = os.getenv("GRAFANA_API_KEY")

