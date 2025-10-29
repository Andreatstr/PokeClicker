# Code Review and Optimization Plan

**Generated**: 2025-10-29
**Project**: T26-Project-2 - Pokémon Clicker Game & Pokédex Browser
**Codebase Size**: 130 TypeScript files across 6 feature modules

---

## Analysis

### 1. Code Organization & Structure

**Strengths:**
- **Excellent feature-based architecture**: The codebase uses a well-organized feature folder structure with clear separation of concerns (130 TypeScript files organized by domain)
- **Consistent component organization**: Each feature has dedicated folders for components, hooks, and utilities
- **Clear barrel exports**: Each feature has an `index.ts` that exports public APIs, promoting encapsulation
- **Path aliases configured**: Using `@/`, `@features/`, `@ui/`, etc. for clean imports
- **Lazy loading strategy**: Heavy components (PokeClicker, ProfileDashboard, PokemonDetailModal, LoginScreen) are lazy-loaded with Suspense boundaries

**Areas for Improvement:**
- **Mixed component organization in Pokedex**: Some components are organized by type (card/, detail/, filters/, shared/) while others aren't. This is good, but could be more consistently applied across all features
- **No explicit API layer**: GraphQL queries/mutations are scattered across hooks rather than centralized
- **Missing error boundaries**: No React error boundaries to catch rendering errors
- **Component size**: Some components like `PokedexPage` (389 lines) and `PokemonCard` (259 lines) are quite large and could benefit from further decomposition

### 2. Code Quality & Best Practices

**Strengths:**
- **TypeScript throughout**: Strong typing with interfaces and type exports
- **Custom hooks for logic separation**: Excellent use of custom hooks like `useClickerActions`, `useCandySync`, `usePokemonModal`
- **Memoization**: Using `memo` on PokemonCard for performance
- **ESLint configured**: Modern ESLint 9 with TypeScript, React Hooks, and React Refresh plugins
- **Testing setup**: Vitest configured with test files colocated in `__tests__` folders
- **Documented ESLint suppressions**: The recent commit shows proper documentation of ESLint suppressions (e.g., in `useCandySync.ts:98-102`)

**Areas for Improvement:**
- **Inconsistent error handling**: Error handling patterns vary across components (some use error state, some console.error, some use timeouts for clearing errors)
- **Console statements in production**: Found 45 console.log/warn/error statements across 21 files that should use a proper logging service
- **Optimistic response issues**: In `usePurchasePokemon.ts:27-47`, the optimistic response returns incomplete/placeholder data (empty strings for _id, username, etc.)
- **Apollo cache management**: Multiple places manually update user state instead of relying on Apollo cache (e.g., `updateUser` calls in AuthContext)
- **Missing prop validation**: No runtime prop validation with PropTypes or Zod
- **Hard-coded magic numbers**: Constants like debounce delays (300ms), batch thresholds (50 clicks, 10 seconds) are embedded in code rather than in configuration files
- **Duplicate mobile detection logic**: Mobile detection is implemented multiple times (in PokedexPage, PokemonGrid) instead of using the existing `useMobileDetection` hook

### 3. React Patterns & Performance

**Strengths:**
- **Proper hook dependencies**: Most hooks have correct dependency arrays
- **Batched updates**: Candy sync uses intelligent batching (50 clicks or 10 seconds)
- **Caching strategy**: Multiple caching layers (IndexedDB, in-memory, localStorage) for sprites and backgrounds
- **Proper cleanup**: useEffect cleanup functions for timers and event listeners

**Areas for Improvement:**
- **Missing useCallback/useMemo**: Some expensive computations and callback functions lack memoization (e.g., `getMainClassName` in App.tsx, filter handlers)
- **Re-renders in PokedexPage**: Passing 20+ props to FiltersAndCount component (lines 143-169) causes unnecessary re-renders
- **State management complexity**: Filter state is duplicated (selectedX and tempX versions) which could be simplified
- **Unmount effect warning**: `useCandySync.ts:92-103` intentionally violates exhaustive-deps rule with a long comment explanation - this pattern could be refactored
- **setState during render**: Recent commit message mentions "prevent setState during render error in battle system" - indicates there may be similar patterns elsewhere

