# Multi-stage build for lightweight final image
FROM python:3.12-slim as builder

WORKDIR /tmp

# Install PostgreSQL client libraries and compiler dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Append bcrypt explicitly to make sure it's present
RUN echo "bcrypt>=4.0.0" >> requirements.txt
RUN pip install --no-cache-dir --user -r requirements.txt

# Final runner image
FROM python:3.12-slim

WORKDIR /app

# Install postgres client library runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
COPY . /app

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Script to run migrations and start the FastAPI application
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
