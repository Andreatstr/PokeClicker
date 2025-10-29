import {useContext} from 'react';
import {PokedexFilterContext} from './PokedexFilterContextDefinition';

/**
 * Hook to access the Pokedex filter context
 * Must be used within a PokedexFilterProvider
 */
export function usePokedexFilterContext() {
  const context = useContext(PokedexFilterContext);
  if (!context) {
    throw new Error(
      'usePokedexFilterContext must be used within PokedexFilterProvider'
    );
  }
  return context;
}
