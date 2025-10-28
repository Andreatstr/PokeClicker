import {gql, useMutation, useQuery} from '@apollo/client';
import type {User} from '@features/auth';

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
  mutation UpgradePokemon($pokemonId: Int!) {
    upgradePokemon(pokemonId: $pokemonId) {
      pokemon_id
      level
      cost
      user {
        _id
        username
        rare_candy
        created_at
        stats {
          hp
          attack
          defense
          spAttack
          spDefense
          speed
          clickPower
          passiveIncome
        }
        owned_pokemon_ids
        favorite_pokemon_id
        selected_pokemon_id
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
