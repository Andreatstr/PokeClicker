import {useState, useRef} from 'react';
import {GameConfig} from '@/config';
import {usePurchasePokemon} from './usePurchasePokemon';
import {useAuth} from '@features/auth';
import {getPokemonCost} from '../utils/pokemonCost';
import {toDecimal} from '@/lib/decimal';

/**
 * Custom hook to handle Pokemon purchase logic with error handling and animations
 */
export function usePokemonPurchaseHandler() {
  const [purchasePokemon] = usePurchasePokemon();
  const {updateUser, user} = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const errorTimeoutRef = useRef<number | null>(null);

  const handlePurchase = async (
    pokemonId: number,
    onSuccess?: (pokemonId: number) => void
  ) => {
    // Clear any existing error timeout to prevent race conditions
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError(null);

    // Client-side validation: Check if user can afford the Pokemon
    // This prevents the optimistic response from flashing the unlocked state
    const cost = getPokemonCost(pokemonId);
    if (user && toDecimal(user.rare_candy).lt(cost)) {
      setError('Not enough Rare Candy!');
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, GameConfig.purchase.errorDisplayDuration);
      return;
    }

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
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, GameConfig.purchase.errorDisplayDuration);
    }
  };

  return {
    handlePurchase,
    error,
    isAnimating,
  };
}
