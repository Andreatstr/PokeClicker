import {useState, useEffect, useCallback, useMemo} from 'react';
import {logger} from '@/lib/logger';
import {type PokedexPokemon} from '@features/pokedex';
import {useAuth} from '@features/auth/hooks/useAuth';
import {
  usePokemonBasicBulk,
  type PokemonBasic,
} from '../../profile/hooks/usePokemonBasic';
import {useQuery, gql} from '@apollo/client';
import {POKEMON_BY_BST_RANGE} from '@/lib/graphql/queries';

// Map dimensions
const MAP_WIDTH = 10560;
const MAP_HEIGHT = 6080;

// Starter Pokémon pool (weak BST range 180–250)
// Adjust IDs to match your pokedex schema
const STARTER_POKEMON_IDS = [
  746, 191, 824, 872, 298, 401, 10, 265, 13, 280, 664, 129, 789, 349, 266, 11,
  268, 172, 14, 194,
];
// Wishiwashi, Sunkern, Blisbug, Snom, Azurill, Kricketot, Caterpie, Wurmple, Weedle, Ralts, Scatterbug, Magikarp, Cosmog, Feebas, Silcoon, Metapod, Cascoon, Pichu, Kakuna, Wooper

interface CollisionChecker {
  isPositionWalkable: (x: number, y: number) => boolean;
}

interface PokemonSpawn {
  spawnId: string; // Unique identifier for this specific spawn
  pokemon: PokedexPokemon;
  x: number;
  y: number;
}

interface PokemonState {
  wildPokemon: PokemonSpawn[];
  nearbyPokemon: PokemonSpawn | null;
  getVisiblePokemon: (
    camera: {x: number; y: number},
    renderSize: {width: number; height: number}
  ) => PokemonSpawn[];
  removePokemon: (spawnId: string) => void;
}

const POKEMON_STORAGE_KEY = 'pokemonMapSpawns';
const NUM_SPAWNS = 50;

/**
 * Generate a target BST based on player's owned Pokemon strength
 *
 * New players (no owned Pokemon): Spawn weak Pokemon (BST 175-215)
 * - Matches starter Pokemon BST (175) for gentle difficulty curve
 *
 * Experienced players: Spawn based on average BST of owned Pokemon
 * - 70%: Around player's average BST (±30 BST variance)
 * - 20%: Slightly stronger (average + 20 to 50 BST)
 * - 10%: Challenge Pokemon (average + 25 to 50 BST)
 *
 * Uses Box-Muller transform for normal distribution around player level
 * Balance improvements: Reduced challenge variance to prevent exponential price jumps
 */
function generateTargetBST(ownedPokemon: PokedexPokemon[]): number {
  // New players: spawn weak Pokemon (175-215 BST range)
  // This matches the starter Pokemon BST (175) and provides gentle difficulty curve
  if (ownedPokemon.length === 0) {
    return Math.floor(Math.random() * 41) + 175; // 175-215
  }

  // Calculate average BST of owned Pokemon
  const validBSTs = ownedPokemon
    .map((p) => p.bst)
    .filter((bst): bst is number => bst !== null && bst !== undefined);

  if (validBSTs.length === 0) {
    // Fallback if no BST data available - use same range as new players
    return Math.floor(Math.random() * 41) + 175;
  }

  const averageBST =
    validBSTs.reduce((sum, bst) => sum + bst, 0) / validBSTs.length;

  // 10% chance: Challenge Pokemon (+25 to +50 BST)
  // Reduced from +50-100 to prevent exponential price jumps
  if (Math.random() < 0.1) {
    const boost = Math.floor(Math.random() * 26) + 25;
    return Math.min(720, Math.floor(averageBST + boost));
  }

  // 20% chance: Slightly stronger (+20 to +50 BST)
  if (Math.random() < 0.2) {
    const boost = Math.floor(Math.random() * 31) + 20;
    return Math.min(720, Math.floor(averageBST + boost));
  }

  // 70% chance: Around player's level (±30 BST variance)
  const stdDev = 30; // Standard deviation for variance

  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  const targetBST = Math.round(averageBST + z * stdDev);

  // Clamp to valid BST range (180 minimum, 720 maximum)
  return Math.max(180, Math.min(720, targetBST));
}

