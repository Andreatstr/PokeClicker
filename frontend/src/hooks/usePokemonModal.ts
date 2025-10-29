import {useState, useEffect} from 'react';
import {type PokedexPokemon, usePokemonById} from '@features/pokedex';

/**
 * Custom hook for managing Pokemon detail modal state
 * Handles modal open/close, selected Pokemon, and cross-region Pokemon fetching
 */
export function usePokemonModal() {
  const [selectedPokemon, setSelectedPokemon] = useState<PokedexPokemon | null>(
    null
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [crossRegionPokemonId, setCrossRegionPokemonId] = useState<
    number | null
  >(null);

  const {data: crossRegionData} = usePokemonById(crossRegionPokemonId);

  // Update selectedPokemon when cross-region data loads
  useEffect(() => {
    if (crossRegionData?.pokemonById) {
      const crossRegionPokemon: PokedexPokemon = {
        id: crossRegionData.pokemonById.id,
        name: crossRegionData.pokemonById.name,
        types: crossRegionData.pokemonById.types,
        sprite: crossRegionData.pokemonById.sprite,
        stats: crossRegionData.pokemonById.stats,
        evolution: crossRegionData.pokemonById.evolution,
        isOwned: crossRegionData.pokemonById.isOwned,
        pokedexNumber: crossRegionData.pokemonById.pokedexNumber,
      };
      setSelectedPokemon(crossRegionPokemon);
      setCrossRegionPokemonId(null);
    }
  }, [crossRegionData]);

  const handlePokemonClick = (pokemon: PokedexPokemon) => {
    setSelectedPokemon(pokemon);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSelectPokemon = (id: number) => {
    setCrossRegionPokemonId(id);
  };

  const handlePurchase = (id: number) => {
    if (selectedPokemon && selectedPokemon.id === id) {
      setSelectedPokemon({...selectedPokemon, isOwned: true});
    }
  };

  return {
    selectedPokemon,
    isModalOpen,
    handlePokemonClick,
    handleCloseModal,
    handleSelectPokemon,
    handlePurchase,
  };
}
