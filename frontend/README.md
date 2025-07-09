# Project Document Management System - Frontend

This is the frontend application for the Project Document Management System, built with React, TypeScript, and Material-UI.

## Technology Stack

- **React**: A JavaScript library for building user interfaces
- **TypeScript**: A typed superset of JavaScript
- **Material-UI**: A popular React UI framework
- **Redux Toolkit**: State management
- **React Router**: Navigation and routing
- **Axios**: HTTP client
- **Vite**: Build tool
- **Vitest**: Testing framework
- **ESLint & Prettier**: Code quality and formatting

## Project Structure

```
src/
  ├── api/             # API clients and services
  ├── components/      # Reusable UI components
  │   ├── common/      # Common UI components
  │   ├── documents/   # Document-related components
  │   ├── projects/    # Project-related components
  │   └── users/       # User-related components
  ├── contexts/        # React contexts
  ├── hooks/           # Custom React hooks
  ├── layouts/         # Layout components
  ├── pages/           # Page components
  ├── redux/           # Redux store and slices
  │   ├── slices/      # Redux slices
  │   └── store/       # Redux store configuration
  ├── test/            # Test utilities
  ├── types/           # TypeScript type definitions
  └── utils/           # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To build the application for production:

```bash
npm run build
```

### Testing

To run tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

### Linting and Formatting

To lint the code:

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lint:fix
```

To format the code:

```bash
npm run format
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_BASE_URL=/api
```
