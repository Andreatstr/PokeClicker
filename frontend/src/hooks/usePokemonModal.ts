import {useState, useEffect} from 'react';
import {type PokedexPokemon, usePokemonById} from '@features/pokedex';

/**
 * Hook for managing Pokemon detail modal state and interactions
 *
 * Features:
 * - Modal open/close state management
 * - Selected Pokemon tracking for detail view
 * - Pokemon carousel (all Pokemon in current list)
 * - Cross-region Pokemon fetching (when navigating to Pokemon outside current filter)
 * - Purchase handler with optimistic UI update
 *
 * Navigation flow:
 * - Opens with Pokemon from current list (carousel navigation works)
 * - Fetches new data if navigating to Pokemon outside current list
 * - Updates local state after purchase for immediate UI feedback
 *
 * @returns Modal state, selected Pokemon, and action handlers
 */
export function usePokemonModal() {
  const [selectedPokemon, setSelectedPokemon] = useState<PokedexPokemon | null>(
    null
  );
  const [allPokemon, setAllPokemon] = useState<PokedexPokemon[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [crossRegionPokemonId, setCrossRegionPokemonId] = useState<
    number | null
  >(null);

  const {pokemon: crossRegionData} = usePokemonById(crossRegionPokemonId);

  // Update selectedPokemon when cross-region Pokemon data loads
  // This handles navigation to Pokemon outside current filtered list
  useEffect(() => {
    if (crossRegionData) {
      // crossRegionData is already a PokedexPokemon, so use it directly
      setSelectedPokemon(crossRegionData);
      setCrossRegionPokemonId(null);
    }
  }, [crossRegionData]);

  const handlePokemonClick = (
    pokemon: PokedexPokemon,
    all: PokedexPokemon[]
  ) => {
    setSelectedPokemon(pokemon);
    setAllPokemon(all);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSelectPokemon = (id: number) => {
    // Check if the Pokemon is already in the current allPokemon array
    const existingPokemon = allPokemon.find((p) => p.id === id);

    if (existingPokemon) {
      // Pokemon is already in the carousel, just update selectedPokemon
      setSelectedPokemon(existingPokemon);
    } else {
      // Pokemon is not in the current list (different region/filter), fetch it
      setCrossRegionPokemonId(id);
    }
  };

  const handlePurchase = (id: number) => {
    if (selectedPokemon && selectedPokemon.id === id) {
      // Update selectedPokemon
      const updatedPokemon = {...selectedPokemon, isOwned: true};
      setSelectedPokemon(updatedPokemon);

      // Also update the Pokemon in allPokemon array for carousel sync
      setAllPokemon((prevAll) =>
        prevAll.map((p) => (p.id === id ? {...p, isOwned: true} : p))
      );
    }
  };

  return {
    selectedPokemon,
    allPokemon,
    isModalOpen,
    handlePokemonClick,
    handleCloseModal,
    handleSelectPokemon,
    handlePurchase,
  };
}
