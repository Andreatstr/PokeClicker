import {useState, useEffect, useCallback} from 'react';
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
 * Generate a Pokemon ID based on player progression
 * Uses bell curve distribution centered around (maxOwnedId - 5)
 * with 15% chance to spawn next-tier Pokemon
 */
function generateRandomPokemonId(maxOwnedId: number): number {
  // New players: spawn only ID 1-20
  if (maxOwnedId === 0) {
    return Math.floor(Math.random() * 20) + 1;
  }

  // 15% chance: "Challenge Pokemon" (next tier, ID maxOwnedId+1 to maxOwnedId+5)
  if (Math.random() < 0.15) {
    const jump = Math.floor(Math.random() * 5) + 1;
    return Math.min(MAX_POKEMON_ID, maxOwnedId + jump);
  }

  // 85% chance: Bell curve centered at (maxOwnedId - 5)
  const center = Math.max(1, maxOwnedId - 5);
  const stdDev = 5; // Standard deviation

  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  const pokemonId = Math.round(center + z * stdDev);

  // Clamp to valid range (1 to MAX_POKEMON_ID)
  return Math.max(1, Math.min(MAX_POKEMON_ID, pokemonId));
}

export function usePokemonSpawning(
  collisionChecker: CollisionChecker,
  playerPosition: {x: number; y: number}
): PokemonState {
  const {user} = useAuth();

  const [wildPokemon, setWildPokemon] = useState<PokemonSpawn[]>([]);
  const [nearbyPokemon, setNearbyPokemon] = useState<PokemonSpawn | null>(null);

  // Create user-specific storage key
  const userStorageKey = user?._id
    ? `${POKEMON_STORAGE_KEY}_${user._id}`
    : POKEMON_STORAGE_KEY;

  // Get player's highest caught Pokemon ID for progression-based spawning
  const maxOwnedId = Math.max(...(user?.owned_pokemon_ids || [0]));

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

  // Determine how many Pokemon to fetch based on player progression
  const fetchLimit = Math.min(Math.max(100, maxOwnedId + 50), MAX_POKEMON_ID);

  const {data: pokemonData} = usePokedexQuery({
    limit: fetchLimit,
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
    if (allPokemon.length >= NUM_SPAWNS && wildPokemon.length === 0) {
      const placedPokemon: PokemonSpawn[] = [];

      // Generate 50 Pokemon using progression-based selection
      for (let i = 0; i < NUM_SPAWNS; i++) {
        const targetId = generateRandomPokemonId(maxOwnedId);

        // Find Pokemon closest to target ID (or random if not found)
        const pokemon =
          allPokemon.find((p) => p.id === targetId) ||
          allPokemon.find((p) => Math.abs(p.id - targetId) <= 5) ||
          allPokemon[Math.floor(Math.random() * allPokemon.length)];

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
  }, [allPokemon, getRandomWalkablePosition, wildPokemon.length, maxOwnedId]);

  // Remove a caught Pokemon and spawn a new one based on progression
  const removePokemon = useCallback(
    (spawnId: string) => {
      setWildPokemon((current) => {
        // Remove the caught Pokemon by its unique spawn ID
        const filtered = current.filter((spawn) => spawn.spawnId !== spawnId);

        // Spawn a new Pokemon based on player progression
        if (allPokemon.length > 0) {
          // Generate new ID based on current progression
          const newId = generateRandomPokemonId(maxOwnedId);

          // Find Pokemon with this ID or closest available
          const newPokemon =
            allPokemon.find((p) => p.id === newId) ||
            allPokemon[Math.floor(Math.random() * allPokemon.length)];

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
    [allPokemon, getRandomWalkablePosition, maxOwnedId]
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
