
### Issue #P4-7: Fix Pokemon Cost Formula and Game Balance

**Branch:** `fix/game-balance-pokemon-costs`

**Priority:** 🔴 CRITICAL - Game breaking bug

**Problem:** Current Pokemon cost formula `100 × 2^tier` grows exponentially and exceeds JavaScript's max safe integer (9,007,199,254,740,991). Pokemon #1025 would cost **507 octillion** rare candies, which is impossible to represent or achieve.

**Current Issues:**
- Formula: `100 × 2^tier` where `tier = floor(pokemonId / 10)`
- Max Pokemon ID: 1025 (tier 102)
- Cost at tier 102: 507,060,240,091,291,760,000,000,000,000,000 (507 octillion)
- Max safe integer: 9,007,199,254,740,991
- **Cost exceeds max safe integer by 56 trillion times** ❌

**Analysis:**
```ts
// Current formula in resolvers.ts
function getPokemonCost(pokemonId: number): number {
  const tier = Math.floor(pokemonId / 10);
  return Math.floor(100 * Math.pow(2, tier));
}

// JavaScript can only safely handle up to tier 46:
// Tier 46 = Pokemon ID ~469
// We have 1025 Pokemon total
```

**Solution: Rebalance with Polynomial Growth**

Replace exponential formula with polynomial formula that stays within safe integer range:

```ts
// resolvers.ts - NEW balanced formula
function getPokemonCost(pokemonId: number): number {
  // Polynomial growth: 100 × (pokemonId^1.5)
  // This provides smooth progression while staying in safe range

  const baseCost = 100;
  const cost = Math.floor(baseCost * Math.pow(pokemonId, 1.5));

  // Verify we stay within safe integer range
  if (cost > Number.MAX_SAFE_INTEGER) {
    console.error(`Pokemon ${pokemonId} cost exceeds safe integer!`);
    return Number.MAX_SAFE_INTEGER;
  }

  return cost;
}

// Example costs:
// Pokemon #1: 100 rare candies
// Pokemon #10: 3,162 rare candies
// Pokemon #100: 100,000 rare candies
// Pokemon #500: 11,180,339 rare candies (~11M)
// Pokemon #1025: 32,819,513 rare candies (~33M)
// All within max safe integer: 9,007,199,254,740,991 ✅
```

**Alternative Formula Options:**

**Option 1: Polynomial (pokemonId^1.5)** ✅ **RECOMMENDED**
- Smooth progression
- Max cost ~33M for Pokemon #1025
- Easy to understand
- Stays well within safe integer range

**Option 2: Logarithmic with multiplier**
```ts
const cost = Math.floor(100 * pokemonId * Math.log10(pokemonId + 1));
// Pokemon #1025: ~309,000 rare candies
// Might be too cheap for late-game
```

**Option 3: Capped exponential**
```ts
const tier = Math.min(Math.floor(pokemonId / 10), 46); // Cap at tier 46
const cost = Math.floor(100 * Math.pow(2, tier));
// Creates a "plateau" where Pokemon 470-1025 all cost the same
// Not ideal for progression
```

**Testing the New Formula:**

```ts
// Add to backend tests or seed script
function testPokemonCosts() {
  const testIds = [1, 10, 50, 100, 250, 500, 750, 1000, 1025];

  console.log('Pokemon Cost Analysis (new formula):');
  console.log('ID\tCost\t\tFormatted');
  console.log('─'.repeat(50));

  testIds.forEach(id => {
    const cost = getPokemonCost(id);
    const formatted = cost >= 1_000_000
      ? `${(cost / 1_000_000).toFixed(1)}M`
      : cost.toLocaleString();

    console.log(`${id}\t${cost}\t${formatted}`);
  });

  console.log('\nMax safe integer:', Number.MAX_SAFE_INTEGER.toLocaleString());
}
```

**Frontend Display:**

```tsx
// utils/formatting.ts - format large numbers
export function formatRareCandy(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toLocaleString();
}

// Usage
<p>Cost: {formatRareCandy(pokemon.cost)} Rare Candy</p>
```

**Game Balance Considerations:**
- Early game (Pokemon 1-50): Affordable for new players
- Mid game (Pokemon 51-250): Requires some grinding
- Late game (Pokemon 251-500): Significant investment
- End game (Pokemon 501-1025): Major achievement

**Migration:**
If users already purchased Pokemon with old costs, no migration needed - they keep their Pokemon. New purchases use the new formula.

**Testing:**
- [ ] Verify all Pokemon costs stay under max safe integer
- [ ] Test purchasing Pokemon #1, #500, #1025
- [ ] Verify no NaN or Infinity values
- [ ] Test cost display formatting
- [ ] Ensure progression feels balanced

**Acceptance:**
- [ ] New formula implemented in `getPokemonCost()`
- [ ] All Pokemon costs < max safe integer
- [ ] Pokemon #1025 is purchasable
- [ ] Cost progression feels balanced
- [ ] Large numbers display with K/M/B formatting

**Files:**
- `backend/src/resolvers.ts` (update `getPokemonCost()`)
- `frontend/src/utils/formatting.ts` (add `formatRareCandy()`)
- `frontend/src/features/pokedex/components/PokemonCard.tsx` (use formatter)

**Effort:** 2-3 hours (includes testing balance)

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
