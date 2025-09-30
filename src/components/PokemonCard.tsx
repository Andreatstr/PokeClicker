import { Card } from '@/components/ui/pixelact-ui/card'
import { type Pokemon } from '@/data/mockData'

interface PokemonCardProps {
  pokemon: Pokemon
  onClick?: (pokemon: Pokemon) => void
}

function getTypeColors(type: string) {
  const typeColorMap: Record<string, { badge: string; cardBg: string; cardBorder: string }> = {
    normal: {
      badge: 'bg-gray-400',
      cardBg: 'bg-gradient-to-br from-gray-100 to-gray-200',
      cardBorder: 'border-gray-400'
    },
    fire: {
      badge: 'bg-red-500',
      cardBg: 'bg-gradient-to-br from-red-50 to-red-100',
      cardBorder: 'border-red-400'
    },
    water: {
      badge: 'bg-blue-500',
      cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      cardBorder: 'border-blue-400'
    },
    electric: {
      badge: 'bg-yellow-400',
      cardBg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      cardBorder: 'border-yellow-400'
    },
    grass: {
      badge: 'bg-green-500',
      cardBg: 'bg-gradient-to-br from-green-50 to-green-100',
      cardBorder: 'border-green-400'
    },
    ice: {
      badge: 'bg-blue-200',
      cardBg: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
      cardBorder: 'border-cyan-300'
    },
    fighting: {
      badge: 'bg-red-700',
      cardBg: 'bg-gradient-to-br from-red-100 to-red-200',
      cardBorder: 'border-red-600'
    },
    poison: {
      badge: 'bg-purple-500',
      cardBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      cardBorder: 'border-purple-400'
    },
    ground: {
      badge: 'bg-yellow-600',
      cardBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      cardBorder: 'border-amber-400'
    },
    flying: {
      badge: 'bg-indigo-400',
      cardBg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      cardBorder: 'border-indigo-300'
    },
    psychic: {
      badge: 'bg-pink-500',
      cardBg: 'bg-gradient-to-br from-pink-50 to-pink-100',
      cardBorder: 'border-pink-400'
    },
    bug: {
      badge: 'bg-green-400',
      cardBg: 'bg-gradient-to-br from-lime-50 to-lime-100',
      cardBorder: 'border-lime-400'
    },
    rock: {
      badge: 'bg-yellow-800',
      cardBg: 'bg-gradient-to-br from-stone-50 to-stone-100',
      cardBorder: 'border-stone-400'
    },
    ghost: {
      badge: 'bg-purple-700',
      cardBg: 'bg-gradient-to-br from-violet-50 to-violet-100',
      cardBorder: 'border-violet-400'
    },
    dragon: {
      badge: 'bg-indigo-700',
      cardBg: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
      cardBorder: 'border-indigo-600'
    },
    dark: {
      badge: 'bg-gray-800',
      cardBg: 'bg-gradient-to-br from-slate-100 to-slate-200',
      cardBorder: 'border-slate-600'
    },
    steel: {
      badge: 'bg-gray-500',
      cardBg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      cardBorder: 'border-gray-500'
    },
    fairy: {
      badge: 'bg-pink-300',
      cardBg: 'bg-gradient-to-br from-pink-25 to-pink-50',
      cardBorder: 'border-pink-300'
    },
  }

  return typeColorMap[type] || typeColorMap.normal
}

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const primaryType = pokemon.types[0]
  const typeColors = getTypeColors(primaryType)

  const handleClick = () => {
    onClick?.(pokemon)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <Card
      font="pixel"
      className={`
        cursor-pointer w-[280px] p-6 border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        transition-all duration-200 ease-in-out
        hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        hover:scale-[1.02] active:scale-[0.98] active:translate-y-[0px]
        ${typeColors.cardBg} ${typeColors.cardBorder}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${pokemon.name}`}
    >
      <article className="text-center">
        <figure
          className="p-6 mb-4 aspect-square flex items-center justify-center m-0"
        >
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="w-full h-full object-contain transition-transform duration-200 hover:scale-110"
            style={{ imageRendering: 'pixelated' }}
            loading="lazy"
          />
        </figure>

        <p className="text-xs text-gray-600 mb-1 tracking-wider">
          #{pokemon.pokedexNumber}
        </p>

        <h2 className="text-lg font-bold text-black mb-3 tracking-wider drop-shadow-sm">
          {pokemon.name}
        </h2>

        <div className="flex flex-wrap justify-center gap-2">
          {pokemon.types.map((type) => {
            const typeColors = getTypeColors(type)
            return (
              <span
                key={type}
                className={`
                  px-3 py-1 text-xs font-bold text-white uppercase tracking-wider
                  border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  ${typeColors.badge}
                `}
              >
                {type}
              </span>
            )
          })}
        </div>
      </article>
    </Card>
  )
}