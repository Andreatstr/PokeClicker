# Issues - Del 3 (Third Underveisinnlevering)

## Overview

This document outlines all issues for the third delivery phase, focusing on sustainability, accessibility, testing infrastructure, and core feature completion. Issues are prioritized to address security concerns first, then sustainability (dark mode priority), accessibility testing, and finally new features.

---

## 🔒 Security & Infrastructure (Pre-requisites)

### Issue #64: Fix JWT Secret Security Vulnerability

**Branch name:** `fix/jwt-secret-validation`

**Description:**
Remove hardcoded JWT secret fallback that creates a security risk in production. Implement proper environment variable validation.

**Acceptance Criteria:**
- JWT_SECRET environment variable is required (no fallback)
- Application throws clear error if JWT_SECRET is not set
- No hardcoded secrets in codebase
- Production deployment fails gracefully with helpful error message

**Technical Implementation Hints:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables');
}
```
- Update backend/.env.example with JWT_SECRET requirement
- Add validation in resolvers.ts startup
- Test with missing JWT_SECRET to ensure proper error handling

**Dependencies:** None

---

### Issue #65: Environment Variable Configuration

**Branch name:** `feat/environment-config`

**Description:**
Replace hardcoded backend URL in frontend with proper environment variable configuration for better deployment flexibility.

**Acceptance Criteria:**
- Frontend uses VITE_GRAPHQL_URL environment variable
- Fallback to localhost:3001 for development
- Production uses relative path /project2/graphql
- No hardcoded URLs in apolloClient.ts
- Environment variables documented in README

**Technical Implementation Hints:**
```typescript
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3001/',
});
```
- Create .env.example in frontend root
- Update apolloClient.ts configuration
- Document environment setup in README

**Dependencies:** None

---

### Issue #66: Implement Rate Limiting

**Branch name:** `feat/rate-limiting`

**Description:**
Add rate limiting to GraphQL endpoint to prevent abuse and DoS attacks. Implement both per-IP and per-user rate limiting.

**Acceptance Criteria:**
- Rate limiting implemented on GraphQL endpoint
- Different limits for authenticated vs unauthenticated users
- Clear error messages when rate limit exceeded
- Rate limiting doesn't affect normal usage patterns
- Configuration via environment variables

**Technical Implementation Hints:**
- Use `express-rate-limit` or `graphql-rate-limit`
- Implement per-IP limiting (100 requests/15min for guests)
- Implement per-user limiting (500 requests/15min for authenticated)
- Add rate limit headers to responses
- Consider using Redis for distributed rate limiting

**Dependencies:** None

---

## 🌱 Bærekraftig Utvikling (Sustainability)

### Issue #67: Dark Mode / Light Mode Toggle Implementation

**Branch name:** `feat/dark-mode`

**Description:**
Complete the dark mode implementation. The CSS variables for both light and dark themes are already defined in index.css, but the toggle functionality needs to be properly implemented to actually switch between themes and persist the preference.

**Acceptance Criteria:**
- Dark mode toggle button works correctly (currently exists in Navbar)
- Theme preference persisted in localStorage
- Dark mode reduces screen brightness/energy usage
- All components support both themes (CSS variables already exist)
- Smooth transitions between themes
- System preference detection (prefers-color-scheme) for initial theme
- Toggle accessible via keyboard navigation
- Theme persists across page refreshes

**Technical Implementation Hints:**
- CSS variables already exist in index.css:
  - Light mode: `:root` (lines 85-130)
  - Dark mode: `.dark` (lines 132-164)
- Fix the toggle functionality in App.tsx (isDarkMode state)
- Add `dark` class to document.documentElement when dark mode is active
- Implement localStorage persistence for theme preference
- Use `prefers-color-scheme: dark` media query for initial theme detection
- Update Tailwind config to use the existing CSS variables
- Test theme switching across all components
- Ensure retro theme variables (--retro-primary, --retro-secondary, etc.) work in both modes

**Dependencies:** None

---

### Issue #68: Lazy Loading and Performance Optimization

**Branch name:** `feat/performance-optimization`

**Description:**
Implement lazy loading and performance optimizations while preserving pixelated art quality. Focus on code-level optimizations rather than image compression to maintain the GameBoy aesthetic.

**Acceptance Criteria:**
- Lazy loading implemented for non-critical images
- Code splitting for heavy components
- Performance optimizations without sacrificing pixelated art
- Reduced initial bundle size
- Improved loading performance
- Maintained visual quality of pixelated assets

**Technical Implementation Hints:**
- Implement lazy loading for Pokemon sprites and non-critical images
- Add loading="lazy" to images below the fold
- Use React.lazy() for heavy components (Pokedex, Map, Battle)
- Implement virtual scrolling for large Pokemon lists
- Optimize bundle size through tree shaking
- Preserve pixelated art quality (no aggressive compression)
- Focus on code optimization rather than image compression
- Test performance improvements with Lighthouse

**Dependencies:** Issue #67 (Dark Mode)

---

### Issue #69: Code Splitting and Lazy Loading

**Branch name:** `feat/code-splitting`

**Description:**
Implement code splitting and lazy loading to reduce initial bundle size and improve performance, especially on slower connections.

**Acceptance Criteria:**
- Route-based code splitting implemented
- Heavy components lazy loaded
- Initial bundle size reduced by 20%+
- Loading states for lazy components
- No functionality regression
- Improved Lighthouse performance score

**Technical Implementation Hints:**
- Use React.lazy() for route components
- Implement Suspense boundaries
- Lazy load heavy features (Pokedex, Map)
- Consider dynamic imports for large libraries
- Add loading spinners for lazy components
- Monitor bundle size with webpack-bundle-analyzer

**Dependencies:** Issue #67 (Dark Mode)

---

### Issue #70: Font and Asset Optimization

**Branch name:** `feat/asset-optimization`

**Description:**
Optimize fonts and other assets to reduce data transfer. Use system fonts where possible and optimize external font loading.

**Acceptance Criteria:**
- System fonts used where appropriate
- External fonts optimized with font-display: swap
- Font loading doesn't block rendering
- Reduced number of font files
- Preload critical fonts
- Fallback fonts defined

**Technical Implementation Hints:**
- Use font-display: swap for custom fonts
- Preload critical fonts in HTML head
- Consider using system font stack
- Optimize font file sizes
- Remove unused font weights
- Implement font loading strategies

**Dependencies:** Issue #5 (Image Optimization)

---

## ♿ Tilgjengelighet (Accessibility)

### Issue #71: Automated Accessibility Testing

**Branch name:** `feat/accessibility-testing`

**Description:**
Set up automated accessibility testing with axe DevTools and Lighthouse CI to ensure WCAG 2.1 AA compliance.

**Acceptance Criteria:**
- axe DevTools integrated in CI/CD pipeline
- Lighthouse accessibility audits automated
- Accessibility tests run on every PR
- Clear reporting of accessibility violations
- Zero critical accessibility issues
- Accessibility score 90+ in Lighthouse

**Technical Implementation Hints:**
- Install @axe-core/react and @axe-core/playwright
- Add accessibility tests to Playwright suite
- Configure Lighthouse CI for accessibility
- Set up GitHub Actions for automated testing
- Create accessibility testing documentation
- Train team on accessibility best practices

**Dependencies:** Issue #66 (Rate Limiting)

---

### Issue #72: WCAG 2.1 AA Compliance Audit

**Branch name:** `feat/wcag-compliance`

**Description:**
Conduct comprehensive WCAG 2.1 AA compliance audit and fix all identified accessibility issues.

**Acceptance Criteria:**
- All images have alt text
- Proper heading hierarchy (h1, h2, h3)
- Keyboard navigation works for all interactive elements
- Color contrast meets AA standards (4.5:1)
- Focus indicators visible and clear
- Screen reader compatibility verified
- ARIA labels where needed

**Technical Implementation Hints:**
- Use axe DevTools browser extension for testing
- Test with actual screen readers (NVDA, JAWS)
- Implement proper ARIA roles and labels
- Ensure keyboard navigation order is logical
- Test with high contrast mode
- Validate color contrast ratios

**Dependencies:** Issue #71 (Automated Testing)

---

### Issue #73: Keyboard Navigation and Screen Reader Support

**Branch name:** `feat/keyboard-navigation`

**Description:**
Improve keyboard navigation and screen reader compatibility throughout the application.

**Acceptance Criteria:**
- All interactive elements accessible via keyboard
- Tab order is logical and intuitive
- Skip links for main content
- Focus management in modals
- Screen reader announcements for dynamic content
- Keyboard shortcuts for common actions

**Technical Implementation Hints:**
- Implement focus trap in modals
- Add skip navigation links
- Use ARIA live regions for updates
- Ensure proper tabindex values
- Test with keyboard-only navigation
- Add keyboard shortcuts documentation

**Dependencies:** Issue #9 (WCAG Compliance)

---

## 🧪 Testing Infrastructure

### Issue #74: Vitest Unit and Component Testing

**Branch name:** `feat/vitest-setup`

**Description:**
Set up Vitest for unit and component testing with comprehensive test coverage for critical functionality.

**Acceptance Criteria:**
- Vitest configured and running
- Unit tests for utility functions
- Component tests for critical UI components
- Test coverage 80%+ for core functionality
- Tests run in CI/CD pipeline
- Mocking for external dependencies

**Technical Implementation Hints:**
- Install vitest and @testing-library/react
- Create test utilities and mocks
- Test Apollo Client integration
- Mock GraphQL responses
- Test user interactions
- Set up test coverage reporting

**Dependencies:** Issue #65 (Environment Config)

---

### Issue #75: Playwright E2E Testing

**Branch name:** `feat/playwright-e2e`

**Description:**
Implement comprehensive end-to-end testing with Playwright covering critical user journeys.

**Acceptance Criteria:**
- Playwright configured for E2E testing
- Tests for user registration/login flow
- Tests for Pokemon search and filtering
- Tests for clicker game functionality
- Cross-browser testing (Chrome, Firefox, Safari)
- Visual regression testing
- Tests run in CI/CD pipeline

**Technical Implementation Hints:**
- Install @playwright/test
- Create page object models
- Test critical user paths
- Implement visual testing
- Set up test data seeding
- Configure CI/CD integration

**Dependencies:** Issue #11 (Vitest Setup)

---

## 🎮 Must Have Features

### Issue #76: Map Feature MVP Improvements

**Branch name:** `feat/map`

**Description:**
Improve the existing map feature MVP with better controls, accurate collision detection, and battle integration. The map feature is already implemented with character movement, wild Pokemon spawning, and basic collision detection, but needs enhancements for better user experience and accessibility.

**Acceptance Criteria:**
- Replace D-pad cross with joystick control for mobile accessibility
- Replace circular purple buttons with functional A/B buttons (like PokeClicker)
- Update collision map PNG with accurate bounding boxes
- Implement Battle! button to redirect to battle view with Pokemon context
- Maintain arrow key controls for desktop users
- Ensure joystick maps to arrow keys for consistent behavior
- All existing functionality preserved (character movement, Pokemon spawning, collision detection)

**Technical Implementation Hints:**
- Create joystick component similar to mobile game controls
- Map joystick directions to arrow key events for existing movement system
- Copy A/B button implementation from PokeClicker component
- Update pokemonmap-collision.png with accurate walkable areas
- Add battle navigation state management
- Pass Pokemon ID/name to battle component
- Ensure touch events work on mobile devices
- Test collision detection accuracy after PNG update

**Dependencies:** None (improves existing feature)

---

### Issue #77: Battle Feature Implementation

**Branch name:** `feat/battle`

**Description:**
Create Pokemon battle system using the same GameBoy layout as the map feature. Users battle with their owned Pokemon against wild Pokemon encountered on the map. Battle uses click-based mechanics similar to PokeClicker with stat-based damage calculations.

**Acceptance Criteria:**
- Battle view uses same GameBoy shell layout as map
- User's Pokemon displayed in bottom left with health bar and name
- Opponent Pokemon displayed in top right with health bar and name
- Health decreases over time based on opponent's attack vs user's defense
- Click attacks based on user's attack stat and click frequency
- Battle ends when either Pokemon reaches 0 health
- Battle rewards rare candy on victory
- Return to map after battle completion
- Responsive design for mobile/desktop

**Technical Implementation Hints:**
- Create BattleView component with GameBoy shell layout
- Implement health bar components with smooth animations
- Add battle state management (user health, opponent health, battle status)
- Calculate damage: opponent attack vs user defense for passive damage
- Calculate damage: user attack * click frequency for active damage
- Add battle timer for passive damage intervals
- Create battle result screen with rewards
- Add navigation between map and battle views
- Store battle results in user profile
- Use existing Pokemon data structure for stats

**Dependencies:** Issue #76 (Map Feature MVP Improvements)

---

### Issue #78: Profile Dashboard Implementation

**Branch name:** `feat/profile-dashboard`

**Description:**
Create comprehensive profile dashboard showing user statistics, owned Pokemon, and game progress. Users can view their total rare candy, select favorite Pokemon, choose Pokemon for clicker game, and manage their profile including logout and deletion options.

**Acceptance Criteria:**
- Display total rare candy count prominently
- Favorite Pokemon selection with visual indicators
- Pokemon selection for clicker game (affects PokeClicker component)
- Profile deletion with confirmation dialog
- Logout functionality
- Game statistics overview (Pokemon owned, battles won, etc.)
- Responsive design for mobile/desktop
- Integration with existing auth system
- Profile updates persist across sessions

**Technical Implementation Hints:**
- Create ProfileDashboard component with GameBoy aesthetic
- Add user statistics queries to GraphQL schema
- Implement favorite Pokemon system with database storage
- Add Pokemon selection for clicker (update PokeClicker component)
- Create profile deletion mutation with confirmation
- Add logout functionality using existing auth context
- Create statistics visualization components
- Ensure mobile responsiveness with touch-friendly controls
- Add profile picture/avatar selection
- Implement profile settings persistence
- Add confirmation dialogs for destructive actions
- Create profile edit functionality

**Dependencies:** Issue #75 (Playwright E2E)

---

### Issue #79: Cross-Region Pokemon Navigation and Evolution Chain Fix

**Branch name:** `feat/region-navigation`

**Description:**
Fix the issue where users cannot navigate to Pokemon in different regions through evolution chains, even when "All regions" is selected. Currently, the onSelectPokemon function only searches within filteredPokemon (current region), preventing cross-region navigation in evolution chains.

**Acceptance Criteria:**
- Can navigate to Pokemon in any region through evolution chains
- Evolution chain navigation works across all regions (Kanto, Johto, Hoenn, etc.)
- Modal updates without page refresh when switching between regions
- Pokemon from different regions display correctly in modal
- Background/page context remains the same (only modal content changes)
- Clear region indicators for Pokemon from different regions
- Smooth navigation between regions without losing current page state

**Technical Implementation Hints:**
- Fix onSelectPokemon function in App.tsx to fetch Pokemon by ID regardless of current region filter
- Use pokemonById GraphQL query instead of searching filteredPokemon array
- Add region detection logic to show which region a Pokemon belongs to
- Update PokemonDetailModal to handle Pokemon from any region
- Ensure evolution chain navigation works with Pokemon from different generations
- Add region indicators to Pokemon cards in evolution chains
- Test with complex evolution chains (Eevee, etc.) that span multiple regions
- Maintain current page state when navigating between regions

**Dependencies:** Issue #78 (Profile Dashboard)

---

### Issue #80: Replace Load More with Traditional Pagination

**Branch name:** `feat/pagination-enhancement`

**Description:**
Replace the current "Load More" button pagination system with traditional pagination controls showing "Previous", "Page X of Y", and "Next" buttons. The backend already supports proper pagination with limit/offset, but the frontend currently uses a "Load More" approach that loads all previous items.

**Acceptance Criteria:**
- Replace "Load More" button with traditional pagination controls
- Show "Previous" and "Next" buttons
- Display "Page X of Y" (e.g., "Page 2 of 15")
- Show total number of Pokemon
- Maintain current page size (20 items per page)
- Pagination controls work with all filters (search, region, type, sort)
- Keyboard navigation support (arrow keys, page up/down)
- Mobile-friendly pagination controls
- Preserve current page when applying filters
- Reset to page 1 when changing search terms

**Technical Implementation Hints:**
- Replace `displayedCount` state with `currentPage` state (1-based)
- Calculate `offset = (currentPage - 1) * ITEMS_PER_PAGE`
- Update usePokedexQuery to use calculated offset instead of 0
- Create PaginationControls component with Previous/Next buttons
- Add page number display with total pages calculation
- Update App.tsx to handle page changes instead of load more
- Ensure filters reset to page 1 when applied
- Add keyboard event handlers for pagination
- Test with different filter combinations
- Maintain existing GraphQL query structure (limit/offset already supported)

**Dependencies:** Issue #79 (Region Navigation)

---

### Issue #81: Responsive Evolution Display with Better UX

**Branch name:** `feat/evolution-display`

**Description:**
Fix evolution display issues in PokemonDialogView where evolutions don't show when there are too many (like Eevee's 8 evolutions), and improve user experience by making evolution navigation more intuitive. Currently, users don't understand they can click on evolutions to view them.

**Acceptance Criteria:**
- Evolution chains display properly with many Pokemon (8+ evolutions like Eevee)
- Responsive layout for both mobile drawer and desktop dialog
- Scrollable evolution chains when needed (horizontal scroll for mobile, grid for desktop)
- Clear visual indicators that evolutions are clickable
- Better affordance - users understand they can click on evolutions
- Smooth transitions when navigating between evolutions
- Performance optimized for large evolution chains
- Accessibility compliance (keyboard navigation, screen reader support)

**Technical Implementation Hints:**
- Update PokemonDetailModal component to handle 8+ evolutions
- Implement horizontal scrolling for mobile (touch-friendly)
- Use grid layout for desktop with proper spacing
- Add visual cues (hover effects, cursor pointer, animations) to show clickability
- Add tooltips or labels indicating "Click to view evolution"
- Implement smooth transitions between evolution views
- Add loading states for evolution navigation
- Test with complex evolution chains (Eevee, Wurmple, etc.)
- Ensure touch targets are large enough for mobile
- Add keyboard navigation support for evolution chains
- Consider using carousel/slider component for mobile
- Add visual indicators for evolution relationships (arrows, lines)

**Dependencies:** Issue #80 (Pagination Improvements)

---

### Issue #82: Pokemon Individual Stat Upgrades System

**Branch name:** `feat/pokemon-upgrades`

**Description:**
Implement individual Pokemon stat upgrade system with proper database schema (3NF/4NF) to track upgrades for each owned Pokemon. Currently, Pokemon upgrades are only visual - they need to actually affect gameplay in PokeClicker and Battle. The system must be universal across the application.

**Acceptance Criteria:**
- Create Pokemon upgrades database table (3NF/4NF design)
- Individual Pokemon stat upgrades (separate from user stats)
- Pokemon upgrade interface in PokemonDetailModal
- Cost calculation based on Pokemon rarity and current upgrade level
- Upgraded stats affect PokeClicker gameplay (damage, passive income)
- Upgraded stats affect Battle gameplay (damage, defense)
- Universal upgrade system across all game modes
- Upgrade history tracking per Pokemon
- Visual indicators showing upgraded vs base stats
- Mobile-friendly upgrade interface

**Technical Implementation Hints:**
- Create `pokemon_upgrades` collection with schema:
  ```typescript
  interface PokemonUpgrade {
    _id: ObjectId;
    user_id: ObjectId;
    pokemon_id: number;
    stat_upgrades: {
      hp: number;
      attack: number;
      defense: number;
      spAttack: number;
      spDefense: number;
      speed: number;
    };
    total_upgrades: number;
    created_at: Date;
    updated_at: Date;
  }
  ```
- Add GraphQL mutations: `upgradePokemonStat(pokemonId: Int!, stat: String!)`
- Update PokemonDetailModal to show upgrade buttons for owned Pokemon
- Modify StackedProgress to show baseValue vs (baseValue + upgrades)
- Update PokeClicker to use selected Pokemon's upgraded stats
- Update Battle system to use Pokemon's upgraded stats
- Add upgrade cost calculation based on Pokemon rarity
- Ensure upgrade system is consistent across all game modes
- Test with different Pokemon types and rarity levels

**Dependencies:** Issue #81 (Evolution Display)

---

### Issue #83: Rare Candy Pricing System with Legendary Pokemon

**Branch name:** `feat/candy-pricing`

**Description:**
Implement correct rare candy pricing system for Pokemon and upgrades based on evolution level and rarity. Low evolution Pokemon have low prices, while legendary Pokemon have high prices. The system must include all legendary Pokemon for accurate pricing.

**Acceptance Criteria:**
- Pokemon prices based on evolution level (low evolution = low price)
- Legendary Pokemon have significantly higher prices
- Upgrade costs clearly displayed with tier-based pricing
- Price updates in real-time when filters change
- Clear pricing information with tooltips
- Mobile-friendly price display
- Consistent pricing across all game modes
- Legendary Pokemon list includes all generations

**Technical Implementation Hints:**
- Create legendary Pokemon list (Uxie, Mesprit, Azelf, Celebi, Mew, Jirachi, Phione, Manaphy, Shaymin, Regirock, Regice, Registeel, Regigigas, Suicune, Raikou, Entei, Darkrai, Articuno, Zapdos, Moltres, Ho-Oh, Lugia, Kyogre, Groudon, Heatran, Cresselia, Giratina, Mewtwo, Rayquaza, Palkia, Dialga, Latias, Latios, Deoxys, Arceus, Cobalion, Terrakion, Virizion, Tornadus, Thundurus, Reshiram, Zekrom, Landorus, Kyurem, Meloetta, Keldeo, Genesect)
- Implement pricing tiers:
  - Basic Pokemon (1st evolution): 100-500 candy
  - Evolved Pokemon (2nd evolution): 1000-5000 candy
  - Final evolution: 10000-50000 candy
  - Legendary Pokemon: 500000-5000000 candy
- Update getPokemonCost function in resolvers.ts
- Add price display components to Pokemon cards
- Implement upgrade cost calculation based on current level
- Add price tooltips with breakdown
- Update PokemonDetailModal with pricing information
- Ensure pricing consistency across PokeClicker, Battle, and Profile
- Test with different Pokemon types and evolution stages

**Dependencies:** Issue #82 (Pokemon Upgrades)

---

### Issue #84: Reusable PokemonSelector Component (High Reuse Priority)

**Branch name:** `feat/pokemon-selector`

**Description:**
Create a highly reusable PokemonSelector component that can be used across multiple contexts: profile dashboard, PokeClicker gameboy interface, and battle Pokemon selection. This component should be designed for maximum reuse and consistency across the application.

**Acceptance Criteria:**
- Create reusable PokemonSelector component in shared components
- Pokemon selection interface in profile dashboard
- Pokemon selection through gameboy select button in PokeClicker
- Pokemon selection for battle system
- Selected Pokemon displayed in clicker game and battle
- Pokemon selection persists across sessions
- Easy Pokemon switching in all interfaces
- Visual indicators for selected Pokemon
- Mobile-friendly selection interface
- Consistent Pokemon selection across all game modes
- Component designed for maximum reusability

**Technical Implementation Hints:**
- **Component Reuse Strategy**:
  - Create PokemonSelector in `src/components/shared/`
  - Design with props for different contexts (profile, gameboy, battle)
  - Use consistent styling with existing GameBoy aesthetic
  - Implement reusable filter logic for owned Pokemon
- **Reuse Across Contexts**:
  - Profile: Full Pokemon collection with selection
  - PokeClicker: Quick Pokemon selection via gameboy select button
  - Battle: Pokemon selection for battle team
  - Future: Any Pokemon selection needs
- **Technical Implementation**:
  - Add selected Pokemon to user profile schema
  - Update PokeClicker to use selected Pokemon instead of hardcoded Charizard
  - Implement Pokemon switching logic in all contexts
  - Add visual selection indicators (highlighted border, checkmark, etc.)
  - Ensure mobile responsiveness for all interfaces
  - Add keyboard navigation support
  - Create Pokemon selection state management
  - Update gameboy select button to open Pokemon selector
  - Ensure selected Pokemon affects clicker damage and battle stats
  - Test Pokemon selection persistence across sessions
- **Reusability Benefits**:
  - Single component for all Pokemon selection needs
  - Consistent UX across application
  - Easier maintenance and updates
  - Reduced code duplication

**Dependencies:** Issue #83 (Candy Pricing)

---

### Issue #85: Mobile Profile/Logout Responsiveness

**Branch name:** `feat/mobile-profile-responsive`

**Description:**
Fix mobile responsiveness of the profile/login/logout section. Currently, dark mode toggle and logout button are on the same row, causing layout issues on mobile. Move logout to profile page and separate dark mode toggle to its own row.

**Acceptance Criteria:**
- Dark mode toggle on separate row (not with logout)
- Logout button moved to profile page instead of navbar
- Profile button in navbar (replaces logout)
- Mobile-friendly layout for all screen sizes
- Proper spacing and alignment on mobile
- Touch-friendly button sizes
- Responsive design for tablet and desktop

**Technical Implementation Hints:**
- Update Navbar component to separate dark mode and profile sections
- Create Profile button in navbar (replaces logout button)
- Move logout functionality to ProfileDashboard component
- Add responsive CSS for mobile layout
- Ensure proper touch targets (44px minimum)
- Test on different mobile screen sizes
- Update mobile menu layout if applicable
- Add proper spacing between elements

**Dependencies:** Issue #84 (PokemonSelector Component)

---

### Issue #86: Special Defense and Speed Upgrades with Charged Attacks

**Branch name:** `feat/stat-upgrades`

**Description:**
Add Special Defense and Speed stat upgrades to the existing upgrade system. Speed affects map character movement, while Special Attack and Special Defense enable charged attacks in battle and PokeClicker that charge up over time for significant damage or defense.

**Acceptance Criteria:**
- Special Defense upgrade option
- Speed upgrade option (affects map character movement)
- Charged attack system in battle and PokeClicker
- Special Attack charges up over time for significant damage
- Special Defense charges up over time for defense shielding
- Charged attack button appears when ready
- Clear upgrade descriptions for all new stats
- Speed affects character movement speed on map
- Charged attacks have visual feedback and cooldowns

**Technical Implementation Hints:**
- Add new stat fields to user schema (spAttack, spDefense, speed)
- Update upgrade mutation to handle new stats
- **Speed Implementation**:
  - Speed affects character movement speed on map
  - Update map movement intervals based on speed stat
  - Higher speed = faster movement
- **Charged Attack System**:
  - Special Attack: Charges up over time, click for significant damage
  - Special Defense: Charges up over time, click for defense shield
  - Add charging progress bars/indicators
  - Implement cooldown periods after use
  - Add special attack/defense buttons that appear when ready
- **Battle Integration**:
  - Charged attacks deal significantly more damage
  - Defense shield reduces incoming damage for a period
  - Visual effects for charged attacks
- **PokeClicker Integration**:
  - Charged attacks provide bonus rare candy
  - Defense shield provides temporary protection
  - Add charged attack UI to PokeClicker interface
- Update stat display components with new mechanics
- Test upgrade cost calculations and charged attack balance

**Dependencies:** Issue #22 (Mobile Profile Responsiveness)

---

## ✨ Should Have Features

### Issue #87: Pixelart Text in Login Input Fields

**Branch name:** `feat/pixelart-input`

**Description:**
Fix login/signup input fields to use the existing pixelated font ('Press Start 2P') that's already used throughout the application. Currently, all input fields in login/signup use regular fonts instead of the pixelated font that matches the GameBoy aesthetic.

**Acceptance Criteria:**
- All login/signup input fields use pixelated font
- Consistent with existing pixel-font class used throughout app
- Readable and accessible with proper sizing
- Works across different browsers
- Mobile-friendly pixelart text with appropriate font sizes
- Maintains input functionality and usability

**Technical Implementation Hints:**
- Apply existing `.pixel-font` class to login/signup input fields
- Font family is already defined: 'Press Start 2P' (from styles.css)
- Ensure input fields are properly sized for pixelated font
- Test readability on mobile devices (may need larger font size)
- Ensure placeholder text is also pixelated
- Test across different browsers for font rendering
- Maintain accessibility (contrast, readability)
- Consider font size adjustments for better mobile experience

**Dependencies:** Issue #86 (Stat Upgrades)

---

### Issue #88: Upgrade Text Improvements - Show Benefits Before Purchase

**Branch name:** `feat/upgrade-text`

**Description:**
Add descriptive text to upgrade buttons that shows the actual benefit users will receive before they purchase the upgrade. Currently, users don't know what benefit they'll get from an upgrade until after they buy it. Add text like "+0.5/s passive" to show the upgrade benefit upfront.

**Acceptance Criteria:**
- Upgrade buttons show benefit text before purchase (e.g., "+0.5/s passive")
- Clear indication of what each stat upgrade provides
- Passive income calculations displayed
- Upgrade descriptions are helpful and informative
- Consistent text formatting across all upgrades
- Mobile-friendly text display
- Users can make informed decisions before spending rare candy

**Technical Implementation Hints:**
- Update upgrade button components to show benefit text
- Add benefit calculation functions for each stat:
  - HP: "+X.X/s passive" (based on current level)
  - Attack: "+X per click" (based on current level)
  - Defense: "+X.X/s passive" (based on current level)
  - Sp. Attack: "+X per click" (based on current level)
  - Sp. Defense: "Coming soon" (placeholder)
  - Speed: "Coming soon" (placeholder)
- Use existing getStatDescription function from PokeClicker as reference
- Add tooltips for detailed upgrade descriptions
- Ensure text is accessible and readable
- Test with different upgrade levels and stat combinations
- Update upgrade cost display to include benefit preview

**Dependencies:** Issue #87 (Pixelart Input)

---

### Issue #89: Number Formatting System for Large Candy Amounts

**Branch name:** `feat/number-formatting`

**Description:**
Implement a general number formatting system to handle large candy amounts throughout the application. Create a utility function that formats numbers as 1K, 1M, 1B to prevent display issues with huge numbers and improve readability.

**Acceptance Criteria:**
- Numbers formatted as 1K, 1M, 1B (1,000 = 1K, 1,000,000 = 1M, 1,000,000,000 = 1B)
- Consistent formatting across entire application
- Applied to all candy displays (costs, totals, counters)
- Proper rounding and precision (1.5K, 2.3M, etc.)
- Mobile-friendly number display
- Performance optimized formatting
- General utility function for reuse

**Technical Implementation Hints:**
- Create number formatting utility function (e.g., `formatNumber()`)
- Implement K/M/B formatting logic with proper thresholds:
  - 1,000+ = K format
  - 1,000,000+ = M format  
  - 1,000,000,000+ = B format
- Apply formatting to all candy displays:
  - Rare candy counter in PokeClicker
  - Upgrade costs in stat upgrades
  - Pokemon purchase costs
  - Battle rewards
  - Profile dashboard totals
- Add number formatting to all displays throughout app
- Test with very large numbers (millions, billions)
- Ensure consistent formatting across all components
- Create reusable utility that can be imported anywhere
- Consider decimal precision for partial amounts (1.5K, 2.3M)

**Dependencies:** Issue #24 (Upgrade Text)

---

## 📋 Nice to Have Features

### Issue #90: Owned Pokemon Filter - Reuse Existing Filter System

**Branch name:** `feat/owned-pokemon-filter`

**Description:**
Add filter option to show only Pokemon that the user owns in their collection. Leverage existing Pokedex filter system for maximum component reuse and consistency. This approach maximizes reuse of existing filter components and maintains consistent UX.

**Acceptance Criteria:**
- Filter toggle for owned Pokemon (reuse existing Pokedex filter system)
- Clear visual indicators for owned Pokemon
- Filter works with search and other filters (integrated with existing system)
- Filter state persists during session
- Mobile-friendly filter interface
- Performance optimized filtering
- Maximum component reuse from existing filter system

**Technical Implementation Hints:**
- **Recommended Approach: Pokedex Filter Integration**
  - Add "Owned" filter to existing Pokedex filters (reuse existing filter system)
  - Leverage existing FiltersAndCount component
  - Reuse existing filter state management
  - Maintain consistent UX with other filters
- **Component Reuse Strategy**:
  - Extend existing filter system instead of creating new components
  - Reuse filter toggle components from Pokedex
  - Leverage existing filter state management
  - Use consistent styling with existing filters
- **Technical Implementation**:
  - Add owned filter to Pokemon query (integrate with existing system)
  - Extend existing filter toggle component for owned Pokemon
  - Update Pokemon display logic (reuse existing patterns)
  - Implement filter state management (extend existing system)
  - Add visual owned indicators (checkmark, border, etc.)
  - Optimize filter performance (leverage existing optimizations)
- **Reusability Benefits**:
  - Maximum reuse of existing filter components
  - Consistent UX with other filters
  - Easier maintenance (single filter system)
  - Reduced code duplication
  - Future filter additions benefit from same system

**Dependencies:** Issue #89 (Number Formatting)

---

### Issue #91: Global Leaderboard System with Two Leagues

**Branch name:** `feat/leaderboard`

**Description:**
Create a global leaderboard system accessible via navbar that shows top players across all users. Implement two separate leagues: one for maximum rare candy and one for Pokemon count. Include database queries to fetch global user statistics.

**Acceptance Criteria:**
- Leaderboard accessible via navbar navigation
- Two separate leagues:
  - **Max Candy League**: Top players by highest rare candy amount
  - **Pokemon Count League**: Top players by number of owned Pokemon
- Global database queries for all users
- Real-time leaderboard updates
- Top 10-50 players displayed per league
- Privacy controls (users can opt out of leaderboard)
- Mobile-friendly leaderboard display
- Performance optimized for large user base

**Technical Implementation Hints:**
- Add "Leaderboard" link to navbar
- Create leaderboard page/route
- Implement database queries for global statistics:
  - `SELECT username, MAX(rare_candy) FROM users GROUP BY user_id ORDER BY rare_candy DESC`
  - `SELECT username, COUNT(owned_pokemon_ids) FROM users GROUP BY user_id ORDER BY count DESC`
- Create leaderboard components for both leagues
- Add user privacy settings (opt-in/opt-out of leaderboard)
- Implement ranking system with position numbers
- Add leaderboard caching for performance
- Create responsive leaderboard layout
- Add user profile links from leaderboard entries
- Consider pagination for large leaderboards
- Test with multiple users and large datasets

**Dependencies:** Issue #90 (Owned Pokemon Filter)

---

## 🎯 Implementation Priority

1. **Phase 1 (Security & Infrastructure):** Issues #64-66
2. **Phase 2 (Sustainability - Dark Mode First):** Issues #67-70
3. **Phase 3 (Accessibility):** Issues #71-73
4. **Phase 4 (Testing):** Issues #74-75
5. **Phase 5 (Must Have Features):** Issues #76-85
6. **Phase 6 (Should Have Features):** Issues #86-89
7. **Phase 7 (Nice to Have):** Issues #90-91

## 🔄 **Component Reuse Strategy**

### **High Reuse Priority Components**

1. **PokemonSelector Component** (Issue #21)
   - **Reuse Across**: Profile, PokeClicker, Battle, Future features
   - **Benefits**: Single component for all Pokemon selection needs
   - **Implementation**: Design with props for different contexts

2. **GameBoy Shell Layout** (Issues #13, #14, #15)
   - **Reuse Across**: Map, Battle, Profile, PokeClicker
   - **Benefits**: Consistent GameBoy aesthetic across all game modes
   - **Implementation**: Extract GameBoy shell into reusable component

3. **Filter System** (Issue #26)
   - **Reuse Across**: Pokedex, PokemonSelector, Profile
   - **Benefits**: Consistent filtering UX, single maintenance point
   - **Implementation**: Extend existing Pokedex filter system

4. **Number Formatting Utility** (Issue #25)
   - **Reuse Across**: All candy displays, costs, totals
   - **Benefits**: Consistent number display, single formatting logic
   - **Implementation**: Create utility function for K/M/B formatting

### **Reusability Benefits**
- **Reduced Code Duplication**: Single components for multiple contexts
- **Consistent UX**: Same behavior across application
- **Easier Maintenance**: Updates in one place affect all uses
- **Faster Development**: Reuse existing components for new features
- **Better Testing**: Test once, works everywhere

---

## 🌱 **Sustainability Impact Assessment**

### **High Impact (Quick Wins)**
- **Dark Mode**: 60% screen energy reduction
- **Code Splitting**: 20% bundle size reduction
- **Lazy Loading**: Reduced initial load time

### **Medium Impact**
- **Component Reuse**: Reduced bundle size, faster development
- **Performance Optimization**: Better user experience, reduced server load

### **Low Impact (Preserve Quality)**
- **Image Optimization**: Removed to preserve pixelated art quality
- **Font Optimization**: Maintain GameBoy aesthetic

---

## ♿ **Accessibility Strategy**

### **Critical (Must Have)**
- Keyboard navigation for all interactive elements
- Screen reader compatibility for all content
- Color contrast compliance (WCAG 2.1 AA)
- Focus management for modals and navigation

### **Enhancement (Should Have)**
- ARIA labels for complex interactions
- High contrast mode support
- Reduced motion preferences
- Voice navigation support

---

## 🧪 **Testing Strategy**

### **Unit/Component Tests (Vitest)**
- Test all reusable components
- Test utility functions (number formatting, etc.)
- Test component props and state management
- Test accessibility features

### **E2E Tests (Playwright)**
- Test complete user flows
- Test cross-browser compatibility
- Test mobile responsiveness
- Test accessibility with screen readers

### **Performance Tests**
- Lighthouse CI for performance monitoring
- Bundle size monitoring
- Load time testing
- Memory usage testing

---

## 📝 Notes

- Each issue should be implemented in its own branch
- Follow the established commit message format
- Include tests for new functionality
- Update documentation as needed
- Consider performance impact of each change
- Ensure mobile responsiveness for all features
- **Prioritize component reuse** to reduce development time and maintenance
- **Preserve pixelated art quality** - avoid aggressive image compression
- **Focus on sustainability** through dark mode and performance optimization
