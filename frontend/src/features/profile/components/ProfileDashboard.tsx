import {useAuth} from '@features/auth';

interface ProfileDashboardProps {
  isDarkMode?: boolean;
  onNavigate?: (page: 'clicker' | 'pokedex' | 'login' | 'profile') => void;
}

export function ProfileDashboard({isDarkMode = false, onNavigate}: ProfileDashboardProps) {
  const {user, logout} = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    onNavigate?.('login');
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div
        className="border-4 p-6 pixel-font"
        style={{
          borderColor: isDarkMode ? '#333333' : 'black',
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f1e8',
          boxShadow: isDarkMode
            ? '8px 8px 0px rgba(51,51,51,1)'
            : '8px 8px 0px rgba(0,0,0,1)',
        }}
      >
        <h1 className="text-2xl font-bold mb-6">TRAINER PROFILE</h1>

        {/* User Info Section */}
        <div className="mb-6 p-4 border-2" style={{borderColor: isDarkMode ? '#333333' : 'black'}}>
          <h2 className="text-xl mb-4">TRAINER INFO</h2>
          <div className="space-y-2">
            <p>
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

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-6 py-3 font-bold border-4 transition-all"
          style={{
            borderColor: isDarkMode ? '#333333' : 'black',
            backgroundColor: '#ef4444',
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
      </div>
    </div>
  );
}