### 4. UI/UX Implementation

**Strengths:**
- **Consistent retro styling**: GameBoy-style UI using pixel-retroui components
- **Responsive design**: Mobile-first approach with proper breakpoints
- **Accessibility**: ARIA labels, keyboard handlers (onKeyDown), role attributes on interactive elements
- **Loading states**: Suspense fallbacks and LoadingSpinner components
- **Dark mode support**: Theme toggle with proper color variables
- **Optimistic UI**: Immediate feedback for clicks and purchases

**Areas for Improvement:**
- **Inconsistent loading indicators**: Some places show spinners, others show nothing during loading
- **Error message UX**: Errors disappear after fixed timeouts (1200ms, 3000ms) without user acknowledgment
- **Mobile filter UX**: Complex temporary state management for mobile filters could be simplified
- **Accessibility gaps**:
  - No focus management for modals
  - Missing skip-to-content links
  - Color contrast may not meet WCAG standards for some type badges
- **Animation performance**: CSS animations could benefit from will-change hints
- **No offline support**: App doesn't handle offline scenarios gracefully despite having caching

### 5. GraphQL & Data Fetching

**Strengths:**
- **Apollo Client setup**: Proper GraphQL client configuration
- **Query fragments**: Using fragments for reusable query pieces
- **Refetch queries**: Using refetchQueries in mutations for cache updates

**Areas for Improvement:**
- **No query error retry logic**: Queries don't automatically retry on failure
- **Missing query cache policies**: No cache-first/network-only policies configured
- **Pagination not using Apollo's built-in**: Custom offset-based pagination instead of Apollo's pagination utilities
- **No query batching**: Multiple queries could be batched
- **Optimistic updates incomplete**: Some mutations have incomplete optimistic responses

### 6. Testing

**Strengths:**
- **Testing infrastructure**: Vitest + Testing Library setup
- **Test files colocated**: Tests in `__tests__` folders near source code
- **Multiple test scripts**: Unit, component, integration, and coverage scripts

**Areas for Improvement:**
- **Limited test coverage**: Only 9 test files found across a 130-file codebase
- **No E2E tests**: No Playwright or Cypress tests for critical user flows
- **Missing visual regression tests**: No snapshot testing for UI components
- **No MSW for API mocking**: Tests likely need better GraphQL mocking

### 7. Build & Developer Experience

**Strengths:**
- **Modern build tools**: Vite for fast builds and HMR
- **Prettier configured**: Code formatting standardized
- **Concurrent dev mode**: Can run frontend and backend together
- **TypeScript strict mode**: Proper type checking

**Areas for Improvement:**
- **No pre-commit hooks**: No Husky + lint-staged to enforce quality
- **Missing bundle analysis**: No tools to analyze bundle size
- **No performance monitoring**: No Lighthouse CI or web-vitals tracking
- **Environment variables**: Not clear how environment-specific configs are managed

---

# Optimization Plan

## Phase 1: Code Quality & Consistency

### ✅ Step 1.1: Centralize GraphQL Operations
**Task**: Extract all GraphQL queries and mutations into a centralized API layer for better organization and reusability.

**Files**:
- Create `frontend/src/lib/graphql/queries.ts`: Move all queries from hooks to this file
- Create `frontend/src/lib/graphql/mutations.ts`: Move all mutations from hooks to this file
- Update hooks in `frontend/src/features/*/hooks/*.ts`: Import queries/mutations from centralized files

**Rationale**: Currently, GraphQL operations are scattered across hook files, making them hard to find and reuse. Centralizing them improves maintainability and enables better code sharing.

**Step Dependencies**: None

