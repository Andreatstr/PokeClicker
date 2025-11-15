/**
 * Pokemon Base Stat Total (BST) calculator
 * Calculates BST from Pokemon stats fetched from PokeAPI
 */
import {fetchPokemonById, PokemonStats} from './pokeapi.js';

/**
 * Legendary Pokemon IDs for 600+ BST pricing boost
 */
const KNOWN_LEGENDARIES = new Set([
  144,
  145,
  146, // Legendary birds (Articuno, Zapdos, Moltres)
  150,
  151, // Mewtwo, Mew
  243,
  244,
  245, // Legendary beasts (Raikou, Entei, Suicune)
  249,
  250, // Lugia, Ho-Oh
  377,
  378,
  379,
  380,
  381,
  382,
  383,
  384, // Regis + Weather trio + Rayquaza
  480,
  481,
  482,
  483,
  484,
  485,
  486,
  487,
  488, // Lake trio + Creation trio + others
  493, // Arceus
  494, // Victini
  638,
  639,
  640,
  641,
  642,
  643,
  644,
  645,
  646, // Unova legendaries
  716,
  717,
  718, // Xerneas, Yveltal, Zygarde
  785,
  786,
  787,
  788,
  789,
  790,
  791,
  792, // Alola guardians + Cosmog line + Necrozma
  888,
  889,
  890, // Zacian, Zamazenta, Eternatus
  894,
  895,
  896,
  897,
  898, // Regieleki, Regidrago, Glastrier, Spectrier, Calyrex
  905, // Enamorus
  1001,
  1002,
  1003,
  1004,
  1005,
  1006,
  1007,
  1008,
  1009,
  1010,
  1014,
  1015,
  1016,
  1017, // Paldea legendaries
]);

/**
 * Calculates Base Stat Total from PokemonStats object
 *
 * @param stats - Pokemon stats from PokeAPI
 * @returns Total of all base stats
 */
function calculateBST(stats: PokemonStats): number {
  return (
    stats.hp +
    stats.attack +
    stats.defense +
    stats.spAttack +
    stats.spDefense +
    stats.speed
  );
}

/**
 * Gets BST for a Pokemon by fetching from PokeAPI
 * PokeAPI has its own cache layer, so this is efficient
 *
 * @param pokemonId - National Pokedex number (1-1025)
 * @returns Base Stat Total
 */
export async function getBSTForPokemon(pokemonId: number): Promise<number> {
  try {
    const pokemon = await fetchPokemonById(pokemonId);

    if (!pokemon) {
      console.error(
        `fetchPokemonById returned null/undefined for Pokemon ${pokemonId}, using estimate`
      );
    } else if (!pokemon.stats) {
      console.error(
        `Pokemon ${pokemonId} (${pokemon.name}) has no stats data, using estimate`
      );
    } else {
      // Successfully got Pokemon with stats - calculate and return BST
      const bst = calculateBST(pokemon.stats);
      return bst;
    }
  } catch (error) {
    // If fetch fails, use generation-based estimate
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `Failed to fetch Pokemon ${pokemonId} from PokeAPI: ${errorMessage}, using estimate`
    );
  }

  // Estimate BST based on Pokemon ID (generation averages) as fallback
  let estimatedBST: number;

  if (pokemonId <= 151)
    estimatedBST = 420; // Gen 1
  else if (pokemonId <= 251)
    estimatedBST = 430; // Gen 2
  else if (pokemonId <= 386)
    estimatedBST = 435; // Gen 3
  else if (pokemonId <= 493)
    estimatedBST = 440; // Gen 4
  else if (pokemonId <= 649)
    estimatedBST = 445; // Gen 5
  else if (pokemonId <= 721)
    estimatedBST = 435; // Gen 6
  else if (pokemonId <= 809)
    estimatedBST = 440; // Gen 7
  else if (pokemonId <= 905)
    estimatedBST = 445; // Gen 8
  else estimatedBST = 450; // Gen 9+

  // Legendaries typically have higher BST
  if (KNOWN_LEGENDARIES.has(pokemonId)) {
    estimatedBST = Math.max(estimatedBST + 200, 600);
  }

  return estimatedBST;
}
