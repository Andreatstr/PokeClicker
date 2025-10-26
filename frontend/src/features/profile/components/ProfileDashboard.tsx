import {useState} from 'react';
import {useAuth} from '@features/auth';
import {useMutation, useQuery, gql} from '@apollo/client';
import {ConfirmDialog} from './ConfirmDialog';
import {FavoritePokemonSelector} from './FavoritePokemonSelector';

const DELETE_USER = gql`
  mutation DeleteUser {
    deleteUser
  }
`;

const SET_FAVORITE_POKEMON = gql`
  mutation SetFavoritePokemon($pokemonId: Int) {
    setFavoritePokemon(pokemonId: $pokemonId) {
      _id
      username
      rare_candy
      created_at
      stats {
        hp
        attack
        defense
        spAttack
        spDefense
        speed
      }
      owned_pokemon_ids
      favorite_pokemon_id
      selected_pokemon_id
    }
  }
`;

const SET_SELECTED_POKEMON = gql`
  mutation SetSelectedPokemon($pokemonId: Int) {
    setSelectedPokemon(pokemonId: $pokemonId) {
      _id
      username
      rare_candy
      created_at
      stats {
        hp
        attack
        defense
        spAttack
        spDefense
        speed
      }
      owned_pokemon_ids
      favorite_pokemon_id
      selected_pokemon_id
    }
  }
`;

const GET_POKEMON_BY_ID = gql`
  query GetPokemonById($id: Int!) {
    pokemonById(id: $id) {
      id
      name
      sprite
      types
    }
  }
`;

interface ProfileDashboardProps {
  isDarkMode?: boolean;
  onNavigate?: (page: 'clicker' | 'pokedex' | 'login' | 'profile') => void;
}

