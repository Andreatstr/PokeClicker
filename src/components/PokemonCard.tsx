import { Card } from '@/components/ui/pixelact-ui/card'
import { type Pokemon } from '@/data/mockData'
import '@/components/ui/pixelact-ui/styles/patterns.css'

interface PokemonCardProps {
  pokemon: Pokemon
  onClick?: (pokemon: Pokemon) => void
}

function getTypeColors(type: string) {
  const typeColorMap: Record<string, { badge: string; cardBg: string; cardBorder: string; shadow: string }> = {
    normal: {
      badge: 'bg-gray-400',
      cardBg: 'bg-gradient-to-br from-gray-100 to-gray-200',
      cardBorder: 'border-gray-400',
      shadow: 'shadow-gray-400/50'
    },
    fire: {
      badge: 'bg-red-500',
      cardBg: 'bg-gradient-to-br from-red-50 to-red-100',
      cardBorder: 'border-red-400',
      shadow: 'shadow-red-400/50'
    },
    water: {
      badge: 'bg-blue-500',
      cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      cardBorder: 'border-blue-400',
      shadow: 'shadow-blue-400/50'
    },
    electric: {
      badge: 'bg-yellow-400',
      cardBg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      cardBorder: 'border-yellow-400',
      shadow: 'shadow-yellow-400/50'
    },
    grass: {
      badge: 'bg-green-500',
      cardBg: 'bg-gradient-to-br from-green-50 to-green-100',
      cardBorder: 'border-green-400',
      shadow: 'shadow-green-400/50'
    },
    ice: {
      badge: 'bg-blue-200',
      cardBg: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
      cardBorder: 'border-cyan-300',
      shadow: 'shadow-cyan-300/50'
    },
    fighting: {
      badge: 'bg-red-700',
      cardBg: 'bg-gradient-to-br from-red-100 to-red-200',
      cardBorder: 'border-red-600',
      shadow: 'shadow-red-600/50'
    },
    poison: {
      badge: 'bg-purple-500',
      cardBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      cardBorder: 'border-purple-400',
      shadow: 'shadow-purple-400/50'
    },
    ground: {
      badge: 'bg-yellow-600',
      cardBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      cardBorder: 'border-amber-400',
      shadow: 'shadow-amber-400/50'
    },
    flying: {
      badge: 'bg-indigo-400',
      cardBg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      cardBorder: 'border-indigo-300',
      shadow: 'shadow-indigo-300/50'
    },
    psychic: {
      badge: 'bg-pink-500',
      cardBg: 'bg-gradient-to-br from-pink-50 to-pink-100',
      cardBorder: 'border-pink-400',
      shadow: 'shadow-pink-400/50'
    },
    bug: {
      badge: 'bg-green-400',
      cardBg: 'bg-gradient-to-br from-lime-50 to-lime-100',
      cardBorder: 'border-lime-400',
      shadow: 'shadow-lime-400/50'
    },
    rock: {
      badge: 'bg-yellow-800',
      cardBg: 'bg-gradient-to-br from-stone-50 to-stone-100',
      cardBorder: 'border-stone-400',
      shadow: 'shadow-stone-400/50'
    },
    ghost: {
      badge: 'bg-purple-700',
      cardBg: 'bg-gradient-to-br from-violet-50 to-violet-100',
      cardBorder: 'border-violet-400',
      shadow: 'shadow-violet-400/50'
    },
    dragon: {
      badge: 'bg-indigo-700',
      cardBg: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
      cardBorder: 'border-indigo-600',
      shadow: 'shadow-indigo-600/50'
    },
    dark: {
      badge: 'bg-gray-800',
      cardBg: 'bg-gradient-to-br from-slate-100 to-slate-200',
      cardBorder: 'border-slate-600',
      shadow: 'shadow-slate-600/50'
    },
    steel: {
      badge: 'bg-gray-500',
      cardBg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      cardBorder: 'border-gray-500',
      shadow: 'shadow-gray-500/50'
    },
    fairy: {
      badge: 'bg-pink-300',
      cardBg: 'bg-gradient-to-br from-pink-25 to-pink-50',
      cardBorder: 'border-pink-300',
      shadow: 'shadow-pink-300/50'
    },
  }

  return typeColorMap[type] || typeColorMap.normal
}

function getBackgroundImageUrl(types: string[]): string {
  const primaryType = types[0]
  return `/pokemon-type-bg/${primaryType}.png`
}

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const primaryType = pokemon.types[0]
  const typeColors = getTypeColors(primaryType)
  const backgroundImageUrl = getBackgroundImageUrl(pokemon.types)

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
        card-pattern
        cursor-pointer w-[280px] p-6 border-4 shadow-lg
        transition-all duration-200 ease-in-out
        hover:translate-y-[-4px] hover:shadow-xl
        hover:scale-[1.02] active:scale-[0.98] active:translate-y-[0px]
        ${typeColors.cardBg} ${typeColors.cardBorder} ${typeColors.shadow}
      `}
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${pokemon.name}`}
    >
      <article className="text-center relative z-1 flex flex-col justify-between h-full">
        <div>
          <p className="text-xs text-black mb-1 tracking-wider" style={{textShadow: '-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF'}}>
            #{pokemon.pokedexNumber}
          </p>
          <h2 className="text-lg font-bold text-white mb-3 tracking-wider" style={{textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000'}}>
            {pokemon.name}
          </h2>
        </div>

        <figure
          className="p-0 mt-4 aspect-square flex items-center justify-center m-0 relative"
        >
          <div className="absolute inset-0" style={{background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)'}}></div>
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="w-full h-full object-contain transition-transform duration-200 [filter:drop-shadow(0_4px_3px_rgba(0,0,0,0.7))] relative z-10"
            style={{ imageRendering: 'pixelated' }}
            loading="lazy"
          />
        </figure>

        <div className="flex flex-wrap justify-center gap-2">
          {pokemon.types.map((type) => {
            const typeColors = getTypeColors(type)
            return (
              <span
                key={type}
                className={`
                  px-3 py-1 text-xs font-bold text-white uppercase tracking-wider
                  border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  ${typeColors.badge} drop-shadow-sm
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