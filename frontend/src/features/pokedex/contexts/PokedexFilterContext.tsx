import type {ReactNode} from 'react';
import {
  PokedexFilterContext,
  type PokedexFilterContextValue,
} from './PokedexFilterContextDefinition';

interface PokedexFilterProviderProps {
  value: PokedexFilterContextValue;
  children: ReactNode;
}

/**
 * Pokedex filter provider that passes down filter state to child components
 *
 * @remarks
 * This is a simple pass-through provider - filter state is managed by the parent component.
 * Reduces prop drilling by making filter state and handlers available via context.
 *
 * State includes:
 * - Search term with debouncing
 * - Region, type, and ownership filters
 * - Sort options (by id/name/type, asc/desc)
 * - Pagination state
 * - Mobile filter modal state (with temporary values)
 *
 * @param value - Complete filter state and handlers from parent
 * @param children - Child components to wrap
 */
export function PokedexFilterProvider({
  value,
  children,
}: PokedexFilterProviderProps) {
  return (
    <PokedexFilterContext.Provider value={value}>
      {children}
    </PokedexFilterContext.Provider>
  );
}
