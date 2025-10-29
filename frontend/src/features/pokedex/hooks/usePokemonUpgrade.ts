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

export function useUpgradePokemonMutation() {
  const [upgradePokemon, {loading, error}] =
    useMutation<UpgradePokemonData>(UPGRADE_POKEMON_MUTATION);

  return [upgradePokemon, {loading, error}] as const;
}
