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

interface FiltersAndCountProps {
  loading: boolean;
  displayedPokemon: PokedexPokemon[];
  totalPokemon: number;
  selectedTypes: string[];
  selectedRegion: string | null;
  sortBy: 'id' | 'name' | 'type';
  sortOrder: 'asc' | 'desc';
  isMobile: boolean;
  showMobileFilters: boolean;
  tempRegion: string | null;
  tempTypes: string[];
  tempSortBy: 'id' | 'name' | 'type';
  tempSortOrder: 'asc' | 'desc';
  selectedOwnedOnly: boolean;
  tempOwnedOnly: boolean;
  setSelectedRegion: (value: string | null) => void;
  setSelectedTypes: (value: string[]) => void;
  setSortBy: (value: 'id' | 'name' | 'type') => void;
  setSortOrder: (value: 'asc' | 'desc') => void;
  setShowMobileFilters: (value: boolean | ((prev: boolean) => boolean)) => void;
  setTempRegion: (value: string | null) => void;
  setTempTypes: (value: string[]) => void;
  setTempSortBy: (value: 'id' | 'name' | 'type') => void;
  setTempSortOrder: (value: 'asc' | 'desc') => void;
  setSelectedOwnedOnly: (value: boolean) => void;
  setTempOwnedOnly: (value: boolean) => void;
  handleClearFilters: () => void;
  ownedPokemonIds: number[];
}

const typeOptions = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

const regionOptions = [
  {value: 'kanto', label: 'Kanto (1-151)'},
  {value: 'johto', label: 'Johto (152-251)'},
  {value: 'hoenn', label: 'Hoenn (252-386)'},
  {value: 'sinnoh', label: 'Sinnoh (387-493)'},
  {value: 'unova', label: 'Unova (494-649)'},
  {value: 'kalos', label: 'Kalos (650-721)'},
  {value: 'alola', label: 'Alola (722-809)'},
  {value: 'galar', label: 'Galar (810-905)'},
  {value: 'paldea', label: 'Paldea (906-1025)'},
];

export function FiltersAndCount({
  loading,
  displayedPokemon,
  totalPokemon,
  selectedTypes,
  selectedRegion,
  sortBy,
  sortOrder,
  isMobile,
  showMobileFilters,
  tempRegion,
  tempTypes,
  tempSortBy,
  tempSortOrder,
  selectedOwnedOnly,
  tempOwnedOnly,
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
  handleClearFilters,
  ownedPokemonIds,
}: FiltersAndCountProps) {
  const ownedCount = (ownedPokemonIds ?? []).length;
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
                    value={tempRegion ?? ''}
                    onValueChange={setTempRegion}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      {regionOptions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* TYPE */}
                <div>
                  <Label className="text-xs font-bold style={{color: 'var(--foreground)'}}">
                    Type
                  </Label>
                  <MultiSelect
                    options={typeOptions}
                    selected={tempTypes}
                    onChange={setTempTypes}
                    className="w-full"
                  />
                </div>

                {/* SORT BY */}
                <div>
                  <Label className="text-xs font-bold style={{color: 'var(--foreground)'}}">
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
                  <Label className="text-xs font-bold style={{color: 'var(--foreground)'}}">
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
                  <Label className="text-xs font-bold" style={{color: 'var(--foreground)'}}>
                    Show
                  </Label>

                  <Select
                    value={tempOwnedOnly ? 'owned' : 'all'}
                    onValueChange={(v) => {
                      const isOwned = v === 'owned';
                      // prevent enabling "owned" when user has none
                      if (!isOwned || ownedCount > 0) {
                        setTempOwnedOnly(isOwned);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full text-sm mt-1" aria-label="Owned filter">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pokémon</SelectItem>
                      <SelectItem value="owned" disabled={ownedCount === 0}>
                        Owned only {ownedCount > 0 ? `(${ownedCount})` : ''}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="default"
                  aria-label="Clear all filters"
                  onClick={() => {
                    setTempRegion(null);
                    setTempTypes([]);
                    setTempSortBy('id');
                    setTempSortOrder('asc');

                    setSelectedRegion(null);
                    setSelectedTypes([]);
                    setSortBy('id');
                    setSortOrder('asc');
                    setSelectedOwnedOnly(false);
                    setShowMobileFilters(false);
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="default"
                  aria-label="Cancel filter changes"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  aria-label="Apply selected filters"
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
        <p className="text-sm pixel-font style={{color: 'var(--foreground)'}}">
          {loading
            ? 'Loading...'
            : `Showing ${displayedPokemon.length} of ${totalPokemon} Pokémon`}
        </p>
      )}
    </section>
  );
}
