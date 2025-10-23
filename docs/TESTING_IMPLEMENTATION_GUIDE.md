# 🧪 Testing Implementation Guide - Issue #74

## Overview
This guide provides step-by-step instructions for implementing comprehensive Vitest testing for the PokeClicker application. Follow this guide exactly to achieve 80%+ test coverage with a single `pnpm test` command.

## 📋 Implementation Steps

### **Step 1: Install Dependencies**

Add these dependencies to `frontend/package.json`:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

### **Step 2: Create Configuration Files**

#### **2.1 Create `frontend/vitest.config.ts`**
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

#### **2.2 Create `frontend/src/test/setup.ts`**
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

// Mock Audio
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  volume: 1,
  currentTime: 0,
}))
```

#### **2.3 Create `frontend/src/test/utils.tsx`**
```typescript
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

#### **2.4 Create `frontend/src/test/factories.ts`**
```typescript
import type { User } from '@features/auth'
import type { PokedexPokemon } from '@features/pokedex'

export const createMockUser = (overrides = {}): User => ({
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

export const createMockPokemon = (overrides = {}): PokedexPokemon => ({
  id: 1,
  name: 'bulbasaur',
  types: ['grass', 'poison'],
  sprite: 'https://example.com/bulbasaur.png',
  isOwned: false,
  ...overrides,
})

export const createMockApolloResponse = (data: any) => ({
  data,
  loading: false,
  error: undefined,
})
```

#### **2.5 Update `frontend/package.json` scripts**
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

### **Step 3: Create Unit Tests**

#### **3.1 Create `frontend/src/lib/__tests__/utils.test.ts`**
Test the `cn` function from `src/lib/utils.ts`:
- Test with single class
- Test with multiple classes
- Test with conditional classes
- Test with undefined/null values
- Test with empty arrays

#### **3.2 Create `frontend/src/features/pokedex/utils/__tests__/typeColors.test.ts`**
Test all functions from `src/features/pokedex/utils/typeColors.ts`:

**For `getContrastColor`:**
- Test with light background colors (should return 'text-black')
- Test with dark background colors (should return 'text-white')
- Test with unknown color (should return 'text-black')
- Test with invalid hex values

**For `getStatBarColors`:**
- Test light mode colors
- Test dark mode colors
- Test all stat properties (hp, attack, defense, spAttack, spDefense, speed)

**For `getTypeColors`:**
- Test all Pokemon types in light mode
- Test all Pokemon types in dark mode
- Test unknown type (should return default)
- Test that all color properties are present

**For `getUnknownPokemonColors`:**
- Test light mode unknown colors
- Test dark mode unknown colors

### **Step 4: Create Hook Tests**

#### **4.1 Create `frontend/src/features/auth/hooks/__tests__/useAuth.test.ts`**
Test the `useAuth` hook:
- Test successful context access
- Test error when used outside AuthProvider
- Mock AuthContext with different user states
- Test with null user
- Test with authenticated user

#### **4.2 Create `frontend/src/features/clicker/hooks/__tests__/useGameMutations.test.ts`**
Test the `useGameMutations` hook:
- Mock Apollo Client mutations
- Test `updateRareCandy` success case
- Test `updateRareCandy` error case
- Test `upgradeStat` success case
- Test `upgradeStat` error case
- Test loading states
- Test error states
- Test onCompleted callbacks

#### **4.3 Create `frontend/src/features/pokedex/hooks/__tests__/usePokedexQuery.test.ts`**
Test the `usePokedexQuery` hook:
- Mock Apollo Client query
- Test successful data fetching
- Test loading state
- Test error state
- Test with different variables (search, types, region, etc.)
- Test pagination
- Test sorting

#### **4.4 Create `frontend/src/features/pokedex/hooks/__tests__/usePokemonById.test.ts`**
Test the `usePokemonById` hook:
- Mock Apollo Client query
- Test successful Pokemon fetch
- Test loading state
- Test error state
- Test with null ID
- Test with invalid ID

#### **4.5 Create `frontend/src/features/pokedex/hooks/__tests__/usePurchasePokemon.test.ts`**
Test the `usePurchasePokemon` hook:
- Mock Apollo Client mutation
- Test successful purchase
- Test error case
- Test loading state
- Test onCompleted callback

### **Step 5: Create Component Tests**

