# 🧪 Testing Strategy - Issue #74

## Overview

This document outlines the comprehensive testing strategy for the PokeClicker application using Vitest for unit and component testing. The goal is to achieve 80%+ test coverage for core functionality with a single command execution.

## 🎯 Testing Objectives

- **Unit Tests**: Test utility functions, hooks, and business logic
- **Component Tests**: Test React components with user interactions
- **Integration Tests**: Test component interactions and data flow
- **Coverage Target**: 80%+ for core functionality
- **Single Command**: `pnpm test` runs all tests

## 📁 Repository Structure Analysis

### Core Components to Test

#### **1. Authentication System**
```
src/features/auth/
├── components/LoginScreen.tsx          # Login/signup forms
├── contexts/AuthContext.tsx           # Auth state management
├── contexts/AuthContextDefinition.tsx # Auth types and context
└── hooks/useAuth.ts                   # Auth hook
```

#### **2. Game Components**
```
src/features/clicker/
├── components/PokeClicker.tsx         # Main clicker game
└── components/StackedProgress.tsx     # Progress visualization
```

#### **3. Pokedex System**
```
src/features/pokedex/
├── components/
│   ├── PokemonCard.tsx               # Pokemon display
│   ├── PokemonDetailModal.tsx        # Pokemon details
│   ├── SearchBar.tsx                 # Search functionality
│   └── FiltersAndCount.tsx           # Filtering system
├── hooks/
│   ├── usePokedexQuery.ts            # Data fetching
│   ├── usePokemonById.ts             # Single Pokemon query
│   └── usePurchasePokemon.ts         # Purchase mutations
└── utils/typeColors.ts               # Utility functions
```

#### **4. Shared Components**
```
src/components/
├── Navbar.tsx                        # Navigation
├── BackgroundMusic.tsx               # Audio component
├── LoadingSpinner.tsx                # Loading states
└── LazyPokedex.tsx                  # Lazy loading wrapper
```

#### **5. UI Components**
```
src/ui/pixelact/
├── button.tsx                        # Button component
├── card.tsx                          # Card component
├── dialog.tsx                        # Modal dialogs
├── input.tsx                         # Input fields
├── select.tsx                        # Select dropdowns
└── UnlockButton.tsx                  # Special unlock button
```

#### **6. Utilities**
```
src/lib/
├── apolloClient.ts                   # GraphQL client setup
└── utils.ts                          # Utility functions
```

## 🧪 Test Categories

### **1. Unit Tests (40% of tests)**

#### **Utility Functions**
- `src/lib/utils.ts` - General utilities
- `src/features/pokedex/utils/typeColors.ts` - Pokemon type colors
- Theme detection logic in `App.tsx`
- Local storage helpers

#### **Custom Hooks**
- `useAuth` - Authentication state
- `usePokedexQuery` - Data fetching
- `usePurchasePokemon` - Purchase mutations
- `useGameMutations` - Game state mutations

#### **Business Logic**
- Pokemon cost calculations
- Stat upgrade calculations
- Game progression logic
- Filter and sort algorithms

### **2. Component Tests (50% of tests)**

#### **Critical UI Components**
- `LoginScreen` - Authentication flow
- `PokeClicker` - Main game component
- `PokemonCard` - Pokemon display
- `PokemonDetailModal` - Pokemon details
- `SearchBar` - Search functionality
- `FiltersAndCount` - Filtering system

#### **Shared Components**
- `Navbar` - Navigation
- `LoadingSpinner` - Loading states
- `LazyPokedex` - Lazy loading

#### **UI Components**
- `Button` - Button interactions
- `Card` - Card display
- `Dialog` - Modal functionality
- `Input` - Form inputs
- `Select` - Dropdown selections

### **3. Integration Tests (10% of tests)**

#### **Component Interactions**
- Authentication flow (login → game)
- Pokemon purchase flow
- Search and filter interactions
- Theme switching
- Lazy loading behavior

#### **Data Flow**
- GraphQL query/mutation integration
- State management across components
- Error handling and loading states

## 🛠️ Testing Setup

### **Dependencies to Install**
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### **Configuration Files**

