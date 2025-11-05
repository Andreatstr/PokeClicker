# PokéClicker - Project 2

IT2810 Web Development - Group 26

[Live Demo](http://it2810-26.idi.ntnu.no/project2/) (Requires eduroam VPN outside NTNU)

## Documentation

**[Setup Guide](./docs/setup.md)** | **[Architecture](./docs/architecture.md)** | **[Testing](./docs/testing.md)** | **[Security](./docs/security.md)** | **[Sustainability](./docs/sustainability.md)** | **[Development Workflow](./docs/development-workflow.md)** | **[AI Usage](./docs/ai-usage.md)**

## Project Concept

PokéClicker is a web application that combines an incremental clicker game with a searchable Pokémon database. The goal is to create an interactive and engaging user experience where game mechanics and data visualization work together.

### How the Game Works

Users earn "rare candy" by clicking on Pokémon in a GameBoy-inspired interface. Rare candy can be used to:

- Purchase new Pokémon for their personal collection
- Upgrade stats (HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed)
- Increase income per click and passive income

The game mechanics provide a natural motivation for users to explore the Pokédex and interact with the system over time.

## Quick Start

```bash
# Clone repository
git clone https://git.ntnu.no/IT2810-H25/T26-Project-2.git
cd T26-Project-2

# Install dependencies
npm install
cd backend && npm install && cd ..

# Seed database (required first time)
cd backend && npm run seed && cd ..

# Start both frontend and backend
npm run dev:all
```

See [Setup Guide](./docs/setup.md) for detailed installation instructions.

## Course Requirements

### Functionality

| Requirement                    | Implementation                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| **Search capability**          | Search field with debouncing (300ms) for case-insensitive Pokémon name search     |
| **List-based presentation**    | Grid view with "Load More" pagination (20 Pokémon per page)                        |
| **Detail view**                | Modal with extended information about stats, evolutions, habitat, abilities        |
| **Sorting and filtering**      | Filtering by region (Kanto/Johto/Hoenn) and type, sorting by ID/name/type         |
| **User-generated data**        | User accounts with personal Pokémon collections and upgrade progression            |
| **Universal design**           | ARIA-labels, keyboard navigation, semantic HTML, high contrast                     |
| **Sustainable web development**| Debounced search, lazy loading, optimized rendering, efficient data transfer       |

### Technology

- **Frontend**: React 19 + TypeScript + Vite
- **State management**: React hooks with Apollo Client
- **Styling**: Tailwind CSS + Radix UI components
- **Backend**: GraphQL API (Node.js + TypeScript)
- **Database**: MongoDB on VM
- **Testing**: Vitest + React Testing Library + Playwright (211 unit tests)

See [Architecture](./docs/architecture.md) for technical overview and design decisions.

## Status: Third Milestone (Part 3)

**Implemented:**

- Complete GraphQL backend with MongoDB database
- Authentication and user management (JWT tokens)
- Pokédex with search, filtering and sorting (live data from PokéAPI)
- Clicker game with upgrade system (persistent storage in database)
- Responsive design with GameBoy aesthetics
- Security and infrastructure (JWT secret validation, environment variables, rate limiting)
- Sustainable development (code splitting with lazy loading, virtual rendering, caching)
- Comprehensive testing (211 unit tests + E2E tests)

**Part 3 Focus Areas:**

- **Security**: JWT secret validation, environment variables, rate limiting - [Details](./docs/security.md)
- **Sustainability**: Code splitting, virtual rendering, caching - [Details](./docs/sustainability.md)
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation
- **Testing**: Vitest + React Testing Library - [Details](./docs/testing.md)

## Key Features

### Code Splitting and Lazy Loading
- Route-based code splitting with React.lazy()
- Components loaded on-demand (Clicker, LoginScreen, Pokedex, Modals)
- Improved initial load time
- [Read more](./docs/sustainability.md#code-splitting-and-lazy-loading)

### Virtual Rendering (90% API Call Reduction)
- Reduced API calls from ~500 to ~30 (90% reduction)
- Only renders visible Pokemon in carousel
- On-demand data loading
- [Read more](./docs/sustainability.md#virtual-rendering-optimization)

### Smart Caching
- API-cache: 24 hour TTL (60x faster)
- User-cache: 5 minute TTL
- IndexedDB for persistent image caching
- [Read more](./docs/architecture.md#caching-strategy)

### Security Hardening
- No hardcoded secrets
- JWT token authentication
- Rate limiting (1000 req/15min)
- Environment variable validation
- [Read more](./docs/security.md)

## GraphQL API

**Endpoint**: `http://it2810-26.idi.ntnu.no/project2/graphql`

**Key Queries**:
- `pokedex()` - Search, filter, sort Pokemon with ownership tracking
- `pokemonById(id)` - Detailed Pokemon info
- `me` - Current user data

**Key Mutations**:
- `signup/login` - User authentication (JWT)
- `purchasePokemon(id)` - Buy Pokemon with rare candy
- `upgradeStat(stat)` - Upgrade user stats

See [GraphQL API Documentation](./docs/GRAPHQL.md) for full API reference.

## AI-Assisted Development

This project was developed with extensive use of AI assistance through Claude Code. AI handled most of the implementation, while humans made all architectural and design decisions and performed active code reviews.

See [AI Usage](./docs/ai-usage.md) for full documentation of the development process.

## Testing

**211 unit tests** + E2E tests with Playwright:
- 107 frontend tests (hooks, components, integration)
- 104 backend tests (resolvers, auth, database)

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

See [Testing Guide](./docs/testing.md) for test strategy and coverage report.

## Deployment

The application runs on NTNU VM with Apache reverse proxy.

**Production**:
- Frontend: `http://it2810-26.idi.ntnu.no/project2/`
- GraphQL: `http://it2810-26.idi.ntnu.no/project2/graphql`

See [Deployment Guide](./docs/deployment.md) and [VM Deployment](./docs/vm-deployment.md) for instructions.

## Development Workflow

The project uses Husky + lint-staged for automatic code quality control:
- ESLint runs automatically on commit
- Prettier formats code automatically
- Tests can run before commit

See [Development Workflow](./docs/development-workflow.md) for details.

## Contributors

Group 26 - IT2810 H25

## License

This project is part of an academic course at NTNU.
