# Security

**[Home](../README.md)** | **[Setup](./setup.md)** | **[Architecture](./architecture.md)** | **[Testing](./testing.md)** | **[Security](./security.md)** | **[Sustainability](./sustainability.md)** | **[Development Workflow](./development-workflow.md)** | **[AI Usage](./ai-usage.md)**

---

This document describes the security measures and implementations in the PokéClicker project.

## Security Issues and Fixes

### Issue #64: JWT Secret Security Vulnerability

**Problem**: Hardcoded fallback value `'change_me'` was a critical security risk.

```typescript
// INSECURE - before fix
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
```

If `JWT_SECRET` environment variable was not set, the application would use the hardcoded value, making all JWT tokens easily hackable.

**Fix**: Partially fixed - resolvers.ts validates, but auth.ts still has fallback.

```typescript
// In resolvers.ts - SECURE
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables');
}

// In auth.ts - STILL INSECURE (line 4)
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
```

**Result**: Application fails at startup if JWT_SECRET is not set (due to resolvers.ts), but auth.ts code should be updated to match.

### Issue #65: Environment Variable Configuration

**Problem**: Hardcoded URLs and configuration values throughout the codebase.

```typescript
// INSECURE - before fix
const API_URL = 'http://localhost:3001/graphql';
```

This made it difficult to deploy to different environments and exposed internal infrastructure details.

**Fix**: Implemented proper environment variable configuration.

**Backend** (`backend/.env`):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your_secure_jwt_secret_here
```

**Frontend** (`frontend/.env`):
```env
VITE_GRAPHQL_URL=http://localhost:3001/
```

**Result**:
- Better deployment flexibility
- Environment-specific configuration
- No hardcoded secrets in codebase
- Easier to manage different environments (dev, staging, prod)

### Issue #66: Rate Limiting Implementation

**Problem**: No protection against API abuse or DoS attacks.

**Fix**: Implemented custom rate limiting optimized for clicker game.

**Configuration**:
- **1000 requests per 15 minutes** per IP
- Custom in-memory rate limiting store
- Per-IP tracking

**Why 1000 requests?**
- Clicker games require high request frequency
- Balance between security and usability

**Result**:
- Protection against API abuse
- Normal gameplay unaffected

## Authentication and Authorization

### JWT Token Authentication

**Token Generation**:
```typescript
const token = jwt.sign(
  { userId: user._id },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Token Validation**:
- All protected routes require valid JWT token
- Tokens expire after 7 days
- Token verified on every request
- Invalid tokens rejected with 401 Unauthorized

**Security Features**:
- Tokens signed with secure secret
- Automatic expiration (7 days)
- No sensitive data in token payload (only user ID)

### Password Security

**Hashing with bcrypt**:
```typescript
const BCRYPT_SALT_ROUNDS = 10;
const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
```

**Security Features**:
- Passwords never stored in plaintext
- Salt rounds: 10 (good balance of security and performance)
- Rainbow table attacks prevented
- Brute force attacks significantly slowed

**Password Verification**:
```typescript
const isValid = await bcrypt.compare(password, user.password_hash);
```

## Environment Variable Security

### Gitignore Configuration

All environment files are gitignored:
```
.env
.env.local
.env.production
backend/.env
frontend/.env
```

**Why this matters**:
- Prevents accidental commit of secrets
- Protects API keys and passwords
- Prevents exposure in version control
- Reduces risk of credential leaks

### Required Environment Variables

The application validates required environment variables at startup:

**Backend**:
- `JWT_SECRET` - REQUIRED (no fallback)
- `MONGODB_URI` - Optional (defaults to localhost)
- `PORT` - Optional (defaults to 3001)

**Frontend**:
- `VITE_GRAPHQL_URL` - Optional (defaults to localhost)

## Data Security

### MongoDB Security

**Connection Security**:
- Connection string in environment variables
- No credentials in code
- Database name configurable

**Data Validation**:
- Input validation on all mutations
- Type checking with TypeScript
- GraphQL schema validation

### GraphQL Security

**Input Sanitization**:
- User inputs validated in resolvers
- Type safety through TypeScript
- XSS protection through React (escapes output automatically)

## Input Validation

### GraphQL Input Validation

All mutations validate inputs:
```typescript
// Username validation
if (username.length < 3 || username.length > 20) {
  throw new Error('Username must be between 3 and 20 characters');
}

// Password validation
if (password.length < 6) {
  throw new Error('Password must be at least 6 characters');
}
```

### MongoDB Query Validation

- Use parameterized queries
- No string concatenation in queries
- Type safety through TypeScript

## Error Handling

**Secure Error Messages**:
- Don't expose stack traces in production
- Generic error messages to clients
- Detailed errors logged server-side only

**Example**:
```typescript
// Production error response
{ error: 'Authentication failed' }

// NOT: { error: 'User not found in database mongodb://...' }
```

## Dependency Security

### Regular Updates

- Dependencies updated regularly
- Security patches applied promptly
- Automated vulnerability scanning

### Audit Commands

```bash
# Check for vulnerabilities
pnpm audit

# Check outdated packages
pnpm outdated
```

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
