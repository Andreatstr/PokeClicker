import { useState, useEffect } from 'react'
import { mockPokemonData, type Pokemon } from './data/mockData'
import { PokemonCard } from './components/PokemonCard'
import { PokemonDetailModal } from './components/ui/pixelact-ui/PokemonDetailModal'
import { Button } from '@/components/ui/pixelact-ui/button'
import { Input } from '@/components/ui/pixelact-ui/input'
import { Label } from '@/components/ui/pixelact-ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/pixelact-ui/select'
import { SearchIcon, CloseIcon } from '@/components/ui/pixelact-ui/icons'
import { PokeClicker } from './components/PokeClicker'
import { Navbar } from './components/Navbar'
import { MultiSelect } from './components/ui/pixelact-ui/MultiSelect'

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>(mockPokemonData)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentPage, setCurrentPage] = useState<'clicker' | 'pokedex'>('clicker')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'type'>('id')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const handlePokemonClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon)
    setModalOpen(true)
    console.log('Clicked on:', pokemon.name)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const filtered = mockPokemonData.filter(pokemon => {
      const matchesSearch = debouncedSearchTerm === '' || pokemon.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchesRegion = !selectedRegion || pokemon.region === selectedRegion
      const matchesType = selectedTypes.length === 0 || selectedTypes.some(type => pokemon.types.includes(type))
      return matchesSearch && matchesRegion && matchesType
    })

    const sorted = [...filtered].sort((a, b) => {
      let valA: string | number
      let valB: string | number

      if (sortBy === 'id') {
        valA = a.id
        valB = b.id
        return valA - valB
      } else if (sortBy === 'name') {
        valA = a.name
        valB = b.name
      } else {
        valA = a.types[0]
        valB = b.types[0]
      }

      return valA.localeCompare(valB)
    })

    setFilteredPokemon(sorted)
  }, [debouncedSearchTerm, selectedRegion, selectedTypes, sortBy])

  const handleClearFilters = () => {
    setSelectedRegion(null)
    setSelectedTypes([])
    setSortBy('id')
  }

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <>
      <Navbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <main className="min-h-screen px-4 sm:px-6 md:px-8 pb-8 pt-0" style={{ backgroundColor: 'var(--retro-secondary)' }}>
        {currentPage === 'clicker' ? (
          <section className="py-8">
            <PokeClicker />
          </section>
        ) : (
          <>
            {/* Search Bar */}
            <section className="mb-6 mt-6 sm:mt-4 max-w-4xl mx-auto">
              <form className="p-4" style={{
                backgroundColor: 'var(--retro-primary)',
                border: '4px solid var(--retro-border)',
                boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'
              }} role="search" onSubmit={(e) => e.preventDefault()}>
                <Label htmlFor="pokemon-search" className="sr-only">Search Pokemon</Label>
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
              </form>
            </section>

            {/* Filters and Count */}
            <section className="mb-6">
              <div className="flex flex-col gap-4">
                <p className="text-sm pixel-font text-black">
                  Showing: xx-xx
                </p>

                <div className="grid gap-4" style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                }}>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-bold text-black">REGION</Label>
                    <Select value={selectedRegion ?? ''} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="w-full text-sm">
                        <SelectValue placeholder="Kanto (1-151)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kanto">Kanto (1-151)</SelectItem>
                        <SelectItem value="johto">Johto (152-251)</SelectItem>
                        <SelectItem value="hoenn">Hoenn (252-386)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-bold text-black">TYPE</Label>
                    <MultiSelect
                      options={[
                        "normal", "fire", "water", "electric", "grass", "ice",
                        "fighting", "poison", "ground", "flying", "psychic", "bug",
                        "rock", "ghost", "dragon", "dark", "steel", "fairy"
                      ]}
                      selected={selectedTypes}
                      onChange={setSelectedTypes}
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-bold text-black">SORT BY</Label>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'id' | 'name' | 'type')}>
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

                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-bold text-black invisible">ACTIONS</Label>
                    <Button type="button" className="w-full text-sm" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Pokemon Grid */}
            <section className="max-w-[2000px] mx-auto">
              {filteredPokemon.length === 0 ? (
                <div className="text-center py-16">
                  <p className="pixel-font text-xl ">No Pokemon found</p>
                  <p className="pixel-font text-sm text-[var(--retro-border)] mt-2">Try a different search term</p>
                </div>
              ) : (
                <>
                  <ul className="grid gap-4 md:gap-6 list-none p-0 m-0" style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 280px))',
                    justifyContent: 'center'
                  }}>
                    {filteredPokemon.map((pokemon) => (
                      <li key={pokemon.id}>
                        <PokemonCard pokemon={pokemon} onClick={handlePokemonClick} />
                      </li>
                    ))}
                  </ul>

                  {/* Load More Button */}
                  <footer className="flex justify-center mt-8">
                    <Button variant="default" size="lg">
                      Load more
                    </Button>
                  </footer>
                </>
              )}
            </section>
          </>
        )}
      </main>

      <PokemonDetailModal
        pokemon={selectedPokemon}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSelectPokemon={(name) => {
          const next = mockPokemonData.find((p) => p.name === name)
          if (next) setSelectedPokemon(next)
        }}
      />
    </>
  )
}

export default App
