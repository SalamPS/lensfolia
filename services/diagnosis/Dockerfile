FROM python:3.11-slim

# Install uv (this will give you both uv and uvx)
RUN pip install uv

WORKDIR /app

# Copy dependency files and install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# Copy application code
COPY . .

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

# Expose port for the LangGraph dev server
EXPOSE 8080

# Run the LangGraph dev server using uv run
CMD ["uv", "run", "langgraph", "dev", "--allow-blocking", "--host", "0.0.0.0", "--port", "8080"]