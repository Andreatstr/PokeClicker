# Code Quality Refactoring Plan

## Overview
This document outlines specific code quality issues found in the codebase and provides detailed, actionable subtasks to fix them. Each task is broken down into concrete steps that can be executed independently.

---

## 🚨 Critical Issues (Fix Immediately)

### Task 1: Fix Syntax Errors in FiltersAndCount.tsx
**Priority:** CRITICAL
**File:** `frontend/src/features/pokedex/components/FiltersAndCount.tsx`
**Estimated Time:** 5 minutes

#### Problem
Lines 168, 181, 203, and 222 have malformed JSX syntax where `style` prop is inside the `className` string.

#### Current Code (BROKEN)
```tsx
// Line 168
<Label className="text-xs font-bold style={{color: 'var(--foreground)'}}">

// Line 181
<Label className="text-xs font-bold style={{color: 'var(--foreground)'}}">

// Line 203
<Label className="text-xs font-bold" style={{color: 'var(--foreground)'}}>

// Line 222
<Label className="text-xs font-bold" style={{color: 'var(--foreground)'}}>
```

#### Subtasks
1. Open `frontend/src/features/pokedex/components/FiltersAndCount.tsx`
2. Go to line 168, change:
   ```tsx
   <Label className="text-xs font-bold style={{color: 'var(--foreground)'}}">
   ```
   to:
   ```tsx
   <Label className="text-xs font-bold" style={{color: 'var(--foreground)'}}>
   ```
3. Repeat for line 181
4. Verify lines 203 and 222 are correct (they should already be fixed based on the read)
5. Save the file
6. Run `npm run lint` to verify no syntax errors
7. Test the filters UI to ensure it renders correctly

---

### Task 2: Remove Duplicate getContrastColor() Function
**Priority:** HIGH
**Files:**
- `frontend/src/features/pokedex/components/PokemonCard.tsx` (lines 23-108)
- `frontend/src/features/pokedex/utils/typeColors.ts` (already has the function)

**Estimated Time:** 10 minutes

#### Problem
`PokemonCard.tsx` contains a complete duplicate of `getContrastColor()` and its 88-line `colorMap` that already exists in `typeColors.ts`.

#### Subtasks
1. Open `frontend/src/features/pokedex/utils/typeColors.ts`
2. Verify `getContrastColor()` function exists (lines 1-55)
3. Ensure it's exported: Change `export function getContrastColor` if needed
4. Open `frontend/src/features/pokedex/components/PokemonCard.tsx`
5. Remove lines 23-108 entirely (the duplicate `getContrastColor()` and `colorMap`)
6. Add import at top of file:
   ```tsx
   import {getTypeColors, getContrastColor} from '../utils/typeColors';
   ```
7. Verify the component still uses `getContrastColor()` at line ~383 (will shift after deletion)
8. Save both files
9. Run `npm run build` to verify no errors
10. Test PokemonCard rendering to ensure colors still work correctly

---

## 🔨 High Priority Refactoring

### Task 3: Extract Custom Hooks from App.tsx
**Priority:** HIGH
**File:** `frontend/src/App.tsx`
**Estimated Time:** 2-3 hours

#### Problem
App.tsx is 440 lines with 20+ state variables, making it unmaintainable. It violates Single Responsibility Principle.

#### Subtasks

##### 3.1: Create usePokedexFilters Hook
1. Create new file: `frontend/src/features/pokedex/hooks/usePokedexFilters.ts`
2. Move filter-related state from App.tsx:
   - `searchTerm`, `debouncedSearchTerm`
   - `selectedRegion`, `selectedTypes`
   - `sortBy`, `sortOrder`
   - `selectedOwnedOnly`
   - All temp filter states (`tempRegion`, `tempTypes`, etc.)
3. Move filter-related handlers:
   - `handleClearFilters()`
   - `handleClearSearch()`
   - Debounce logic from lines 226-232
