import {Button} from '@/components/ui/pixelact-ui/button';
import {Input} from '@/components/ui/pixelact-ui/input';
import {Label} from '@/components/ui/pixelact-ui/label';
import {SearchIcon, CloseIcon} from '@/components/ui/pixelact-ui/icons';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleClearSearch: () => void;
  isMobile: boolean;
  showMobileFilters: boolean;
  setShowMobileFilters: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function SearchBar({
  searchTerm,
  setSearchTerm,
  handleClearSearch,
  isMobile,
  showMobileFilters,
  setShowMobileFilters,
}: SearchBarProps) {
  return (
    <section className="mb-6 mt-6 sm:mt-4 max-w-4xl mx-auto">
      <form
        className="p-4"
        style={{
          backgroundColor: 'var(--retro-primary)',
          border: '4px solid var(--retro-border)',
          boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
        }}
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <Label htmlFor="pokemon-search" className="sr-only">
          Search Pokemon
        </Label>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              id="pokemon-search"
              type="search"
              placeholder="search"
              className="w-full border-0 text-xl pl-12 pr-12 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
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
                <CloseIcon className="w-5 h-5 text-gray-600 hover:text-black" />
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
