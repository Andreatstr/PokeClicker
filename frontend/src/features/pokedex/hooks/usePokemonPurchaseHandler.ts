import {useState} from 'react';
import {GameConfig} from '@/config';
import {usePurchasePokemon} from './usePurchasePokemon';
import {useAuth} from '@features/auth';

/**
 * Custom hook to handle Pokemon purchase logic with error handling and animations
 */
export function usePokemonPurchaseHandler() {
  const [purchasePokemon] = usePurchasePokemon();
  const {updateUser} = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePurchase = async (
    pokemonId: number,
    onSuccess?: (pokemonId: number) => void
  ) => {
    setError(null);

    try {
      const result = await purchasePokemon({
        variables: {pokemonId},
      });

      // Update AuthContext with the server response
      // Apollo optimistic response already updated the UI immediately
      if (result.data?.purchasePokemon) {
        updateUser(result.data.purchasePokemon);
      }

      onSuccess?.(pokemonId);

      // Trigger animation after successful purchase
      setIsAnimating(true);
      setTimeout(
        () => setIsAnimating(false),
        GameConfig.purchase.successAnimationDuration
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to purchase Pokémon';
      setError(errorMessage);
      setTimeout(() => setError(null), GameConfig.purchase.errorDisplayDuration);
    }
  };

  return {
    handlePurchase,
    error,
    isAnimating,
  };
}
