import {describe, it, expect, vi} from 'vitest';
import {render} from '../../../../../test/utils';
import {PokemonCard} from '../PokemonCard';
import type {PokedexPokemon} from '../../../types';

// Mock the purchase handler hook
vi.mock('../../../hooks/usePokemonPurchaseHandler', () => ({
  usePokemonPurchaseHandler: () => ({
    handlePurchase: vi.fn(),
    error: null,
    isAnimating: false,
  }),
}));

// Mock sprite and background caches
vi.mock('@/lib/pokemonSpriteCache', () => ({
  pokemonSpriteCache: {
    getPokemonSprite: vi.fn().mockResolvedValue(new Image()),
  },
}));

vi.mock('@/lib/typeBackgroundCache', () => ({
  typeBackgroundCache: {
    getTypeBackground: vi.fn().mockResolvedValue(new Image()),
  },
}));

describe('PokemonCard Semantic HTML', () => {
  const mockPokemon: PokedexPokemon = {
    id: 25,
    name: 'Pikachu',
    types: ['electric'],
    sprite:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    pokedexNumber: 25,
    height: '0.4m',
    weight: '6.0kg',
    abilities: ['Static', 'Lightning Rod'],
    stats: {
      hp: 35,
      attack: 55,
      defense: 40,
      spAttack: 50,
      spDefense: 50,
      speed: 90,
    },
    evolutionChain: [25, 26],
    generation: 'kanto',
    genderRatio: {male: 50, female: 50},
    habitat: 'forest',
    isOwned: true,
  };

  it('should render with semantic HTML structure (snapshot)', () => {
    const {container} = render(
      <PokemonCard
        pokemon={mockPokemon}
        onClick={vi.fn()}
        isDarkMode={false}
        ownedPokemonIds={[25]}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should use semantic elements correctly', () => {
    const {container} = render(
      <PokemonCard
        pokemon={mockPokemon}
        onClick={vi.fn()}
        isDarkMode={false}
        ownedPokemonIds={[25]}
      />
    );

    // Check for semantic elements
    const aside = container.querySelector('aside');
    const article = container.querySelector('article');
    const figure = container.querySelector('figure');
    const header = container.querySelector('header');
    const h3 = container.querySelector('h3');
    const section = container.querySelector('section');
    const h4 = container.querySelector('h4');
    const ul = container.querySelector('ul');
    const li = container.querySelector('li');

    expect(aside).toBeInTheDocument();
    expect(article).toBeInTheDocument();
    expect(figure).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(h3).toBeInTheDocument();
    expect(section).toBeInTheDocument();
    expect(h4).toBeInTheDocument();
    expect(ul).toBeInTheDocument();
    expect(li).toBeInTheDocument();
  });

  it('should have h3 heading with Pokemon name', () => {
    const {container} = render(
      <PokemonCard
        pokemon={mockPokemon}
        onClick={vi.fn()}
        isDarkMode={false}
        ownedPokemonIds={[25]}
      />
    );

    const h3 = container.querySelector('h3');
    expect(h3).toHaveTextContent('Pikachu');
  });

  it('should render abilities as a list with h4 heading', () => {
    const {container} = render(
      <PokemonCard
        pokemon={mockPokemon}
        onClick={vi.fn()}
        isDarkMode={false}
        ownedPokemonIds={[25]}
      />
    );

    const h4 = container.querySelector('h4');
    const ul = container.querySelector('ul');
    const listItems = container.querySelectorAll('li');

    expect(h4).toHaveTextContent('Abilities');
    expect(ul).toBeInTheDocument();
    expect(listItems).toHaveLength(2);
    expect(listItems[0]).toHaveTextContent('Static');
    expect(listItems[1]).toHaveTextContent('Lightning Rod');
  });

  it('should render locked Pokemon with same semantic structure', () => {
    const lockedPokemon = {...mockPokemon, isOwned: false};
    const {container} = render(
      <PokemonCard
        pokemon={lockedPokemon}
        onClick={vi.fn()}
        isDarkMode={false}
        ownedPokemonIds={[]}
      />
    );

    // Should still have semantic elements even when locked
    const aside = container.querySelector('aside');
    const article = container.querySelector('article');
    const figure = container.querySelector('figure');
    const header = container.querySelector('header');
    const h3 = container.querySelector('h3');

    expect(aside).toBeInTheDocument();
    expect(article).toBeInTheDocument();
    expect(figure).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(h3).toBeInTheDocument();
    expect(h3).toHaveTextContent('???'); // Locked Pokemon shows ???
  });

  it('should maintain all CSS classes after semantic changes', () => {
    const {container} = render(
      <PokemonCard
        pokemon={mockPokemon}
        onClick={vi.fn()}
        isDarkMode={false}
        ownedPokemonIds={[25]}
      />
    );

    const article = container.querySelector('article');
    const header = container.querySelector('header');
    const h3 = container.querySelector('h3');
    const ul = container.querySelector('ul');

    // Verify CSS classes are preserved
    expect(article).toHaveClass(
      'bg-black/20',
      'p-2',
      'rounded-md',
      'w-full',
      'flex-1',
      'flex',
      'flex-col',
      'overflow-hidden'
    );
    expect(header).toHaveClass(
      'flex',
      'items-center',
      'justify-between',
      'min-h-[20px]'
    );
    expect(h3).toHaveClass('font-bold', 'text-sm', 'capitalize', 'truncate');
    expect(ul).toHaveClass(
      'flex',
      'flex-wrap',
      'gap-0.5',
      'mt-0.5',
      'list-none',
      'p-0',
      'm-0'
    );
  });

  it('should be keyboard accessible with role and tabindex', () => {
    const {container} = render(
      <PokemonCard
        pokemon={mockPokemon}
        onClick={vi.fn()}
        isDarkMode={false}
        ownedPokemonIds={[25]}
      />
    );

    const aside = container.querySelector('aside');
    expect(aside).toHaveAttribute('role', 'button');
    expect(aside).toHaveAttribute('tabIndex', '0');
    expect(aside).toHaveAttribute('aria-label', 'View details for Pikachu');
  });
});