/**
 * Find Pokemon with BST closest to target using binary search
 * O(log n) complexity instead of O(n) linear search
 *
 * @param sortedPokemon - Array of Pokemon sorted by BST (ascending)
 * @param targetBST - Target BST value to find closest match
 * @returns Pokemon with BST closest to target
 */
function findClosestBST(
  sortedPokemon: PokedexPokemon[],
  targetBST: number
): PokedexPokemon {
  if (sortedPokemon.length === 0) {
    throw new Error('Cannot find closest BST in empty array');
  }

  let left = 0;
  let right = sortedPokemon.length - 1;
  let closest = sortedPokemon[0];
  let closestDiff = Math.abs((closest.bst || 0) - targetBST);

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const pokemon = sortedPokemon[mid];
    const currentBST = pokemon.bst || 0;
    const currentDiff = Math.abs(currentBST - targetBST);

    // Update closest if this Pokemon is closer
    if (currentDiff < closestDiff) {
      closest = pokemon;
      closestDiff = currentDiff;
    }

    // Also check neighbors for edge cases
    if (mid > 0) {
      const leftNeighbor = sortedPokemon[mid - 1];
      const leftDiff = Math.abs((leftNeighbor.bst || 0) - targetBST);
      if (leftDiff < closestDiff) {
        closest = leftNeighbor;
        closestDiff = leftDiff;
      }
    }

    if (mid < sortedPokemon.length - 1) {
      const rightNeighbor = sortedPokemon[mid + 1];
      const rightDiff = Math.abs((rightNeighbor.bst || 0) - targetBST);
      if (rightDiff < closestDiff) {
        closest = rightNeighbor;
        closestDiff = rightDiff;
      }
    }

    // Binary search: move towards target
    if (currentBST < targetBST) {
      left = mid + 1;
    } else if (currentBST > targetBST) {
      right = mid - 1;
    } else {
      // Exact match found
      return pokemon;
    }
  }

  return closest;
}

function normalizeBasicToPokedex(p: PokemonBasic): PokedexPokemon {
  return {
    id: p.id,
    name: p.name,
    types: p.types,
    sprite: p.sprite,
    pokedexNumber: p.id, // fallback: use id as pokedexNumber
    stats: p.stats ?? null,
    height: null,
    weight: null,
    abilities: null,
    evolution: null,
    isOwned: false,
    bst: null,
    price: null,
  };
}

/**
 * Hook managing wild Pokemon spawning system with progression-based difficulty
 *
 * Features:
 * - 50 Pokemon spawned across map at random walkable locations
 * - User-specific spawn persistence in localStorage
 * - Progression-based spawning (starter Pokemon for new players, scaled difficulty for experienced)
 * - Proximity detection (80px radius) for battle encounters
 * - Automatic respawn when Pokemon caught (maintains 50 active spawns)
 * - Viewport culling for rendering performance
 *
 * Spawn mechanics:
 * - Initial spawn: Uses progression algorithm to select appropriate Pokemon
 * - Respawn on catch: Generates new Pokemon at same difficulty level
 * - Position validation: Only spawns at walkable collision map locations
 * - User isolation: Each user has separate spawn set that persists
 *
 * @param collisionChecker - Collision detection for spawn position validation
 * @param playerPosition - Current player position for proximity checks
 * @returns Wild Pokemon state and management functions
 */