**Success Criteria**: All GraphQL operations are in `lib/graphql/` folder, hooks import from there, no duplicate query definitions.

---

### ✅ Step 1.2: Implement Centralized Error Handling
**Task**: Create a consistent error handling system to replace scattered error patterns.

**Files**:
- Create `frontend/src/lib/errorHandler.ts`: Error handling utilities with logging service
- Create `frontend/src/contexts/ErrorContext.tsx`: Global error boundary and toast/notification system
- Update `frontend/src/main.tsx`: Wrap app with ErrorProvider
- Update components using local error state (PokeClicker, PokemonCard, etc.): Use error context instead

**Rationale**: Currently, error handling is inconsistent (setTimeout to clear errors, console.error, local state). A centralized system provides better UX and debugging.

**Step Dependencies**: None

**Success Criteria**: All errors go through error handler, consistent error display UX, errors logged properly.

---

### ✅ Step 1.3: Replace Console Statements with Logging Service (COMPLETED)
**Task**: Implement a proper logging service to replace 45 console statements found in production code.

**Files**:
- Create `frontend/src/lib/logger.ts`: Logging service with log levels (debug, info, warn, error)
- Update all 21 files with console statements: Replace with logger service
- Files to update include:
  - `frontend/src/lib/imageCache.ts`
  - `frontend/src/lib/pokemonSpriteCache.ts`
  - `frontend/src/features/clicker/hooks/useClickerActions.ts`
  - (And 18 other files identified in grep)

**Rationale**: Console statements in production are unprofessional and don't provide structured logging for debugging.

**Step Dependencies**: None

**Success Criteria**: No console.log/warn/error in source code (except error boundaries), logger supports log levels, can be disabled in production.

---

### ✅ Step 1.4: Extract Magic Numbers to Configuration (COMPLETED)
**Task**: Move hard-coded constants to configuration files for better maintainability.

**Files**:
- Create `frontend/src/config/gameConfig.ts`: Game constants (candy costs, upgrade formulas, batch thresholds, passive income rates)
- Create `frontend/src/config/uiConfig.ts`: UI constants (debounce delays, animation durations, pagination size, error display timeouts)
- Update files using magic numbers:
  - `frontend/src/features/clicker/hooks/useCandySync.ts` (50 clicks, 10 seconds)
  - `frontend/src/features/pokedex/components/PokedexPage.ts` (300ms debounce, 20 items per page)
  - `frontend/src/features/pokedex/hooks/usePokemonPurchaseHandler.ts` (800ms, 1200ms timeouts)
  - `frontend/src/features/clicker/hooks/useClickerActions.ts` (1000ms, 150ms, 3000ms timeouts)

**Rationale**: Magic numbers scattered throughout code make it hard to tune game balance and UI timing.

**Step Dependencies**: None

**Success Criteria**: All magic numbers extracted to config files, easy to adjust game balance, clear documentation of what each constant controls.

---

## Phase 2: Performance Optimizations

### ✅ Step 2.1: Optimize PokedexPage with useCallback and Context
**Task**: Reduce re-renders in PokedexPage by memoizing callbacks and using context for filter state.

**Files**:
- Create `frontend/src/features/pokedex/contexts/PokedexFilterContext.tsx`: Context for filter state (replaces 20+ props)
- Update `frontend/src/features/pokedex/components/PokedexPage.tsx`: Use context, add useCallback for handlers
- Update `frontend/src/features/pokedex/components/filters/FiltersAndCount.tsx`: Consume context instead of props
- Update `frontend/src/features/pokedex/components/filters/SearchBar.tsx`: Consume context instead of props
- Update `frontend/src/hooks/usePokedexFilters.ts`: Return context value object

**Rationale**: FiltersAndCount receives 20+ props causing unnecessary re-renders. Context + memoization will significantly improve performance.

**Step Dependencies**: None

**Success Criteria**: FiltersAndCount receives <5 props, filter changes don't re-render unrelated components, React DevTools shows fewer re-renders.

