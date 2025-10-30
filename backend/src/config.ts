import 'dotenv/config';

// Adaptive filter faceting configuration
// Controls when to use dynamic vs static filter counts based on dataset size
// For small datasets: compute counts dynamically per request (updates with filters)
// For large datasets: use precomputed static counts (global, doesn't update)
export const DYNAMIC_FACET_THRESHOLD = parseInt(
  process.env.DYNAMIC_FACET_THRESHOLD || '10000'
); // Use dynamic facets if total Pokemon <= this value
export const FACET_TIMEOUT_MS = parseInt(process.env.FACET_TIMEOUT_MS || '100'); // Max time (ms) for facet aggregation before falling back to static counts
export const USE_STATIC_FALLBACK = process.env.USE_STATIC_FALLBACK !== 'false'; // Enable fallback to precomputed static counts