export function usePokemonSpawning(
  collisionChecker: CollisionChecker & {collisionMapLoaded?: boolean},
  playerPosition: {x: number; y: number}
): PokemonState {
  const {user} = useAuth();

  const [wildPokemon, setWildPokemon] = useState<PokemonSpawn[]>([]);
  const [nearbyPokemon, setNearbyPokemon] = useState<PokemonSpawn | null>(null);

  // Create user-specific storage key
  const userStorageKey = user?._id
    ? `${POKEMON_STORAGE_KEY}_${user._id}`
    : POKEMON_STORAGE_KEY;

  // Get player's owned Pokemon for BST-based spawning
  // Memoize to prevent dependency changes on every render
  const ownedPokemonIds = useMemo(
    () => user?.owned_pokemon_ids || [],
    [user?.owned_pokemon_ids]
  );

  // Fetch a large pool of Pokemon to spawn from (based on progression)
  const [allPokemon, setAllPokemon] = useState<PokedexPokemon[]>([]);

  // Pre-sorted Pokemon by BST for efficient binary search
  // Memoize to avoid re-sorting on every render
  const sortedPokemonByBST = useMemo(() => {
    return [...allPokemon]
      .filter((p) => p.bst !== null && p.bst !== undefined)
      .sort((a, b) => (a.bst || 0) - (b.bst || 0));
  }, [allPokemon]);

  // Restore Pokemon spawns from user-specific localStorage when user changes
  useEffect(() => {
    if (user?._id) {
      const saved = localStorage.getItem(userStorageKey);

      if (saved) {
        try {
          const restored = JSON.parse(saved);
          setWildPokemon(restored);
        } catch (e) {
          logger.logError(e, 'RestorePokemonSpawns');
          setWildPokemon([]); // Clear on error
        }
      } else {
        // No saved data for this user, start fresh
        setWildPokemon([]);
      }
    } else {
      // User logged out, clear spawns
      setWildPokemon([]);
    }
  }, [user?._id, userStorageKey]);

  // Fetch starter Pokemon for initial spawning (old commit logic)
  const {data, loading} = usePokemonBasicBulk(STARTER_POKEMON_IDS);

  // Fetch owned Pokemon metadata to calculate BST range for respawning
  // This is a lightweight query that only fetches BST values, not full Pokemon data
  const {data: ownedPokemonData} = useQuery<{
    pokemonByIds: PokedexPokemon[];
  }>(
    gql`
      query OwnedPokemonBST($ids: [Int!]!) {
        pokemonByIds(ids: $ids) {
          id
          bst
        }
      }
    `,
    {
      variables: {ids: ownedPokemonIds},
      skip: ownedPokemonIds.length === 0,
    }
  );

  // Calculate BST range to fetch for respawning based on player progression
  const bstRange = useMemo(() => {
    const ownedPokemon = ownedPokemonData?.pokemonByIds || [];

    // Calculate average BST of owned Pokemon
    const validBSTs = ownedPokemon
      .map((p) => p.bst)
      .filter((bst): bst is number => bst !== null && bst !== undefined);

    if (validBSTs.length === 0) {
      // Fallback to starter range (matches new player spawn range)
      return {minBST: 175, maxBST: 215};
    }

    const averageBST =
      validBSTs.reduce((sum, bst) => sum + bst, 0) / validBSTs.length;

    // Logarithmic BST range scaling to prevent exponential price jumps
    // - 70%: average ± 30 BST
    // - 20%: average + 20 to 50 BST
    // - 10%: average + 25 to 50 BST (reduced from +50-100)
    // Range grows logarithmically: min 30, max 60 based on progression
    const bstRange = Math.min(60, 20 + Math.log10(averageBST) * 10);
    const minBST = Math.max(180, Math.floor(averageBST - bstRange));
    const maxBST = Math.min(720, Math.floor(averageBST + bstRange));

    return {minBST, maxBST};
  }, [ownedPokemonData]);

  // Fetch Pokemon in BST range for respawning (only when needed)
  // This is used when catching Pokemon to spawn new ones
  const {data: bstRangeData} = useQuery<{
    pokemonByBSTRange: PokedexPokemon[];
  }>(POKEMON_BY_BST_RANGE, {
    variables: {
      minBST: bstRange.minBST,
      maxBST: bstRange.maxBST,
      limit: 200,
    },
    skip: !user?._id || wildPokemon.length === 0, // Only fetch after initial spawn
  });

  // Set allPokemon for respawning
  useEffect(() => {
    if (bstRangeData?.pokemonByBSTRange) {
      setAllPokemon(bstRangeData.pokemonByBSTRange);
    }
  }, [bstRangeData]);

  // Generate random walkable position on the map
  const getRandomWalkablePosition = useCallback((): {x: number; y: number} => {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * MAP_WIDTH);
      const y = Math.floor(Math.random() * MAP_HEIGHT);

      if (collisionChecker.isPositionWalkable(x, y)) {
        return {x, y};
      }
      attempts++;
    }

    // Fallback to center of map if can't find walkable position
    return {x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2};
  }, [collisionChecker]);

  // Save Pokemon spawns to user-specific localStorage whenever they change
  useEffect(() => {
    if (wildPokemon.length > 0) {
      localStorage.setItem(userStorageKey, JSON.stringify(wildPokemon));
    }
  }, [wildPokemon, userStorageKey]);

  // Spawn starter Pokémon once pokedex data is available
  useEffect(() => {
    const starterPokemon = data?.pokemonByIds || [];

    if (
      !loading &&
      starterPokemon.length > 0 &&
      wildPokemon.length === 0 &&
      collisionChecker.collisionMapLoaded
    ) {
      const startSpawns: PokemonSpawn[] = [];

      for (let i = 0; i < NUM_SPAWNS; i++) {
        const starterId =
          STARTER_POKEMON_IDS[
            Math.floor(Math.random() * STARTER_POKEMON_IDS.length)
          ];

        const pokemon = starterPokemon.find((p) => p.id === starterId);
        if (!pokemon) continue; // skip if not found

        const position = getRandomWalkablePosition();

        startSpawns.push({
          spawnId: `${pokemon.id}-${position.x}-${position.y}-${Date.now()}-${i}`,
          pokemon: normalizeBasicToPokedex(pokemon),
          x: position.x,
          y: position.y,
        });
      }

      setWildPokemon(startSpawns);
    }
  }, [
    data?.pokemonByIds,
    loading,
    wildPokemon.length,
    getRandomWalkablePosition,
    collisionChecker.collisionMapLoaded,
  ]);

  // Remove a caught Pokemon and spawn a new one based on progression
  // This uses the optimized BST range query + binary search
  const removePokemon = useCallback(
    (spawnId: string) => {
      setWildPokemon((current) => {
        // Remove the caught Pokemon by its unique spawn ID
        const filtered = current.filter((spawn) => spawn.spawnId !== spawnId);

        // Spawn a new Pokemon based on player's current BST level
        if (allPokemon.length > 0) {
          // Get current owned Pokemon for BST calculation
          // Use ownedPokemonData instead of filtering allPokemon
          const ownedPokemon = ownedPokemonData?.pokemonByIds || [];

          // Generate new target BST based on current progression
          const targetBST = generateTargetBST(ownedPokemon);

          // Find Pokemon with BST closest to target using binary search (O(log n))
          const newPokemon = findClosestBST(sortedPokemonByBST, targetBST);

          const position = getRandomWalkablePosition();

          filtered.push({
            spawnId: `${newPokemon.id}-${position.x}-${position.y}-${Date.now()}`,
            pokemon: newPokemon,
            x: position.x,
            y: position.y,
          });
        }

        return filtered;
      });
    },
    [
      allPokemon,
      sortedPokemonByBST,
      getRandomWalkablePosition,
      ownedPokemonData,
    ]
  );

  // Check proximity to nearest wild Pokémon
  useEffect(() => {
    if (wildPokemon.length === 0) {
      setNearbyPokemon(null);
      return;
    }

    const PROXIMITY_RADIUS = 80; // pixels in world space
    let closest: PokemonSpawn | null = null;
    let closestDist = Infinity;

    for (const wp of wildPokemon) {
      const dx = wp.x - playerPosition.x;
      const dy = wp.y - playerPosition.y;
      const dist = Math.hypot(dx, dy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = wp;
      }
    }

    if (closest && closestDist <= PROXIMITY_RADIUS) {
      setNearbyPokemon(closest);
    } else {
      setNearbyPokemon(null);
    }
  }, [playerPosition, wildPokemon]);

  // Viewport culling - only render Pokemon within viewport for better performance
  const getVisiblePokemon = useCallback(
    (
      camera: {x: number; y: number},
      renderSize: {width: number; height: number}
    ): PokemonSpawn[] => {
      return wildPokemon.filter((pokemon) => {
        const pokemonScreenX = pokemon.x - camera.x;
        const pokemonScreenY = pokemon.y - camera.y;

        // Only render if Pokemon is within viewport + some buffer
        return (
          pokemonScreenX > -100 &&
          pokemonScreenX < renderSize.width + 100 &&
          pokemonScreenY > -100 &&
          pokemonScreenY < renderSize.height + 100
        );
      });
    },
    [wildPokemon]
  );

  return {
    wildPokemon,
    nearbyPokemon,
    getVisiblePokemon,
    removePokemon,
  };
}