---

### ✅ Step 2.2: Consolidate Mobile Detection Logic
**Task**: Replace duplicate mobile detection implementations with the existing `useMobileDetection` hook.

**Files**:
- Update `frontend/src/features/pokedex/components/PokedexPage.tsx` (lines 76-88): Replace local mobile detection with `useMobileDetection` hook
- Update `frontend/src/features/pokedex/components/PokedexPage.tsx` in PokemonGrid (lines 228-235): Use `useMobileDetection` hook
- Review other components for duplicate window.innerWidth checks

**Rationale**: Duplicate mobile detection logic adds unnecessary code and event listeners.

**Step Dependencies**: None

**Success Criteria**: All mobile detection uses `useMobileDetection` hook, no duplicate window resize listeners.

---

### ✅ Step 2.3: Fix Optimistic Response in usePurchasePokemon
**Task**: Improve optimistic UI updates in purchase flow.

**Files**:
- Update `frontend/src/features/pokedex/hooks/usePurchasePokemon.ts` (lines 27-47): Use proper optimistic response with actual user data from cache
- Update `frontend/src/features/pokedex/hooks/usePokemonPurchaseHandler.ts`: Simplify updateUser logic since optimistic response will be correct

**Rationale**: Current optimistic response has placeholder data (empty strings) which could cause UI flicker.

**Step Dependencies**: Step 1.1 (Centralize GraphQL Operations)

**Success Criteria**: Optimistic updates show correct data immediately, no UI flicker on purchase.

---

### ✅ Step 2.4: Refactor useCandySync Unmount Effect
**Task**: Improve the unmount effect pattern in useCandySync to avoid ESLint suppression.

**Files**:
- Update `frontend/src/features/clicker/hooks/useCandySync.ts` (lines 92-103): Use ref pattern to avoid exhaustive-deps warning
  - Store `unsyncedAmount` in a ref
  - Create a separate flush function that reads from ref
  - Remove ESLint disable comment

**Rationale**: Current implementation intentionally violates React Hooks rules with a long explanation comment. Using refs is the proper pattern.

**Step Dependencies**: None

**Success Criteria**: No ESLint suppressions, unmount flush works correctly, code is clearer.

---

## Phase 3: Component Decomposition

### ✅ Step 3.1: Split Large PokedexPage Component
**Task**: Break down PokedexPage (389 lines) into smaller, focused components.

**Files**:
- Extract PokemonGrid to `frontend/src/features/pokedex/components/grid/PokemonGrid.tsx`
- Extract MobilePokemonList to `frontend/src/features/pokedex/components/grid/MobilePokemonList.tsx`
- Extract DesktopPokemonGrid to `frontend/src/features/pokedex/components/grid/DesktopPokemonGrid.tsx`
- Update `frontend/src/features/pokedex/components/PokedexPage.tsx`: Use extracted components, reduce to ~150 lines
- Update `frontend/src/features/pokedex/index.ts`: Export new components if needed

**Rationale**: 389-line component is hard to maintain and test. Splitting improves code organization and testability.

**Step Dependencies**: Step 2.1 (Optimize PokedexPage with Context)

**Success Criteria**: PokedexPage is <150 lines, grid components are in dedicated files, each component has single responsibility.

---

### ✅ Step 3.2: Decompose PokemonCard Component
**Task**: Extract sub-components from PokemonCard (259 lines) for better organization.

**Files**:
- Create `frontend/src/features/pokedex/components/card/PokemonCardSprite.tsx`: Extract sprite display logic
- Create `frontend/src/features/pokedex/components/card/PokemonCardInfo.tsx`: Extract info grid logic
- Update `frontend/src/features/pokedex/components/card/PokemonCard.tsx`: Use extracted components, reduce to ~100 lines

**Rationale**: PokemonCard has complex sprite logic, styling, and info display. Splitting improves readability.

**Step Dependencies**: None

