# Testing

**[Home](../README.md)** | **[Setup](./setup.md)** | **[Architecture](./architecture.md)** | **[Testing](./testing.md)** | **[Security](./security.md)** | **[Sustainability](./sustainability.md)** | **[Development Workflow](./development-workflow.md)** | **[AI Usage](./ai-usage.md)**

---

This document describes the testing strategy, test suite, and how to run tests for the PokéClicker project.

## Test Suite Overview

The project includes a comprehensive test suite with **403 passing tests** covering:

- **Frontend tests**: 351 tests
  - Utility functions and type utilities
  - Custom hooks (useAuth, useGameMutations, usePokedexQuery, etc.)
  - Component tests (LoginScreen, PokeClicker)
  - Integration tests with Apollo Client mocking
- **Backend tests**: 52 tests
  - GraphQL resolvers
  - Authentication module (JWT and bcrypt)
  - Database operations

## Running Tests

### Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Run all tests
pnpm test

# Run tests with coverage report
pnpm test:coverage

# Run tests in watch mode (for development)
pnpm test:watch

# Run specific test categories
pnpm test:unit        # Utility functions and hooks
pnpm test:components  # Component tests
pnpm test:integration # Integration tests
```

### Backend Tests

```bash
# Navigate to backend directory
cd backend

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Test Configuration

- **Framework**: Vitest with React Testing Library
- **Environment**: jsdom for DOM simulation
- **Coverage**: v8 provider with 80% threshold (lines, functions, branches, statements)
- **Mocking**: localStorage, matchMedia, IntersectionObserver, Audio, IndexedDB

## Test Coverage

The test suite focuses on business logic and critical functionality:
- Authentication and authorization
- Game mechanics (clicking, upgrades, candy sync)
- Pokedex queries and Pokemon data fetching
- Utility functions

UI components are primarily tested through E2E tests with Playwright.

## Test Structure

### Frontend
```
frontend/src/
├── test/                      # Test utilities and setup
│   ├── setup.ts               # Global test configuration
│   ├── utils.tsx              # Custom render with providers
│   ├── factories.ts           # Mock data factories
│   └── vitest.d.ts            # Vitest type augmentation for Testing Library matchers
├── lib/__tests__/             # Library utility tests
└── features/*/__tests__/      # Feature-specific tests
    ├── components/__tests__/  # Component tests
    ├── hooks/__tests__/       # Hook tests
    └── utils/__tests__/       # Utility tests
```

### Backend
```
backend/src/
└── __tests__/                 # All backend tests
    ├── resolvers.test.ts      # GraphQL resolver tests
    └── auth.test.ts           # Authentication tests
```

## Writing Tests

Tests follow these patterns:

### Component Test Example

```typescript
import { render, screen, userEvent } from '@testing-library/react'
import { vi } from 'vitest'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Hook Test Example

```typescript
import { renderHook } from '@testing-library/react'
import { useCustomHook } from '../useCustomHook'

describe('useCustomHook', () => {
  it('should return expected values', () => {
    const { result } = renderHook(() => useCustomHook())
    expect(result.current.value).toBe('expected')
  })
})
```

## Test Categories

### Unit Tests
- Test individual functions and utilities
- No dependencies on external systems
- Fast execution
- Examples: type color utilities, data formatters

### Component Tests
- Test React components in isolation
- Mock external dependencies (API calls, etc.)
- Test user interactions and rendering
- Examples: LoginScreen, PokeClicker button interactions

### Integration Tests
- Test multiple components working together
- Test real GraphQL operations with mocked responses
- Test state management across components
- Examples: Apollo Client integration, authentication flow

### Hook Tests
- Test custom React hooks
- Test state updates and side effects
- Mock external dependencies
- Examples: useAuth, useGameMutations, usePokedexQuery

## Mocking Strategy

Global mocks are configured in `src/test/setup.ts`:

- **localStorage**: All methods mocked with vi.fn()
- **matchMedia**: For responsive design tests
- **IntersectionObserver**: For lazy loading tests
- **Audio**: For game sound effects
- **IndexedDB**: For image caching tests

Tests mock GraphQL hooks and responses directly rather than using MockedProvider.

## CI/CD Integration

Tests run automatically:
- **Pre-commit hooks**: Both frontend and backend tests run before every commit
- **GitHub Actions**: Tests run on push to main/develop and on pull requests
- **CI Pipeline**: Includes linting, formatting, unit tests, build, and smoke tests

## Best Practices

1. **Test behavior, not implementation** - Focus on what the component does, not how it does it
2. **Keep tests simple** - One concept per test
3. **Use descriptive test names** - Should explain what is being tested
4. **Mock external dependencies** - Keep tests fast and deterministic
5. **Test error cases** - Don't just test the happy path
6. **Focus on business logic** - Prioritize testing critical functionality over UI components

