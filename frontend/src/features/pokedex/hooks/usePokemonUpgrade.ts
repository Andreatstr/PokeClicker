import {useMutation, useQuery} from '@apollo/client';
import {
  POKEMON_UPGRADE_QUERY,
  UPGRADE_POKEMON_MUTATION,
  type PokemonUpgrade,
  type PokemonUpgradeData,
  type PokemonUpgradeVariables,
  type UpgradePokemonData,
} from '@/lib/graphql';

// Re-export type for convenience
export type {PokemonUpgrade};

/**
 * Hook for querying user's Pokemon upgrade level
 * Returns upgrade data for a specific Pokemon ID
 * Used to display current upgrade level and calculate upgrade costs
 */
export function usePokemonUpgrade(pokemonId: number | null) {
  const {data, loading, error, refetch} = useQuery<
    PokemonUpgradeData,
    PokemonUpgradeVariables
  >(POKEMON_UPGRADE_QUERY, {
    variables: {pokemonId: pokemonId!},
    skip: !pokemonId,
  });

  return {
    upgrade: data?.pokemonUpgrade,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for upgrading Pokemon mutation
 * Increases Pokemon's upgrade level by 1, adding +1 to all stats
 * Consumes Rare Candy based on exponential cost formula
 */
export function useUpgradePokemonMutation() {
  const [upgradePokemon, {loading, error}] = useMutation<UpgradePokemonData>(
    UPGRADE_POKEMON_MUTATION,
    {
      // Refetch all POKEMON_UPGRADE_QUERY queries to prevent race conditions
      // This ensures any component querying upgrade data gets fresh data
      refetchQueries: ['PokemonUpgrade'],
      awaitRefetchQueries: true,
    }
  );

  return [upgradePokemon, {loading, error}] as const;
}
