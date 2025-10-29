/**
 * UI Configuration Constants
 * Centralized location for all UI timing, pagination, and UX constants
 */

export const UIConfig = {
  /**
   * Pokédex pagination and search
   */
  pokedex: {
    /** Number of Pokemon per page */
    itemsPerPage: 20,
    /** Search input debounce delay in milliseconds */
    searchDebounceDelay: 300,
  },

  /**
   * Error display settings
   */
  errors: {
    /** Auto-dismiss duration for error messages in milliseconds */
    autoDismissDuration: 5000, // 5 seconds
    /** Maximum number of errors to show at once */
    maxConcurrentErrors: 5,
  },

  /**
   * Animation durations (in milliseconds)
   */
  animations: {
    /** Standard fade transition */
    fade: 300,
    /** Quick state change */
    quick: 150,
    /** Medium duration for modals/overlays */
    medium: 500,
    /** Long duration for major transitions */
    long: 1000,
  },

  /**
   * Image caching settings
   */
  cache: {
    /** Delay between image preload requests in milliseconds */
    preloadDelay: 100,
    /** Maximum cache age in milliseconds (7 days) */
    maxCacheAge: 7 * 24 * 60 * 60 * 1000,
    /** Rate limit retry delay in milliseconds */
    rateLimitRetryDelay: 1000,
  },
} as const;

// Type-safe access to config
export type UIConfigType = typeof UIConfig;
