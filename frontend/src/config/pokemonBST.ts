/**
 * Pokemon BST (Base Stat Total) estimation utility
 * Used as fallback when API price data is unavailable
 */

/**
 * Estimates BST for Pokemon based on generation averages
 * This is a fallback estimation - actual BST data comes from the API
 *
 * @param pokemonId - Pokemon ID (1-1025)
 * @returns Estimated Base Stat Total
 */
export function estimateBST(pokemonId: number): number {
  // Estimate based on ID ranges (generation averages)
  if (pokemonId <= 151) return 420; // Gen 1 (Kanto) average
  if (pokemonId <= 251) return 430; // Gen 2 (Johto) average
  if (pokemonId <= 386) return 435; // Gen 3 (Hoenn) average
  if (pokemonId <= 493) return 440; // Gen 4 (Sinnoh) average
  if (pokemonId <= 649) return 445; // Gen 5 (Unova) average
  if (pokemonId <= 721) return 435; // Gen 6 (Kalos) average
  if (pokemonId <= 809) return 440; // Gen 7 (Alola) average
  if (pokemonId <= 905) return 445; // Gen 8 (Galar) average
  return 450; // Gen 9+ (Paldea) average
}
