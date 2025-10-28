import {usePokemonById} from '@features/pokedex';
import {EvolutionPokemon} from './EvolutionPokemon';

interface PokemonEvolutionSectionProps {
  evolutionIds: number[];
  ownedPokemonIds: number[];
  onSelectPokemon?: (id: number) => void;
  isDarkMode: boolean;
}

/**
 * Displays the evolution chain for a Pokemon
 * Sorts by pokedex number and shows arrows between evolutions
 */
export function PokemonEvolutionSection({
  evolutionIds,
  ownedPokemonIds,
  onSelectPokemon,
  isDarkMode,
}: PokemonEvolutionSectionProps) {
  // Call hooks unconditionally for up to 10 Pokemon
  const evo0 = usePokemonById(evolutionIds[0] ?? null);
  const evo1 = usePokemonById(evolutionIds[1] ?? null);
  const evo2 = usePokemonById(evolutionIds[2] ?? null);
  const evo3 = usePokemonById(evolutionIds[3] ?? null);
  const evo4 = usePokemonById(evolutionIds[4] ?? null);
  const evo5 = usePokemonById(evolutionIds[5] ?? null);
  const evo6 = usePokemonById(evolutionIds[6] ?? null);
  const evo7 = usePokemonById(evolutionIds[7] ?? null);
  const evo8 = usePokemonById(evolutionIds[8] ?? null);
  const evo9 = usePokemonById(evolutionIds[9] ?? null);

  const evolutionDataQueries = [
    evo0,
    evo1,
    evo2,
    evo3,
    evo4,
    evo5,
    evo6,
    evo7,
    evo8,
    evo9,
  ];

  // Sort evolution chain by pokedexNumber instead of ID
  const sortedEvolutionIds = evolutionIds
    .map((id, index) => ({
      id,
      pokedexNumber:
        evolutionDataQueries[index]?.data?.pokemonById?.pokedexNumber ?? id,
    }))
    .sort((a, b) => a.pokedexNumber - b.pokedexNumber)
    .map((item) => item.id);

  return (
    <div
      className="evolutionWrapper p-3 border-4 text-xs md:text-sm w-full max-w-[400px] font-press-start"
      style={{
        borderColor: isDarkMode ? '#333333' : 'black',
        boxShadow: isDarkMode
          ? '4px 4px 0px rgba(51,51,51,1)'
          : '4px 4px 0px rgba(0,0,0,1)',
        backgroundColor: isDarkMode ? '#1e3a5f' : '#a0c8ff',
      }}
    >
      <h3 className="font-bold mb-2">Evolution</h3>
      <div className="evolutionChain flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {sortedEvolutionIds.map((id, i, arr) => (
          <EvolutionPokemon
            key={id}
            id={id}
            onSelectPokemon={onSelectPokemon}
            showArrow={i < arr.length - 1}
            isOwned={ownedPokemonIds.includes(id)}
          />
        ))}
      </div>
    </div>
  );
}
