# Project 4 Issues - Post-Review Improvements

**Based on:** Project review feedback received 2025-11-05

**Sprint Goal:** Address critical UX, accessibility, and documentation issues identified in project review

**Total Capacity:** ~30-40 hours

---

## 🔴 CRITICAL - Must Fix Before Final Submission

### Issue #P4-1: Fix Interactive Element Hit Areas (44x44px Minimum)

**Branch:** `fix/touch-target-sizes`

**Priority:** 🔴 CRITICAL - WCAG 2.5.5 AA requirement

**Problem:** Multiple interactive elements have hit areas smaller than 44x44px, making them difficult to tap on mobile devices and failing WCAG accessibility guidelines.

**Affected Elements:**
- Filters button
- Type badges (Fire, Water, Grass, etc.)
- Navbar buttons (Pokedex, Clicker, Map, Profile)
- "Unlock" buttons in Pokedex cards
- Theme toggle button
- Profile icons/buttons

**Solution:**

```tsx
// Add to global CSS or component styles
.touch-target {
  /* Ensure minimum 44x44px clickable area */
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

// For smaller visual elements, use padding to expand hit area
.small-icon-button {
  padding: 12px; /* Adds to visual size to reach 44x44px */
}
```

**Implementation Checklist:**

**Navbar.tsx:**
```tsx
// Update all nav buttons
<Button
  className="min-w-[44px] min-h-[44px] touch-target"
  onClick={() => onPageChange('pokedex')}
>
  {/* icon content */}
</Button>
```

**FilterControls.tsx:**
```tsx
// Filters button
<Button
  className="min-w-[44px] min-h-[44px]"
  onClick={toggleFilters}
  aria-label="Open filters"
>
  <Filter className="w-5 h-5" />
</Button>

// Type badges - add padding to expand hit area
<Badge
  className="cursor-pointer min-h-[44px] px-4 py-2"
  onClick={() => toggleType(type)}
>
  {type}
</Badge>
```

**PokemonCard.tsx:**
```tsx
// Unlock button
<Button
  className="min-w-[44px] min-h-[44px]"
  onClick={handleUnlock}
  aria-label={`Unlock ${pokemon.name} for ${cost} rare candy`}
>
  Unlock
</Button>
```

**Testing:**
- [ ] Use browser dev tools to inspect computed dimensions
- [ ] Test on mobile device (iOS/Android)
- [ ] Verify all buttons are easily tappable
- [ ] Run Lighthouse accessibility audit (should fix touch target issues)
- [ ] Check with Chrome's "Show rulers" feature to measure exact sizes

**Acceptance:**
- [ ] All interactive elements have minimum 44x44px hit area
- [ ] Visual appearance unchanged (use padding, not resizing content)
- [ ] Mobile tap experience improved
- [ ] Lighthouse accessibility audit shows no touch target warnings

**Files:**
- `frontend/src/components/Navbar.tsx`
- `frontend/src/features/pokedex/components/FilterControls.tsx`
- `frontend/src/features/pokedex/components/PokemonCard.tsx`
- `frontend/src/components/ui/pixelact-ui/button.tsx` (if global changes needed)
- `frontend/src/index.css` (add `.touch-target` utility class)

**Effort:** 2-3 hours

---

### Issue #P4-2: Add Hover States to All Interactive Elements

**Branch:** `feat/hover-states`

**Priority:** 🔴 CRITICAL - UX feedback

**Problem:** Filters button, navbar buttons, and other interactive elements lack hover states, making it unclear what is clickable.

**Solution:**

```tsx
// Navbar.tsx - add hover effects to all buttons
<Button
  className="transition-all hover:scale-105 hover:bg-accent/80"
  onClick={() => onPageChange('pokedex')}
>
  Pokedex
</Button>

// FilterControls.tsx - Filters button
<Button
  className="hover:bg-primary/90 hover:shadow-lg transition-all"
  onClick={toggleFilters}
>
  <Filter className="w-5 h-5" />
  Filters
</Button>

// Type badges
<Badge
  className="cursor-pointer hover:scale-110 hover:brightness-110 transition-transform"
  onClick={() => toggleType(type)}
>
  {type}
</Badge>

// PokemonCard.tsx - Unlock button
<Button
  className="hover:bg-yellow-500 hover:scale-105 transition-all"
  onClick={handleUnlock}
>
  Unlock
</Button>

// Theme toggle
<button
  className="hover:rotate-180 transition-transform duration-500"
  onClick={toggleTheme}
  aria-label="Toggle theme"
>
  {isDarkMode ? '🌙' : '☀️'}
</button>
```

**CSS Additions:**
```css
/* Add to index.css or button.css */
.pixel__button:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.pixel__button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

**Acceptance:**
- [ ] All clickable elements have visible hover state
- [ ] Hover effects are consistent with retro GameBoy theme
- [ ] Cursor changes to pointer on hover
- [ ] Transitions are smooth (200-300ms)
- [ ] Active/pressed states also implemented

**Files:**
- `frontend/src/components/Navbar.tsx`
- `frontend/src/features/pokedex/components/FilterControls.tsx`
- `frontend/src/features/pokedex/components/PokemonCard.tsx`
- `frontend/src/components/ui/pixelact-ui/button.tsx`
- `frontend/src/components/ui/pixelact-ui/button.css`

**Effort:** 1-2 hours

---

### Issue #P4-3: Investigate and Fix Pokedex 500 Error (Rate Limiting)

**Branch:** `fix/pokedex-500-error`

**Priority:** 🔴 CRITICAL - Blocks core functionality

**Problem:** Users report "Error loading Pokémon (status code 500)" in Pokedex. Likely caused by rate limiting on backend or external API calls.

**Investigation Steps:**

1. **Check Backend Logs:**
```bash
# Look for errors in backend console during Pokedex load
# Check for MongoDB connection errors
# Check for rate limit errors from external APIs
```

2. **Identify Rate Limit Source:**
- PokeAPI rate limits (if using external API)
- MongoDB query timeouts
- GraphQL resolver bottlenecks

3. **Potential Causes:**
- Too many parallel requests from frontend
- Expensive MongoDB aggregations (ranks queries)
- Missing database indexes
- External API rate limits

**Solutions:**

**Option 1: Add Request Debouncing/Throttling (Frontend)**
```tsx
// PokemonGrid.tsx - debounce search/filter requests
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedFetch = useMemo(
  () => debounce((variables) => {
    refetch(variables);
  }, 500),
  []
);

useEffect(() => {
  debouncedFetch({ search, filters, page });
}, [search, filters, page]);
```

**Option 2: Implement Request Caching (Backend)**
```ts
// resolvers.ts - cache expensive queries
import NodeCache from 'node-cache';

const pokemonCache = new NodeCache({ stdTTL: 300 }); // 5 min cache

export const resolvers = {
  Query: {
    pokemon: async (_, args, { db }) => {
      const cacheKey = JSON.stringify(args);

      if (pokemonCache.has(cacheKey)) {
        return pokemonCache.get(cacheKey);
      }

      const result = await fetchPokemon(db, args);
      pokemonCache.set(cacheKey, result);

      return result;
    }
  }
};
```

**Option 3: Add Database Indexes**
```ts
// initSchema.ts - ensure all necessary indexes exist
await pokemonCollection.createIndex({ name: 1 });
await pokemonCollection.createIndex({ types: 1 });
await pokemonCollection.createIndex({ generation: 1 });
await pokemonCollection.createIndex({ pokedexNumber: 1 });
```

**Option 4: Limit Concurrent Requests**
```tsx
// apollo/client.ts - limit concurrent requests
import { BatchHttpLink } from '@apollo/client/link/batch-http';

