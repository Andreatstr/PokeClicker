import {useMutation, gql} from '@apollo/client';
import {type User} from '@features/auth';
import {USER_FRAGMENT} from '@/lib/graphql/fragments';

const DELETE_USER = gql`
  mutation DeleteUser {
    deleteUser
  }
`;

const SET_FAVORITE_POKEMON = gql`
  ${USER_FRAGMENT}
  mutation SetFavoritePokemon($pokemonId: Int) {
    setFavoritePokemon(pokemonId: $pokemonId) {
      ...UserFields
    }
  }
`;

const SET_SELECTED_POKEMON = gql`
  ${USER_FRAGMENT}
  mutation SetSelectedPokemon($pokemonId: Int) {
    setSelectedPokemon(pokemonId: $pokemonId) {
      ...UserFields
    }
  }
`;

interface SetFavoritePokemonData {
  setFavoritePokemon: User;
}

interface SetSelectedPokemonData {
  setSelectedPokemon: User;
}

interface PokemonIdVariables {
  pokemonId: number | null;
}

/**
 * Hook to delete user account
 */
export function useDeleteUser() {
  return useMutation(DELETE_USER);
}

/**
 * Hook to set user's favorite Pokemon
 */
export function useSetFavoritePokemon() {
  return useMutation<SetFavoritePokemonData, PokemonIdVariables>(
    SET_FAVORITE_POKEMON
  );
}

/**
 * Hook to set user's selected Pokemon for clicker
 */
export function useSetSelectedPokemon() {
  return useMutation<SetSelectedPokemonData, PokemonIdVariables>(
    SET_SELECTED_POKEMON
  );
}
