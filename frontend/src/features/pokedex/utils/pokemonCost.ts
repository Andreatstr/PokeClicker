/**
 * Helper to calculate Pokemon purchase cost (matches backend)
 * Exponential pricing by tier: 100 × 1.5^(tier)
 * Pokemon are grouped into tiers of 10
 * Tier 0 (ID 1-10): 100, Tier 1 (ID 11-20): 150, Tier 2 (ID 21-30): 225, etc.
 */
export function getPokemonCost(pokemonId: number): number {
  const tier = Math.floor(pokemonId / 10);
  return Math.floor(100 * Math.pow(1.5, tier));
}

/**
 * Returns the background image URL for a Pokemon based on its primary type
 */
export function getBackgroundImageUrl(types: string[]): string {
  const primaryType = types[0];
  return `${import.meta.env.BASE_URL}pokemon-type-bg/${primaryType}.webp`;
}