4. Export interface:
   ```typescript
   export interface PokedexFilters {
     // Search
     searchTerm: string;
     debouncedSearchTerm: string;
     setSearchTerm: (term: string) => void;
     handleClearSearch: () => void;

     // Filters
     selectedRegion: string | null;
     setSelectedRegion: (region: string | null) => void;
     selectedTypes: string[];
     setSelectedTypes: (types: string[]) => void;
     sortBy: 'id' | 'name' | 'type';
     setSortBy: (sort: 'id' | 'name' | 'type') => void;
     sortOrder: 'asc' | 'desc';
     setSortOrder: (order: 'asc' | 'desc') => void;
     selectedOwnedOnly: boolean;
     setSelectedOwnedOnly: (owned: boolean) => void;

     // Mobile temp state
     tempRegion: string | null;
     setTempRegion: (region: string | null) => void;
     tempTypes: string[];
     setTempTypes: (types: string[]) => void;
     tempSortBy: 'id' | 'name' | 'type';
     setTempSortBy: (sort: 'id' | 'name' | 'type') => void;
     tempSortOrder: 'asc' | 'desc';
     setTempSortOrder: (order: 'asc' | 'desc') => void;
     tempOwnedOnly: boolean;
     setTempOwnedOnly: (owned: boolean) => void;

     // Handlers
     handleClearFilters: () => void;
   }
   ```
5. Implement the hook with all state and logic
6. Update App.tsx to use: `const filters = usePokedexFilters();`
7. Test filter functionality

##### 3.2: Create usePagination Hook
1. Create new file: `frontend/src/features/pokedex/hooks/usePagination.ts`
2. Move pagination state:
   - `paginationPage`
   - `ITEMS_PER_PAGE` constant
3. Move pagination logic:
   - `handlePageChange()` function
   - Reset logic from useEffect (lines 106-109)
4. Export interface:
   ```typescript
   export interface PaginationState {
     currentPage: number;
     itemsPerPage: number;
     totalPages: number;
     offset: number;
     onPageChange: (page: number) => void;
     reset: () => void;
   }

   export function usePagination(
     itemsPerPage: number,
     totalItems: number,
     dependencies: any[] // Reset when these change
   ): PaginationState
   ```
5. Implement the hook
6. Update App.tsx to use: `const pagination = usePagination(20, totalPokemon, [filters.selectedRegion, filters.selectedTypes, filters.debouncedSearchTerm]);`
7. Test pagination

##### 3.3: Create usePokemonModal Hook
1. Create new file: `frontend/src/features/pokedex/hooks/usePokemonModal.ts`
2. Move modal state:
   - `selectedPokemon`
   - `isModalOpen`
   - `crossRegionPokemonId`
3. Move modal handlers:
   - `handlePokemonClick()`
   - Cross-region loading logic (lines 208-224)
4. Export interface:
   ```typescript
   export interface PokemonModalState {
     selectedPokemon: PokedexPokemon | null;
     isOpen: boolean;
     handleOpen: (pokemon: PokedexPokemon) => void;
     handleClose: () => void;
     handleSelectPokemon: (id: number, allPokemon: PokedexPokemon[]) => void;
   }
   ```
5. Implement the hook with `usePokemonById` query for cross-region
6. Update App.tsx to use: `const modal = usePokemonModal();`
7. Test modal opening/closing and cross-region navigation

##### 3.4: Create useMobileMenu Hook
1. Create new file: `frontend/src/hooks/useMobileMenu.ts` (or in Navbar component)
2. Move mobile menu state:
   - `isMobile`
   - `showMobileFilters`
3. Move mobile detection logic (lines 188-201)
4. Export interface:
   ```typescript
   export interface MobileMenuState {
     isMobile: boolean;
     showMobileFilters: boolean;
     setShowMobileFilters: (show: boolean | ((prev: boolean) => boolean)) => void;
   }
   ```
5. Implement the hook
6. Consider moving this into Navbar component instead
7. Update App.tsx to use: `const mobile = useMobileMenu();`

##### 3.5: Update App.tsx to Use All New Hooks
1. Remove all extracted state variables
2. Import and use all new hooks:
   ```typescript
   const filters = usePokedexFilters();
   const pagination = usePagination(20, totalPokemon, [filters.debouncedSearchTerm, filters.selectedRegion, filters.selectedTypes]);
   const modal = usePokemonModal();
   const mobile = useMobileMenu();
   ```
3. Update all JSX to use new hook objects
4. Verify App.tsx is now under 200 lines
5. Run full app test

---

### Task 4: Refactor LazyPokedex Props
**Priority:** HIGH
**File:** `frontend/src/components/LazyPokedex.tsx`
**Estimated Time:** 1 hour

#### Problem
Component accepts 43 individual props, making it unmaintainable.

#### Subtasks

