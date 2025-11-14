/**
 * JWT token validation utilities
 *
 * Security Note: This is CLIENT-SIDE validation only for UX purposes.
 * Never trust client-side JWT validation for security - always validate on the server.
 * This helps avoid unnecessary API calls with expired tokens.
 */

/**
 * Check if a JWT token has expired
 *
 * Performs client-side expiration check by decoding the JWT payload.
 * Does NOT verify the signature - signature validation must happen server-side.
 *
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
    // Note: atob() is safe here as we're only reading, not trusting the data
    const payload = JSON.parse(atob(parts[1]));

    // Check expiration time (exp claim is in seconds since epoch)
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
