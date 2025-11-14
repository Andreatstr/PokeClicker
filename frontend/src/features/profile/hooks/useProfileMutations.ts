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
 * Hook to delete user account permanently
 * Removes all user data including owned Pokemon, stats, and progress
 * Should be followed by logout to clear auth state
 */
export function useDeleteUser() {
  return useMutation<DeleteUserData>(DELETE_USER_MUTATION);
}

/**
 * Hook to set user's favorite Pokemon
 * Updates favorite_pokemon_id field displayed on profile
 * Pass null to clear favorite
 */
export function useSetFavoritePokemon() {
  return useMutation<SetFavoritePokemonData, PokemonIdVariables>(
    SET_FAVORITE_POKEMON_MUTATION
  );
}

/**
 * Hook to set user's selected Pokemon for clicker game
 * Updates selected_pokemon_id used as active Pokemon in clicker
 * Pass null to clear selection
 */
export function useSetSelectedPokemon() {
  return useMutation<SetSelectedPokemonData, PokemonIdVariables>(
    SET_SELECTED_POKEMON_MUTATION
  );
}
