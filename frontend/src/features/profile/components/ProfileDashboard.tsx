import {useState} from 'react';
import {useAuth} from '@features/auth/hooks/useAuth';
import {ConfirmDialog} from './ConfirmDialog';
import {FavoritePokemonSelector} from './FavoritePokemonSelector';
import {PokemonDisplayButton} from './PokemonDisplayButton';
import {usePokemonBasic} from '../hooks/usePokemonBasic';
import {useProfileHandlers} from '../hooks/useProfileHandlers';
import {formatTrainerSince} from '../utils/formatDate';

interface ProfileDashboardProps {
  isDarkMode?: boolean;
  onNavigate?: (page: 'clicker' | 'pokedex' | 'login' | 'profile') => void;
}

export function ProfileDashboard({
  isDarkMode = false,
  onNavigate,
}: ProfileDashboardProps) {
  const {user} = useAuth();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showFavoriteSelector, setShowFavoriteSelector] = useState(false);
  const [showSelectedSelector, setShowSelectedSelector] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:py-8 sm:px-6">
      <div
        className="border-4 p-4 sm:p-6 pixel-font"
        style={{
          borderColor: isDarkMode ? '#333333' : 'black',
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f1e8',
          boxShadow: isDarkMode
            ? '8px 8px 0px rgba(51,51,51,1)'
            : '8px 8px 0px rgba(0,0,0,1)',
        }}
      >
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
          TRAINER PROFILE
        </h1>

        {/* User Info Section */}
        <div
          className="mb-4 sm:mb-6 p-3 sm:p-4 border-4"
          style={{borderColor: isDarkMode ? '#333333' : 'black'}}
        >
          <h2 className="text-lg sm:text-xl mb-3 sm:mb-4">TRAINER INFO</h2>
          <div className="space-y-2 text-sm sm:text-base">
            <p className="break-words">
              <strong>NAME:</strong> {user.username}
            </p>
            <p>
              <strong>RARE CANDY:</strong> {user.rare_candy}
            </p>
            <p>
              <strong>POKEMON OWNED:</strong> {user.owned_pokemon_ids.length}
            </p>
            <p>
              <strong>TRAINER SINCE:</strong>{' '}
              {formatTrainerSince(user.created_at)}
            </p>
          </div>
        </div>

        {/* Game Statistics Section */}
        <div
          className="mb-4 sm:mb-6 p-3 sm:p-4 border-4"
          style={{borderColor: isDarkMode ? '#333333' : 'black'}}
        >
          <h2 className="text-lg sm:text-xl mb-3 sm:mb-4">TRAINER STATS</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm sm:text-base">
            <div className="flex flex-col">
              <span className="text-xs opacity-70">HP</span>
              <span className="font-bold">{user.stats.hp}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs opacity-70">ATTACK</span>
              <span className="font-bold">{user.stats.attack}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs opacity-70">DEFENSE</span>
              <span className="font-bold">{user.stats.defense}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs opacity-70">SP. ATK</span>
              <span className="font-bold">{user.stats.spAttack}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs opacity-70">SP. DEF</span>
              <span className="font-bold">{user.stats.spDefense}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs opacity-70">SPEED</span>
              <span className="font-bold">{user.stats.speed}</span>
            </div>
          </div>
        </div>

        {/* Battle Pokemon Section - previously Favorite */}
        <div
          className="mb-4 sm:mb-6 p-3 sm:p-4 border-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
          style={{borderColor: isDarkMode ? '#333333' : 'black'}}
        >
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold">BATTLE POKEMON</h2>
            <p className="text-xs opacity-70 mt-1">
              This Pokemon is used in battles in the World
            </p>
          </div>
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
        </div>

        {/* Clicker Pokemon Section */}
        <div
          className="mb-4 sm:mb-6 p-3 sm:p-4 border-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
          style={{borderColor: isDarkMode ? '#333333' : 'black'}}
        >
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold">CLICKER POKEMON</h2>
            <p className="text-xs opacity-70 mt-1">
              This Pokemon appears in the Clicker game
            </p>
          </div>
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleLogout}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 font-bold border-4 transition-all text-sm sm:text-base"
            style={{
              borderColor: isDarkMode ? '#333333' : 'black',
              backgroundColor: '#3b82f6',
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
            style={{
              borderColor: isDarkMode ? '#333333' : 'black',
              backgroundColor: deleting ? '#9ca3af' : '#ef4444',
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
        </div>
      </div>

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
    </div>
  );
}
