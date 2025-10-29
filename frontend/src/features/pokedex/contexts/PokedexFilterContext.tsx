import type {ReactNode} from 'react';
import {
  PokedexFilterContext,
  type PokedexFilterContextValue,
} from './PokedexFilterContextDefinition';

interface PokedexFilterProviderProps {
  value: PokedexFilterContextValue;
  children: ReactNode;
}

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