##### 4.1: Create Grouped Prop Interfaces
1. Open `frontend/src/components/LazyPokedex.tsx`
2. Replace the massive `LazyPokedexProps` interface with grouped interfaces:
   ```typescript
   interface SearchBarProps {
     searchTerm: string;
     setSearchTerm: (value: string) => void;
     handleClearSearch: () => void;
     isMobile: boolean;
     showMobileFilters: boolean;
     setShowMobileFilters: (value: boolean | ((prev: boolean) => boolean)) => void;
     isDarkMode: boolean;
   }

   interface FiltersProps {
     loading: boolean;
     displayedPokemon: PokedexPokemon[];
     totalPokemon: number;
     selectedTypes: string[];
     selectedRegion: string | null;
     sortBy: 'id' | 'name' | 'type';
     sortOrder: 'asc' | 'desc';
     tempRegion: string | null;
     tempTypes: string[];
     tempSortBy: 'id' | 'name' | 'type';
     tempSortOrder: 'asc' | 'desc';
     selectedOwnedOnly: boolean;
     tempOwnedOnly: boolean;
     setSelectedRegion: (value: string | null) => void;
     setSelectedTypes: (value: string[]) => void;
     setSortBy: (value: 'id' | 'name' | 'type') => void;
     setSortOrder: (value: 'asc' | 'desc') => void;
     setTempRegion: (value: string | null) => void;
     setTempTypes: (value: string[]) => void;
     setTempSortBy: (value: 'id' | 'name' | 'type') => void;
     setTempSortOrder: (value: 'asc' | 'desc') => void;
     setSelectedOwnedOnly: (value: boolean) => void;
     setTempOwnedOnly: (value: boolean) => void;
     handleClearFilters: () => void;
     ownedPokemonIds: number[];
     isMobile: boolean;
     showMobileFilters: boolean;
     setShowMobileFilters: (value: boolean | ((prev: boolean) => boolean)) => void;
   }

   interface PaginationProps {
     handlePokemonClick: (pokemon: PokedexPokemon) => void;
     paginationPage: number;
     totalPages: number;
     onPageChange: (page: number) => void;
     ITEMS_PER_PAGE: number;
   }

   interface LazyPokedexProps {
     search: SearchBarProps;
     filters: FiltersProps;
     pagination: PaginationProps;
     isDarkMode: boolean;
   }
   ```

##### 4.2: Update Component to Accept Grouped Props
1. Update function signature:
   ```typescript
   export function LazyPokedex({ search, filters, pagination, isDarkMode }: LazyPokedexProps) {
   ```
2. Update all internal references to use grouped props:
   - `props.searchTerm` → `search.searchTerm`
   - `props.selectedRegion` → `filters.selectedRegion`
   - `props.paginationPage` → `pagination.paginationPage`
3. Pass grouped props to child components

##### 4.3: Update App.tsx to Pass Grouped Props
1. Open `frontend/src/App.tsx`
2. Update LazyPokedex usage:
   ```tsx
   <LazyPokedex
     search={{
       searchTerm,
       setSearchTerm,
       handleClearSearch,
       isMobile,
       showMobileFilters,
       setShowMobileFilters,
       isDarkMode,
     }}
     filters={{
       // ... all filter props
     }}
     pagination={{
       // ... all pagination props
     }}
     isDarkMode={isDarkMode}
   />
   ```
3. Or better yet, if using hooks from Task 3:
   ```tsx
   <LazyPokedex
     search={{ ...filters, isMobile: mobile.isMobile, showMobileFilters: mobile.showMobileFilters, setShowMobileFilters: mobile.setShowMobileFilters, isDarkMode }}
     filters={{ ...filters, ...mobile, loading, displayedPokemon, totalPokemon, ownedPokemonIds: user?.owned_pokemon_ids ?? [] }}
     pagination={{ ...pagination, handlePokemonClick: modal.handleOpen }}
     isDarkMode={isDarkMode}
   />
   ```

##### 4.4: Test Refactored Component
1. Verify app still compiles
2. Test all Pokedex functionality
3. Ensure no regressions

---

### Task 5: Split PokeClicker Component
**Priority:** MEDIUM
**File:** `frontend/src/features/clicker/components/PokeClicker.tsx`
**Estimated Time:** 3-4 hours

#### Problem
843-line component mixing game logic, UI, network sync, and animations.

#### Subtasks