#### **5.1 Create `frontend/src/features/auth/components/__tests__/LoginScreen.test.tsx`**
Test the `LoginScreen` component:
- Test initial render
- Test login form submission
- Test signup form submission
- Test form validation
- Test error handling
- Test navigation callback
- Test dark mode styling
- Test responsive design

#### **5.2 Create `frontend/src/features/clicker/components/__tests__/PokeClicker.test.tsx`**
Test the `PokeClicker` component:
- Test initial render
- Test candy clicking
- Test stat upgrades
- Test candy animations
- Test progress bars
- Test dark mode styling
- Test responsive design
- Test game state management

#### **5.3 Create `frontend/src/features/pokedex/components/__tests__/PokemonCard.test.tsx`**
Test the `PokemonCard` component:
- Test Pokemon display
- Test type badges
- Test owned/not owned states
- Test click handling
- Test dark mode styling
- Test responsive design

#### **5.4 Create `frontend/src/features/pokedex/components/__tests__/PokemonDetailModal.test.tsx`**
Test the `PokemonDetailModal` component:
- Test modal opening/closing
- Test Pokemon details display
- Test purchase functionality
- Test error handling
- Test dark mode styling
- Test responsive design

#### **5.5 Create `frontend/src/features/pokedex/components/__tests__/SearchBar.test.tsx`**
Test the `SearchBar` component:
- Test search input
- Test clear button
- Test debounced search
- Test mobile/desktop views
- Test dark mode styling

#### **5.6 Create `frontend/src/features/pokedex/components/__tests__/FiltersAndCount.test.tsx`**
Test the `FiltersAndCount` component:
- Test filter controls
- Test type selection
- Test region selection
- Test sorting options
- Test clear filters
- Test count display
- Test dark mode styling

### **Step 6: Create Shared Component Tests**

#### **6.1 Create `frontend/src/components/__tests__/Navbar.test.tsx`**
Test the `Navbar` component:
- Test navigation links
- Test theme toggle
- Test current page highlighting
- Test dark mode styling
- Test responsive design

#### **6.2 Create `frontend/src/components/__tests__/LoadingSpinner.test.tsx`**
Test the `LoadingSpinner` component:
- Test spinner display
- Test custom message
- Test dark mode styling
- Test different sizes

#### **6.3 Create `frontend/src/components/__tests__/LazyPokedex.test.tsx`**
Test the `LazyPokedex` component:
- Test lazy loading behavior
- Test Suspense fallback
- Test prop passing
- Test component integration

#### **6.4 Create `frontend/src/components/__tests__/BackgroundMusic.test.tsx`**
Test the `BackgroundMusic` component:
- Test audio element creation
- Test play/pause functionality
- Test volume control
- Test dark mode styling

### **Step 7: Create UI Component Tests**

#### **7.1 Create `frontend/src/ui/pixelact/__tests__/button.test.tsx`**
Test the `Button` component:
- Test different variants
- Test different sizes
- Test disabled state
- Test click handling
- Test dark mode styling

#### **7.2 Create `frontend/src/ui/pixelact/__tests__/card.test.tsx`**
Test the `Card` component:
- Test different variants
- Test content display
- Test dark mode styling
- Test responsive design

#### **7.3 Create `frontend/src/ui/pixelact/__tests__/dialog.test.tsx`**
Test the `Dialog` component:
- Test modal opening/closing
- Test content display
- Test dark mode styling
- Test responsive design

#### **7.4 Create `frontend/src/ui/pixelact/__tests__/input.test.tsx`**
Test the `Input` component:
- Test input functionality
- Test validation states
- Test dark mode styling
- Test responsive design

#### **7.5 Create `frontend/src/ui/pixelact/__tests__/select.test.tsx`**
Test the `Select` component:
- Test dropdown functionality
- Test option selection
- Test dark mode styling
- Test responsive design

### **Step 8: Create Integration Tests**

#### **8.1 Create `frontend/src/__tests__/App.test.tsx`**
Test the main `App` component:
- Test initial render
- Test page navigation
- Test theme switching
- Test lazy loading
- Test error boundaries
- Test responsive design

#### **8.2 Create `frontend/src/__tests__/AuthFlow.test.tsx`**
Test the authentication flow:
- Test login process
- Test signup process
- Test logout process
- Test protected routes
- Test error handling

#### **8.3 Create `frontend/src/__tests__/GameFlow.test.tsx`**
Test the game flow:
- Test candy clicking
- Test stat upgrades
- Test Pokemon purchase
- Test game state persistence