const httpLink = new BatchHttpLink({
  uri: 'http://localhost:3001',
  batchMax: 5, // Max 5 queries per batch
  batchInterval: 100, // Wait 100ms before batching
});
```

**Testing:**
- [ ] Load Pokedex repeatedly to reproduce error
- [ ] Check browser Network tab for 500 responses
- [ ] Monitor backend logs for error messages
- [ ] Test with throttled network (Chrome DevTools)
- [ ] Verify error handling shows user-friendly message

**Acceptance:**
- [ ] No 500 errors in normal usage
- [ ] Proper error handling with user-friendly messages
- [ ] Loading states during slow requests
- [ ] Rate limiting respected (if external API)

**Files:**
- `backend/src/resolvers.ts` (add caching)
- `backend/src/initSchema.ts` (add indexes)
- `frontend/src/apollo/client.ts` (request batching)
- `frontend/src/features/pokedex/components/PokemonGrid.tsx` (debouncing)

**Effort:** 3-4 hours (includes debugging and testing)

---

### Issue #P4-4: Fix Favorite Pokemon Selection in Profile

**Branch:** `fix/favorite-pokemon-selection`

**Priority:** 🔴 CRITICAL - Core feature broken

**Problem:** Users cannot select favorite Pokemon in profile page. Feature appears broken.

**Investigation:**
1. Check if GraphQL mutation exists and is wired correctly
2. Verify UI component is properly handling selection
3. Check for console errors
4. Verify backend resolver logic

**Current Implementation Check:**
```tsx
// ProfileDashboard.tsx - verify this exists and works
const [setFavoritePokemon] = useMutation(SET_FAVORITE_POKEMON_MUTATION);

const handleSelectFavorite = async (pokemonId: number) => {
  try {
    await setFavoritePokemon({ variables: { pokemonId } });
    // Update local state or refetch user
  } catch (error) {
    console.error('Failed to set favorite:', error);
  }
};
```

**Likely Issues:**
- Mutation not defined in schema
- Mutation not wired to UI component
- Permission/authentication issue
- State not updating after mutation

**Solution:**

**Backend (if missing):**
```graphql
# schema.ts
type Mutation {
  setFavoritePokemon(pokemonId: Int!): User!
}
```

```ts
// resolvers.ts
Mutation: {
  setFavoritePokemon: async (_, { pokemonId }, { db, userId }) => {
    if (!userId) throw new Error('Not authenticated');

    const usersCollection = db.collection('users');

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { favorite_pokemon_id: pokemonId } },
      { returnDocument: 'after' }
    );

    return result.value;
  }
}
```

**Frontend:**
```tsx
// ProfileDashboard.tsx
import { useMutation } from '@apollo/client';
import { SET_FAVORITE_POKEMON_MUTATION } from '@/graphql/mutations';
import { ME_QUERY } from '@/graphql/queries';

export function ProfileDashboard() {
  const { data: userData } = useQuery(ME_QUERY);
  const [setFavoritePokemon, { loading }] = useMutation(
    SET_FAVORITE_POKEMON_MUTATION,
    {
      refetchQueries: [{ query: ME_QUERY }],
      onCompleted: () => {
        toast.success('Favorite Pokemon updated!');
      },
      onError: (error) => {
        toast.error(`Failed to update: ${error.message}`);
      }
    }
  );

  const handleSelectFavorite = (pokemonId: number) => {
    setFavoritePokemon({ variables: { pokemonId } });
  };

  return (
    <section className="pixel-box p-6">
      <h2 className="pixel-font text-2xl mb-4">World Pokemon</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Select a Pokemon to appear in the World map
      </p>

      <div className="grid grid-cols-3 gap-4">
        {userData?.me?.owned_pokemon_ids.map((pokemonId) => (
          <div
            key={pokemonId}
            className={`pixel-box p-2 cursor-pointer hover:scale-105 transition-transform ${
              userData.me.favorite_pokemon_id === pokemonId ? 'ring-2 ring-yellow-400' : ''
            }`}
            onClick={() => handleSelectFavorite(pokemonId)}
          >
            <img src={getPokemonSprite(pokemonId)} alt={getPokemonName(pokemonId)} />
            <p className="text-xs text-center">{getPokemonName(pokemonId)}</p>
          </div>
        ))}
      </div>

      {loading && <p className="text-xs mt-2">Updating...</p>}
    </section>
  );
}
```

**Testing:**
- [ ] Click on owned Pokemon to select as favorite
- [ ] Verify selection persists after refresh
- [ ] Check that selected Pokemon appears in World/Map
- [ ] Test with guest users (should be disabled or handled gracefully)

**Acceptance:**
- [ ] Can select favorite Pokemon from owned collection
- [ ] Visual feedback shows selected Pokemon (ring/highlight)
- [ ] Selection persists after page refresh
- [ ] Selected Pokemon appears in World/Map feature
- [ ] Error handling for failures

**Files:**
- `backend/src/schema.ts` (mutation definition)
- `backend/src/resolvers.ts` (mutation resolver)
- `frontend/src/graphql/mutations.ts` (mutation query)
- `frontend/src/features/profile/components/ProfileDashboard.tsx`

**Effort:** 2-3 hours

---

### Issue #P4-5: Persist Dark Mode Preference for Logged-In Users

**Branch:** `feat/persist-theme-authenticated`

**Priority:** 🟡 HIGH - UX improvement

**Problem:** Dark mode preference is saved to localStorage but not persisted in database for logged-in users. Preference is lost when switching devices or clearing browser data.

**Current Behavior:**
```tsx
// Theme stored only in localStorage
localStorage.setItem('theme', 'dark');
```

**Desired Behavior:**
- Guest users: localStorage (current behavior)
- Logged-in users: Save to database + localStorage

**Solution:**

**Backend:**
```graphql
# schema.ts - add theme field to User
type User {
  _id: ID!
  username: String!
  theme_preference: String # "light" | "dark" | "system"
  # ... rest of fields
}

