# Development Workflow

**[Home](../README.md)** | **[Setup](./setup.md)** | **[Architecture](./architecture.md)** | **[Testing](./testing.md)** | **[Security](./security.md)** | **[Sustainability](./sustainability.md)** | **[Development Workflow](./development-workflow.md)** | **[AI Usage](./ai-usage.md)**

---

This document describes the development workflow, tools, and practices used in the PokéClicker project.

## Pre-commit Hooks

The project uses automated code quality checks on every commit.

### Configuration

- **Husky**: Git hooks management
- **ESLint**: Code quality checks with auto-fix
- **Prettier**: Code formatting enforcement
- **Tests**: Full test suite runs on commit

### What Runs on Commit

When you run `git commit`, the following happens automatically:

1. **Format check** - Prettier validates formatting
2. **Lint** - ESLint checks code quality
3. **Tests** - Full test suite (417 tests)

Pre-commit hooks are installed automatically with `npm install`.

**`.husky/pre-commit`**:
```bash
# Run frontend checks
cd frontend
npm run format:check || exit 1
npm run lint || exit 1
npm run test:run || exit 1

# Run backend checks
cd backend
npm run format:check || exit 1
npm run lint || exit 1
npm run test:run || exit 1
```

### Bypassing Hooks (Not Recommended)

```bash
git commit --no-verify -m "Emergency fix"
```

**Warning**: Only use for emergency situations.

## Git Workflow

### Branch Naming

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `chore/description` - Maintenance tasks

### Commit Convention

Follow conventional commits format:

```
<type>: <subject>

<body (optional)>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```bash
git commit -m "feat: add JWT token refresh"
git commit -m "fix: resolve search debounce issue"
git commit -m "docs: update setup instructions"
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and commit
3. Push to remote
4. Create Pull Request
5. Address code review feedback
6. Merge after approval

## Development Commands

### Root Commands

```bash
npm run dev          # Start both frontend and backend
npm install          # Install all dependencies
```

### Frontend

```bash
cd frontend

npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm test             # Run tests
```

### Backend

```bash
cd backend

npm run dev          # Start dev server
npm run build        # Compile TypeScript
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
npm run seed         # Seed database
```

## Code Quality Tools

### ESLint

```bash
npm run lint         # Check all files
npm run lint --fix   # Auto-fix issues
```

**Key Rules**:
- No unused variables
- React hooks dependencies
- TypeScript type safety

### Prettier

```bash
npm run format       # Format all files
npm run format:check # Check without modifying
```

**Configuration**: `singleQuote: true`, `tabWidth: 2`, `trailingComma: es5`

## Deployment

See [deployment.md](./deployment.md) for production deployment instructions.

## Best Practices

1. **Commit often** - Small, focused commits
2. **Write tests** - For new features and bug fixes
3. **Review your own code** - Before requesting review
4. **Keep branches updated** - Merge from main regularly
5. **Clean up** - Delete merged branches
6. **Document** - Update docs with significant changes

## Troubleshooting

### Pre-commit hooks not running

```bash
npm install
npx husky install
```

### ESLint errors blocking commit

```bash
npm run lint        # See errors
npm run lint --fix  # Auto-fix
```

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
