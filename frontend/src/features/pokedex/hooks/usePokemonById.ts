import {useQuery, ApolloError} from '@apollo/client';
import type {ApolloQueryResult} from '@apollo/client';
import {useMemo} from 'react';
import {useAuth} from '@/features/auth/hooks/useAuth';
import {
  POKEMON_BY_ID_QUERY,
  POKEMON_UPGRADE_QUERY,
  type PokemonByIdData,
  type PokemonByIdVariables,
  type PokemonUpgradeData,
  type PokemonUpgradeVariables,
  type PokemonStats,
  type PokemonById,
} from '@/lib/graphql';

interface UsePokemonByIdReturn {
  pokemon: PokemonById | null;
  loading: boolean;
  error?: ApolloError;
  refreshStats: () => Promise<void>;
  networkStatus?: number;
  refetch?: () => Promise<ApolloQueryResult<PokemonByIdData>>;
}

export type {PokemonStats, PokemonById};

export function usePokemonById(id: number | null): UsePokemonByIdReturn {
  const {isAuthenticated} = useAuth();

  const {
    data: pokeData,
    loading: pokemonLoading,
    error: pokeError,
    refetch: refetchPokemon,
  } = useQuery<PokemonByIdData, PokemonByIdVariables>(POKEMON_BY_ID_QUERY, {
    variables: {id: id!},
    skip: id === null,
  });

  const {
    data: upgradeData,
    loading: upgradeLoading,
    refetch: refetchUpgrade,
  } = useQuery<PokemonUpgradeData, PokemonUpgradeVariables>(
    POKEMON_UPGRADE_QUERY,
    {
      variables: {pokemonId: id!},
      skip: !id || !isAuthenticated,
    }
  );

  const pokemon = useMemo(() => {
    if (!pokeData?.pokemonById) return null;

    const basePokemon = pokeData.pokemonById;
    const upgradeLevel = upgradeData?.pokemonUpgrade?.level ?? 1;
    const bonus = Math.max(0, upgradeLevel - 1);

    // Apply the stat upgrades
    const upgradedStats: PokemonStats = {
      hp: (basePokemon.stats.hp ?? 0) + bonus,
      attack: (basePokemon.stats.attack ?? 0) + bonus,
      defense: (basePokemon.stats.defense ?? 0) + bonus,
      spAttack: (basePokemon.stats.spAttack ?? 0) + bonus,
      spDefense: (basePokemon.stats.spDefense ?? 0) + bonus,
      speed: (basePokemon.stats.speed ?? 0) + bonus,
    };

    return {
      ...basePokemon,
      stats: upgradedStats,
      upgradeLevel,
    };
  }, [pokeData, upgradeData]);

  const loading = pokemonLoading || upgradeLoading;

  // Function to refresh pokemon stats
  const refreshStats = async () => {
    await Promise.all([refetchPokemon(), isAuthenticated && refetchUpgrade()]);
  };

  return {
    pokemon,
    loading,
    error: pokeError,
    refreshStats,
    networkStatus: pokemonLoading ? 1 : 7,
    refetch: refetchPokemon,
  };
}
