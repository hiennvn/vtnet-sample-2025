# VT

A secure FastAPI application with JWT Bearer authentication, featuring user registration and profile management.

## Features

- **JWT Bearer Authentication**: Secure token-based authentication system
- **User Registration**: Simple user account creation
- **Profile Management**: Get and update user profile information
- **Password Security**: Bcrypt password hashing with salt
- **Protected API Endpoints**: All routes require valid JWT tokens
- **Interactive API Documentation**: Swagger UI with authentication support
- **PostgreSQL Database**: Async database operations with SQLModel
- **Docker Containerization**: Easy deployment with Docker Compose

## Authentication System

### JWT Bearer Token Authentication

The application uses JWT (JSON Web Tokens) for stateless authentication:

- **Token Expiration**: Configurable token lifetime (default: 30 minutes)
- **Secure Headers**: Bearer token authentication via HTTP headers
- **Password Hashing**: Bcrypt with automatic salt generation
- **Stateless Logout**: Client-side token disposal

### API Endpoints

#### Authentication Routes (`/api/auth`)

- `POST /api/auth/login` - Login with email/password, returns JWT token
- `POST /api/auth/logout` - Logout (stateless - client discards token)

#### User Management Routes (`/api/user`)

- `POST /api/user/register` - Register new user account
- `GET /api/user/me` - Get current user information
- `PUT /api/user/me` - Update current user profile

### Using the Authentication System

#### 1. Register a New User

```bash
curl -X POST "http://localhost:8000/api/user/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "full_name": "John Doe"
  }'
```

Note: New users are automatically set as active (`is_active: true`) and non-admin (`is_superuser: false`).

#### 2. Login and Get Token

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 3. Get Your Profile

```bash
curl -X GET "http://localhost:8000/api/user/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 4. Update Your Profile

```bash
curl -X PUT "http://localhost:8000/api/user/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Smith",
    "email": "john.smith@example.com"
  }'
```

Note: Users can only update their `email`, `full_name`, and `password`. System fields like `is_active` and `is_superuser` cannot be modified through this endpoint.

#### 5. Logout

```bash
curl -X POST "http://localhost:8000/api/auth/logout" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 6. Using Swagger UI

1. Go to `http://localhost:8000/docs`
2. Click the "Authorize" button (🔒)
3. Enter your token in the format: `Bearer your_jwt_token_here`
4. Click "Authorize" and "Close"
5. All protected endpoints will now include your authentication

## Quick Start

1. Clone the repository and navigate to the project directory

2. Create a `.env` file with your configuration:
```env
# Database
POSTGRES_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/postgres
POSTGRES_PASSWORD=your_password
POSTGRES_USER=postgres
POSTGRES_DB=postgres

# Authentication
SECRET_KEY=your-secret-key-change-this-in-production-please
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OAuth (optional)
OAUTH_GOOGLE_CLIENT_ID=your_client_id
OAUTH_GOOGLE_CLIENT_SECRET=your_client_secret

# Chainlit
CHAINLIT_AUTH_SECRET=your_secret

# Admin users (comma-separated emails)
ADMIN_USERS=admin@example.com
```

3. Start with Docker Compose:
```bash
docker-compose up -d
```

4. Run database migrations:
```bash
docker-compose exec api uv run alembic upgrade head
```

5. Access the application:
   - API docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/healthz

## Local Development

1. Install dependencies:
```bash
uv sync
```

2. Start PostgreSQL:
```bash
docker-compose up postgres -d
```

3. Set environment variables and run:
```bash
export POSTGRES_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"
export SECRET_KEY="your-secret-key-for-development"
uv run uvicorn app.api:create_app --factory --host 0.0.0.0 --port 8000 --reload
```

4. Run migrations:
```bash
uv run alembic upgrade head
```

## Project Structure

```
app/
├── auth/                # Authentication system
│   ├── models.py       # Auth-specific models (empty for now)
│   ├── schemas.py      # Auth schemas (Token, TokenData)
│   ├── security.py     # JWT token handling and password hashing
│   ├── dependencies.py # Database session management
│   └── routers.py      # Authentication API routes (login, logout)
├── users/              # User management
│   ├── models.py       # User database model
│   ├── schemas.py      # User Pydantic schemas
│   └── routers.py      # User endpoints (register, me)
├── api.py              # FastAPI application factory
├── db.py               # Database configuration
└── consts.py           # Configuration constants
```

## Security Features

- **Password Hashing**: Uses bcrypt with automatic salt generation
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Bearer Authentication**: Industry-standard HTTP header authentication
- **Input Validation**: Pydantic models for request/response validation
- **SQL Injection Protection**: SQLModel/SQLAlchemy ORM protection
- **Stateless Logout**: No server-side session management needed
- **Default Security**: New users are non-admin by default

## Environment Variables

### Required
- `POSTGRES_URL`: Database connection string
- `SECRET_KEY`: JWT signing secret (use a strong, random key in production)

### Optional
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT token lifetime (default: 30)
- `OAUTH_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `OAUTH_GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `CHAINLIT_AUTH_SECRET`: Chainlit authentication secret
- `ADMIN_USERS`: Comma-separated admin email addresses

## Database

Uses PostgreSQL with async operations via SQLModel/SQLAlchemy. The users table includes:

- `id`: UUID primary key
- `email`: Unique email address
- `full_name`: Optional full name
- `hashed_password`: Bcrypt hashed password
- `is_active`: Account status flag (default: true)
- `is_superuser`: Admin privileges flag (default: false)
- `created_at`: Account creation timestamp
- `updated_at`: Last modification timestamp

Built with FastAPI, SQLModel, PostgreSQL, and JWT authentication.
