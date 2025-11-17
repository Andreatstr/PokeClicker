import {Dialog, DialogBody} from '@ui/pixelact';
import type {PokedexPokemon} from '@features/pokedex';
import {usePurchasePokemon} from '@features/pokedex';
import {useAuth} from '@features/auth';
import {useQuery, gql} from '@apollo/client';
import {FocusTrap} from 'focus-trap-react';
import {useModal} from '@/hooks/useModal';
import {PokemonDetailCard} from './PokemonDetailCard';
import {PokemonCarousel} from './PokemonCarousel';
import {useRef, useEffect} from 'react';

const ME_QUERY = gql`
  query Me {
    me {
      _id
      owned_pokemon_ids
    }
  }
`;

interface Props {
  pokemon: PokedexPokemon | null;
  allPokemon?: PokedexPokemon[]; // All filtered Pokemon for carousel navigation
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon?: (id: number) => void;
  onPurchase?: (id: number) => void;
  isDarkMode?: boolean;
  disableFocusTrap?: boolean;
}

export function PokemonDetailModal({
  pokemon,
  allPokemon = [],
  isOpen,
  onClose,
  onSelectPokemon,
  onPurchase,
  isDarkMode = false,
  disableFocusTrap = false,
}: Props) {
  const [purchasePokemon] = usePurchasePokemon();
  const {updateUser, user} = useAuth();
  const {data: userData} = useQuery(ME_QUERY);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useModal(isOpen, onClose);

  // Auto-focus the close button when modal opens
  // This ensures consistent focus behavior regardless of carousel state
  useEffect(() => {
    if (isOpen && closeButtonRef.current && !disableFocusTrap) {
      // Small delay to ensure DOM is fully ready
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, disableFocusTrap]);

  if (!pokemon) return null;

  const ownedPokemonIds = userData?.me?.owned_pokemon_ids || [];

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <FocusTrap
        active={isOpen && !disableFocusTrap}
        focusTrapOptions={{
          allowOutsideClick: true,
          escapeDeactivates: false, // We handle Escape in our own handler
          // Use function-based initialFocus to ensure button is found
          initialFocus: () =>
            closeButtonRef.current ||
            (document.querySelector('[aria-label="Exit"]') as HTMLElement),
          returnFocusOnDeactivate: true,
          clickOutsideDeactivates: false, // Prevent clicks outside from breaking the trap
          preventScroll: true, // Prevent scroll when focusing elements
          fallbackFocus: '[role="dialog"]', // Fallback to dialog if close button not found
        }}
      >
        <DialogBody>
          <header className="md:hidden flex justify-center mb-2">
            <div
              className="w-12 h-1 bg-gray-400 rounded-full"
              aria-hidden="true"
            ></div>
          </header>

          {allPokemon.length > 1 ? (
            <PokemonCarousel
              allPokemon={allPokemon}
              currentPokemon={pokemon}
              isDarkMode={isDarkMode}
              onClose={onClose}
              onSelectPokemon={onSelectPokemon}
              onPurchaseComplete={onPurchase}
              purchasePokemonMutation={purchasePokemon}
              updateUser={updateUser}
              user={user}
              ownedPokemonIds={ownedPokemonIds}
              closeButtonRef={closeButtonRef}
            />
          ) : (
            <PokemonDetailCard
              pokemon={pokemon}
              isDarkMode={isDarkMode}
              onClose={onClose}
              onSelectPokemon={onSelectPokemon}
              onPurchaseComplete={onPurchase}
              purchasePokemonMutation={purchasePokemon}
              updateUser={updateUser}
              user={user}
              ownedPokemonIds={ownedPokemonIds}
              closeButtonRef={closeButtonRef}
            />
          )}
        </DialogBody>
      </FocusTrap>
    </Dialog>
  );
}

export default PokemonDetailModal;