type Mutation {
  updateThemePreference(theme: String!): User!
}
```

```ts
// resolvers.ts
Mutation: {
  updateThemePreference: async (_, { theme }, { db, userId }) => {
    if (!userId) throw new Error('Not authenticated');

    const usersCollection = db.collection('users');

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { theme_preference: theme } },
      { returnDocument: 'after' }
    );

    return result.value;
  }
}
```

**Frontend:**
```tsx
// ThemeProvider.tsx or App.tsx
import { useMutation } from '@apollo/client';

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [updateThemeMutation] = useMutation(UPDATE_THEME_PREFERENCE_MUTATION);

  // Load theme on mount
  useEffect(() => {
    if (user && user.theme_preference) {
      // Logged-in user: use database preference
      setTheme(user.theme_preference);
      localStorage.setItem('theme', user.theme_preference);
    } else {
      // Guest user: use localStorage
      const savedTheme = localStorage.getItem('theme') || 'dark';
      setTheme(savedTheme);
    }
  }, [user]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Always save to localStorage (for immediate effect)
    localStorage.setItem('theme', newTheme);

    // If logged in, also save to database
    if (user) {
      try {
        await updateThemeMutation({ variables: { theme: newTheme } });
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
```

**Migration:**
```ts
// Add migration script to set default theme for existing users
async function migrateUserThemes() {
  const usersCollection = db.collection('users');

  await usersCollection.updateMany(
    { theme_preference: { $exists: false } },
    { $set: { theme_preference: 'dark' } } // Default to dark
  );
}
```

**Testing:**
- [ ] Toggle theme while logged in
- [ ] Refresh page - theme persists
- [ ] Log out and log back in - theme persists
- [ ] Clear localStorage - theme still loads from database
- [ ] Test with guest user - still uses localStorage

**Acceptance:**
- [ ] Logged-in users have theme saved to database
- [ ] Theme persists across devices for same user
- [ ] Guest users still use localStorage (no database write)
- [ ] Theme applies immediately on toggle (no delay)
- [ ] Migration script sets default theme for existing users

**Files:**
- `backend/src/schema.ts`
- `backend/src/resolvers.ts`
- `backend/src/migrations/add-theme-preference.ts` (new)
- `frontend/src/contexts/ThemeContext.tsx` (or wherever theme logic lives)
- `frontend/src/graphql/mutations.ts`

**Effort:** 2-3 hours

---

### Issue #P4-6: Extract Sorting from Filter Button

**Branch:** `feat/sorting-outside-filters`

**Priority:** 🟡 HIGH - UX improvement

**Problem:** Sorting controls are hidden inside filter modal/dropdown. Users expect sorting to be always visible as it's a frequently used action.

**Current State:**
```tsx
// Sorting is inside FilterControls modal
<FilterModal>
  {/* Search */}
  {/* Region filters */}
  {/* Type filters */}
  {/* Sort dropdown */} {/* ❌ Hidden in modal */}
</FilterModal>
```

**Desired State:**
```tsx
// Sorting visible outside filter button
<div className="flex gap-2 items-center">
  <SortDropdown /> {/* ✅ Always visible */}
  <FilterButton /> {/* Opens modal for region/type filters */}
</div>
```

**Solution:**

```tsx
// FilterControls.tsx - split into sorting and filtering

export function FilterControls({
  sortBy,
  onSortChange,
  onOpenFilters
}: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Sort dropdown - ALWAYS VISIBLE */}
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger
          className="w-[180px] min-h-[44px]"
          aria-label="Sort Pokemon"
        >
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="id">Sort by ID</SelectItem>
          <SelectItem value="name">Sort by Name</SelectItem>
          <SelectItem value="type">Sort by Type</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter button - opens modal for region/type */}
      <Button
        onClick={onOpenFilters}
        className="min-h-[44px] gap-2"
        aria-label="Open filter options"
      >
        <Filter className="w-5 h-5" />
        Filters
      </Button>
    </div>
  );
}

// FilterModal.tsx - only contains region and type filters
export function FilterModal({ isOpen, onClose, filters, onFilterChange }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Pokemon</DialogTitle>
        </DialogHeader>

        {/* Region filters */}
        <section>
          <h3 className="text-sm font-semibold mb-2">Region</h3>
          {/* Region checkboxes */}
        </section>

        {/* Type filters */}
        <section>
          <h3 className="text-sm font-semibold mb-2">Type</h3>
          {/* Type badges */}
        </section>

        {/* No sorting here - moved outside */}
      </DialogContent>
    </Dialog>
  );
}
```

**Layout:**
```tsx
// App.tsx or PokedexPage.tsx
<div className="flex flex-col gap-4">
  {/* Search bar */}
  <SearchBar value={search} onChange={setSearch} />

  {/* Sorting + Filters - side by side */}
  <div className="flex gap-2 items-center">
    <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
    <FilterButton onClick={() => setShowFilters(true)} />
  </div>

  {/* Active filters display */}
  {hasActiveFilters && <ActiveFilterChips filters={filters} />}

  {/* Pokemon grid */}
  <PokemonGrid pokemon={filteredPokemon} />
</div>
```

**Mobile Considerations:**
- Keep sorting visible on mobile (use `<select>` for native UI)
- Filters button opens modal (current behavior)

**Testing:**
- [ ] Sorting dropdown always visible on desktop
- [ ] Sorting works without opening filter modal
- [ ] Filter button still opens modal for region/type filters
- [ ] Mobile layout works (both controls visible)
- [ ] Keyboard accessible (Tab navigation)

**Acceptance:**
- [ ] Sort dropdown always visible (not in modal)
- [ ] Filter button only opens region/type filters
- [ ] Both controls have 44x44px minimum hit area
- [ ] Responsive design maintains visibility on mobile
- [ ] Hover states on both controls

**Files:**
- `frontend/src/features/pokedex/components/FilterControls.tsx`
- `frontend/src/features/pokedex/components/SortDropdown.tsx` (new)
- `frontend/src/features/pokedex/components/FilterModal.tsx`
- `frontend/src/App.tsx` (update layout)

**Effort:** 2-3 hours

---

### Issue #P4-7: Fix Rare Candy Integer Overflow (64-bit Support)

**Branch:** `fix/rare-candy-bigint`

**Priority:** 🟡 HIGH - Data integrity issue

**Problem:** Rare candy is stored as signed 32-bit integer (max ~2.1 billion). Top Pokemon cost more than this limit. Need to support larger numbers.

**Current Limit:**
- Signed 32-bit integer: -2,147,483,648 to 2,147,483,647
- Unsigned 32-bit integer: 0 to 4,294,967,295

**Solution Options:**

**Option 1: Use JavaScript Number (64-bit float)**
- Max safe integer: 9,007,199,254,740,991 (2^53 - 1)
- Sufficient for game currency
- No schema changes needed
- ✅ **RECOMMENDED**

**Option 2: Use BigInt**
- Unlimited size
- Requires schema changes
- More complex implementation
- Overkill for this use case

**Implementation (Option 1):**

**Backend:**
```ts
// resolvers.ts - ensure no integer casting issues
Mutation: {
  updateRareCandy: async (_, { amount }, { db, userId }) => {
    if (!userId) throw new Error('Not authenticated');

    const usersCollection = db.collection('users');

    // MongoDB stores as Double (64-bit float) by default
    // No changes needed - just ensure we don't explicitly cast to Int32
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $inc: { rare_candy: amount } }, // MongoDB handles large numbers
      { returnDocument: 'after' }
    );

    return result.value;
  }
}
```

**GraphQL Schema:**
```graphql
# schema.ts - use Float instead of Int for large numbers
type User {
  rare_candy: Float! # Change from Int! to Float!
}

type Mutation {
  updateRareCandy(amount: Float!): User!
}
```

**Frontend:**
```tsx
// Ensure no integer truncation in calculations
function calculateUpgradeCost(level: number): number {
  const cost = Math.floor(10 * Math.pow(1.5, level - 1));

  // Check if exceeds safe integer
  if (cost > Number.MAX_SAFE_INTEGER) {
    console.warn('Cost exceeds safe integer limit');
  }

  return cost;
}

// Display large numbers with formatting
function formatRareCandy(amount: number): string {
  if (amount >= 1_000_000_000_000) {
    return `${(amount / 1_000_000_000_000).toFixed(1)}T`; // Trillion
  }
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`; // Billion
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`; // Million
  }
  return amount.toLocaleString(); // Add commas
}

// Usage in UI
<p className="text-2xl font-bold">
  {formatRareCandy(user.rare_candy)} Rare Candy