**Success Criteria**: PokemonCard is ~100 lines, sprite and info are separate components, easier to test and maintain.

---

## Phase 4: Testing & Quality Assurance

### ✅ Step 4.1: Add Unit Tests for Critical Hooks
**Task**: Increase test coverage for core business logic in custom hooks.

**Files**:
- Create `frontend/src/features/clicker/hooks/__tests__/useClickerActions.test.ts`: Test click and upgrade logic
- Create `frontend/src/features/clicker/hooks/__tests__/useCandySync.test.ts`: Test batching and sync logic
- Create `frontend/src/features/clicker/hooks/__tests__/usePassiveIncome.test.ts`: Test passive income generation
- Create `frontend/src/hooks/__tests__/usePokemonModal.test.ts`: Test modal state management
- Create `frontend/src/hooks/__tests__/usePokedexFilters.test.ts`: Test filter logic

**Rationale**: Only 9 test files for 130 source files is insufficient. Critical hooks need coverage.

**Step Dependencies**: Step 1.2 (Centralized Error Handling)

**Success Criteria**: All critical hooks have >80% test coverage, tests cover edge cases and error scenarios.

---

### ✅ Step 4.2: Add Component Tests for Key UI Components
**Task**: Add tests for main UI components to prevent regressions.

**Files**:
- Create `frontend/src/features/pokedex/components/card/__tests__/PokemonCard.test.tsx`: Test owned/unowned states, purchase flow
- Create `frontend/src/features/pokedex/components/__tests__/PokedexPage.test.tsx`: Test filtering, pagination, mobile vs desktop
- Create `frontend/src/features/clicker/components/__tests__/GameBoyConsole.test.tsx`: Test click interactions
- Create `frontend/src/components/__tests__/Navbar.test.tsx`: Test navigation and theme toggle

**Rationale**: Key UI components lack tests, making refactoring risky.

**Step Dependencies**: Step 3.1 (Split PokedexPage), Step 3.2 (Decompose PokemonCard)

**Success Criteria**: Main UI components have test coverage, tests check rendering and interactions.

---

### ✅ Step 4.3: Set Up MSW for GraphQL Mocking
**Task**: Implement Mock Service Worker for consistent API mocking in tests.

**Files**:
- Add dependency: `npm install -D msw@latest`
- Create `frontend/src/test/mocks/handlers.ts`: MSW handlers for GraphQL operations
- Create `frontend/src/test/mocks/server.ts`: MSW server setup
- Update `frontend/src/test/setup.ts`: Initialize MSW in test setup
- Update existing hook tests to use MSW instead of Apollo MockedProvider

**Rationale**: Tests need consistent, realistic API mocking. MSW is the modern standard.

**Step Dependencies**: Step 1.1 (Centralize GraphQL Operations)

**Success Criteria**: All GraphQL operations mocked with MSW, tests don't rely on real API, faster test execution.

---

## Phase 5: Developer Experience Improvements

### ✅ Step 5.1: Add Pre-commit Hooks
**Task**: Enforce code quality with automated pre-commit checks.

**Files**:
- Add dependencies: `npm install -D husky lint-staged`
- Create `.husky/pre-commit`: Pre-commit hook script
- Update `frontend/package.json`: Add lint-staged configuration
  ```json
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
  ```
- Run: `npx husky init`

**Rationale**: Prevent bad code from being committed, enforce consistent formatting.

**Step Dependencies**: None

**User Instructions**: Run `npx husky init` after pulling changes.

**Success Criteria**: Commits automatically run linting and formatting, bad code is caught before commit.

---

### ✅ Step 5.2: Add Bundle Analysis Tool
**Task**: Set up bundle size monitoring to prevent bloat.

**Files**:
- Add dependency: `npm install -D rollup-plugin-visualizer`
- Update `frontend/vite.config.ts`: Add visualizer plugin for bundle analysis
- Add script to `frontend/package.json`: `"analyze": "vite build && open stats.html"`

