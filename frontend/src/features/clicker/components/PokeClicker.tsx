/**
 * Main clicker game component with GameBoy-style interface.
 *
 * Features:
 * - Click to earn rare candy (attack + spAttack*0.5 per click)
 * - Passive income system (autoclicker based on autoclicker stat)
 * - 10 upgradeable stats with exponential costs
 * - Real-time candy sync with backend
 * - Asset preloading for smooth animations
 * - Selected Pokemon display
 *
 * Game mechanics:
 * - Click power: base attack + spAttack bonus
 * - Autoclicker: generates candy per second
 * - Lucky hit: chance for multiplied rewards
 * - Click multiplier: amplifies all clicks
 * - Pokedex bonus: bonus per owned Pokemon
 *
 * State management:
 * - Local candy optimistic updates for responsiveness
 * - Periodic backend sync to persist progress
 * - Stats synced from user.stats in auth context
 *
 * Integration:
 * - useGameMutations: GraphQL mutations for upgrades
 * - useCandySync: local/remote candy synchronization
 * - useAutoclicker: passive income generation
 * - useClickerActions: click handling and upgrade logic
 */
import {useState, useEffect} from 'react';
import {logger} from '@/lib/logger';
import {useAuth} from '@features/auth/hooks/useAuth';
import {useGameMutations} from '../hooks/useGameMutations';
import {useCandySync} from '../hooks/useCandySync';
import {useAutoclicker} from '../hooks/useAutoclicker';
import {useClickerActions} from '../hooks/useClickerActions';
import {gameAssetsCache} from '@/lib/gameAssetsCache';
import {GameBoyConsole} from './GameBoyConsole';
import {UpgradesPanel} from './UpgradesPanel';
import {UnauthenticatedMessage} from './UnauthenticatedMessage';
import {ErrorBanner} from '@/components';

interface PokeClickerProps {
  isDarkMode?: boolean;
  isOnboarding?: boolean;
}

export function PokeClicker({
  isDarkMode = false,
  isOnboarding = false,
}: PokeClickerProps) {
  const {user, isAuthenticated, updateUser} = useAuth();
  const {upgradeStat, loading} = useGameMutations();

  const [stats, setStats] = useState(
    user?.stats || {
      hp: 1,
      attack: 1,
      defense: 1,
      spAttack: 1,
      spDefense: 1,
      speed: 1,
      clickPower: 1,
      autoclicker: 1,
      luckyHitChance: 1,
      luckyHitMultiplier: 1,
      clickMultiplier: 1,
      pokedexBonus: 1,
    }
  );

  useEffect(() => {
    if (user?.stats) {
      setStats(user.stats);
    }
  }, [user?.stats]);

  const {
    localRareCandy,
    displayError,
    setDisplayError,
    addCandy,
    deductCandy,
    flushPendingCandy,
  } = useCandySync({user, isAuthenticated, updateUser});

  const {isAnimating, candies, handleClick, handleUpgrade} = useClickerActions({
    stats,
    isAuthenticated,
    addCandy,
    deductCandy,
    flushPendingCandy,
    localRareCandy,
    setDisplayError,
    setStats,
    upgradeStat,
    updateUser,
    ownedPokemonCount: user?.owned_pokemon_ids?.length || 0,
  });

  useAutoclicker({
    stats,
    isAuthenticated,
    onAutoClick: addCandy,
    ownedPokemonCount: user?.owned_pokemon_ids?.length || 0,
    isOnboarding,
  });

  useEffect(() => {
    const preloadAssets = async () => {
      try {
        await gameAssetsCache.preloadClickerAssets();
        await Promise.all([
          gameAssetsCache.getCharizardSprite(),
          gameAssetsCache.getCandyImage(),
          gameAssetsCache.getRareCandyIcon(),
          gameAssetsCache.getPokemonBackground(),
        ]);
      } catch (error) {
        logger.logError(error, 'PreloadGameAssets');
      }
    };
    preloadAssets();
  }, []);

  useEffect(() => {
    if (user) {
      setStats(user.stats);
    }
  }, [user]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
      {displayError && (
        <ErrorBanner
          message={displayError}
          onDismiss={() => setDisplayError(null)}
          isDarkMode={isDarkMode}
        />
      )}

      {!isAuthenticated && <UnauthenticatedMessage />}

      <GameBoyConsole
        isDarkMode={isDarkMode}
        isAuthenticated={isAuthenticated}
        isAnimating={isAnimating}
        candies={candies}
        selectedPokemonId={user?.selected_pokemon_id || null}
        onClickScreen={handleClick}
        isOnboarding={isOnboarding}
      />

      <div className="flex flex-col gap-6 w-full max-w-md lg:max-w-lg">
        <UpgradesPanel
          isDarkMode={isDarkMode}
          stats={stats}
          currentCandy={localRareCandy}
          isLoading={loading}
          isAuthenticated={isAuthenticated}
          onUpgrade={handleUpgrade}
          ownedPokemonCount={user?.owned_pokemon_ids?.length || 0}
        />
      </div>
    </div>
  );
}