</p>
```

**Testing:**
- [ ] Test with values > 2.1 billion
- [ ] Verify calculations remain accurate
- [ ] Test upgrade costs for high-level stats
- [ ] Ensure no truncation or overflow errors
- [ ] Test display formatting for large numbers

**Acceptance:**
- [ ] Rare candy can exceed 2.1 billion
- [ ] No overflow errors in calculations
- [ ] Large numbers display with readable formatting (M/B/T)
- [ ] Database stores values accurately
- [ ] Top Pokemon unlockable without hitting limit

**Files:**
- `backend/src/schema.ts` (change Int to Float)
- `backend/src/resolvers.ts` (verify no Int32 casting)
- `frontend/src/utils/formatting.ts` (add formatRareCandy)
- `frontend/src/features/clicker/components/PokeClicker.tsx`
- `frontend/src/features/profile/components/ProfileDashboard.tsx`

**Effort:** 1-2 hours

---

## 🟡 HIGH PRIORITY - Documentation & Accessibility

### Issue #P4-8: Add Comprehensive File Structure Documentation to README

**Branch:** `docs/file-structure`

**Priority:** 🟡 HIGH - Reviewer feedback

**Problem:** Project has many component files and complex structure. Difficult for reviewers/new developers to understand organization without explanation.

**Solution:**

Add detailed file structure section to README.md:

```markdown
## 📁 Project Structure

### Frontend Structure (`frontend/src/`)

```
frontend/src/
├── components/           # Shared/global components
│   ├── Navbar.tsx       # Main navigation bar
│   ├── BackgroundMusic.tsx
│   └── ui/              # Reusable UI components
│       └── pixelact-ui/ # Custom GameBoy-style component library
│           ├── button.tsx
│           ├── card.tsx
│           └── dialog.tsx
│
├── features/            # Feature-based modules
│   ├── pokedex/        # Pokemon browsing & search
│   │   ├── components/ # Pokedex-specific components
│   │   │   ├── PokemonCard.tsx
│   │   │   ├── PokemonGrid.tsx
│   │   │   ├── FilterControls.tsx
│   │   │   └── PokemonDetailModal.tsx
│   │   └── hooks/      # Pokedex-specific hooks
│   │
│   ├── clicker/        # Clicker game feature
│   │   ├── components/
│   │   │   ├── PokeClicker.tsx
│   │   │   └── UpgradesPanel.tsx
│   │   └── hooks/
│   │       └── useGameMutations.ts
│   │
│   ├── map/            # World exploration feature
│   │   ├── components/
│   │   │   ├── WorldMap.tsx
│   │   │   ├── BattleView.tsx
│   │   │   └── BattleResult.tsx
│   │   └── hooks/
│   │
│   ├── profile/        # User profile & stats
│   │   └── components/
│   │       └── ProfileDashboard.tsx
│   │
│   ├── ranks/          # Leaderboard system
│   │   └── components/
│   │       └── RanksTable.tsx
│   │
│   └── auth/           # Authentication
│       ├── components/
│       │   └── LoginScreen.tsx
│       └── contexts/
│           └── AuthContext.tsx
│
├── graphql/            # GraphQL queries & mutations
│   ├── queries.ts
│   └── mutations.ts
│
├── apollo/             # Apollo Client configuration
│   └── client.ts
│
├── hooks/              # Global custom hooks
│   ├── usePageNavigation.ts  # Custom routing system
│   └── useAuth.ts
│
├── utils/              # Utility functions
│   └── formatting.ts
│
├── data/               # Static data
│   └── mockData.ts     # Pokemon dataset
│
├── App.tsx             # Main app component & routing
└── index.css           # Global styles & CSS variables
```

### Backend Structure (`backend/src/`)

```
backend/src/
├── server.ts           # Express & Apollo Server setup
├── schema.ts           # GraphQL type definitions
├── resolvers.ts        # GraphQL resolvers (business logic)
├── initSchema.ts       # Database initialization & indexes
└── db.ts               # MongoDB connection
```

### Component Organization Philosophy

**Feature-Based Structure:**
- Each major feature (Pokedex, Clicker, Map, Profile, Ranks) has its own folder
- Components are colocated with the feature they belong to
- Shared components live in `components/`

**Component Types:**
- **Page Components**: Top-level feature entry points (e.g., `PokeClicker.tsx`)
- **Container Components**: Handle data fetching and state (e.g., `PokemonGrid.tsx`)
- **Presentational Components**: Pure UI components (e.g., `PokemonCard.tsx`)
- **UI Components**: Reusable design system components (`components/ui/`)

**Why This Structure?**
- **Scalability**: Easy to add new features without affecting existing code
- **Maintainability**: Related code stays together
- **Discoverability**: Clear where to find specific functionality
- **Reusability**: Shared components in `components/`, feature-specific in feature folders

### Key Files Explained

**Frontend:**
- `App.tsx`: Main routing logic (custom routing instead of react-router)
- `usePageNavigation.ts`: Custom hook for single-page navigation
- `AuthContext.tsx`: Global authentication state
- `mockData.ts`: Pokemon dataset (151 Kanto Pokemon)
- `pixelact-ui/`: Custom component library for GameBoy aesthetic

**Backend:**
- `schema.ts`: GraphQL schema definitions (types, queries, mutations)
- `resolvers.ts`: Business logic for all GraphQL operations
- `initSchema.ts`: Database indexes and schema setup

### Routing System

We use a **custom routing system** (`usePageNavigation`) instead of react-router:
- Simpler state management
- No URL changes (SPA behavior)
- Full control over navigation
- Trade-off: No deep linking or browser back/forward

**Why custom routing?**
- Game-like experience (no URL bar changes)
- Simpler state management
- No need for deep linking in a clicker game

**When to use react-router instead?**
- If you need shareable URLs (e.g., `/pokemon/25`)
- If browser back/forward buttons are important
- If SEO is a concern
```

**Additional Sections:**
- Architecture diagram (optional)
- Data flow diagram
- Component hierarchy

**Testing:**
- [ ] New developer can find files quickly using documentation
- [ ] Structure explanation is clear and concise
- [ ] Diagrams (if added) are accurate

**Acceptance:**
- [ ] File structure section added to README
- [ ] Explains feature-based organization
- [ ] Documents component types and responsibilities
- [ ] Explains custom routing decision
- [ ] Includes directory tree visualization

**Files:**
- `README.md`

**Effort:** 2-3 hours

---

### Issue #P4-9: Add Table of Contents to README

**Branch:** `docs/readme-toc`

**Priority:** 🟡 HIGH - Reviewer feedback

**Problem:** README is comprehensive but very long. Needs table of contents for easy navigation.

**Solution:**

Add table of contents at top of README.md:

```markdown
# PokeClicker - Pokemon Clicker Game & Pokedex

[Brief project description]

