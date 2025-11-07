/**
 * JWT token validation utilities
 */

/**
 * Check if a JWT token has expired
 * @param token - The JWT token to validate
 * @returns true if token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true; // Invalid token format
    }

    // Decode the payload (base64url)
    const payload = JSON.parse(atob(parts[1]));

    // Check expiration time
    if (!payload.exp) {
      return true; // No expiration time in token
    }

    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();

    return now >= exp;
  } catch {
    // Invalid token format or decoding error
    return true;
  }
}
