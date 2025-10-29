import {useMutation} from '@apollo/client';
import {
  DELETE_USER_MUTATION,
  SET_FAVORITE_POKEMON_MUTATION,
  SET_SELECTED_POKEMON_MUTATION,
  type DeleteUserData,
  type SetFavoritePokemonData,
  type SetSelectedPokemonData,
  type PokemonIdVariables,
} from '@/lib/graphql';

/**
 * Hook to delete user account
 */
export function useDeleteUser() {
  return useMutation<DeleteUserData>(DELETE_USER_MUTATION);
}

/**
 * Hook to set user's favorite Pokemon
 */
export function useSetFavoritePokemon() {
  return useMutation<SetFavoritePokemonData, PokemonIdVariables>(
    SET_FAVORITE_POKEMON_MUTATION
  );
}

/**
 * Hook to set user's selected Pokemon for clicker
 */
export function useSetSelectedPokemon() {
  return useMutation<SetSelectedPokemonData, PokemonIdVariables>(
    SET_SELECTED_POKEMON_MUTATION
  );
}