##### 5.1: Extract Game Logic Hook
1. Create `frontend/src/features/clicker/hooks/useClickerGame.ts`
2. Extract game state and logic:
   - Stats state
   - Local candy state
   - Click handling
   - Upgrade cost calculation
   - Stat description logic
3. Export interface:
   ```typescript
   export interface ClickerGameState {
     stats: Stats;
     localRareCandy: number;
     candies: Candy[];
     isAnimating: boolean;
     handleClick: () => void;
     handleUpgrade: (stat: keyof Stats) => Promise<void>;
     getCandiesPerClick: () => number;
     getUpgradeCost: (stat: string) => number;
     getStatDescription: (stat: string) => any;
   }
   ```
4. Implement the hook
5. Keep UI-related state separate

##### 5.2: Extract Network Sync Hook
1. Create `frontend/src/features/clicker/hooks/useCandySync.ts`
2. Extract sync logic:
   - Unsynced amount tracking
   - Batch timer management
   - `flushPendingCandy()` function
   - Error handling
3. Export interface:
   ```typescript
   export interface CandySyncState {
     unsyncedAmount: number;
     addUnsynced: (amount: number) => void;
     flush: () => Promise<void>;
     error: string | null;
   }
   ```
4. Implement the hook with `updateRareCandy` mutation
5. Handle batching (50 clicks or 10 seconds)
6. Handle unmount flushing

##### 5.3: Extract Passive Income Hook
1. Create `frontend/src/features/clicker/hooks/usePassiveIncome.ts`
2. Extract passive income logic from useEffect (lines 196-228)
3. Export interface:
   ```typescript
   export function usePassiveIncome(
     stats: Stats,
     isAuthenticated: boolean,
     onIncomeEarned: (amount: number) => void
   ): void
   ```
4. Implement the hook with interval logic

##### 5.4: Create GameBoyConsole Component
1. Create `frontend/src/features/clicker/components/GameBoyConsole.tsx`
2. Extract GameBoy UI (lines 410-638)
3. Props interface:
   ```typescript
   interface GameBoyConsoleProps {
     isDarkMode: boolean;
     isAuthenticated: boolean;
     isAnimating: boolean;
     candies: Candy[];
     selectedPokemonId: number;
     onPokemonClick: () => void;
   }
   ```
4. Move all GameBoy rendering (screen, buttons, D-pad, speaker)
5. Keep pure presentational (no game logic)

##### 5.5: Create UpgradePanel Component
1. Create `frontend/src/features/clicker/components/UpgradePanel.tsx`
2. Extract upgrade UI (lines 703-839)
3. Props interface:
   ```typescript
   interface UpgradePanelProps {
     isDarkMode: boolean;
     stats: Stats;
     currentCandy: number;
     isLoading: boolean;
     isAuthenticated: boolean;
     onUpgrade: (stat: keyof Stats) => Promise<void>;
     getUpgradeCost: (stat: string) => number;
     getStatDescription: (stat: string) => any;
   }
   ```
4. Move rare candy counter and upgrade cards UI

##### 5.6: Refactor Main PokeClicker Component
1. Import all new hooks and components
2. Compose them together:
   ```typescript
   export function PokeClicker({ isDarkMode = false }: PokeClickerProps) {
     const { user, isAuthenticated, updateUser } = useAuth();
     const game = useClickerGame(user);
     const sync = useCandySync(updateRareCandy, updateUser, isAuthenticated);

     usePassiveIncome(game.stats, isAuthenticated, (amount) => {
       game.addCandy(amount);
       sync.addUnsynced(amount);
     });

     return (
       <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
         {/* Error display */}
         {sync.error && <ErrorBanner error={sync.error} isDarkMode={isDarkMode} />}

         {/* Unauthenticated message */}
         {!isAuthenticated && <UnauthenticatedMessage isDarkMode={isDarkMode} />}

         {/* GameBoy Console */}
         <GameBoyConsole
           isDarkMode={isDarkMode}
           isAuthenticated={isAuthenticated}
           isAnimating={game.isAnimating}
           candies={game.candies}
           selectedPokemonId={user?.selected_pokemon_id || 1}
           onPokemonClick={game.handleClick}
         />

         {/* Stats and Upgrades */}
         <UpgradePanel
           isDarkMode={isDarkMode}
           stats={game.stats}
           currentCandy={game.localRareCandy}
           isLoading={loading}
           isAuthenticated={isAuthenticated}
           onUpgrade={game.handleUpgrade}
           getUpgradeCost={game.getUpgradeCost}
           getStatDescription={game.getStatDescription}
         />
       </div>
     );
   }
   ```
