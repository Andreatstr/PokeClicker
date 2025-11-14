/**
 * Battle Platform Mapping Utilities
 * Maps Pokemon types to appropriate battle platform/background images
 * Used in battle interface to show thematic backgrounds
 */

/**
 * Gets the full platform image path for a Pokemon based on its types
 *
 * Maps Pokemon types to thematic battle platforms:
 * - Grass/Bug types -> grass platform
 * - Water type -> water platform
 * - Fire/Rock/Fighting/Dragon -> rock platform
 * - Psychic/Ghost -> museum platform
 * - Steel -> steel-gym platform
 * - etc.
 *
 * @param types - Array of Pokemon types (uses primary type for mapping)
 * @returns Absolute path to the platform image (WebP format)
 */
export function getPlatformImage(types: string[]): string {
  // Use the first type to determine the platform
  const primaryType = types[0]?.toLowerCase();

  // Type-to-platform mapping for battle backgrounds
  const typeToPlatform: Record<string, string> = {
    grass: 'grass',
    bug: 'grass',
    fire: 'rock',
    water: 'water',
    ice: 'ice',
    electric: 'lightdirt',
    ground: 'sand',
    rock: 'rock',
    psychic: 'museum',
    ghost: 'museum',
    steel: 'steel-gym',
    fighting: 'rock',
    poison: 'mud',
    dragon: 'rock',
    fairy: 'forest',
    dark: 'forest',
    flying: 'grass',
    normal: 'grass',
  };

  const platformType = typeToPlatform[primaryType] || 'grass';
  // Note: /project2/ is the base path configured in vite.config.ts
  return `/project2/plattforms/${platformType}.webp`;
}
