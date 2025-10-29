import {Button, Label, SearchIcon, CloseIcon} from '@ui/pixelact';
import {usePokedexFilterContext} from '../../contexts/PokedexFilterContext';

interface SearchBarProps {
  isDarkMode?: boolean;
}

export function SearchBar({isDarkMode = false}: SearchBarProps) {
  // Get search state and handlers from context
  const {
    searchTerm,
    setSearchTerm,
    handleClearSearch,
    showMobileFilters,
    setShowMobileFilters,
  } = usePokedexFilterContext();
  return (
    <section className="mb-6 mt-6 sm:mt-4 max-w-4xl mx-auto">
      <form
        className="p-4"
        style={{
          backgroundColor: 'var(--primary)',
          border: '4px solid var(--border)',
          boxShadow: isDarkMode
            ? '8px 8px 0px 0px rgba(51,51,51,1)'
            : '8px 8px 0px 0px rgba(0,0,0,1)',
        }}
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <Label htmlFor="pokemon-search" className="sr-only">
          Search Pokemon
        </Label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{
                color: isDarkMode ? 'var(--muted-foreground)' : '#6b7280',
              }}
            />
            <input
              id="pokemon-search"
              type="search"
              placeholder="search"
              className={`w-full border-0 text-xl pl-12 pr-12 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none pixel-font max-w-full outline-none p-2 shadow-(--pixel-box-shadow) placeholder:text-sm md:placeholder:text-base box-shadow-margin ${
                isDarkMode ? 'placeholder-white' : 'placeholder-black'
              }`}
              style={{
                backgroundColor: isDarkMode ? 'var(--card)' : 'var(--input)',
                color: isDarkMode ? 'white' : 'black',
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Clear search"
                onKeyDown={(e) => e.key === 'Enter' && handleClearSearch()}
              >
                <CloseIcon
                  className="w-5 h-5"
                  style={{
                    color: isDarkMode ? 'var(--muted-foreground)' : '#4b5563',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = isDarkMode
                      ? 'var(--foreground)'
                      : '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isDarkMode
                      ? 'var(--muted-foreground)'
                      : '#4b5563';
                  }}
                />
              </div>
            )}
          </div>
          <Button
            className="w-full sm:w-auto text-sm"
            aria-haspopup="dialog"
            aria-expanded={showMobileFilters}
            aria-controls="mobile-filter-dialog"
            aria-label="Open filter options"
            onClick={() => setShowMobileFilters((prev) => !prev)}
          >
            Filters
          </Button>
        </div>
      </form>
    </section>
  );
}
