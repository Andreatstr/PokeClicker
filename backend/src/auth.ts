import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set');
}

export interface JWTPayload {
  id: string;
  username: string;
}

export interface AuthContext {
  user?: JWTPayload;
}

/**
 * Extracts and verifies JWT token from Authorization header
 * Returns user payload if valid, undefined if invalid/missing
 */
export function authenticateToken(authHeader?: string): JWTPayload | undefined {
  if (!authHeader) {
    return undefined;
  }

  // Expected format: "Bearer <token>"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return undefined;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    // Token is invalid or expired - silently return undefined
    // Error details are logged at the GraphQL resolver level if needed
    return undefined;
  }
}

/**
 * Throws error if user is not authenticated
 * Use this in protected resolvers
 */
export function requireAuth(context: AuthContext): JWTPayload {
  if (!context.user) {
    throw new Error('Authentication required. Please provide a valid token.');
  }
  return context.user;
}

/**
 * Checks if token is expired and throws specific error
 */
export function validateTokenNotExpired(authHeader?: string): void {
  if (!authHeader) {
    throw new Error('No authentication token provided');
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    throw new Error('No authentication token provided');
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Authentication token has expired. Please login again.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid authentication token. Please login again.');
    } else {
      throw new Error('Token validation failed');
    }
  }
}