3. Verify PokeClicker.tsx is now under 150 lines
4. Test all clicker functionality

---

## 🧹 Code Cleanup Tasks

### Task 6: Remove Unnecessary Comments
**Priority:** LOW
**Estimated Time:** 30 minutes

#### Problem
Many comments state the obvious and don't add value.

#### Subtasks

##### 6.1: Clean App.tsx Comments
1. Open `frontend/src/App.tsx`
2. Remove these comment lines:
   - Line 8: `// Lazy load heavy components`
   - Line 36: `// Check localStorage first, then system preference`
   - Line 42: `// Check system preference`
   - Line 50: `// If authenticated, restore last page or default to pokedex`
   - Line 71: `// Initialize preloading service` (keep the detailed comments inside though)
   - Line 106: `// Reset to page 1 when filters change`
   - Line 111: `// Mobile`
   - Line 120: `// Apply initial theme on mount`
   - Line 129: `// Prevent scrolling on map page`
   - Line 170: `// Save current page to localStorage`
3. Keep these comments (they explain non-obvious WHY):
   - Line 65: `// State for cross-region Pokemon navigation` (explains WHY this state exists)
   - Line 145-152: Touch scroll prevention logic (complex, needs explanation)
4. Save file

##### 6.2: Clean PokeClicker.tsx Comments
1. Open `frontend/src/features/clicker/components/PokeClicker.tsx`
2. Remove these comment lines:
   - Line 55: `// Preload game assets`
   - Line 91: `// Initialize local candy from server when component mounts` (obvious from code)
   - Line 101: `// Sync stats with user data when it changes (but NOT candy)` (obvious)
   - Line 108: `// Get the current candy count (local state only - never use server value during gameplay)` (function name is clear)
   - Line 136: `// Batch update clicks every 10 seconds or after 50 clicks` (obvious from code below)
   - Line 160: `// Flush when component unmounts (navigating away from clicker)` (obvious)
   - Line 169: `// Calculate candies per click (using shared utility)` (obvious)
   - Line 195: `// Effect for passive income` (obvious)
   - Line 308: `// Get stat description (shows current → next level benefit)` (obvious from function name)
   - Line 357: `// Show loading state while mutations are in progress` (obvious)
3. Keep these comments (they explain important WHY):
   - Line 24: `// Local state for visual feedback only`
   - Line 82: `// Local candy state - THIS is the source of truth for display!`
   - Line 88: `// Error state`
   - Line 111: Batch sync strategy comment
   - Line 174: `// Calculate upgrade cost (differentiated by stat type)` (explains WHY logic is complex)
   - Line 178: `// New simplified system` (explains migration)
4. Save file

##### 6.3: Clean LazyPokedex.tsx Comments
1. Open `frontend/src/components/LazyPokedex.tsx`
2. Remove all JSX section comments:
   - Line 72: `{/* Search Bar */}`
   - Line 92: `{/* Filters and Count */}`
   - Line 133: `{/* Pokemon Grid */}`
   - Line 184: `// Detect mobile`
   - Line 194: `// Set first Pokemon as selected on mobile by default (only when no selection exists)`
   - Line 224: `{/* Mobile: Card on Top + List Below */}`
   - Line 227: `{/* Top: Selected Pokemon Card */}`
   - Line 247: `{/* Bottom: Horizontal Scrollable Pokemon List */}`
   - All gradient fade comments (lines 249-261)
   - Line 299: `{/* Mobile Pagination Controls */}`
   - Line 309: `/* Desktop: Grid View */`
   - Line 336: `{/* Desktop Pagination Controls */}`
3. Keep comment on line 7: `// Lazy load the heavy Pokedex components` if it helps, or remove if obvious
4. Save file

##### 6.4: Clean Other Component Comments
1. Open `frontend/src/features/pokedex/components/PokemonCard.tsx`
2. Review all comments - most are function-level and should stay
3. Remove obvious comments like:
   - Line 16: `// Helper to calculate Pokemon purchase cost (matches backend)` - keep this, it's useful
   - Line 23: `function getContrastColor` - **DELETE ENTIRE FUNCTION** (done in Task 2)
   - Line 146: `// Preload Pokemon sprite and type background` - remove, obvious
4. Save file