#### **8.4 Create `frontend/src/__tests__/PokedexFlow.test.tsx`**
Test the Pokedex flow:
- Test Pokemon search
- Test filtering
- Test sorting
- Test Pokemon details
- Test purchase flow

### **Step 9: Create Mock Files**

#### **9.1 Create `frontend/src/test/mocks/apolloClient.ts`**
```typescript
import { MockedProvider } from '@apollo/client/testing'

export const createMockApolloProvider = (mocks = []) => {
  return ({ children }: { children: React.ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  )
}
```

#### **9.2 Create `frontend/src/test/mocks/graphql.ts`**
```typescript
export const mockPokedexQuery = {
  request: {
    query: 'POKEDEX_QUERY',
    variables: { limit: 20, offset: 0 }
  },
  result: {
    data: {
      pokedex: {
        pokemon: [
          {
            id: 1,
            name: 'bulbasaur',
            types: ['grass', 'poison'],
            sprite: 'https://example.com/bulbasaur.png',
            isOwned: false
          }
        ],
        totalCount: 151
      }
    }
  }
}

export const mockUserQuery = {
  request: {
    query: 'USER_QUERY'
  },
  result: {
    data: {
      user: {
        _id: '1',
        username: 'testuser',
        rare_candy: 1000,
        stats: {
          hp: 100,
          attack: 50,
          defense: 50,
          spAttack: 50,
          spDefense: 50,
          speed: 50
        },
        owned_pokemon_ids: [1, 2, 3]
      }
    }
  }
}
```

### **Step 10: Create Test Utilities**

#### **10.1 Create `frontend/src/test/helpers/renderWithProviders.tsx`**
```typescript
import { render, RenderOptions } from '@testing-library/react'
import { ApolloProvider } from '@apollo/client'
import { AuthProvider } from '@features/auth'
import { apolloClient } from '@lib/apolloClient'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null
  apolloMocks?: any[]
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user = null, apolloMocks = [], ...renderOptions } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <ApolloProvider client={apolloClient}>
        {children}
      </ApolloProvider>
    </AuthProvider>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
```

#### **10.2 Create `frontend/src/test/helpers/testUtils.ts`**
```typescript
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const user = userEvent.setup()

export const waitForLoadingToFinish = () =>
  waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

export const expectElementToBeInDocument = (text: string) => {
  expect(screen.getByText(text)).toBeInTheDocument()
}

export const expectElementNotToBeInDocument = (text: string) => {
  expect(screen.queryByText(text)).not.toBeInTheDocument()
}
```

### **Step 11: Update Package.json Scripts**

Add these scripts to `frontend/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:unit": "vitest run --reporter=verbose src/lib src/features/*/utils",
    "test:components": "vitest run --reporter=verbose src/components src/features/*/components",
    "test:integration": "vitest run --reporter=verbose src/__tests__"
  }
}
```

### **Step 12: Create Test Documentation**

#### **12.1 Create `frontend/src/test/README.md`**
```markdown
# Testing Guide

## Running Tests

- `pnpm test` - Run all tests in watch mode
- `pnpm test:run` - Run all tests once
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:ui` - Run tests with UI interface

## Test Structure

- `__tests__/` - Test files
- `mocks/` - Mock data and providers
- `helpers/` - Test utilities
- `factories.ts` - Test data factories
- `setup.ts` - Test setup configuration

## Writing Tests

1. Use `renderWithProviders` for component tests
2. Use `createMockUser` and `createMockPokemon` for test data
3. Mock Apollo Client for GraphQL tests
4. Test both light and dark modes
5. Test responsive design
6. Test error states and loading states
```

## 🎯 Expected Results

After implementing all these tests:

1. **Coverage**: 80%+ overall coverage
2. **Critical Components**: 90%+ coverage
3. **Single Command**: `pnpm test` runs all tests
4. **Fast Execution**: Tests run in under 30 seconds
5. **Reliable**: No flaky tests
6. **Maintainable**: Clear test structure and documentation

## 📊 Test Coverage Targets

- **Utility Functions**: 95%+ coverage
- **Custom Hooks**: 85%+ coverage
- **React Components**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **Overall**: 80%+ coverage

## 🚀 Final Verification

Run these commands to verify implementation:

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test:run

# Check coverage
pnpm test:coverage

# Verify single command works
pnpm test
```

The testing setup should now be complete with comprehensive coverage and a single command execution! 🧪✨
