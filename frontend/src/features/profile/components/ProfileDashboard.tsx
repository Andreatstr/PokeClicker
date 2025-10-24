import {useState} from 'react';
import {useAuth} from '@features/auth';
import {useMutation, gql} from '@apollo/client';
import {ConfirmDialog} from './ConfirmDialog';

const DELETE_USER = gql`
  mutation DeleteUser {
    deleteUser
  }
`;

interface ProfileDashboardProps {
  isDarkMode?: boolean;
  onNavigate?: (page: 'clicker' | 'pokedex' | 'login' | 'profile') => void;
}

export function ProfileDashboard({isDarkMode = false, onNavigate}: ProfileDashboardProps) {
  const {user, logout} = useAuth();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUser, {loading: deleting}] = useMutation(DELETE_USER);

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
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">TRAINER PROFILE</h1>

        {/* User Info Section */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 border-2" style={{borderColor: isDarkMode ? '#333333' : 'black'}}>
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
          </div>
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
    </div>
  );
}