export function ProfileDashboard({
  isDarkMode = false,
  onNavigate,
}: ProfileDashboardProps) {
  const {user, logout, updateUser} = useAuth();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showFavoriteSelector, setShowFavoriteSelector] = useState(false);
  const [showSelectedSelector, setShowSelectedSelector] = useState(false);
  const [deleteUser, {loading: deleting}] = useMutation(DELETE_USER);
  const [setFavoritePokemon] = useMutation(SET_FAVORITE_POKEMON);
  const [setSelectedPokemon] = useMutation(SET_SELECTED_POKEMON);

  const {data: favoritePokemonData} = useQuery(GET_POKEMON_BY_ID, {
    variables: {id: user?.favorite_pokemon_id},
    skip: !user?.favorite_pokemon_id,
  });

  const {data: selectedPokemonData} = useQuery(GET_POKEMON_BY_ID, {
    variables: {id: user?.selected_pokemon_id},
    skip: !user?.selected_pokemon_id,
  });

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    onNavigate?.('login');
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser();
      await logout();
      setDeleteDialogOpen(false);
      onNavigate?.('login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleSetFavorite = async (pokemonId: number | null) => {
    try {
      const result = await setFavoritePokemon({variables: {pokemonId}});
      if (result.data?.setFavoritePokemon) {
        updateUser(result.data.setFavoritePokemon);
      }
      setShowFavoriteSelector(false);
    } catch (error) {
      console.error('Failed to set favorite Pokemon:', error);
      alert('Failed to set favorite Pokemon. Please try again.');
    }
  };

  const handleSetSelected = async (pokemonId: number | null) => {
    try {
      const result = await setSelectedPokemon({variables: {pokemonId}});
      if (result.data?.setSelectedPokemon) {
        updateUser(result.data.setSelectedPokemon);
      }
      setShowSelectedSelector(false);
    } catch (error) {
      console.error('Failed to set selected Pokemon:', error);
      alert('Failed to set selected Pokemon. Please try again.');
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
              {(() => {
                try {
                  const date = new Date(user.created_at);
                  if (isNaN(date.getTime())) return 'Unknown';
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  });
                } catch {
                  return 'Unknown';
                }
              })()}
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

        {/* Favorite Pokemon Section */}
        <div
          className="mb-4 sm:mb-6 p-3 sm:p-4 border-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
          style={{borderColor: isDarkMode ? '#333333' : 'black'}}
        >
          <h2 className="text-lg sm:text-xl font-bold">FAVORITE</h2>

          {favoritePokemonData?.pokemonById ? (
            <button
              onClick={() => setShowFavoriteSelector(true)}
              className="px-6 py-4 border-4 transition-all hover:scale-105 cursor-pointer flex items-center gap-4 w-full sm:w-auto sm:min-w-[200px]"
              style={{
                borderColor: isDarkMode ? '#333333' : 'black',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f1e8',
              }}
              title="Click to change favorite (long press to remove)"
            >
              <img
                src={favoritePokemonData.pokemonById.sprite}
                alt={favoritePokemonData.pokemonById.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0"
                style={{imageRendering: 'pixelated'}}
              />
              <p className="text-sm sm:text-base capitalize font-bold text-left flex-1">
                {favoritePokemonData.pokemonById.name}
              </p>
            </button>
          ) : (
            <button
              onClick={() => setShowFavoriteSelector(true)}
              disabled={user.owned_pokemon_ids.length === 0}
              className="px-6 py-4 border-4 transition-all hover:scale-105 flex items-center gap-4 w-full sm:w-auto sm:min-w-[200px]"
              style={{
                borderColor: isDarkMode ? '#333333' : 'black',
                backgroundColor:
                  user.owned_pokemon_ids.length === 0
                    ? '#555'
                    : isDarkMode
                      ? '#2a2a2a'
                      : '#f5f1e8',
                cursor:
                  user.owned_pokemon_ids.length === 0
                    ? 'not-allowed'
                    : 'pointer',
                opacity: user.owned_pokemon_ids.length === 0 ? 0.5 : 1,
              }}
              title={
                user.owned_pokemon_ids.length === 0
                  ? 'Catch a Pokemon first!'
                  : 'Click to select favorite'
              }
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0"
                style={{color: isDarkMode ? '#666' : '#999'}}
              >
                ?
              </div>
              <p
                className="text-sm sm:text-base font-bold text-left flex-1"
                style={{color: isDarkMode ? '#666' : '#999'}}
              >
                None
              </p>
            </button>
          )}
        </div>

        {/* Clicker Pokemon Section */}
        <div
          className="mb-4 sm:mb-6 p-3 sm:p-4 border-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
          style={{borderColor: isDarkMode ? '#333333' : 'black'}}
        >
          <h2 className="text-lg sm:text-xl font-bold">CLICKER</h2>

          {selectedPokemonData?.pokemonById ? (
            <button
              onClick={() => setShowSelectedSelector(true)}
              className="px-6 py-4 border-4 transition-all hover:scale-105 cursor-pointer flex items-center gap-4 w-full sm:w-auto sm:min-w-[200px]"
              style={{
                borderColor: isDarkMode ? '#333333' : 'black',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f1e8',
              }}
              title="Click to change clicker Pokemon"
            >
              <img
                src={selectedPokemonData.pokemonById.sprite}
                alt={selectedPokemonData.pokemonById.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0"
                style={{imageRendering: 'pixelated'}}
              />
              <p className="text-sm sm:text-base capitalize font-bold text-left flex-1">
                {selectedPokemonData.pokemonById.name}
              </p>
            </button>
          ) : (
            <button
              onClick={() => setShowSelectedSelector(true)}
              disabled={user.owned_pokemon_ids.length === 0}
              className="px-6 py-4 border-4 transition-all hover:scale-105 flex items-center gap-4 w-full sm:w-auto sm:min-w-[200px]"
              style={{
                borderColor: isDarkMode ? '#333333' : 'black',
                backgroundColor:
                  user.owned_pokemon_ids.length === 0
                    ? '#555'
                    : isDarkMode
                      ? '#2a2a2a'
                      : '#f5f1e8',
                cursor:
                  user.owned_pokemon_ids.length === 0
                    ? 'not-allowed'
                    : 'pointer',
                opacity: user.owned_pokemon_ids.length === 0 ? 0.5 : 1,
              }}
              title={
                user.owned_pokemon_ids.length === 0
                  ? 'Catch a Pokemon first!'
                  : 'Click to select clicker Pokemon'
              }
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0"
                style={{color: isDarkMode ? '#666' : '#999'}}
              >
                ?
              </div>
              <p
                className="text-sm sm:text-base font-bold text-left flex-1"
                style={{color: isDarkMode ? '#666' : '#999'}}
              >
                None
              </p>
            </button>
          )}
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
        onConfirm={handleDeleteAccount}
        title="DELETE ACCOUNT"
        message="Are you sure you want to delete your account? This action cannot be undone. All your Pokemon and progress will be lost forever."
        confirmText="DELETE"
        cancelText="CANCEL"
        isDarkMode={isDarkMode}
      />

      <FavoritePokemonSelector
        isOpen={showFavoriteSelector}
        onClose={() => setShowFavoriteSelector(false)}
        onSelect={handleSetFavorite}
        ownedPokemonIds={user.owned_pokemon_ids}
        isDarkMode={isDarkMode}
      />

      <FavoritePokemonSelector
        isOpen={showSelectedSelector}
        onClose={() => setShowSelectedSelector(false)}
        onSelect={handleSetSelected}
        ownedPokemonIds={user.owned_pokemon_ids}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
