# Technical Context: Project Document Management System

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.x
- **Language**: Java 17
- **API**: RESTful API with Spring Web
- **Security**: Spring Security with JWT authentication
- **Validation**: Hibernate Validator
- **Testing**: JUnit 5, Mockito, TestContainers
- **Database**: MySQL 8.0 with Spring Data JPA and Hibernate
- **Migration**: Flyway for database schema management

### Frontend
- **Framework**: React 18.x with TypeScript
- **State Management**: Redux Toolkit
- **UI Components**: Custom components following Fluent 2 Design principles
- **HTTP Client**: Axios for API communication
- **Form Handling**: React Hook Form
- **Testing**: Jest, React Testing Library
- **Routing**: React Router for navigation

### Document Storage & Processing
- **Storage**: Local file system with metadata in MySQL
- **PDF Processing**: Apache PDFBox
- **Office Documents**: Apache POI
- **Content Extraction**: Apache Tika
- **Indexing**: Elasticsearch for search functionality

### AI & Search
- **LLM Integration**: OpenAI API or Google Gemini API
- **Vector Database**: Qdrant for embeddings storage
- **RAG Implementation**: Custom retrieval-augmented generation
- **Embeddings**: Text embeddings for semantic search

### DevOps & Infrastructure
- **Containerization**: Docker
- **Container Orchestration**: Docker Compose
- **Base Images**: 
  - Backend: openjdk:17-slim
  - Frontend: node:18-alpine for build, nginx:stable-alpine for runtime
  - Database: mysql:8.0
  - Search: elasticsearch:8.11.1
  - Vector DB: qdrant/qdrant:latest
- **Reverse Proxy**: Nginx for production deployment
- **Health Checks**: Implemented for all containers in production
- **Resource Management**: CPU and memory limits defined in production

### Testing
- **End-to-End Testing**: Playwright
- **Backend Unit Testing**: JUnit 5, Mockito
- **Frontend Testing**: Jest, React Testing Library
- **Methodology**: Test-Driven Development (TDD)

## Development Environment
- **Platform**: Any modern IDE with Java and TypeScript support
- **Operating System**: Cross-platform (developed on macOS)
- **Build Tools**: Maven for backend, npm/yarn for frontend
- **Version Control**: Git
- **Local Environment**: Docker Compose for development environment

## Technical Constraints
1. **Local Storage**: Document files must be stored in the local file system
2. **Security**: Role-based access control for all system features
3. **Performance**: System must handle large document repositories efficiently
4. **Scalability**: Architecture must support future scaling needs
5. **Compatibility**: Document viewer must support common file formats (PDF, DOCX, XLSX, etc.)
6. **Environment Consistency**: Docker ensures consistent development and production environments
7. **UI Design**: Must follow Fluent 2 Design principles (no floating buttons, consistent components)
8. **Testing**: Follow Test-Driven Development approach for both backend and frontend

## System Architecture

The system follows Clean Architecture principles with Domain-Driven Design:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │                                         │    │
│  │  ┌─────────────────────────────────┐    │    │
│  │  │                                 │    │    │
│  │  │  ┌─────────────────────────┐    │    │    │
│  │  │  │                         │    │    │    │
│  │  │  │      Domain Layer       │    │    │    │
│  │  │  │                         │    │    │    │
│  │  │  └─────────────────────────┘    │    │    │
│  │  │       Application Layer         │    │    │
│  │  │                                 │    │    │
│  │  └─────────────────────────────────┘    │    │
│  │           Interface Layer               │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│               Infrastructure Layer              │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Core Modules
1. **User & Access Control Module**: Authentication, authorization, and user management
2. **Project Management Module**: Project lifecycle and membership management
3. **Document Storage & Management Module**: Document organization and versioning
4. **Information Retrieval & AI Module**: Search, indexing, and chatbot functionality

## Integration Points
- **Database**: MySQL for structured data storage
- **File System**: Local storage for document files
- **Elasticsearch**: Document content indexing and search
- **Qdrant**: Vector database for semantic search capabilities
- **LLM API**: AI-powered chatbot functionality

## Docker Configuration

### Development Environment
```
┌─────────────────────────────────────────────────────────────────────┐
│                         Docker Compose Network                      │
│                                                                     │
│  ┌────────────┐   ┌────────────┐   ┌───────────┐   ┌─────────────┐  │
│  │  Frontend  │   │  Backend   │   │  MySQL    │   │ Elasticsearch│  │
│  │  Container │   │  Container │   │ Container │   │  Container   │  │
│  └────────────┘   └────────────┘   └───────────┘   └─────────────┘  │
│                                                                     │
│                              ┌────────────┐                         │
│                              │   Qdrant   │                         │
│                              │  Container │                         │
│                              └────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Production Environment
```
┌─────────────────────────────────────────────────────────────────────┐
│                         Docker Compose Network                      │
│                                                                     │
│  ┌────────────┐   ┌────────────┐   ┌───────────┐   ┌─────────────┐  │
│  │   Nginx    │   │  Frontend  │   │  Backend  │   │    MySQL    │  │
│  │  Container ├───┤  Container │   │ Container │   │  Container  │  │
│  └─────┬──────┘   └────────────┘   └─────┬─────┘   └─────────────┘  │
│        │                                 │                          │
│    External                              │                          │
│    Requests                              │                          │
│        │                                 │                          │
│        │                          ┌─────┴─────┐   ┌─────────────┐  │
│        │                          │Elasticsearch│   │   Qdrant    │  │
│        ▼                          │  Container  │   │  Container  │  │
│  Load Balancer                    └─────────────┘   └─────────────┘  │
│  (Future)                                                            │
└─────────────────────────────────────────────────────────────────────┘
```

## Volume Management
- **MySQL Data**: Persistent volume for database storage
- **Elasticsearch Data**: Persistent volume for search indices
- **Qdrant Data**: Persistent volume for vector embeddings
- **Document Storage**: Volume mount for document file storage
- **Nginx Configuration**: Volume mount for Nginx settings

## Development Setup Requirements
1. Java 17 JDK
2. Docker and Docker Compose
3. Git for version control

## Implementation Strategy
- Domain-first development approach
- Test-driven development for core functionality
- Incremental feature implementation
- Continuous integration with automated testing
- Regular performance monitoring and optimization
- Docker Compose for local development and testing

## UI Design Principles
- Follow Fluent 2 Design guidelines
- No floating buttons
- Consistent component styling
- Clean, intuitive user interface
- Responsive design for different screen sizes
- Custom components instead of Tailwind CSS

## Testing Strategy
- Test-Driven Development (TDD) approach
- Write unit tests before implementation
- End-to-end testing with Playwright
- Component testing for frontend
- Integration testing for backend services
- Aim for high test coverage of critical paths 