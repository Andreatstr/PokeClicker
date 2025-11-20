import {useAuth} from '@features/auth/hooks/useAuth';
import {
  useDeleteUser,
  useSetFavoritePokemon,
  useSetSelectedPokemon,
} from './useProfileMutations';
import {logger} from '@/lib/logger';

/**
 * Custom hook that encapsulates all profile-related action handlers
 */
export function useProfileHandlers(
  onNavigate?: (page: 'clicker' | 'pokedex' | 'login' | 'profile') => void
) {
  const {logout, updateUser} = useAuth();
  const [deleteUser, {loading: deleting}] = useDeleteUser();
  const [setFavoritePokemon] = useSetFavoritePokemon();
  const [setSelectedPokemon] = useSetSelectedPokemon();

  const handleLogout = async () => {
    await logout();
    onNavigate?.('login');
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser();
      await logout(true); // Pass true to clear onboarding flag
      onNavigate?.('login');
    } catch (error) {
      logger.logError(error, 'DeleteAccount');
      alert('Failed to delete account. Please try again.');
      throw error;
    }
  };

  const handleSetFavorite = async (pokemonId: number | null) => {
    try {
      const result = await setFavoritePokemon({variables: {pokemonId}});
      if (result.data?.setFavoritePokemon) {
        updateUser(result.data.setFavoritePokemon);
      }
      return true;
    } catch (error) {
      logger.logError(error, 'SetFavoritePokemon');
      alert('Failed to set favorite Pokemon. Please try again.');
      return false;
    }
  };

  const handleSetSelected = async (pokemonId: number | null) => {
    try {
      const result = await setSelectedPokemon({variables: {pokemonId}});
      if (result.data?.setSelectedPokemon) {
        updateUser(result.data.setSelectedPokemon);
      }
      return true;
    } catch (error) {
      logger.logError(error, 'SetSelectedPokemon');
      alert('Failed to set selected Pokemon. Please try again.');
      return false;
    }
  };

  return {
    handleLogout,
    handleDeleteAccount,
    handleSetFavorite,
    handleSetSelected,
    deleting,
  };
}