##### 6.5: Verify No Important Comments Removed
1. Do a final review of all changed files
2. Ensure no WHY comments were removed
3. Ensure all WHAT comments (obvious) were removed
4. Run `git diff` to review changes

---

### Task 7: Remove Duplicate Code in typeColors.ts
**Priority:** LOW
**File:** `frontend/src/features/pokedex/utils/typeColors.ts`
**Estimated Time:** 5 minutes

#### Problem
`getStatBarColors()` returns identical objects for both dark and light mode.

#### Subtasks
1. Open `frontend/src/features/pokedex/utils/typeColors.ts`
2. Find `getStatBarColors()` function (lines 57-77)
3. Replace entire function with:
   ```typescript
   export function getStatBarColors() {
     return {
       hp: {color: 'bg-red-300', upgradeColor: 'bg-red-600'},
       attack: {color: 'bg-orange-300', upgradeColor: 'bg-orange-600'},
       defense: {color: 'bg-blue-300', upgradeColor: 'bg-blue-600'},
       spAttack: {color: 'bg-purple-300', upgradeColor: 'bg-purple-600'},
       spDefense: {color: 'bg-yellow-300', upgradeColor: 'bg-yellow-600'},
       speed: {color: 'bg-pink-300', upgradeColor: 'bg-pink-600'},
     };
   }
   ```
4. Find all usages of `getStatBarColors(isDarkMode)` in the codebase
5. Change to `getStatBarColors()` (remove parameter)
6. Update function signature to remove `isDarkMode` parameter
7. Save all files
8. Test that stat bars still render correctly

---

## 📋 Testing Checklist

After completing all tasks, verify:

### Critical Functionality
- [ ] App loads without errors
- [ ] Filters work (region, type, sort, owned)
- [ ] Search works with debouncing
- [ ] Pagination works
- [ ] Pokemon cards render correctly with proper colors
- [ ] Modal opens and closes
- [ ] Cross-region Pokemon navigation works
- [ ] Mobile responsive design works

### Clicker Game
- [ ] Clicking Pokemon awards candy
- [ ] Passive income generates candy
- [ ] Upgrades cost correct amount
- [ ] Upgrades increase stats
- [ ] Candy syncs to server
- [ ] Batch syncing works (50 clicks or 10 seconds)
- [ ] Error handling works
- [ ] GameBoy UI renders correctly

### Code Quality
- [ ] No console errors
- [ ] No TypeScript errors (`npm run build`)
- [ ] No lint errors (`npm run lint`)
- [ ] File sizes reduced (App.tsx, PokeClicker.tsx)
- [ ] No duplicate code
- [ ] Comments are meaningful, not obvious

---

## 📊 Success Metrics

### Before Refactoring
- **App.tsx:** 440 lines, 20+ state variables, 43 props passed to children
- **PokeClicker.tsx:** 843 lines, multiple concerns mixed
- **Duplicate code:** `getContrastColor()` in 2 places
- **Syntax errors:** 4 in FiltersAndCount.tsx
- **Unnecessary comments:** ~30+ across codebase

### After Refactoring
- **App.tsx:** < 200 lines, 5-6 state variables (rest in hooks), grouped props
- **PokeClicker.tsx:** < 150 lines, single responsibility (composition)
- **Duplicate code:** 0 instances
- **Syntax errors:** 0
- **Unnecessary comments:** 0
- **New hooks created:** 6-7 reusable hooks
- **New components created:** 2-3 presentational components

---

## 🚀 Execution Order

For Claude or any developer following this plan:

1. **Start with Critical (Tasks 1-2)** - Fix breaking issues first
2. **Then High Priority (Tasks 3-5)** - Major refactoring for maintainability
3. **Finally Low Priority (Tasks 6-7)** - Code cleanup and polish
4. **Run full test suite** after each major task
5. **Commit after each completed task** for easy rollback if needed

---

## 📝 Notes

- Each task is independent where possible
- Test after each task to catch regressions early
- Use TypeScript compiler to catch errors: `npm run build`
- Use linter to enforce code style: `npm run lint`
- Keep git commits small and focused per task
- If a task breaks something, revert and try again

---

## ❓ Questions or Issues?

If you encounter any issues while following this plan:
1. Check the TypeScript errors first
2. Verify imports are correct
3. Ensure all dependencies are installed
4. Test in isolation (comment out new code temporarily)
5. Roll back to last working commit if needed

Good luck with the refactoring! 🎉
