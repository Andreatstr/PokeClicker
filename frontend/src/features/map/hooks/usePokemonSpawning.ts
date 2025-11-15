import {useState, useEffect, useCallback, useMemo} from 'react';
import {logger} from '@/lib/logger';
import {usePokedexQuery, type PokedexPokemon} from '@features/pokedex';
import {useAuth} from '@features/auth/hooks/useAuth';

// Map dimensions
const MAP_WIDTH = 10560;
const MAP_HEIGHT = 6080;

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
const MAX_POKEMON_ID = 1025; // Total Pokemon in database (Gen 1-9, Paldea)

/**
 * Generate a target BST based on player's owned Pokemon strength
 *
 * New players (no owned Pokemon): Spawn weak Pokemon (BST 180-250)
 *
 * Experienced players: Spawn based on average BST of owned Pokemon
 * - 70%: Around player's average BST (±30 BST variance)
 * - 20%: Slightly stronger (average + 20 to 50 BST)
 * - 10%: Challenge Pokemon (average + 50 to 100 BST)
 *
 * Uses Box-Muller transform for normal distribution around player level
 */
function generateTargetBST(ownedPokemon: PokedexPokemon[]): number {
  // New players: spawn weak Pokemon (180-250 BST range)
  if (ownedPokemon.length === 0) {
    return Math.floor(Math.random() * 71) + 180; // 180-250
  }

  // Calculate average BST of owned Pokemon
  const validBSTs = ownedPokemon
    .map((p) => p.bst)
    .filter((bst): bst is number => bst !== null && bst !== undefined);

  if (validBSTs.length === 0) {
    // Fallback if no BST data available
    return Math.floor(Math.random() * 71) + 180;
  }

  const averageBST =
    validBSTs.reduce((sum, bst) => sum + bst, 0) / validBSTs.length;

  // 10% chance: Challenge Pokemon (+50 to +100 BST)
  if (Math.random() < 0.1) {
    const boost = Math.floor(Math.random() * 51) + 50;
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

  // Fetch all Pokemon to have access to full BST range
  // We need all Pokemon available since spawning is BST-based, not ID-based
  const {data: pokemonData} = usePokedexQuery({
    limit: MAX_POKEMON_ID,
    offset: 0,
  });

  useEffect(() => {
    if (
      pokemonData?.pokedex.pokemon &&
      pokemonData.pokedex.pokemon.length > 0
    ) {
      setAllPokemon(pokemonData.pokedex.pokemon);
    }
  }, [pokemonData]);

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

  // Place Pokemon at random walkable locations when data loads
  useEffect(() => {
    // Check all conditions including collision map
    const collisionMapReady = collisionChecker.collisionMapLoaded !== false;

    if (
      allPokemon.length >= NUM_SPAWNS &&
      wildPokemon.length === 0 &&
      collisionMapReady
    ) {
      const placedPokemon: PokemonSpawn[] = [];

      // Get owned Pokemon data for BST calculation
      const ownedPokemon = allPokemon.filter((p) =>
        ownedPokemonIds.includes(p.id)
      );

      // Generate 50 Pokemon using BST-based selection
      for (let i = 0; i < NUM_SPAWNS; i++) {
        const targetBST = generateTargetBST(ownedPokemon);

        // Find Pokemon with BST closest to target
        const pokemon = allPokemon.reduce((closest, current) => {
          if (!current.bst) return closest;
          if (!closest || !closest.bst) return current;

          const currentDiff = Math.abs(current.bst - targetBST);
          const closestDiff = Math.abs(closest.bst - targetBST);

          return currentDiff < closestDiff ? current : closest;
        }, allPokemon[0]);

        if (pokemon) {
          const position = getRandomWalkablePosition();
          placedPokemon.push({
            spawnId: `${pokemon.id}-${position.x}-${position.y}-${Date.now()}-${i}`,
            pokemon,
            x: position.x,
            y: position.y,
          });
        }
      }

      setWildPokemon(placedPokemon);
    }
  }, [
    allPokemon,
    getRandomWalkablePosition,
    wildPokemon.length,
    ownedPokemonIds,
    collisionChecker.collisionMapLoaded,
    user?._id,
  ]);

  // Remove a caught Pokemon and spawn a new one based on progression
  const removePokemon = useCallback(
    (spawnId: string) => {
      setWildPokemon((current) => {
        // Remove the caught Pokemon by its unique spawn ID
        const filtered = current.filter((spawn) => spawn.spawnId !== spawnId);

        // Spawn a new Pokemon based on player's current BST level
        if (allPokemon.length > 0) {
          // Get current owned Pokemon for BST calculation
          const ownedPokemon = allPokemon.filter((p) =>
            ownedPokemonIds.includes(p.id)
          );

          // Generate new target BST based on current progression
          const targetBST = generateTargetBST(ownedPokemon);

          // Find Pokemon with BST closest to target
          const newPokemon = allPokemon.reduce((closest, current) => {
            if (!current.bst) return closest;
            if (!closest || !closest.bst) return current;

            const currentDiff = Math.abs(current.bst - targetBST);
            const closestDiff = Math.abs(closest.bst - targetBST);

            return currentDiff < closestDiff ? current : closest;
          }, allPokemon[0]);

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
    [allPokemon, getRandomWalkablePosition, ownedPokemonIds]
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
