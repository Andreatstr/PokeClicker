import {gql, useMutation, useQuery} from '@apollo/client';
import type {User} from '@features/auth';
import {USER_FRAGMENT} from '@/lib/graphql/fragments';

const GET_POKEMON_UPGRADE = gql`
  query PokemonUpgrade($pokemonId: Int!) {
    pokemonUpgrade(pokemonId: $pokemonId) {
      pokemon_id
      level
      cost
    }
  }
`;

const UPGRADE_POKEMON = gql`
  ${USER_FRAGMENT}
  mutation UpgradePokemon($pokemonId: Int!) {
    upgradePokemon(pokemonId: $pokemonId) {
      pokemon_id
      level
      cost
      user {
        ...UserFields
      }
    }
  }
`;

export interface PokemonUpgrade {
  pokemon_id: number;
  level: number;
  cost: number;
  user?: User;
}

export function usePokemonUpgrade(pokemonId: number | null) {
  const {data, loading, error, refetch} = useQuery<{
    pokemonUpgrade: PokemonUpgrade;
  }>(GET_POKEMON_UPGRADE, {
    variables: {pokemonId},
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
  const [upgradePokemon, {loading, error}] = useMutation<{
    upgradePokemon: PokemonUpgrade;
  }>(UPGRADE_POKEMON);

  return [upgradePokemon, {loading, error}] as const;
}
