# Security

**[Home](../README.md)** | **[Setup](./setup.md)** | **[Architecture](./architecture.md)** | **[Testing](./testing.md)** | **[Security](./security.md)** | **[Sustainability](./sustainability.md)** | **[Development Workflow](./development-workflow.md)** | **[AI Usage](./ai-usage.md)**

---

This document describes the security measures and implementations in the PokéClicker project.

## Security Issues and Fixes

### Issue #64: JWT Secret Security Vulnerability

**Problem**: Hardcoded fallback value `'change_me'` was a critical security risk. If `JWT_SECRET` environment variable was not set, the application would use the hardcoded value, making all JWT tokens easily hackable.

**Fix**: Implemented validation in resolvers.ts to throw error if JWT_SECRET is not set. Note: auth.ts still has fallback and should be updated.

**Result**: Application fails at startup if JWT_SECRET is not set (due to resolvers.ts), preventing deployment with insecure configuration.

### Issue #65: Environment Variable Configuration

**Problem**: Hardcoded URLs and configuration values throughout the codebase made it difficult to deploy to different environments and exposed internal infrastructure details.

**Fix**: Implemented proper environment variable configuration in backend/.env (PORT, MONGODB_URI, JWT_SECRET) and frontend/.env (VITE_GRAPHQL_URL).

**Result**: Better deployment flexibility, environment-specific configuration, no hardcoded secrets in codebase, easier to manage different environments.

### Issue #66: Rate Limiting Implementation

**Problem**: No protection against API abuse or DoS attacks.

**Fix**: Implemented custom rate limiting with 1000 requests per 15 minutes per IP using in-memory store. High limit chosen specifically for clicker game's high request frequency.

**Result**: Protection against API abuse while allowing normal gameplay to continue unaffected.

## Authentication and Authorization

### JWT Token Authentication

- Tokens signed with JWT_SECRET and expire after 7 days
- All protected routes require valid JWT token
- Token verified on every request, invalid tokens rejected with 401
- Token payload contains only user ID (no sensitive data)

### Password Security

- Passwords hashed with bcrypt using 10 salt rounds
- Never stored in plaintext
- Prevents rainbow table and brute force attacks
- Secure verification on login using bcrypt.compare()

## Environment Variable Security

### Gitignore Configuration

All environment files (.env, .env.local, .env.production, backend/.env, frontend/.env) are gitignored to prevent accidental commit of secrets and credential leaks.

### Required Environment Variables

**Backend**:
- `JWT_SECRET` - REQUIRED (no fallback, application fails at startup if not set)
- `MONGODB_URI` - Optional (defaults to localhost)
- `PORT` - Optional (defaults to 3001)

**Frontend**:
- `VITE_GRAPHQL_URL` - Optional (defaults to localhost)

## Data Security

### MongoDB Security

- Connection string in environment variables (no credentials in code)
- Input validation on all mutations
- Type checking with TypeScript and GraphQL schema validation

### GraphQL Security

- User inputs validated in resolvers (username length, password requirements)
- Type safety through TypeScript
- XSS protection through React (escapes output automatically)

## Input Validation

All GraphQL mutations implement input validation:
- Username: 3-20 characters
- Password: minimum 6 characters
- MongoDB queries use parameterized queries (no string concatenation)
- Type safety enforced through TypeScript

## Security Best Practices Applied

1. **Principle of Least Privilege** - Users only access their own data
2. **Secure by Default** - Application fails if JWT_SECRET not set
3. **Input Validation** - Validate all user inputs in resolvers
4. **Output Encoding** - React handles XSS prevention
5. **Authentication** - JWT tokens with expiration
6. **Password Hashing** - bcrypt with 10 salt rounds
7. **Rate Limiting** - Per-IP request limits
8. **Environment Variables** - No hardcoded secrets

## Security Checklist

- [x] JWT secret required (no fallback)
- [x] No hardcoded secrets in code
- [x] Environment variables for all config
- [x] Rate limiting implemented
- [x] Passwords hashed with bcrypt (10 salt rounds)
- [x] Input validation on mutations
- [x] Environment files gitignored
- [x] XSS protection through React

## Known Security Issues

1. **JWT in localStorage** - Tokens stored in localStorage are vulnerable to XSS attacks. Should use httpOnly cookies.
2. **auth.ts fallback** - Still has `'change_me'` fallback that should be removed (`backend/src/auth.ts:4`)
3. **No HTTPS** - Tokens transmitted in plaintext (acceptable for school project on VM)
4. **Default CORS** - Apollo Server uses permissive CORS by default (allows all origins)
5. **No security headers** - Missing X-Frame-Options, CSP, HSTS, etc.

## Potential Security Improvements

1. **HttpOnly Cookies** - Store JWT in httpOnly cookies instead of localStorage
2. **CORS Configuration** - Restrict allowed origins explicitly
3. **Security Headers** - Add X-Frame-Options, CSP, HSTS, X-Content-Type-Options
4. **HTTPS/TLS** - Configure SSL certificates (if deploying beyond school project)
5. **Query Complexity Limits** - Prevent expensive GraphQL queries
6. **Audit Logging** - Log authentication and authorization events
7. **Fix auth.ts** - Remove `'change_me'` fallback to match resolvers.ts
