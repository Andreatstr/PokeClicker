import {useState, useEffect} from 'react';
import {useAuth} from '@features/auth/hooks/useAuth';
import {useOnboarding} from '@/hooks';
import {useMutation} from '@apollo/client';
import {ConfirmDialog} from './ConfirmDialog';
import {FavoritePokemonSelector} from './FavoritePokemonSelector';
import {PokemonDisplayButton} from './PokemonDisplayButton';
import {usePokemonBasic} from '../hooks/usePokemonBasic';
import {useProfileHandlers} from '../hooks/useProfileHandlers';
import {formatTrainerSince} from '../utils/formatDate';
import {formatNumber} from '@/lib/formatNumber';
import {Checkbox} from '@ui/pixelact';
import {UPDATE_RANKS_PREFERENCE} from '@/lib/graphql';
import type {CheckedState} from '@radix-ui/react-checkbox';

interface ProfileDashboardProps {
  isDarkMode?: boolean;
  onNavigate?: (
    page: 'clicker' | 'ranks' | 'pokedex' | 'login' | 'profile'
  ) => void;
}

export function ProfileDashboard({
  isDarkMode = false,
  onNavigate,
}: ProfileDashboardProps) {
  const {user, updateUser} = useAuth();
  const {restartTutorial} = useOnboarding();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showFavoriteSelector, setShowFavoriteSelector] = useState(false);
  const [showSelectedSelector, setShowSelectedSelector] = useState(false);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [updatePreference] = useMutation(UPDATE_RANKS_PREFERENCE, {
    onCompleted: (data) => {
      if (data?.updateRanksPreference) {
        // Update the AuthContext user state and localStorage
        updateUser(data.updateRanksPreference);
      }
    },
    onError(error) {
      console.error('Failed to update ranks preference:', error);
    },
  });

  const {
    handleLogout,
    handleDeleteAccount,
    handleSetFavorite,
    handleSetSelected,
    deleting,
  } = useProfileHandlers(onNavigate);

  const {data: favoritePokemonData} = usePokemonBasic(
    user?.favorite_pokemon_id
  );
  const {data: selectedPokemonData} = usePokemonBasic(
    user?.selected_pokemon_id
  );

  useEffect(() => {
    if (user) {
      setChecked(user.showInRanks !== false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.showInRanks]);

  if (!user) {
    return null;
  }

  const onDeleteConfirm = async () => {
    await handleDeleteAccount();
    setDeleteDialogOpen(false);
  };

  const onFavoriteSelect = async (pokemonId: number | null) => {
    const success = await handleSetFavorite(pokemonId);
    if (success) {
      setShowFavoriteSelector(false);
    }
  };

  const onSelectedSelect = async (pokemonId: number | null) => {
    const success = await handleSetSelected(pokemonId);
    if (success) {
      setShowSelectedSelector(false);
    }
  };

  const handleCheckedChange = async (state: CheckedState) => {
    if (!user) return;

    const newValue = state === true;
    setChecked(newValue);
    setIsUpdating(true);

    try {
      await updatePreference({
        variables: {showInRanks: newValue},
      });
    } catch (error) {
      console.error('Failed to update ranks preference:', error);
      setChecked(user?.showInRanks !== false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <main
      className="max-w-4xl mx-auto py-4 px-4 sm:py-8 sm:px-6"
      aria-labelledby="profile-title"
    >
      <article
        className="border-4 p-4 sm:p-6 pixel-font"
        style={{
          borderColor: isDarkMode ? '#333333' : 'black',
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f1e8',
          boxShadow: isDarkMode
            ? '8px 8px 0px rgba(51,51,51,1)'
            : '8px 8px 0px rgba(0,0,0,1)',
        }}
      >
        <h1
          id="profile-title"
          className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6"
        >
          TRAINER PROFILE
        </h1>

        {/* User Info Section */}
        <section
          className="mb-4 sm:mb-6 p-3 sm:p-4 border-4"
          style={{borderColor: isDarkMode ? '#333333' : 'black'}}
          aria-labelledby="trainer-info-heading"
        >
          <h2
            id="trainer-info-heading"
            className="text-lg sm:text-xl mb-3 sm:mb-4"
          >
            TRAINER INFO
          </h2>
          <dl className="text-sm sm:text-base flex flex-col gap-3">
            <div>
              <dt className="inline">
                <strong>NAME:</strong>
              </dt>
              <dd className="inline ml-2">{user.username}</dd>
            </div>

            <div>
              <dt className="inline">
                <strong>RARE CANDY:</strong>
              </dt>
              <dd className="inline ml-2">{formatNumber(user.rare_candy)}</dd>
            </div>

            <div>
              <dt className="inline">
                <strong>POKEMON OWNED:</strong>
              </dt>
              <dd className="inline ml-2">{user.owned_pokemon_ids.length}</dd>
            </div>

            <div>
              <dt className="inline">
                <strong>TRAINER SINCE:</strong>
              </dt>
              <dd className="inline ml-2">
                {formatTrainerSince(user.created_at)}
              </dd>
            </div>
          </dl>
        </section>

        {checked !== null && (
          <section
            className="mb-4 sm:mb-6 p-3 sm:p-4 border-4"
            style={{borderColor: isDarkMode ? '#333333' : 'black'}}
            aria-labelledby="ranks-visibility-heading"
          >
            <h2
              id="ranks-visibility-heading"
              className="text-lg sm:text-xl font-bold mb-3"
            >
              RANKS VISIBILITY
            </h2>
            <label
              htmlFor="profile-show-in-ranks"
              className="flex items-center gap-2 text-sm"
              style={{color: 'var(--foreground)'}}
            >
              <Checkbox
                id="profile-show-in-ranks"
                checked={checked}
                onCheckedChange={handleCheckedChange}
                disabled={isUpdating}
              />
              Show me in ranks
            </label>
          </section>
        )}

        {/* Pokemon Selection Sections */}
        <section
          data-onboarding="pokemon-selection"
          aria-label="Pokemon selection options"
        >
          {/* Battle Pokemon Section (renamed from Favorite) */}
          <section
            className="mb-4 sm:mb-6 p-3 sm:p-4 border-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
            style={{borderColor: isDarkMode ? '#333333' : 'black'}}
            aria-labelledby="battle-pokemon-heading"
          >
            <header className="flex-1">
              <h2
                id="battle-pokemon-heading"
                className="text-lg sm:text-xl font-bold"
              >
                BATTLE POKEMON
              </h2>
              <p className="text-xs opacity-70 mt-1">
                This Pokemon is used in battles in the World
              </p>
            </header>
            <PokemonDisplayButton
              pokemon={favoritePokemonData?.pokemonById}
              onClick={() => setShowFavoriteSelector(true)}
              disabled={user.owned_pokemon_ids.length === 0}
              title="Click to change battle Pokemon"
              emptyTitle={
                user.owned_pokemon_ids.length === 0
                  ? 'Catch a Pokemon first!'
                  : 'Click to select battle Pokemon'
              }
              isDarkMode={isDarkMode}
              isFirstRender={true}
            />
          </section>

          {/* Clicker Pokemon Section */}
          <section
            className="mb-4 sm:mb-6 p-3 sm:p-4 border-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
            style={{borderColor: isDarkMode ? '#333333' : 'black'}}
            aria-labelledby="clicker-pokemon-heading"
          >
            <header className="flex-1">
              <h2
                id="clicker-pokemon-heading"
                className="text-lg sm:text-xl font-bold"
              >
                CLICKER POKEMON
              </h2>
              <p className="text-xs opacity-70 mt-1">
                This Pokemon appears in the Clicker game
              </p>
            </header>
            <PokemonDisplayButton
              pokemon={selectedPokemonData?.pokemonById}
              onClick={() => setShowSelectedSelector(true)}
              disabled={user.owned_pokemon_ids.length === 0}
              title="Click to change clicker Pokemon"
              emptyTitle={
                user.owned_pokemon_ids.length === 0
                  ? 'Catch a Pokemon first!'
                  : 'Click to select clicker Pokemon'
              }
              isDarkMode={isDarkMode}
            />
          </section>
        </section>

        {/* Tutorial Section */}
        <section
          className="mb-4 sm:mb-6 p-3 sm:p-4 border-4"
          style={{borderColor: isDarkMode ? '#333333' : 'black'}}
          aria-labelledby="tutorial-heading"
        >
          <h2 id="tutorial-heading" className="text-lg sm:text-xl mb-2">
            TUTORIAL
          </h2>
          <p className="text-xs sm:text-sm mb-3 opacity-70">
            Need help? Restart the interactive tutorial to learn how to use all
            features.
          </p>
          <button
            aria-label="Restart tutorial"
            onClick={() => {
              window.scrollTo({top: 0, behavior: 'instant'});
              if (onNavigate) {
                onNavigate('pokedex');
              }
              setTimeout(() => {
                restartTutorial();
              }, 500);
            }}
            className="w-full sm:w-auto px-4 py-2 font-bold border-4 transition-all text-sm"
            style={{
              borderColor: isDarkMode ? '#333333' : 'black',
              backgroundColor: '#10845dff',
              color: 'white',
              boxShadow: isDarkMode
                ? '4px 4px 0px rgba(51,51,51,1)'
                : '4px 4px 0px rgba(0,0,0,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '6px 6px 0px rgba(51,51,51,1)'
                : '6px 6px 0px rgba(0,0,0,1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '4px 4px 0px rgba(51,51,51,1)'
                : '4px 4px 0px rgba(0,0,0,1)';
            }}
          >
            RESTART TUTORIAL
          </button>
        </section>

        {/* Action Buttons */}
        <footer
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          aria-label="Account actions"
        >
          <button
            onClick={handleLogout}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 font-bold border-4 transition-all text-sm sm:text-base"
            aria-label="Log out"
            style={{
              borderColor: isDarkMode ? '#333333' : 'black',
              backgroundColor: '#336fcfff',
              color: 'white',
              boxShadow: isDarkMode
                ? '4px 4px 0px rgba(51,51,51,1)'
                : '4px 4px 0px rgba(0,0,0,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '6px 6px 0px rgba(51,51,51,1)'
                : '6px 6px 0px rgba(0,0,0,1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '4px 4px 0px rgba(51,51,51,1)'
                : '4px 4px 0px rgba(0,0,0,1)';
            }}
          >
            LOGOUT
          </button>

          <button
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleting}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 font-bold border-4 transition-all text-sm sm:text-base"
            aria-label="Delete account"
            style={{
              borderColor: isDarkMode ? '#333333' : 'black',
              backgroundColor: deleting ? '#9ca3af' : '#d13a3aff',
              color: 'white',
              boxShadow: isDarkMode
                ? '4px 4px 0px rgba(51,51,51,1)'
                : '4px 4px 0px rgba(0,0,0,1)',
              cursor: deleting ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!deleting) {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = isDarkMode
                  ? '6px 6px 0px rgba(51,51,51,1)'
                  : '6px 6px 0px rgba(0,0,0,1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '4px 4px 0px rgba(51,51,51,1)'
                : '4px 4px 0px rgba(0,0,0,1)';
            }}
          >
            {deleting ? 'DELETING...' : 'DELETE ACCOUNT'}
          </button>
        </footer>
      </article>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={onDeleteConfirm}
        title="DELETE ACCOUNT"
        message="Are you sure you want to delete your account? This action cannot be undone. All your Pokemon and progress will be lost forever."
        confirmText="DELETE"
        cancelText="CANCEL"
        isDarkMode={isDarkMode}
      />

      <FavoritePokemonSelector
        isOpen={showFavoriteSelector}
        onClose={() => setShowFavoriteSelector(false)}
        onSelect={onFavoriteSelect}
        ownedPokemonIds={user.owned_pokemon_ids}
        isDarkMode={isDarkMode}
      />

      <FavoritePokemonSelector
        isOpen={showSelectedSelector}
        onClose={() => setShowSelectedSelector(false)}
        onSelect={onSelectedSelect}
        ownedPokemonIds={user.owned_pokemon_ids}
        isDarkMode={isDarkMode}
      />
    </main>
  );
}
