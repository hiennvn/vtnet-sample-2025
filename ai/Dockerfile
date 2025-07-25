FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Create virtual environment in project directory and install dependencies
ENV UV_PROJECT_ENVIRONMENT=/app/.venv
RUN uv venv
RUN uv sync --frozen --no-dev

# Copy the rest of the application
COPY . .

EXPOSE 8000

ENV PYTHONPATH=/app
ENV PATH="/app/.venv/bin:$PATH"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
