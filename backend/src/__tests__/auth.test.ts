import {describe, it, expect, beforeEach, vi} from 'vitest';
import jwt from 'jsonwebtoken';
import {
  authenticateToken,
  requireAuth,
  validateTokenNotExpired,
  type JWTPayload,
  type AuthContext,
} from '../auth';

describe('Auth Module', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
  const mockPayload: JWTPayload = {
    id: '123',
    username: 'testuser',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should return user payload for valid token with Bearer prefix', () => {
      const token = jwt.sign(mockPayload, JWT_SECRET, {expiresIn: '1h'});
      const authHeader = `Bearer ${token}`;

      const result = authenticateToken(authHeader);

      expect(result).toBeDefined();
      expect(result?.id).toBe('123');
      expect(result?.username).toBe('testuser');
    });

    it('should return user payload for valid token without Bearer prefix', () => {
      const token = jwt.sign(mockPayload, JWT_SECRET, {expiresIn: '1h'});

      const result = authenticateToken(token);

      expect(result).toBeDefined();
      expect(result?.id).toBe('123');
      expect(result?.username).toBe('testuser');
    });

    it('should return undefined for missing authHeader', () => {
      const result = authenticateToken(undefined);
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty authHeader', () => {
      const result = authenticateToken('');
      expect(result).toBeUndefined();
    });

    it('should return undefined for invalid token', () => {
      const result = authenticateToken('Bearer invalid_token');
      expect(result).toBeUndefined();
    });

    it('should return undefined for expired token', () => {
      const expiredToken = jwt.sign(mockPayload, JWT_SECRET, {
        expiresIn: '-1h',
      });
      const authHeader = `Bearer ${expiredToken}`;

      const result = authenticateToken(authHeader);
      expect(result).toBeUndefined();
    });

    it('should return undefined for token with wrong secret', () => {
      const tokenWithWrongSecret = jwt.sign(mockPayload, 'wrong_secret', {
        expiresIn: '1h',
      });
      const authHeader = `Bearer ${tokenWithWrongSecret}`;

      const result = authenticateToken(authHeader);
      expect(result).toBeUndefined();
    });
  });

  describe('requireAuth', () => {
    it('should return user payload when user is authenticated', () => {
      const context: AuthContext = {
        user: mockPayload,
      };

      const result = requireAuth(context);
      expect(result).toEqual(mockPayload);
    });

    it('should throw error when user is not authenticated', () => {
      const context: AuthContext = {};

      expect(() => requireAuth(context)).toThrow(
        'Authentication required. Please provide a valid token.'
      );
    });

    it('should throw error when user is undefined', () => {
      const context: AuthContext = {
        user: undefined,
      };

      expect(() => requireAuth(context)).toThrow(
        'Authentication required. Please provide a valid token.'
      );
    });
  });

  describe('validateTokenNotExpired', () => {
    it('should not throw for valid token', () => {
      const token = jwt.sign(mockPayload, JWT_SECRET, {expiresIn: '1h'});
      const authHeader = `Bearer ${token}`;

      expect(() => validateTokenNotExpired(authHeader)).not.toThrow();
    });

    it('should throw for missing authHeader', () => {
      expect(() => validateTokenNotExpired(undefined)).toThrow(
        'No authentication token provided'
      );
    });

    it('should throw for empty authHeader', () => {
      expect(() => validateTokenNotExpired('')).toThrow(
        'No authentication token provided'
      );
    });

    it('should throw specific error for expired token', () => {
      const expiredToken = jwt.sign(mockPayload, JWT_SECRET, {
        expiresIn: '-1h',
      });
      const authHeader = `Bearer ${expiredToken}`;

      expect(() => validateTokenNotExpired(authHeader)).toThrow(
        'Authentication token has expired. Please login again.'
      );
    });

    it('should throw specific error for invalid token', () => {
      const authHeader = 'Bearer invalid_token_format';

      expect(() => validateTokenNotExpired(authHeader)).toThrow(
        'Invalid authentication token. Please login again.'
      );
    });

    it('should throw error for token with wrong secret', () => {
      const tokenWithWrongSecret = jwt.sign(mockPayload, 'wrong_secret', {
        expiresIn: '1h',
      });
      const authHeader = `Bearer ${tokenWithWrongSecret}`;

      expect(() => validateTokenNotExpired(authHeader)).toThrow(
        'Invalid authentication token. Please login again.'
      );
    });

    it('should work with token without Bearer prefix', () => {
      const token = jwt.sign(mockPayload, JWT_SECRET, {expiresIn: '1h'});

      expect(() => validateTokenNotExpired(token)).not.toThrow();
    });
  });
});
