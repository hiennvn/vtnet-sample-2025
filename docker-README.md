# Docker Setup for Project Document Management System

This document provides instructions for setting up and running the Project Document Management System using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0.0 or higher)

## Directory Structure

```
.
├── backend/                # Backend Spring Boot application
│   └── Dockerfile          # Backend Docker configuration
├── frontend/               # Frontend React application
│   ├── Dockerfile          # Frontend Docker configuration
│   └── nginx.conf          # Nginx configuration for frontend
├── mysql/                  # MySQL configuration
│   └── init/               # MySQL initialization scripts
│       └── 01-init.sql     # Initial database schema
├── nginx/                  # Nginx configuration for production
│   └── conf/               # Nginx configuration files
│       └── default.conf    # Default Nginx configuration
├── docker-compose.yml      # Docker Compose for development
└── docker-compose.prod.yml # Docker Compose for production
```

## Development Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd project-document-management
```

2. Create a `.env` file in the root directory based on the `.env.example` file:

```bash
cp .env.example .env
```

3. Start the development environment:

```bash
docker-compose up -d
```

4. Access the application:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8080/api
   - Elasticsearch: http://localhost:9200
   - Qdrant: http://localhost:6333

5. Stop the development environment:

```bash
docker-compose down
```

## Production Setup

1. Create a `.env` file in the root directory with production settings.

2. Start the production environment:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. Access the application:
   - Application: https://your-domain.com
   - API: https://your-domain.com/api

4. Stop the production environment:

```bash
docker-compose -f docker-compose.prod.yml down
```

## SSL Configuration for Production

1. Create a directory for SSL certificates:

```bash
mkdir -p nginx/ssl
```

2. Place your SSL certificate and key in the `nginx/ssl` directory:
   - Certificate: `nginx/ssl/server.crt`
   - Key: `nginx/ssl/server.key`

3. If you don't have SSL certificates, you can generate self-signed certificates for testing:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/ssl/server.key -out nginx/ssl/server.crt
```

## Docker Commands

### View running containers:

```bash
docker-compose ps
```

### View logs:

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
```

### Rebuild and restart a specific service:

```bash
docker-compose up -d --build backend
```

### Stop and remove all containers, networks, and volumes:

```bash
docker-compose down -v
```

## Troubleshooting

### Database connection issues:

1. Check if the MySQL container is running:

```bash
docker-compose ps mysql
```

2. View MySQL logs:

```bash
docker-compose logs mysql
```

3. Connect to MySQL directly:

```bash
docker-compose exec mysql mysql -u vtnet -p
```

### Backend issues:

1. View backend logs:

```bash
docker-compose logs backend
```

2. Access the backend container:

```bash
docker-compose exec backend sh
```

### Frontend issues:

1. View frontend logs:

```bash
docker-compose logs frontend
```

2. Access the frontend container:

```bash
docker-compose exec frontend sh
``` 