## 📚 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
  - [Frontend Structure](#frontend-structure)
  - [Backend Structure](#backend-structure)
  - [Component Organization](#component-organization)
- [Development](#development)
  - [Available Scripts](#available-scripts)
  - [Code Style](#code-style)
  - [Testing](#testing)
- [Architecture](#architecture)
  - [State Management](#state-management)
  - [Routing System](#routing-system)
  - [Data Flow](#data-flow)
- [Features Deep Dive](#features-deep-dive)
  - [Pokedex Browser](#pokedex-browser)
  - [Clicker Game](#clicker-game)
  - [World Map & Battles](#world-map-battles)
  - [Profile & Stats](#profile-stats)
  - [Leaderboard System](#leaderboard-system)
- [Accessibility](#accessibility)
- [Sustainability](#sustainability)
- [API Documentation](#api-documentation)
  - [GraphQL Schema](#graphql-schema)
  - [Queries](#queries)
  - [Mutations](#mutations)
- [Deployment](#deployment)
- [Changelog](#changelog)
  - [Sprint 1](#sprint-1)
  - [Sprint 2](#sprint-2)
  - [Sprint 3](#sprint-3)
- [Contributing](#contributing)
- [License](#license)

---

[Rest of README content with proper heading anchors]
```

**Implementation:**
- Use GitHub-compatible markdown anchor links
- Ensure all headings have proper IDs
- Test links work correctly on GitHub
- Add emoji for visual navigation aid

**Testing:**
- [ ] All TOC links work correctly
- [ ] Links jump to correct section
- [ ] Works on GitHub (not just local markdown viewer)

**Acceptance:**
- [ ] Table of contents at top of README
- [ ] All major sections linked
- [ ] Links functional on GitHub
- [ ] Nested structure for subsections

**Files:**
- `README.md`

**Effort:** 30 minutes

---

### Issue #P4-10: Improve Code Documentation (JSDoc Comments)

**Branch:** `docs/code-documentation`

**Priority:** 🟡 HIGH - Reviewer feedback

**Problem:** Code lacks documentation comments, making it harder to understand for new developers and reviewers.

**Solution:**

Add JSDoc comments to:
1. All exported functions
2. Complex logic
3. Custom hooks
4. GraphQL resolvers
5. Utility functions

**Examples:**

```tsx
// Frontend - Component documentation
/**
 * PokemonCard displays a single Pokemon with image, name, types, and unlock button.
 *
 * @param pokemon - Pokemon data to display
 * @param isUnlocked - Whether user owns this Pokemon
 * @param onUnlock - Callback when unlock button is clicked
 * @param onClick - Callback when card is clicked (opens detail modal)
 *
 * @example
 * <PokemonCard
 *   pokemon={pikachu}
 *   isUnlocked={true}
 *   onUnlock={handleUnlock}
 *   onClick={handleCardClick}
 * />
 */
export function PokemonCard({ pokemon, isUnlocked, onUnlock, onClick }: Props) {
  // ...
}

// Custom hook documentation
/**
 * useGameMutations provides mutations for clicker game actions.
 * Handles stat upgrades and rare candy updates with Apollo cache management.
 *
 * @returns Object containing mutation functions and loading states
 *
 * @example
 * const { upgradeStat, updateRareCandy, loading } = useGameMutations();
 *
 * await upgradeStat({ statName: 'clickPower' });
 */
export function useGameMutations() {
  // ...
}

// Utility function documentation
/**
 * Formats large numbers with suffixes (K, M, B, T).
 *
 * @param value - The number to format
 * @returns Formatted string with appropriate suffix
 *
 * @example
 * formatNumber(1500) // "1.5K"
 * formatNumber(2500000) // "2.5M"
 * formatNumber(1000000000) // "1.0B"
 */
export function formatNumber(value: number): string {
  // ...
}
```

```ts
// Backend - Resolver documentation
/**
 * Fetches paginated and filtered Pokemon data.
 * Supports searching by name, filtering by generation and type, and sorting.
 *
 * @param args.search - Optional search term (matches Pokemon name)
 * @param args.generation - Optional generation filter (kanto, johto, hoenn)
 * @param args.type - Optional type filter (fire, water, grass, etc.)
 * @param args.limit - Number of results per page (default: 20)
 * @param args.offset - Pagination offset (default: 0)
 * @param args.sortBy - Sort field (id, name, type)
 *
 * @returns Object with pokemon array and total count
 *
 * @example
 * // GraphQL query:
 * query {
 *   pokemon(search: "pika", generation: "kanto", limit: 10) {
 *     pokemon { id name types }
 *     total
 *   }
 * }
 */
async pokemon(_: any, args: PokemonQueryArgs, { db }: Context) {
  // ...
}

/**
 * Upgrades a user's stat by one level.
 * Deducts rare candy based on exponential cost formula: 10 * 1.5^(level - 1).
 *
 * @param args.statName - Name of stat to upgrade (clickPower, passiveIncome, etc.)
 * @throws Error if user not authenticated
 * @throws Error if insufficient rare candy
 *
 * @returns Updated user object with new stat values and candy balance
 */
async upgradeStat(_: any, { statName }: UpgradeStatArgs, { db, userId }: Context) {
  // ...
}
```

**Priority Files to Document:**

**High Priority:**
1. `resolvers.ts` - All queries and mutations
2. `useGameMutations.ts` - Custom hooks
3. `usePageNavigation.ts` - Custom routing
4. `PokemonCard.tsx` - Core component
5. `PokeClicker.tsx` - Game logic
6. `formatting.ts` - Utility functions

**Medium Priority:**
7. `FilterControls.tsx`
8. `PokemonGrid.tsx`
9. `BattleView.tsx`
10. `AuthContext.tsx`

**Documentation Standards:**
- Use JSDoc format (`/** */`)
- Include `@param` for parameters
- Include `@returns` for return values
- Include `@throws` for errors
- Include `@example` for complex functions
- Explain "why" not just "what"

**Testing:**
- [ ] TypeScript IntelliSense shows documentation
- [ ] VSCode hover shows function descriptions
- [ ] Examples are accurate and helpful

**Acceptance:**
- [ ] All exported functions documented
- [ ] All GraphQL resolvers documented
- [ ] All custom hooks documented
- [ ] Complex logic explained with comments
- [ ] JSDoc format used consistently

**Files:**
- `backend/src/resolvers.ts`
- `frontend/src/features/clicker/hooks/useGameMutations.ts`
- `frontend/src/hooks/usePageNavigation.ts`
- `frontend/src/features/pokedex/components/PokemonCard.tsx`
- `frontend/src/features/clicker/components/PokeClicker.tsx`
- `frontend/src/utils/formatting.ts`
- (and other key files)

**Effort:** 4-5 hours

---

### Issue #P4-11: Set Dark Mode as Default Theme

**Branch:** `feat/dark-mode-default`

**Priority:** 🟢 MEDIUM - UX improvement

**Problem:** Users prefer dark mode by default. Current default is light mode.

**Solution:**

```tsx
// ThemeProvider.tsx or App.tsx
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');

    // Default to dark if no preference saved
    return savedTheme || 'dark'; // ✅ Changed from 'light' to 'dark'
  });

  // ...rest of theme provider
}
```

**Testing:**
- [ ] First-time visitors see dark mode
- [ ] Theme preference still saved and respected
- [ ] Toggle still works correctly

**Acceptance:**
- [ ] Dark mode is default for new users
- [ ] Existing user preferences unchanged
- [ ] Toggle between light/dark still works

**Files:**
- `frontend/src/contexts/ThemeContext.tsx` (or wherever theme logic lives)

**Effort:** 15 minutes

---

### Issue #P4-12: Clarify Dark Mode Energy Savings Claim

**Branch:** `docs/dark-mode-sustainability`

**Priority:** 🟢 MEDIUM - Documentation accuracy

**Problem:** README claims "60% energy reduction" for dark mode. This is context-dependent (OLED screens, brightness settings). Should clarify the claim.

**Solution:**

Update sustainability section in README:

```markdown
## ♻️ Sustainability

### Energy Efficiency

**Dark Mode:**
- Dark mode can reduce energy consumption on **OLED and AMOLED displays** by up to 60% (source: Google Android study on dark theme).
- Energy savings depend on:
  - Display technology (OLED: high savings, LCD: minimal savings)
  - Screen brightness settings
  - Ratio of dark pixels on screen
- Our dark mode uses dark backgrounds with light text, maximizing dark pixel coverage.
- Users can toggle between light and dark mode based on preference.

**Reference:**
Google Android's dark theme implementation showed 60% power savings on OLED displays at 100% brightness when displaying dark content. ([Google I/O 2019](https://www.youtube.com/watch?v=N_6sPd0Jd3g))

**Other Efficiency Measures:**
- Lazy loading for Pokemon images
- Debounced search (reduces unnecessary API calls)
- Efficient MongoDB indexes for fast queries
- Sprite-based graphics (smaller file sizes than high-res images)
- Code splitting (future improvement)
```

**Acceptance:**
- [ ] Dark mode claim clarified with context
- [ ] Source cited (Google Android study)
- [ ] Explains when savings apply (OLED vs LCD)
- [ ] Mentions other efficiency measures

**Files:**
- `README.md`

**Effort:** 30 minutes

---

## 🔴 CRITICAL - Accessibility Compliance (WCAG AA)

### Issue #P4-13: Fix Color Contrast Issues (WCAG AA 4.5:1)

**Branch:** `fix/color-contrast-wcag`

**Priority:** 🔴 CRITICAL - WCAG AA compliance

**Problem:** Several color combinations fail WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).

**Identified Issues:**
1. GameBoy screen: Light gray text on olive/green background
2. Type badges: Some type colors have poor contrast
3. Button text on certain backgrounds
4. Muted text colors

**Testing Tools:**
- Chrome DevTools Lighthouse
- WebAIM Contrast Checker
- axe DevTools

**Solution:**

**1. Update CSS Variables for Better Contrast:**

```css
/* index.css or globals.css */
:root {
  /* Original colors for reference */
  --gameboy-screen: #9bbc0f; /* Olive green */
  --gameboy-screen-dark: #8bac0f;

  /* Improved text colors for GameBoy screen */
  --gameboy-text: #0f380f; /* Dark green - better contrast */
  --gameboy-text-secondary: #1f4d1f; /* Medium dark green */
}

/* Dark mode improvements */
.dark {
  --muted-foreground: #a0a0a0; /* Lightened from #808080 for better contrast */
  --foreground: #f0f0f0; /* Ensure high contrast on dark backgrounds */
}

/* GameBoy screen text - ensure WCAG AA compliance */
.gameboy-screen {
  background-color: var(--gameboy-screen);
  color: var(--gameboy-text); /* Dark green text on olive background */
}

/* Check contrast ratio:
 * #0f380f (text) on #9bbc0f (background) = 6.2:1 ✅ Passes WCAG AA
 */
```

**2. Fix Type Badge Contrasts:**

```tsx
// PokemonCard.tsx or types.css
const TYPE_COLORS = {
  fire: { bg: '#EE8130', text: '#000000' },      // Black text for better contrast
  water: { bg: '#6390F0', text: '#FFFFFF' },     // White text OK
  grass: { bg: '#7AC74C', text: '#000000' },     // Black text
  electric: { bg: '#F7D02C', text: '#000000' },  // Black text
  psychic: { bg: '#F95587', text: '#FFFFFF' },   // White text OK
  ice: { bg: '#96D9D6', text: '#000000' },       // Black text
  dragon: { bg: '#6F35FC', text: '#FFFFFF' },    // White text OK
  dark: { bg: '#705746', text: '#FFFFFF' },      // White text OK
  fairy: { bg: '#D685AD', text: '#000000' },     // Black text
  normal: { bg: '#A8A77A', text: '#000000' },    // Black text
  fighting: { bg: '#C22E28', text: '#FFFFFF' },  // White text OK
  flying: { bg: '#A98FF3', text: '#000000' },    // Black text
  poison: { bg: '#A33EA1', text: '#FFFFFF' },    // White text OK
  ground: { bg: '#E2BF65', text: '#000000' },    // Black text
  rock: { bg: '#B6A136', text: '#000000' },      // Black text
  bug: { bg: '#A6B91A', text: '#000000' },       // Black text
  ghost: { bg: '#735797', text: '#FFFFFF' },     // White text OK
  steel: { bg: '#B7B7CE', text: '#000000' },     // Black text
};

// Apply in component
<Badge
  style={{
    backgroundColor: TYPE_COLORS[type].bg,
    color: TYPE_COLORS[type].text,
  }}
>
  {type}
</Badge>
```

**3. Test All Combinations:**

Create contrast testing script:

```ts
// scripts/test-contrast.ts
import { WCAG21 } from 'wcag-color';

const colorCombinations = [
  { bg: '#9bbc0f', fg: '#0f380f', name: 'GameBoy screen' },
  { bg: '#EE8130', fg: '#000000', name: 'Fire type badge' },
  // ... all type combinations
];

colorCombinations.forEach(({ bg, fg, name }) => {
  const ratio = WCAG21.calculateContrastRatio(fg, bg);
  const passesAA = ratio >= 4.5;
  console.log(`${name}: ${ratio.toFixed(2)}:1 ${passesAA ? '✅' : '❌'}`);
});
```

**Testing:**
- [ ] Run Lighthouse accessibility audit
- [ ] Use axe DevTools to scan all pages
- [ ] Test with WebAIM Contrast Checker
- [ ] Verify all text meets 4.5:1 contrast ratio
- [ ] Test in both light and dark modes

**Acceptance:**
- [ ] All text has minimum 4.5:1 contrast ratio (WCAG AA)
- [ ] Large text (18pt+) has minimum 3:1 contrast ratio
- [ ] Type badges all pass contrast requirements
- [ ] GameBoy screen text readable
- [ ] No Lighthouse contrast warnings

**Files:**
- `frontend/src/index.css` (CSS variables)
- `frontend/src/features/pokedex/components/PokemonCard.tsx` (type badges)
- `frontend/src/components/ui/pixelact-ui/button.css`
- `scripts/test-contrast.ts` (new - testing script)

**Effort:** 3-4 hours

---

### Issue #P4-14: Implement Semantic HTML Structure

**Branch:** `fix/semantic-html-landmarks`

**Priority:** 🔴 CRITICAL - WCAG compliance

**Problem:** App uses many `<div>` elements without semantic HTML. Screen readers cannot navigate effectively without landmarks and proper structure.

**Current Issues:**
- No semantic landmarks (`<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`)
- Missing heading hierarchy
- Clickable divs instead of buttons
- No `<section>` or `<article>` elements

**Solution:**

**1. Add Semantic Landmarks:**

```tsx
// App.tsx - add semantic structure
export function App() {
  return (
    <div className="app">
      {/* Header with navigation */}
      <header>
        <Navbar onPageChange={handlePageChange} currentPage={currentPage} />
      </header>

      {/* Main content area */}
      <main id="main-content" role="main" aria-label="Main content">
        {currentPage === 'pokedex' && (
          <section aria-labelledby="pokedex-heading">
            <h1 id="pokedex-heading" className="sr-only">Pokedex</h1>
            <PokedexPage />
          </section>
        )}

        {currentPage === 'clicker' && (
          <section aria-labelledby="clicker-heading">
            <h1 id="clicker-heading" className="sr-only">Clicker Game</h1>
            <PokeClicker />
          </section>
        )}

        {currentPage === 'map' && (
          <section aria-labelledby="map-heading">
            <h1 id="map-heading" className="sr-only">World Map</h1>
            <WorldMap />
          </section>
        )}

        {currentPage === 'profile' && (
          <section aria-labelledby="profile-heading">
            <h1 id="profile-heading" className="sr-only">Profile</h1>
            <ProfileDashboard />
          </section>
        )}
      </main>

      {/* Aside for music player */}
      <aside aria-label="Music player">
        <BackgroundMusic />
      </aside>
    </div>
  );
}
```

**2. Fix Heading Hierarchy:**

```tsx
// Ensure proper heading order: h1 → h2 → h3 (no skipping)

// PokedexPage.tsx
<section>
  <h1 className="sr-only">Pokedex</h1> {/* h1 for page */}

  <div className="filters">
    <h2 className="sr-only">Search and Filters</h2> {/* h2 for section */}
    <SearchBar />
    <FilterControls />
  </div>

  <div className="pokemon-grid">
    <h2 className="sr-only">Pokemon List</h2> {/* h2 for section */}
    <PokemonGrid />
  </div>
</section>

// PokeClicker.tsx
<section>
  <h1 className="sr-only">Clicker Game</h1>

  <div className="game-area">
    <h2 className="pixel-font">Click to Earn Rare Candy!</h2>
    {/* Game content */}
  </div>

  <div className="upgrades">
    <h2 className="pixel-font">Trainer Upgrades</h2>
    {/* Upgrade buttons */}
  </div>
</section>
```

**3. Replace Clickable Divs with Buttons:**

```tsx
// BEFORE (incorrect):
<div onClick={handleClick} className="clickable">
  Click me
</div>

// AFTER (correct):
<button onClick={handleClick} type="button">
  Click me
</button>
```

**4. Use Appropriate Elements:**

```tsx
// Navigation - use <nav>
<nav aria-label="Main navigation">
  <ul className="flex gap-4">
    <li>
      <button onClick={() => onPageChange('pokedex')}>Pokedex</button>
    </li>
    <li>
      <button onClick={() => onPageChange('clicker')}>Clicker</button>
    </li>
  </ul>
</nav>

// Lists - use <ul> and <li>
<ul className="pokemon-grid">
  {pokemon.map((p) => (
    <li key={p.id}>
      <PokemonCard pokemon={p} />
    </li>
  ))}
</ul>

// Forms - use <form> and <label>
<form onSubmit={handleSearch} role="search">
  <label htmlFor="pokemon-search" className="sr-only">
    Search Pokemon
  </label>
  <input
    id="pokemon-search"
    type="search"
    placeholder="Search Pokemon..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</form>
```

**5. Add Skip Link:**

```tsx
// App.tsx - add skip to main content link
<a href="#main-content" className="sr-only focus:not-sr-only skip-link">
  Skip to main content
</a>

/* index.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.skip-link:focus {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  background: var(--background);
  color: var(--foreground);
  padding: 1rem;
  text-decoration: none;
}
```

**Testing:**
- [ ] Use screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Navigate with keyboard only
- [ ] Test "skip to main content" link
- [ ] Verify heading hierarchy (browser extension: HeadingsMap)
- [ ] Run axe DevTools semantic HTML audit
- [ ] Check landmark navigation works

**Acceptance:**
- [ ] All pages have semantic landmarks
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] No clickable divs (all use `<button>`)
- [ ] Navigation uses `<nav>` element
- [ ] Lists use `<ul>` and `<li>`
- [ ] Skip link present and functional
- [ ] Screen reader can navigate by landmarks

**Files:**
- `frontend/src/App.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/features/pokedex/pages/PokedexPage.tsx`
- `frontend/src/features/clicker/components/PokeClicker.tsx`
- `frontend/src/features/map/pages/WorldMapPage.tsx`
- `frontend/src/features/profile/pages/ProfilePage.tsx`
- `frontend/src/index.css` (skip link styles)

**Effort:** 4-5 hours

---

### Issue #P4-15: Add ARIA Labels and Improve Screen Reader Experience

**Branch:** `fix/aria-labels-screen-reader`

**Priority:** 🔴 CRITICAL - WCAG compliance

**Problem:** Controls lack accessible names, decorative elements create noise for screen readers, and focus management is missing.

**Identified Issues:**
1. Start/Select/A/B buttons (GameBoy controls) - no accessible names
2. Filter controls - missing labels
3. Decorative images exposed to screen readers
4. Modals lack focus trapping
5. Form inputs without associated labels

**Solution:**

**1. Add ARIA Labels to Controls:**

```tsx
// GameBoy controls (if applicable)
<button
  aria-label="A button - Select Pokemon"
  onClick={handleAButton}
>
  A
</button>

<button
  aria-label="B button - Go back"
  onClick={handleBButton}
>
  B
</button>

<button
  aria-label="Start game"
  onClick={handleStart}
>
  Start
</button>

<button
  aria-label="Open menu"
  onClick={handleSelect}
>
  Select
</button>

// Filter button
<Button
  onClick={toggleFilters}
  aria-label="Open filter options"
  aria-expanded={isFilterOpen}
  aria-controls="filter-panel"
>
  <Filter className="w-5 h-5" aria-hidden="true" />
  Filters
</Button>

// Sort dropdown
<Select
  value={sortBy}
  onValueChange={onSortChange}
  aria-label="Sort Pokemon by"
>
  <SelectTrigger>
    <SelectValue placeholder="Sort by..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="id">ID</SelectItem>
    <SelectItem value="name">Name</SelectItem>
  </SelectContent>
</Select>

// Theme toggle
<button
  onClick={toggleTheme}
  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
  aria-pressed={theme === 'dark'}
>
  {theme === 'dark' ? '🌙' : '☀️'}
</button>
```

**2. Hide Decorative Elements:**

```tsx
// Decorative images
<img
  src={pokemon.sprite}
  alt="" // Empty alt for decorative (name is shown in text)
  aria-hidden="true"
  role="presentation"
/>

// Or if image is meaningful:
<img
  src={pokemon.sprite}
  alt={`${pokemon.name} sprite`}
/>

// Decorative icons
<Filter className="w-5 h-5" aria-hidden="true" />
<Search className="w-4 h-4" aria-hidden="true" />

// Background decorations
<div className="gameboy-border" aria-hidden="true" role="presentation">
  {/* decorative content */}
</div>
```

**3. Implement Focus Trapping in Modals:**

```tsx
// PokemonDetailModal.tsx
import { Dialog } from '@radix-ui/react-dialog';
import { useEffect, useRef } from 'react';

export function PokemonDetailModal({ isOpen, onClose, pokemon }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-labelledby="pokemon-modal-title"
        aria-describedby="pokemon-modal-description"
      >
        <DialogHeader>
          <DialogTitle id="pokemon-modal-title">
            {pokemon.name}
          </DialogTitle>
          <DialogDescription id="pokemon-modal-description">
            Pokemon details and information
          </DialogDescription>
        </DialogHeader>

        {/* Modal content */}

        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close modal"
        >
          Close
        </button>
      </DialogContent>
    </Dialog>
  );
}
```

**4. Add Labels to Form Inputs:**

```tsx
// SearchBar.tsx
<div className="search-container">
  <label htmlFor="pokemon-search" className="sr-only">
    Search Pokemon by name
  </label>
  <input
    id="pokemon-search"
    type="search"
    placeholder="Search Pokemon..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    aria-label="Search Pokemon by name"
  />
</div>

// LoginScreen.tsx
<form onSubmit={handleLogin}>
  <div>
    <label htmlFor="username">Username</label>
    <input
      id="username"
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
      aria-required="true"
    />
  </div>

  <div>
    <label htmlFor="password">Password</label>
    <input
      id="password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      aria-required="true"
    />
  </div>

  <button type="submit">Login</button>
</form>
```

**5. Add Live Regions for Dynamic Updates:**

```tsx
// PokemonGrid.tsx - announce search results
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isLoading ? 'Loading Pokemon...' : `Found ${pokemon.length} Pokemon`}
</div>

// PokeClicker.tsx - announce candy earned
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {lastEarned > 0 && `Earned ${lastEarned} rare candy`}
</div>

// BattleView.tsx - announce battle result
<div aria-live="assertive" aria-atomic="true" className="sr-only">
  {battleResult === 'win' && 'Victory! You won the battle.'}
  {battleResult === 'lose' && 'Defeated! You lost the battle.'}
</div>
```

**6. Add Navigation Announcements:**

```tsx
// App.tsx - announce page changes
<div aria-live="polite" className="sr-only">
  {currentPage === 'pokedex' && 'Navigated to Pokedex'}
  {currentPage === 'clicker' && 'Navigated to Clicker Game'}
  {currentPage === 'map' && 'Navigated to World Map'}
  {currentPage === 'profile' && 'Navigated to Profile'}
</div>
```

**Testing:**
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify all controls have accessible names
- [ ] Verify decorative elements hidden from screen readers
- [ ] Test modal focus management
- [ ] Verify live regions announce updates
- [ ] Run axe DevTools ARIA audit

**Acceptance:**
- [ ] All interactive elements have accessible names
- [ ] All form inputs have associated labels
- [ ] Decorative elements hidden with aria-hidden="true"
- [ ] Modals trap focus and restore on close
- [ ] Dynamic updates announced via live regions
- [ ] No axe DevTools ARIA violations

**Files:**
- `frontend/src/features/pokedex/components/FilterControls.tsx`
- `frontend/src/features/pokedex/components/SearchBar.tsx`
- `frontend/src/features/pokedex/components/PokemonCard.tsx`
- `frontend/src/features/pokedex/components/PokemonDetailModal.tsx`
- `frontend/src/features/clicker/components/PokeClicker.tsx`
- `frontend/src/features/map/components/BattleView.tsx`
- `frontend/src/features/auth/components/LoginScreen.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/App.tsx`

**Effort:** 5-6 hours

---

## 🟢 NICE TO HAVE - Future Improvements

### Issue #P4-16: Evaluate React Router Implementation

**Branch:** `evaluate/react-router`

**Priority:** 🟢 LOW - Architecture consideration

**Problem:** App uses custom routing (`usePageNavigation`) instead of react-router. This prevents deep linking and browser back/forward navigation.

**Current Approach:**
- Custom routing via state management
- No URL changes
- Simpler implementation
- ✅ Good for: Game-like experience, full control

**React Router Approach:**
- URL-based routing
- Deep linking support
- Browser back/forward buttons work
- ✅ Good for: Shareable links, SEO, navigation UX

**Decision Criteria:**

**Keep Custom Routing If:**
- App is primarily a game (not content-heavy)
- No need for shareable Pokemon URLs
- No SEO requirements
- Simpler state management preferred

**Switch to React Router If:**
- Want to share specific Pokemon URLs (e.g., `/pokemon/25`)
- Want browser back/forward to work
- Future plans for SEO
- Need URL parameters for filters/search

**Recommendation:**
For a clicker game/Pokedex, **custom routing is acceptable**. Consider react-router only if:
1. Users request shareable Pokemon links
2. SEO becomes important
3. Browser navigation is frequently requested

**Action:**
- Document decision in README
- Add to "Future Improvements" section
- No immediate changes needed

**Files:**
- `README.md` (document decision)

**Effort:** 1 hour (documentation only)

---

### Issue #P4-17: Fix npm install Warning

**Branch:** `fix/npm-install-warning`

**Priority:** 🟢 LOW - Developer experience

**Problem:** npm install shows warnings (need to identify specific warning).

**Investigation:**
```bash
# Run to see warnings
npm install

# Common causes:
# - Deprecated dependencies
# - Peer dependency conflicts
# - Missing dependency versions
```

**Common Solutions:**

**1. Deprecated Dependencies:**
```bash
# Check for outdated packages
npm outdated

# Update deprecated packages
npm update
```

**2. Peer Dependency Warnings:**
```json
// package.json - ensure peer dependencies are correct
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

**3. Lock File Issues:**
```bash
# Regenerate lock file
rm package-lock.json
npm install
```

**Acceptance:**
- [ ] npm install runs without warnings
- [ ] All dependencies up to date
- [ ] No security vulnerabilities

**Files:**
- `frontend/package.json`
- `backend/package.json`

**Effort:** 1 hour

---

## Sprint Planning

### Priority 1: Critical Fixes (Week 1, 20-25 hours)
**Must complete before final submission**

- **P4-1:** Touch target sizes (3h)
- **P4-2:** Hover states (2h)
- **P4-3:** 500 error investigation (4h)
- **P4-4:** Favorite Pokemon fix (3h)
- **P4-5:** Dark mode persistence (3h)
- **P4-6:** Sorting outside filters (3h)
- **P4-13:** Color contrast fixes (4h)

**Total:** ~22 hours

### Priority 2: Accessibility & Documentation (Week 2, 15-20 hours)
**Important for final evaluation**

- **P4-8:** File structure docs (3h)
- **P4-9:** README table of contents (0.5h)
- **P4-14:** Semantic HTML (5h)
- **P4-15:** ARIA labels (6h)
- **P4-10:** Code documentation (5h)

**Total:** ~19.5 hours

### Priority 3: Nice to Have (If time permits, 3-5 hours)

- **P4-7:** Rare candy BigInt (2h)
- **P4-11:** Dark mode default (0.25h)
- **P4-12:** Dark mode claim clarification (0.5h)
- **P4-17:** npm warning fix (1h)
- **P4-16:** React router evaluation (1h - docs only)

**Total:** ~4.75 hours

---

## Success Criteria

### Functional Requirements
- [ ] All interactive elements have 44x44px hit areas
- [ ] Hover states on all clickable elements
- [ ] No 500 errors in Pokedex
- [ ] Favorite Pokemon selection works
- [ ] Dark mode persists for logged-in users
- [ ] Sorting visible outside filter button

### Accessibility (WCAG AA)
- [ ] All color contrasts meet 4.5:1 ratio
- [ ] Semantic HTML structure throughout
- [ ] All controls have accessible names
- [ ] Screen reader can navigate effectively
- [ ] Keyboard navigation works completely
- [ ] Lighthouse accessibility score 90+

### Documentation
- [ ] File structure explained in README
- [ ] Table of contents for easy navigation
- [ ] Key functions documented with JSDoc
- [ ] Architecture decisions documented

### Polish
- [ ] Dark mode as default
- [ ] Dark mode energy claim clarified
- [ ] No npm install warnings
- [ ] Code is well-documented

---

## Notes

**Testing Priority:**
1. Run Lighthouse audit on all pages
2. Use axe DevTools for accessibility scan
3. Test with actual screen reader (NVDA/JAWS/VoiceOver)
4. Manual keyboard navigation test
5. Mobile device testing (touch targets)

**Tools Needed:**
- Chrome DevTools Lighthouse
- axe DevTools browser extension
- WebAIM Contrast Checker
- HeadingsMap browser extension
- Screen reader (NVDA - free, JAWS - trial, VoiceOver - macOS built-in)

**Documentation:**
- Update README with all changes
- Update CHANGELOG.md
- Create accessibility statement
- Document known issues/limitations

**Total Estimated Effort:** 40-50 hours
- **Critical (P1):** 22 hours
- **Important (P2):** 19.5 hours
- **Nice to have (P3):** 4.75 hours
- **Buffer for testing/bugs:** 5 hours
