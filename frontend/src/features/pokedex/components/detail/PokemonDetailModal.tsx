import {Dialog, DialogBody} from '@ui/pixelact';
import type {PokedexPokemon} from '@features/pokedex';
import {usePurchasePokemon} from '@features/pokedex';
import {useAuth} from '@features/auth';
import {useQuery, gql} from '@apollo/client';
import {useEffect} from 'react';
import {PokemonDetailCard} from './PokemonDetailCard';
import {PokemonCarousel} from './PokemonCarousel';

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
}

export function PokemonDetailModal({
  pokemon,
  allPokemon = [],
  isOpen,
  onClose,
  onSelectPokemon,
  onPurchase,
  isDarkMode = false,
}: Props) {
  const [purchasePokemon] = usePurchasePokemon();
  const {updateUser, user} = useAuth();
  const {data: userData} = useQuery(ME_QUERY);

  // Add Escape key handler to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!pokemon) return null;

  const ownedPokemonIds = userData?.me?.owned_pokemon_ids || [];

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogBody>
        {/* Mobile drawer handle */}
        <div className="md:hidden flex justify-center mb-2">
          <div className="w-12 h-1 bg-gray-400 rounded-full"></div>
        </div>

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
          />
        )}
      </DialogBody>
    </Dialog>
  );
}

export default PokemonDetailModal;
