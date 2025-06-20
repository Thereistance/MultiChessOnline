# Stage 1: Base build stage
FROM python:3.12-slim AS builder

# Устанавливаем системные зависимости для psycopg2
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    python3-dev && \
    rm -rf /var/lib/apt/lists/*

# Create the app directory
RUN mkdir /app

# Set the working directory
WORKDIR /app

# Set environment variables to optimize Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 

# Install dependencies first for caching benefit
RUN pip install --upgrade pip 
COPY requirements.txt /app/ 
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production stage
FROM python:3.12-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postgresql-client \
    netcat-openbsd \
    libpq5 && \
    rm -rf /var/lib/apt/lists/*
    
RUN useradd -m -r appuser && \
   mkdir /app && \
   chown -R appuser /app

# Copy the Python dependencies from the builder stage
COPY --from=builder /usr/local/lib/python3.12/site-packages/ /usr/local/lib/python3.12/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Устанавливаем только runtime-зависимости для psycopg2
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libpq5 && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy application code
COPY --chown=appuser:appuser . .
RUN sed -i 's/\r$//' /app/entrypoint.prod.sh && \
    chmod +x /app/entrypoint.prod.sh
# Set environment variables to optimize Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 8000

# Make entry file executable

RUN chmod +x /app/entrypoint.prod.sh
# Start the application using Gunicorn
CMD ["/app/entrypoint.prod.sh"]