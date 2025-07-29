# VTNet Project Document Management System (PDMS)

A comprehensive document management system designed for project teams to store, organize, search, and collaborate on documents with intelligent search capabilities.

![PDMS Dashboard](frontend/public/vite.svg)

## Overview

The Project Document Management System (PDMS) is a web-based application that enables teams to:

- Create and manage projects with different statuses and access controls
- Upload, organize, and version documents within project folders
- Search documents using both traditional and AI-powered semantic search
- Chat with an AI assistant that can answer questions based on document content
- Manage users and their roles/permissions across projects

## Architecture

PDMS follows Clean Architecture principles with a clear separation of concerns:

- **Frontend**: React with TypeScript, Redux Toolkit, and Fluent UI design
- **Backend**: Spring Boot with Java 17, following Domain-Driven Design
- **AI Services**: Python-based AI service for document embeddings and chatbot
- **Storage**: MySQL for structured data, file system for documents, Elasticsearch for search
- **Authentication**: JWT-based with access and refresh tokens

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Java 17 (for local backend development)
- Python 3.10+ (for local AI service development)

### Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vtnet-sample-2025.git
   cd vtnet-sample-2025
   ```

2. Create environment files:
   ```bash
   cp backend/src/main/resources/application-dev.yml backend/src/main/resources/application.yml
   cp ai/env.example ai/.env
   ```

3. Start the application:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8080/api
   - API Documentation: http://localhost:8080/swagger-ui.html

### Local Development

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### AI Service

```bash
cd ai
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e .
python -m ai.app
```

## Project Structure

```
vtnet-sample-2025/
├── ai/                  # AI service for document processing and chatbot
├── backend/             # Spring Boot backend
│   └── src/
│       ├── main/        # Application code
│       └── test/        # Test code
├── frontend/            # React frontend
│   └── src/
│       ├── api/         # API clients
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       └── redux/       # State management
├── documents/           # Project documentation
├── memory-bank/         # Project memory for AI assistance
├── mysql/               # MySQL initialization scripts
├── nginx/               # Nginx configuration
└── playwright/          # End-to-end tests
```

## Key Features

### Project Management

- Create, edit, and delete projects
- Assign members with different roles
- Track project status and metadata

### Document Handling

- Upload documents in various formats (PDF, DOCX, TXT, etc.)
- Organize documents in folder structures
- Preview documents in-browser
- Version control for document updates

### Intelligent Search & Chatbot

- Full-text search across all documents
- Semantic search using document embeddings
- AI-powered chatbot that can answer questions based on document content
- Reference tracking for chatbot responses

### User Management

- Role-based access control
- User registration and profile management
- Password policies and security features

## Testing

### Unit and Integration Tests

```bash
# Backend tests
cd backend
./mvnw test

# Frontend tests
cd frontend
npm test
```

### End-to-End Tests

```bash
cd playwright
npm install
npx playwright test
```

## Deployment

For production deployment, use the production Docker Compose file:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

See `docker-README.md` for more detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Spring Boot, React, and modern cloud-native technologies
- Uses OpenAI/Google Gemini API for AI features
- Follows Clean Architecture and Domain-Driven Design principles 