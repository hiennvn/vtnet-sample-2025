# Playwright End-to-End Tests

This directory contains end-to-end tests for the Project Document Management System using Playwright.

## Test Structure

- `tests/common.spec.ts`: Common test cases based on 5.0.common_testcases.md
- `tests/project-management.spec.ts`: Project management test cases
- `tests/helpers/auth.helper.ts`: Helper functions for authentication and navigation

## Prerequisites

- Node.js 14 or higher
- npm or yarn
- Running instance of the application

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure the base URL:

The tests are configured to run against `http://localhost:3000` by default. You can change this by setting the `BASE_URL` environment variable:

```bash
# For Unix-like systems
export BASE_URL=http://your-app-url

# For Windows Command Prompt
set BASE_URL=http://your-app-url

# For Windows PowerShell
$env:BASE_URL="http://your-app-url"
```

## Running Tests

### Run all tests

```bash
npx playwright test
```

### Run specific test file

```bash
npx playwright test tests/common.spec.ts
```

### Run tests in headed mode (with browser visible)

```bash
npx playwright test --headed
```

### Run tests in debug mode

```bash
npx playwright test --debug
```

### Run tests with specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Reports

After running tests, you can view the HTML report:

```bash
npx playwright show-report
```

## Adding New Tests

1. Create a new test file in the `tests` directory
2. Import required helpers from `auth.helper.ts`
3. Follow the Test-Driven Development approach:
   - Write the test case first
   - Run it to see it fail
   - Implement the feature
   - Run the test again to see it pass

## Test Data

The tests use the following test users:

- Director: director@example.com / password123
- Project Manager: pm@example.com / password123
- Team Member: member@example.com / password123

Make sure these users exist in your test environment with the appropriate roles.

## CI/CD Integration

These tests can be integrated into your CI/CD pipeline. See the Playwright documentation for more information:

https://playwright.dev/docs/ci 