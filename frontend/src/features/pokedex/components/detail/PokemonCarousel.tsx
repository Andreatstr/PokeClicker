import {useEffect, useMemo} from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
} from '@ui/pixelact';
import type {PokedexPokemon} from '@features/pokedex';
import {usePurchasePokemon} from '@features/pokedex';
import type {User} from '@features/auth';
import {pokemonSpriteCache} from '@/lib/pokemonSpriteCache';
import {logger} from '@/lib/logger';
import {PokemonDetailCard} from './PokemonDetailCard';

interface PokemonCarouselProps {
  allPokemon: PokedexPokemon[];
  currentPokemon: PokedexPokemon;
  isDarkMode: boolean;
  onClose: () => void;
  onSelectPokemon?: (id: number) => void;
  onPurchaseComplete?: (id: number) => void;
  purchasePokemonMutation: ReturnType<typeof usePurchasePokemon>[0];
  updateUser: (user: User) => void;
  user: User | null;
  ownedPokemonIds: number[];
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function PokemonCarousel({
  allPokemon,
  currentPokemon,
  isDarkMode,
  onClose,
  onSelectPokemon,
  onPurchaseComplete,
  purchasePokemonMutation,
  updateUser,
  user,
  ownedPokemonIds,
  closeButtonRef,
}: PokemonCarouselProps) {
  const initialIndex = allPokemon.findIndex((p) => p.id === currentPokemon.id);

  // Create stable ID list to prevent unnecessary preload triggers
  const pokemonIdList = useMemo(
    () => allPokemon.map((p) => p.id).join(','),
    [allPokemon]
  );

  // Preload nearby Pokemon sprites (current ± 2)
  // Only runs when the Pokemon list actually changes, not on every render
  useEffect(() => {
    const nearbyIndices = [
      initialIndex - 2,
      initialIndex - 1,
      initialIndex,
      initialIndex + 1,
      initialIndex + 2,
    ].filter((i) => i >= 0 && i < allPokemon.length);

    const nearbyIds = nearbyIndices
      .map((i) => allPokemon[i]?.id)
      .filter((id): id is number => id !== undefined);

    pokemonSpriteCache.preloadPokemonSprites(nearbyIds).catch((err) => {
      logger.logError(err, 'PreloadCarouselSprites');
    });
  }, [pokemonIdList, initialIndex, allPokemon]);

  return (
    <Carousel
      key={`carousel-${currentPokemon.id}`}
      className="relative"
      initialIndex={initialIndex}
    >
      <CarouselContent>
        {allPokemon.map((poke, index) => (
          <CarouselItem key={poke.id}>
            <LazyPokemonCard
              pokemon={poke}
              index={index}
              isDarkMode={isDarkMode}
              onClose={onClose}
              onSelectPokemon={onSelectPokemon}
              onPurchaseComplete={onPurchaseComplete}
              purchasePokemonMutation={purchasePokemonMutation}
              updateUser={updateUser}
              user={user}
              ownedPokemonIds={ownedPokemonIds}
              closeButtonRef={closeButtonRef}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Position carousel buttons outside the content - hidden on mobile (swipe instead) */}
      {/* These buttons come LAST in tab order, after all modal content */}
      {/* 44x44px = w-11 h-11, but border-4 adds 8px to each dimension, so we need w-[52px]! h-[52px]! for true 44px clickable area */}
      {/* Use ! important to override base carousel component's responsive classes */}
      <CarouselPrevious className="cursor-pointer hidden md:block fixed left-[calc(50%-300px)] top-1/2 -translate-y-1/2 z-60 w-[52px]! h-[52px]! border-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] text-2xl" />
      <CarouselNext className="cursor-pointer hidden md:block fixed right-[calc(50%-300px)] top-1/2 -translate-y-1/2 z-60 w-[52px]! h-[52px]! border-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] text-2xl" />
    </Carousel>
  );
}

// Lazy-loaded Pokemon card that only renders when near the current carousel index
function LazyPokemonCard({
  pokemon,
  index,
  isDarkMode,
  onClose,
  onSelectPokemon,
  onPurchaseComplete,
  purchasePokemonMutation,
  updateUser,
  user,
  ownedPokemonIds,
  closeButtonRef,
}: {
  pokemon: PokedexPokemon;
  index: number;
  isDarkMode: boolean;
  onClose: () => void;
  onSelectPokemon?: (id: number) => void;
  onPurchaseComplete?: (id: number) => void;
  purchasePokemonMutation: ReturnType<typeof usePurchasePokemon>[0];
  updateUser: (user: User) => void;
  user: User | null;
  ownedPokemonIds: number[];
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const {currentIndex} = useCarousel();

  // Only render current Pokemon ± 1 to reduce API calls
  // This prevents loading evolution chains for all Pokemon at once
  const renderWindow = 1;
  const shouldRender = Math.abs(currentIndex - index) <= renderWindow;
  const isCurrentCard = currentIndex === index;

  if (!shouldRender) {
    return (
      <div
        className="flex flex-col gap-3 md:gap-4 items-center w-full max-w-[400px] mx-auto"
        style={{minHeight: '600px'}}
        // Use proper React 19 inert attribute - boolean true for non-current cards
        inert={!isCurrentCard ? true : undefined}
        aria-hidden={!isCurrentCard}
      >
        {/* Placeholder - content loads when scrolled into view */}
      </div>
    );
  }

  // Wrap in a div with inert to prevent tabbing to non-current cards
  // In React 19, inert should be boolean true, not empty string
  return (
    <div inert={!isCurrentCard ? true : undefined} aria-hidden={!isCurrentCard}>
      <PokemonDetailCard
        pokemon={pokemon}
        isDarkMode={isDarkMode}
        onClose={onClose}
        onSelectPokemon={onSelectPokemon}
        onPurchaseComplete={onPurchaseComplete}
        purchasePokemonMutation={purchasePokemonMutation}
        updateUser={updateUser}
        user={user}
        ownedPokemonIds={ownedPokemonIds}
        closeButtonRef={closeButtonRef}
      />
    </div>
  );
}
