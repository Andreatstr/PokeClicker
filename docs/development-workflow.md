# Development Workflow

**[Home](../README.md)** | **[Setup](./setup.md)** | **[Architecture](./architecture.md)** | **[Testing](./testing.md)** | **[Security](./security.md)** | **[Sustainability](./sustainability.md)** | **[Development Workflow](./development-workflow.md)** | **[AI Usage](./ai-usage.md)**

---

This document describes the development workflow, tools, and practices used in the PokéClicker project.

## Pre-commit Hooks

The project uses automated code quality checks on every commit to maintain consistent code standards.

### Configuration

- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files only
- **ESLint**: JavaScript/TypeScript linting with auto-fix
- **Prettier**: Code formatting enforcement

### What Runs on Commit

When you run `git commit`, the following happens automatically:

1. **ESLint** runs on all staged `.ts` and `.tsx` files
   - Checks for code quality issues
   - Fixes auto-fixable issues
   - Fails commit if unfixable errors exist

2. **Prettier** formats all staged files
   - Ensures consistent code formatting
   - Automatically formats before commit
   - No manual formatting needed

### Setup

Pre-commit hooks are installed automatically when you run:

```bash
pnpm install
```

Husky creates the `.husky/` directory with the necessary git hooks.

### Configuration Files

**`.husky/pre-commit`**:
```bash
echo "Running pre-commit checks..."

# Run frontend checks
cd frontend || exit 1
pnpm run format:check || exit 1
pnpm run lint || exit 1
pnpm run test:run || exit 1
cd ..

# Run backend checks
cd backend || exit 1
pnpm run format:check || exit 1
pnpm run lint || exit 1
pnpm run test:run || exit 1
cd ..
```

**`frontend/package.json` - lint-staged configuration**:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

### Benefits

- **Consistent code quality**: All commits meet minimum quality standards
- **Automatic formatting**: No manual formatting needed
- **Catch errors early**: Issues found before code review
- **Prevent broken code**: Tests can run in pre-commit
- **Team consistency**: Same standards for all developers

### Bypassing Hooks (Not Recommended)

In rare cases where you need to bypass hooks:

```bash
git commit --no-verify -m "Emergency fix"
```

**Warning**: Only use this for emergency situations. Bypassing hooks can introduce code quality issues.

## ESLint Configuration

### Rules

The project uses ESLint with TypeScript support:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ]
}
```

### Key Rules Enforced

- No unused variables
- No console.log in production code
- React hooks dependencies
- TypeScript type safety
- Consistent naming conventions

### Running Manually

```bash
# Lint all files
pnpm run lint

# Fix auto-fixable issues
pnpm run lint --fix

# Lint specific file
pnpm exec eslint src/path/to/file.ts
```

## Prettier Configuration

### Code Style

Prettier enforces consistent formatting:

```json
{
  "trailingComma": "es5",
  "tabWidth": 2,
  "singleQuote": true,
  "bracketSpacing": false,
  "arrowParens": "always"
}
```

### Running Manually

```bash
# Format all files
pnpm run format

# Check formatting without changing files
pnpm run format:check
```

## Git Workflow

### Branch Strategy

**Main Branch**:
- `main` - Production-ready code

**Feature Branches**:
- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `{issue-number}-description` - Issue-based branches

### Commit Message Convention

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**: (parentheses for domain optional)
```bash
git commit -m "feat(auth): add JWT token refresh"
git commit -m "fix(pokedex): resolve search debounce issue"
git commit -m "docs(readme): update setup instructions"
```

### Pull Request Process

1. **Create feature branch** from `main`
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make changes** and commit regularly
   ```bash
   git add .
   git commit -m "feat: implement feature"
   ```

3. **Push to remote**
   ```bash
   git push -u origin feat/my-feature
   ```

4. **Create Pull Request** on GitHub/GitLab
   - Add descriptive title
   - Fill out PR template
   - Request reviews from team

5. **Address feedback** from code review
   ```bash
   git add .
   git commit -m "refactor: address PR feedback"
   git push
   ```

6. **Merge** after approval
   - Squash commits if needed
   - Delete feature branch after merge

## Code Review Guidelines

### What to Look For

**Code Quality**:
- Follows project patterns
- No code duplication
- Proper error handling
- Clear variable names

**Security**:
- No hardcoded secrets
- Input validation
- Proper authentication checks

**Performance**:
- Efficient algorithms
- No unnecessary re-renders
- Proper caching

**Testing**:
- Tests included for new features
- Existing tests still pass
- Good test coverage

**Documentation**:
- Complex logic commented
- README updated if needed
- API documentation current

### Providing Feedback

- Be constructive and respectful
- Explain the "why" behind suggestions
- Distinguish between "must fix" and "nice to have"
- Approve when ready, request changes if needed

## Development Commands

### Frontend

```bash
cd frontend

pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run preview      # Preview production build
pnpm run lint         # Run ESLint
pnpm run format       # Format code with Prettier
pnpm test             # Run tests
pnpm test:coverage    # Run tests with coverage
```

### Backend

```bash
cd backend

pnpm run dev          # Start dev server with tsx watch
pnpm run build        # Compile TypeScript
pnpm start            # Start production server
pnpm run lint         # Run ESLint
pnpm test             # Run tests
pnpm run seed         # Seed database with Pokemon
```

### Root

```bash
pnpm run dev          # Start both frontend and backend
pnpm install          # Install all dependencies (root + workspaces)
```

## Continuous Integration

### CI Pipeline

Automated checks run on every push:

1. **Linting** - ESLint checks
2. **Type checking** - TypeScript compilation
3. **Tests** - Full test suite
4. **Build** - Production build verification

### Local CI Simulation

Run the same checks locally before pushing:

```bash
# Run all checks
pnpm run lint && pnpm test && pnpm run build
```

## Debugging

### Frontend Debugging

**React DevTools**:
- Install browser extension
- Inspect component tree
- View props and state
- Profile performance

**Console Logging**:
```typescript
console.log('Debug:', { variable, state });
```

**VS Code Debugger**:
- Set breakpoints in VS Code
- Use Chrome debugger integration
- Step through code execution

### Backend Debugging

**VS Code Debugger**:

`.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/src/index.ts",
  "runtimeArgs": ["-r", "ts-node/register"]
}
```

**Console Logging**:
```typescript
console.log('Request:', req.body);
```

## Deployment

See [deployment.md](./deployment.md) and [vm-deployment.md](./vm-deployment.md) for deployment instructions.

## Best Practices

1. **Commit often** - Small, focused commits
2. **Write tests** - For new features and bug fixes
3. **Review your own code** - Before requesting review
4. **Keep branches up to date** - Rebase or merge from main regularly
5. **Clean up** - Delete merged branches
6. **Document** - Update docs with significant changes
7. **Communicate** - Discuss major changes with team first

## Troubleshooting

### Pre-commit hooks not running

```bash
# Reinstall hooks
pnpm install
pnpm exec husky install
```

### ESLint errors blocking commit

```bash
# See what's wrong
pnpm run lint

# Auto-fix issues
pnpm run lint --fix

# If unfixable, address manually
```

### Prettier conflicts with ESLint

The project is configured so Prettier and ESLint work together. If conflicts occur:

```bash
# Format first, then lint
pnpm run format
pnpm run lint --fix
```

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