#### **vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
})
```

#### **src/test/setup.ts**
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

## 📋 Test Implementation Plan

### **Phase 1: Setup & Utilities (Week 1)**
1. Install dependencies and configure Vitest
2. Create test utilities and mocks
3. Test utility functions (`src/lib/utils.ts`)
4. Test type color utilities (`src/features/pokedex/utils/typeColors.ts`)

### **Phase 2: Hooks & Context (Week 2)**
1. Test `useAuth` hook
2. Test `usePokedexQuery` hook
3. Test `usePurchasePokemon` hook
4. Test `AuthContext` provider

### **Phase 3: Core Components (Week 3)**
1. Test `LoginScreen` component
2. Test `PokeClicker` component
3. Test `PokemonCard` component
4. Test `PokemonDetailModal` component

### **Phase 4: UI Components (Week 4)**
1. Test `Navbar` component
2. Test `SearchBar` component
3. Test `FiltersAndCount` component
4. Test UI components (`Button`, `Card`, `Dialog`, etc.)

### **Phase 5: Integration Tests (Week 5)**
1. Test authentication flow
2. Test Pokemon purchase flow
3. Test search and filtering
4. Test theme switching
5. Test lazy loading behavior

## 🎯 Test Coverage Targets

### **Critical Paths (Must have 90%+ coverage)**
- Authentication flow
- Pokemon purchase flow
- Game progression
- Search and filtering
- Theme switching

### **Core Functionality (Must have 80%+ coverage)**
- All React components
- Custom hooks
- Utility functions
- Business logic

### **Nice to Have (60%+ coverage)**
- Error boundaries
- Loading states
- Edge cases
- Accessibility features

## 🚀 Single Command Execution

### **Package.json Scripts**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

### **Test Execution**
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui
```

## 📊 Mocking Strategy

### **GraphQL Mocks**
- Mock Apollo Client responses
- Mock GraphQL queries and mutations
- Mock error states and loading states

### **External Dependencies**
- Mock localStorage
- Mock matchMedia for theme detection
- Mock IntersectionObserver for lazy loading
- Mock audio elements for background music

### **Component Mocks**
- Mock heavy components (PokeClicker, PokemonDetailModal)
- Mock lazy-loaded components
- Mock external libraries

## 🔧 Test Utilities

### **Custom Render Function**
```typescript
// src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { ApolloProvider } from '@apollo/client'
import { AuthProvider } from '@features/auth'
import { apolloClient } from '@lib/apolloClient'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ApolloProvider client={apolloClient}>
        {children}
      </ApolloProvider>
    </AuthProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### **Test Data Factories**
```typescript
// src/test/factories.ts
export const createMockUser = (overrides = {}) => ({
  _id: '1',
  username: 'testuser',
  rare_candy: 1000,
  created_at: '2024-01-01T00:00:00Z',
  stats: {
    hp: 100,
    attack: 50,
    defense: 50,
    spAttack: 50,
    spDefense: 50,
    speed: 50,
  },
  owned_pokemon_ids: [1, 2, 3],
  ...overrides,
})

export const createMockPokemon = (overrides = {}) => ({
  id: 1,
  name: 'bulbasaur',
  types: ['grass', 'poison'],
  sprite: 'https://example.com/bulbasaur.png',
  isOwned: false,
  ...overrides,
})
```

## 📈 Success Metrics

### **Coverage Targets**
- **Overall**: 80%+ coverage
- **Critical Components**: 90%+ coverage
- **Utility Functions**: 95%+ coverage
- **Hooks**: 85%+ coverage

### **Quality Metrics**
- All tests pass consistently
- Tests run in under 30 seconds
- No flaky tests
- Clear test descriptions
- Proper mocking strategy

### **Maintenance**
- Tests are easy to understand
- Tests are easy to maintain
- Tests catch real bugs
- Tests provide confidence in deployments

## 🎯 Next Steps

1. **Install Dependencies**: Set up Vitest and testing libraries
2. **Configure Testing**: Create configuration files
3. **Create Test Utilities**: Set up mocks and helpers
4. **Implement Tests**: Start with utility functions, then components
5. **Achieve Coverage**: Reach 80%+ coverage target
6. **Documentation**: Update README with testing instructions

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Apollo Client Testing](https://www.apollographql.com/docs/react/development-testing/testing/)

---

**Goal**: Achieve comprehensive test coverage with a single `pnpm test` command that runs all tests, provides coverage reports, and ensures code quality for the PokeClicker application.