**Rationale**: No visibility into bundle size. Need to monitor and optimize.

**Step Dependencies**: None

**Success Criteria**: Can run `npm run analyze` to see bundle composition, identify large dependencies.

---

### ✅ Step 5.3: Add Performance Monitoring
**Task**: Implement Core Web Vitals tracking for performance monitoring.

**Files**:
- Add dependency: `npm install web-vitals`
- Create `frontend/src/lib/vitals.ts`: Web Vitals reporting utility
- Update `frontend/src/main.tsx`: Initialize vitals reporting
- Create `frontend/src/lib/performanceMonitor.ts`: Custom performance metrics for game actions

**Rationale**: No performance monitoring makes it hard to identify bottlenecks in production.

**Step Dependencies**: Step 1.3 (Logging Service)

**Success Criteria**: Core Web Vitals logged, custom metrics for clicks/purchases tracked, data available for analysis.

---

## Phase 6: UI/UX Enhancements

### ✅ Step 6.1: Improve Error Message UX
**Task**: Replace timeout-based error dismissal with user-controlled dismissal.

**Files**:
- Update `frontend/src/contexts/ErrorContext.tsx`: Add persistent error toast with manual dismiss
- Update `frontend/src/components/ErrorBanner.tsx`: Add close button, remove auto-dismiss timeout
- Update components using error timeouts: Remove setTimeout calls, use error context

**Rationale**: Errors disappearing automatically (1200ms, 3000ms) is bad UX - users may not have time to read them.

**Step Dependencies**: Step 1.2 (Centralized Error Handling)

**Success Criteria**: Errors stay visible until user dismisses, close button works, errors stack if multiple occur.

---

### ✅ Step 6.2: Add Focus Management for Modals
**Task**: Improve accessibility by managing focus in modal dialogs.

**Files**:
- Add dependency: `npm install focus-trap-react`
- Update `frontend/src/features/pokedex/components/detail/PokemonDetailModal.tsx`: Add focus trap, focus first interactive element on open, return focus on close
- Update `frontend/src/features/profile/components/ConfirmDialog.tsx`: Add focus trap
- Add keyboard shortcuts (Escape to close)

**Rationale**: Modals don't trap focus, making keyboard navigation difficult. Accessibility issue.

**Step Dependencies**: None

**Success Criteria**: Focus trapped in modal, Tab cycles through modal only, Escape closes modal, focus returns to trigger element on close.

---

### ✅ Step 6.3: Add Offline Support
**Task**: Implement offline detection and graceful degradation.

**Files**:
- Create `frontend/src/hooks/useOnlineStatus.ts`: Hook to detect online/offline status
- Create `frontend/src/components/OfflineBanner.tsx`: Banner to show when offline
- Update `frontend/src/App.tsx`: Show offline banner when disconnected
- Update `frontend/src/lib/apolloClient.ts`: Configure offline error handling

**Rationale**: App has caching but doesn't handle offline scenarios gracefully.

**Step Dependencies**: None

**Success Criteria**: Users see offline indicator, cached data still works offline, clear error messages for actions requiring connectivity.

---

## Phase 7: GraphQL & Data Fetching Improvements

### ✅ Step 7.1: Configure Apollo Cache Policies
**Task**: Optimize data fetching with proper cache policies.

**Files**:
- Update `frontend/src/lib/apolloClient.ts`:
  - Add cache policies (cache-first for Pokedex, network-only for user data)
  - Configure automatic query retry with exponential backoff
  - Set up cache garbage collection
  - Add field policies for pagination

**Rationale**: Default cache behavior isn't optimized for this app's needs. Proper policies reduce unnecessary network requests.

**Step Dependencies**: Step 1.1 (Centralize GraphQL Operations)

**Success Criteria**: Pokedex data cached aggressively, user data always fresh, queries retry on failure, pagination works with cache.

---

