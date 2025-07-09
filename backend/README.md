# Project Document Management System - Backend

This is the backend service for the Project Document Management System, a centralized platform for storing, managing, and retrieving project-related documents efficiently.

## Technology Stack

- **Framework**: Spring Boot 3.2.x
- **Language**: Java 17
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA with Hibernate
- **Migration**: Flyway
- **Security**: Spring Security with JWT
- **Documentation**: OpenAPI/Swagger
- **Search**: Elasticsearch
- **Document Processing**: Apache Tika, PDFBox, POI
- **Testing**: JUnit 5, Mockito, TestContainers

## Architecture

The project follows Clean Architecture principles with Domain-Driven Design:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: Technical implementations and external integrations
- **Interface Layer**: API endpoints and controllers

## Getting Started

### Prerequisites

- Java 17 JDK
- MySQL 8.0
- Maven
- Docker (optional, for containerized dependencies)

### Setup

1. Clone the repository
2. Configure the database in `application-dev.yml` or use environment variables
3. Run the application:

```bash
cd backend
mvn spring-boot:run
```

### API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8080/api/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api/api-docs

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/vtnet/pdms/
│   │       ├── domain/          # Domain layer - core business logic
│   │       ├── application/     # Application layer - use cases
│   │       ├── infrastructure/  # Infrastructure layer - technical implementations
│   │       └── interfaces/      # Interface layer - API controllers
│   └── resources/
│       ├── application.yml      # Common application properties
│       ├── application-dev.yml  # Development-specific properties
│       ├── application-test.yml # Test-specific properties
│       ├── application-prod.yml # Production-specific properties
│       └── db/migration/        # Flyway database migrations
└── test/                        # Test classes
```

## Development

### Building the Project

```bash
mvn clean install
```

### Running Tests

```bash
mvn test
```

### Creating a Docker Image

```bash
mvn spring-boot:build-image
```

## Configuration

The application uses different configuration profiles:

- **dev**: Development environment (default)
- **test**: Testing environment
- **prod**: Production environment

To use a specific profile:

```bash
mvn spring-boot:run -Dspring.profiles.active=dev
```

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details. 