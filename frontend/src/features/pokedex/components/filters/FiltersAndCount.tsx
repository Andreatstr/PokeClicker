import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  MultiSelect,
} from '@ui/pixelact';
import type {PokedexPokemon} from '@features/pokedex';
import {usePokedexFilterContext} from '../../contexts/usePokedexFilterContext';
import {POKEMON_TYPES, POKEMON_REGIONS} from '../../utils/constants';
import type {FilterFacets} from '@/lib/graphql';

interface FiltersAndCountProps {
  loading: boolean;
  displayedPokemon: PokedexPokemon[];
  totalPokemon: number;
  isMobile: boolean;
  ownedPokemonIds: number[];
  facets?: FilterFacets | null;
}

export function FiltersAndCount({
  loading,
  totalPokemon,
  isMobile,
  ownedPokemonIds,
  facets,
}: FiltersAndCountProps) {
  // Get all filter state and handlers from context
  const {
    showMobileFilters,
    tempRegion,
    tempTypes,
    tempSortBy,
    tempSortOrder,
    tempOwnedOnly,
    paginationPage,
    setSelectedRegion,
    setSelectedTypes,
    setSortBy,
    setSortOrder,
    setShowMobileFilters,
    setTempRegion,
    setTempTypes,
    setTempSortBy,
    setTempSortOrder,
    setSelectedOwnedOnly,
    setTempOwnedOnly,
  } = usePokedexFilterContext();
  const ownedCount = (ownedPokemonIds ?? []).length;

  // Calculate display range for pagination
  const ITEMS_PER_PAGE = 20;
  const startIndex = (paginationPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(paginationPage * ITEMS_PER_PAGE, totalPokemon);

  // Convert facets to lookup maps
  const generationCountMap = facets?.byGeneration
    ? Object.fromEntries(
        facets.byGeneration.map((f: {generation: string; count: number}) => [
          f.generation,
          f.count,
        ])
      )
    : {};

  const typeCountMap = facets?.byType
    ? Object.fromEntries(
        facets.byType.map((f: {type: string; count: number}) => [
          f.type,
          f.count,
        ])
      )
    : {};

  const showCounts = facets !== null && facets !== undefined;

  return (
    <section className="mb-6">
      {showMobileFilters && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-dialog-title"
          id="mobile-filter-dialog"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="w-full max-w-md p-4 rounded-md shadow-[var(--pixel-box-shadow)] max-h-[90vh] overflow-y-auto"
            style={{backgroundColor: 'var(--card)'}}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full p-4"
              style={{backgroundColor: 'var(--card)'}}
            >
              <div className="flex justify-between items-center mb-4">
                <h2
                  id="filter-dialog-title"
                  className="pixel-font text-lg"
                  style={{color: 'var(--foreground)'}}
                >
                  Filter
                </h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Close filter dialog"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* REGION */}
                <div>
                  <Label
                    className="text-xs font-bold"
                    style={{color: 'var(--foreground)'}}
                  >
                    Region
                  </Label>
                  <Select
                    value={tempRegion ?? 'all'}
                    onValueChange={(v) => {
                      setTempRegion(v === 'all' ? null : v);
                    }}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All regions</SelectItem>
                      {POKEMON_REGIONS.map((region) => {
                        const count = generationCountMap[region.value];
                        const label =
                          count !== undefined
                            ? `${region.label.split(' ')[0]} (${count})`
                            : region.label.split(' ')[0];
                        return (
                          <SelectItem key={region.value} value={region.value}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* TYPE */}
                <div>
                  <Label
                    className="text-xs font-bold"
                    style={{color: 'var(--foreground)'}}
                  >
                    Type
                  </Label>
                  <MultiSelect
                    options={[...POKEMON_TYPES]}
                    selected={tempTypes}
                    onChange={setTempTypes}
                    className="w-full"
                    counts={showCounts ? typeCountMap : undefined}
                  />
                </div>

                {/* SORT BY */}
                <div>
                  <Label
                    className="text-xs font-bold"
                    style={{color: 'var(--foreground)'}}
                  >
                    Sort by
                  </Label>
                  <Select
                    value={tempSortBy}
                    onValueChange={(v) =>
                      setTempSortBy(v as 'id' | 'name' | 'type')
                    }
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="ID" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">ID</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ORDER */}
                <div>
                  <Label
                    className="text-xs font-bold"
                    style={{color: 'var(--foreground)'}}
                  >
                    Order
                  </Label>
                  <Select
                    value={tempSortOrder}
                    onValueChange={(v) => setTempSortOrder(v as 'asc' | 'desc')}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Asc" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Asc</SelectItem>
                      <SelectItem value="desc">Desc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* OWNED */}
                <div>
                  <Label
                    className="text-xs font-bold"
                    style={{color: 'var(--foreground)'}}
                  >
                    Filter on
                  </Label>

                  <Select
                    value={tempOwnedOnly}
                    onValueChange={(v: 'all' | 'owned' | 'unowned') => {
                      // prevent enabling "owned" or "unowned" when user has none
                      if (v === 'all' || ownedCount > 0) {
                        setTempOwnedOnly(v);
                      }
                    }}
                  >
                    <SelectTrigger
                      className="w-full text-sm mt-1"
                      aria-label="Owned filter"
                    >
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pokémon</SelectItem>
                      <SelectItem value="owned" disabled={ownedCount === 0}>
                        Owned only{' '}
                        {showCounts && facets
                          ? `(${facets.ownedCount}/${facets.totalCount})`
                          : ownedCount > 0
                            ? `(${ownedCount} total)`
                            : ''}
                      </SelectItem>
                      <SelectItem value="unowned" disabled={ownedCount === 0}>
                        Unowned only{' '}
                        {showCounts && facets
                          ? `(${facets.totalCount - facets.ownedCount}/${facets.totalCount})`
                          : ''}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-between mt-6 gap-2">
                <Button
                  variant="default"
                  aria-label="Clear all filters"
                  className="min-h-[44px]"
                  onClick={() => {
                    setTempRegion(null);
                    setTempTypes([]);
                    setTempSortBy('id');
                    setTempSortOrder('asc');
                    setTempOwnedOnly('all');

                    setSelectedRegion(null);
                    setSelectedTypes([]);
                    setSortBy('id');
                    setSortOrder('asc');
                    setSelectedOwnedOnly('all');
                    setShowMobileFilters(false);
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="default"
                  aria-label="Cancel filter changes"
                  className="min-h-[44px]"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  aria-label="Apply selected filters"
                  className="min-h-[44px]"
                  onClick={() => {
                    setSelectedRegion(tempRegion);
                    setSelectedTypes(tempTypes);
                    setSortBy(tempSortBy);
                    setSortOrder(tempSortOrder);
                    setSelectedOwnedOnly(tempOwnedOnly);
                    setShowMobileFilters(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <p className="text-sm pixel-font" style={{color: 'var(--foreground)'}}>
          {loading
            ? 'Loading...'
            : totalPokemon > 0
              ? `Showing ${startIndex}-${endIndex} of ${totalPokemon} Pokémon`
              : 'No Pokémon found'}
        </p>
      )}
    </section>
  );
}