### ✅ Step 7.2: Implement Apollo Query Batching
**Task**: Batch multiple GraphQL queries into single request.

**Files**:
- Update `frontend/src/lib/apolloClient.ts`: Configure BatchHttpLink for query batching
- Update backend GraphQL server config (if needed): Ensure batch support is enabled

**Rationale**: Multiple individual queries create unnecessary HTTP overhead. Batching improves performance.

**Step Dependencies**: None

**Success Criteria**: Multiple queries in same render batch into single request, network tab shows fewer requests, faster loading.

---

## Phase 8: Build & Deployment Optimizations

### ✅ Step 8.1: Add Lighthouse CI
**Task**: Automate performance audits in CI/CD pipeline.

**Files**:
- Add dependency: `npm install -D @lhci/cli`
- Create `lighthouserc.json`: Lighthouse CI configuration with thresholds
- Update `.github/workflows/` (or CI config): Add Lighthouse CI step
- Create `frontend/scripts/lighthouse-ci.js`: Custom Lighthouse run script

**Rationale**: No automated performance monitoring in CI. Lighthouse CI catches regressions.

**Step Dependencies**: None

**User Instructions**: Configure CI environment to run Lighthouse CI on PRs.

**Success Criteria**: Lighthouse runs on every PR, fails if performance degrades below thresholds, report published.

---

### ✅ Step 8.2: Optimize Bundle Splitting
**Task**: Improve code splitting strategy for faster initial load.

**Files**:
- Update `frontend/vite.config.ts`: Configure manual chunk splitting
  - Vendor chunks (React, Apollo, UI libraries)
  - Feature chunks (each feature as separate chunk)
  - Shared utilities chunk
- Update lazy loading in `frontend/src/App.tsx`: Add preload hints for likely navigation paths

**Rationale**: Current bundle splitting may not be optimal. Better splitting improves TTI.

**Step Dependencies**: Step 5.2 (Bundle Analysis)

**Success Criteria**: Initial bundle <200KB, vendor chunk cached separately, features load on-demand, Lighthouse score improves.

---

## Summary

This optimization plan addresses **50+ improvements** across 8 phases:

1. **Phase 1**: Code quality foundations (error handling, logging, configuration)
2. **Phase 2**: Performance optimizations (memoization, mobile detection, optimistic updates)
3. **Phase 3**: Component decomposition (splitting large components)
4. **Phase 4**: Testing infrastructure (unit tests, component tests, MSW)
5. **Phase 5**: Developer experience (pre-commit hooks, bundle analysis, monitoring)
6. **Phase 6**: UI/UX enhancements (error UX, accessibility, offline support)
7. **Phase 7**: GraphQL improvements (cache policies, batching)
8. **Phase 8**: Build optimizations (Lighthouse CI, bundle splitting)

**Recommended Implementation Order**: Execute phases sequentially, completing all steps in a phase before moving to the next. This ensures dependencies are met and changes are properly tested before building on them.

**Expected Impact**:
- **Performance**: 30-50% reduction in re-renders, faster initial load
- **Code Quality**: Better error handling, logging, and testing
- **Maintainability**: Smaller components, centralized logic, clear patterns
- **Developer Experience**: Faster development, fewer bugs caught in pre-commit
- **User Experience**: Better accessibility, offline support, clearer error messages

Each step is designed to be atomic (≤20 file changes) and can be completed in a single iteration by an AI agent or developer.

---

## Progress Tracker

**Phase 1**: ✅ 4/4 steps complete
**Phase 2**: ✅ 4/4 steps complete
**Phase 3**: ✅ 2/2 steps complete
**Phase 4**: ⬜ 0/3 steps complete
**Phase 5**: ⬜ 0/3 steps complete
**Phase 6**: ⬜ 0/3 steps complete
**Phase 7**: ⬜ 0/2 steps complete
**Phase 8**: ⬜ 0/2 steps complete

**Overall Progress**: 10/23 steps complete (43%)
