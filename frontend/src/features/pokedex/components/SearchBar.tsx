import {Button, Input, Label, SearchIcon, CloseIcon} from '@ui/pixelact';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleClearSearch: () => void;
  isMobile: boolean;
  showMobileFilters: boolean;
  setShowMobileFilters: (value: boolean | ((prev: boolean) => boolean)) => void;
  isDarkMode?: boolean;
}

export function SearchBar({
  searchTerm,
  setSearchTerm,
  handleClearSearch,
  isMobile,
  showMobileFilters,
  setShowMobileFilters,
  isDarkMode = false,
}: SearchBarProps) {
  return (
    <section className="mb-6 mt-6 sm:mt-4 max-w-4xl mx-auto">
      <form
        className="p-4"
        style={{
          backgroundColor: 'var(--primary)',
          border: '4px solid var(--border)',
          boxShadow: isDarkMode 
            ? '8px 8px 0px 0px rgba(255,255,255,1)' 
            : '8px 8px 0px 0px rgba(0,0,0,1)',
        }}
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <Label htmlFor="pokemon-search" className="sr-only">
          Search Pokemon
        </Label>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <SearchIcon 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
              style={{color: isDarkMode ? 'var(--muted-foreground)' : '#6b7280'}}
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
                    e.currentTarget.style.color = isDarkMode ? 'var(--foreground)' : '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isDarkMode ? 'var(--muted-foreground)' : '#4b5563';
                  }}
                />
              </div>
            )}
          </div>
          {isMobile && (
            <Button
              className="w-full mt-2 text-sm"
              aria-haspopup="dialog"
              aria-expanded={showMobileFilters}
              aria-controls="mobile-filter-dialog"
              aria-label="Open filter options"
              onClick={() => setShowMobileFilters((prev) => !prev)}
            >
              Filters
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
