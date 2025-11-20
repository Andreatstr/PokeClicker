# E2E Tests with Playwright

Comprehensive end-to-end testing suite for the Pokémon Clicker application.

## Test Coverage

### Authentication Tests ([auth.spec.ts](auth.spec.ts))
- Login screen display
- User registration
- User login
- Guest login functionality

### Navigation Tests ([navigation.spec.ts](navigation.spec.ts))
- Application loading and initialization
- Navigation between Clicker and Pokédex pages

### Pokédex Tests ([pokedex.spec.ts](pokedex.spec.ts))
- Pokémon card display
- Search functionality with debouncing
- Clear search functionality
- Region filtering (Kanto, Johto, Hoenn, etc.)
- Type filtering
- Sorting options (by ID, name, type)
- Sort order (ascending/descending)
- Clear type filter
- Clear all filters
- Pagination and "Load More"
- Combined search and filters

### Clicker Game Tests ([clicker.spec.ts](clicker.spec.ts))
- Initial game state and candy count display
- Click mechanics and candy increment with batch sync
- Mobile viewport compatibility

### Map Tests ([map.spec.ts](map.spec.ts))
- Map rendering and interactions
- Zoom in/out functionality
- Region selection and highlighting

## Running Tests

### Smoke Tests (Fast)
```bash
npx playwright test smoke.spec.ts --project=chromium
```

### Full E2E Suite (Comprehensive - run manually)
```bash
# Run all tests
pnpm test:e2e

# Run tests with UI mode
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Debug tests
pnpm test:e2e:debug

# View test report
pnpm test:e2e:report
```

> **Note:** Both `pnpm` and `npm run` commands work in this project, but `pnpm` is preferred.

## Test Structure

```
e2e/
├── pages/                        # Page Object Models
│   ├── BasePage.ts               # Base page class with common methods
│   ├── NavbarPage.ts             # Navigation bar interactions
│   ├── ClickerPage.ts            # Clicker game page interactions
│   ├── LoginPage.ts              # Authentication page interactions
│   ├── PokedexPage.ts            # Pokédex page interactions
│   └── PokemonDetailModalPage.ts # Pokemon detail modal interactions
├── utils/                        # Test utilities
│   ├── test-helpers.ts           # Helper functions for testing
│   └── fixtures.ts               # Playwright fixtures for page objects
├── smoke.spec.ts                 # Quick smoke tests (CI/CD)
├── auth.spec.ts                  # Authentication tests (full suite)
├── navigation.spec.ts            # Navigation tests (full suite)
├── pokedex.spec.ts               # Pokédex tests (full suite)
├── clicker.spec.ts               # Clicker game tests (full suite)
└── map.spec.ts                   # Map game tests (full suite)
```

## Browser Coverage

Tests run against:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit/Safari (Desktop)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## CI/CD Integration

**Workflow:** `.github/workflows/smoke-tests.yml` (CI Pipeline)

The CI pipeline runs on every push and PR to `main`, `develop`, and feature branches:
- Prettier formatting checks
- ESLint linting
- Project build verification
- Frontend and backend unit tests
- Smoke tests (currently disabled - see note below)

### Smoke Tests Status
> **Note:** E2E smoke tests are currently disabled in CI due to onboarding modal blocking issues in the CI environment. They can still be run locally for manual testing.

### Running Tests Locally
For comprehensive E2E testing, run the full suite locally using the commands above. Test results and artifacts are uploaded to GitHub Actions on failure for debugging.

## Writing New Tests

1. Create page object models in `pages/` for new components
2. Use existing fixtures from `utils/fixtures.ts`
3. Add test helpers to `utils/test-helpers.ts` as needed
4. Follow naming convention: `*.spec.ts`
5. Use descriptive test names that explain the expected behavior
