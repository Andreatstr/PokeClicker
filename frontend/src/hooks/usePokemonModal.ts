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
  const [allPokemon, setAllPokemon] = useState<PokedexPokemon[]>([]);
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
