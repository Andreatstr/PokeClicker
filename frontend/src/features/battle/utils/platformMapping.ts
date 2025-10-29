/**
 * Gets the full platform image path for a Pokemon based on its types
 */
export function getPlatformImage(types: string[]): string {
  // Use the first type to determine the platform
  const primaryType = types[0]?.toLowerCase();

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
  return `/project2/plattforms/${platformType}.webp`;
}
