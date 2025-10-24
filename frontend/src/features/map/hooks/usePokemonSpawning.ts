import {useState, useEffect, useCallback} from 'react';
import {usePokedexQuery, type PokedexPokemon} from '@features/pokedex';

// Map dimensions
const MAP_WIDTH = 10560;
const MAP_HEIGHT = 6080;

interface CollisionChecker {
  isPositionWalkable: (x: number, y: number) => boolean;
}

interface PokemonSpawn {
  pokemon: PokedexPokemon;
  x: number;
  y: number;
}

interface PokemonState {
  wildPokemon: PokemonSpawn[];
  nearbyPokemon: PokemonSpawn | null;
  getVisiblePokemon: (camera: {x: number; y: number}, renderSize: {width: number; height: number}) => PokemonSpawn[];
}

export function usePokemonSpawning(
  collisionChecker: CollisionChecker,
  playerPosition: {x: number; y: number}
): PokemonState {
  const [wildPokemon, setWildPokemon] = useState<PokemonSpawn[]>([]);
  const [nearbyPokemon, setNearbyPokemon] = useState<PokemonSpawn | null>(null);

  // Fetch random Pokemon from API
  const {data: pokemonData} = usePokedexQuery({
    limit: 10,
    offset: 0,
  });

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

  // Place Pokemon at random walkable locations when data loads
  useEffect(() => {
    if (pokemonData?.pokedex.pokemon && wildPokemon.length === 0) {
      const placedPokemon = pokemonData.pokedex.pokemon.map((pokemon) => {
        const position = getRandomWalkablePosition();
        return {
          pokemon,
          x: position.x,
          y: position.y,
        };
      });
      setWildPokemon(placedPokemon);
      console.log('Placed', placedPokemon.length, 'wild Pokemon on the map');
    }
  }, [pokemonData, getRandomWalkablePosition, wildPokemon.length]);

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
  const getVisiblePokemon = useCallback((
    camera: {x: number; y: number},
    renderSize: {width: number; height: number}
  ): PokemonSpawn[] => {
    return wildPokemon.filter(pokemon => {
      const pokemonScreenX = pokemon.x - camera.x;
      const pokemonScreenY = pokemon.y - camera.y;

      // Only render if Pokemon is within viewport + some buffer
      return pokemonScreenX > -100 && pokemonScreenX < renderSize.width + 100 &&
             pokemonScreenY > -100 && pokemonScreenY < renderSize.height + 100;
    });
  }, [wildPokemon]);

  return {
    wildPokemon,
    nearbyPokemon,
    getVisiblePokemon,
  };
}