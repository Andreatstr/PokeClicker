import {useState, useEffect} from 'react';
import {Button, UserIcon, SunIcon, MoonIcon, MenuIcon} from '@ui/pixelact';
import {useAuth} from '@features/auth';

interface NavbarProps {
  currentPage: 'pokedex' | 'clicker' | 'login' | 'map' | 'profile';
  onPageChange: (
    page: 'pokedex' | 'clicker' | 'login' | 'map' | 'profile'
  ) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function Navbar({
  currentPage,
  onPageChange,
  isDarkMode,
  onToggleTheme,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {isAuthenticated, user} = useAuth();

  // Close mobile menu when page changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className="px-4 py-2 sm:px-6 sm:py-4 md:px-8 md:py-8"
      style={{backgroundColor: 'var(--background)'}}
    >
      <div
        className="w-full h-16 sm:h-16 md:h-20 px-2 sm:px-4 py-3 sm:py-3 md:py-4"
        style={{
          backgroundColor: 'var(--card)',
          border: '4px solid var(--border)',
          boxShadow: isDarkMode
            ? '8px 8px 0px 0px rgba(55,65,81,1)'
            : '8px 8px 0px 0px rgba(187,183,178,1)',
        }}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <h1
              className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold pixel-font whitespace-nowrap flex-shrink-[2] min-w-0"
              style={{color: 'var(--foreground)'}}
            >
              PokeClicker
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              className="text-xs md:text-sm"
              onClick={() => onPageChange('pokedex')}
            >
              Pokedex
            </Button>
            <Button
              className="text-xs md:text-sm"
              onClick={() => onPageChange('clicker')}
            >
              Clicker
            </Button>
            <Button
              className="text-xs md:text-sm"
              onClick={() => onPageChange('map')}
            >
              World
            </Button>

            <Button onClick={onToggleTheme} className="p-2">
              {isDarkMode ? (
                <SunIcon className="w-4 h-4" />
              ) : (
                <MoonIcon className="w-4 h-4" />
              )}
            </Button>

            {isAuthenticated ? (
              <Button
                className="text-xs md:text-sm"
                onClick={() => onPageChange('profile')}
                title={`Logged in as ${user?.username}`}
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </Button>
            ) : (
              <Button className="p-2" onClick={() => onPageChange('login')}>
                <UserIcon className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button onClick={toggleMobileMenu} className="px-3 py-4">
              <MenuIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden mt-4 p-4"
          style={{
            backgroundColor: 'var(--card)',
            border: '4px solid var(--border)',
            boxShadow: isDarkMode
              ? '8px 8px 0px 0px rgba(55,65,81,1)'
              : '8px 8px 0px 0px rgba(187,183,178,1)',
          }}
        >
          <div className="flex flex-col gap-3">
            {/* Navigation Links */}
            <div className="flex flex-col gap-2">
              <Button
                className="w-full text-sm"
                onClick={() => onPageChange('pokedex')}
              >
                Pokedex
              </Button>
              <Button
                className="w-full text-sm"
                onClick={() => onPageChange('clicker')}
              >
                Clicker
              </Button>
              <Button
                className="w-full text-sm"
                onClick={() => onPageChange('map')}
              >
                World
              </Button>
            </div>

            {/* Controls Row - Dark/Light Mode, Music, Profile */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-300 dark:border-gray-600">
              <Button
                className="w-full text-sm flex items-center justify-center gap-2"
                onClick={onToggleTheme}
              >
                {isDarkMode ? (
                  <>
                    <SunIcon className="w-4 h-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <MoonIcon className="w-4 h-4" />
                    Dark Mode
                  </>
                )}
              </Button>

              {isAuthenticated ? (
                <Button
                  className="w-full text-sm flex items-center justify-center gap-2"
                  onClick={() => onPageChange('profile')}
                  title={`Logged in as ${user?.username}`}
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </Button>
              ) : (
                <Button
                  className="w-full text-sm flex items-center justify-center gap-2"
                  onClick={() => onPageChange('login')}
                >
                  <UserIcon className="w-4 h-4" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
