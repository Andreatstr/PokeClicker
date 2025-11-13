import {Button, Input, Label, SearchIcon, CloseIcon} from '@ui/pixelact';
import {usePokedexFilterContext} from '../../contexts/usePokedexFilterContext';

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
        data-onboarding="search-bar"
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
            <Input
              id="pokemon-search"
              type="search"
              placeholder="search"
              aria-label="Search"
              className={`w-full border-0 text-xl pl-12 pr-12 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none pixel-font max-w-full shadow-(--pixel-box-shadow) placeholder:text-sm md:placeholder:text-base box-shadow-margin ${
                isDarkMode ? 'placeholder-white' : 'placeholder-black'
              }`}
              style={{
                backgroundColor: isDarkMode ? 'var(--card)' : 'var(--input)',
                color: isDarkMode ? 'white' : 'black',
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              isDarkMode={isDarkMode}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] ${isDarkMode ? 'focus-visible:ring-white' : 'focus-visible:ring-[#0066ff]'}`}
                type="button"
                aria-label="Clear search"
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
              </button>
            )}
          </div>
          <Button
            data-onboarding="filters-button"
            className="w-full sm:w-auto text-sm min-h-[44px]"
            aria-haspopup="dialog"
            aria-expanded={showMobileFilters}
            aria-controls="mobile-filter-dialog"
            aria-label="Open filter options"
            onClick={() => setShowMobileFilters((prev) => !prev)}
            isDarkMode={isDarkMode}
          >
            Filters
          </Button>
        </div>
      </form>
    </section>
  );
}
