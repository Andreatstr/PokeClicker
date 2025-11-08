import {useState, useEffect} from 'react';
import {Button, UserIcon, SunIcon, MoonIcon, MenuIcon} from '@ui/pixelact';
import {useAuth} from '@features/auth';

interface NavbarProps {
  currentPage: 'pokedex' | 'ranks' | 'clicker' | 'login' | 'map' | 'profile';
  onPageChange: (
    page: 'pokedex' | 'ranks' | 'clicker' | 'login' | 'map' | 'profile'
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
        data-onboarding="navbar"
        className="w-full h-16 sm:h-16 md:h-20 px-2 sm:px-4 py-3 sm:py-3 md:py-4"
        style={{
          backgroundColor: 'var(--card)',
          border: '4px solid var(--border)',
          boxShadow: isDarkMode
            ? '8px 8px 0px 0px rgba(55,65,81,1)'
            : '8px 8px 0px 0px rgba(187,183,178,1)',
        }}
      >
        <div
          className="flex items-center justify-between h-full"
          role="group"
          aria-label="Navigation container"
        >
          <section className="flex items-center">
            <h1
              className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold pixel-font whitespace-nowrap flex-shrink-[2] min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
              style={{color: 'var(--foreground)'}}
              onClick={() => onPageChange('pokedex')}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPageChange('pokedex');
                }
              }}
              aria-label="Return to Pokedex home"
            >
              PokeClicker
            </h1>
          </section>

          {/* Desktop Navigation */}
          <nav
            className="hidden xl:flex items-center gap-4"
            aria-label="Main navigation"
          >
            <Button
              className="text-xs md:text-sm min-w-[44px] min-h-[44px]"
              aria-label="Pokedex"
              onClick={() => onPageChange('pokedex')}
            >
              Pokedex
            </Button>
            <Button
              data-onboarding="clicker-nav"
              className="text-xs md:text-sm min-w-[44px] min-h-[44px]"
              aria-label="Clicker"
              onClick={() => onPageChange('clicker')}
            >
              Clicker
            </Button>
            <Button
              data-onboarding="world-nav"
              className="text-xs md:text-sm min-w-[44px] min-h-[44px]"
              aria-label="Map"
              onClick={() => onPageChange('map')}
            >
              World
            </Button>
            <Button
              data-onboarding="ranks-nav"
              className="text-xs md:text-sm min-w-[44px] min-h-[44px]"
              aria-label="Ranks"
              onClick={() => onPageChange('ranks')}
            >
              Ranks
            </Button>

            <Button
              onClick={onToggleTheme}
              className="min-w-[44px] min-h-[44px] p-2"
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? (
                <SunIcon className="w-4 h-4" />
              ) : (
                <MoonIcon className="w-4 h-4" />
              )}
            </Button>

            {isAuthenticated ? (
              <Button
                data-onboarding="profile-button"
                className="min-w-[44px] min-h-[44px] p-2"
                onClick={() => onPageChange('profile')}
                title={`Logged in as ${user?.username}`}
                aria-label={`Profile for ${user?.username}`}
              >
                <UserIcon className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                data-onboarding="profile-button"
                className="min-w-[44px] min-h-[44px] p-2"
                onClick={() => onPageChange('login')}
                aria-label="Login"
              >
                <UserIcon className="w-4 h-4" />
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <section className="xl:hidden" aria-label="Mobile menu control">
            <Button
              onClick={toggleMobileMenu}
              className="min-w-[44px] min-h-[44px] px-3 py-4"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <MenuIcon className="w-5 h-5" />
            </Button>
          </section>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <nav
          className="xl:hidden mt-4 p-4"
          aria-label="Mobile navigation"
          style={{
            backgroundColor: 'var(--card)',
            border: '4px solid var(--border)',
            boxShadow: isDarkMode
              ? '8px 8px 0px 0px rgba(55,65,81,1)'
              : '8px 8px 0px 0px rgba(187,183,178,1)',
          }}
        >
          <div
            className="flex flex-col gap-3"
            role="group"
            aria-label="Mobile menu items"
          >
            {/* Navigation Links */}
            <section
              className="flex flex-col gap-2"
              aria-label="Page navigation links"
            >
              <Button
                className="w-full text-sm min-h-[44px]"
                aria-label="Pokedex"
                onClick={() => onPageChange('pokedex')}
              >
                Pokedex
              </Button>
              <Button
                data-onboarding="clicker-nav"
                className="w-full text-sm min-h-[44px]"
                aria-label="Clicker"
                onClick={() => onPageChange('clicker')}
              >
                Clicker
              </Button>
              <Button
                data-onboarding="world-nav"
                className="w-full text-sm min-h-[44px]"
                aria-label="Map"
                onClick={() => onPageChange('map')}
              >
                World
              </Button>
              <Button
                data-onboarding="ranks-nav"
                className="w-full text-sm min-h-[44px]"
                aria-label="Ranks"
                onClick={() => onPageChange('ranks')}
              >
                Ranks
              </Button>
            </section>

            {/* Controls Row - Dark/Light Mode, Music, Profile */}
            <section
              className="flex flex-col gap-2 pt-2 border-t border-gray-300 dark:border-gray-600"
              aria-label="Settings and profile"
            >
              <Button
                className="w-full text-sm min-h-[44px] flex items-center justify-center gap-2"
                onClick={onToggleTheme}
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
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
                  data-onboarding="profile-button"
                  className="w-full text-sm min-h-[44px] flex items-center justify-center gap-2"
                  onClick={() => onPageChange('profile')}
                  title={`Logged in as ${user?.username}`}
                  aria-label={`Profile for ${user?.username}`}
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </Button>
              ) : (
                <Button
                  data-onboarding="profile-button"
                  className="w-full text-sm min-h-[44px] flex items-center justify-center gap-2"
                  onClick={() => onPageChange('login')}
                  aria-label="Login"
                >
                  <UserIcon className="w-4 h-4" />
                  Login
                </Button>
              )}
            </section>
          </div>
        </nav>
      )}
    </header>
  );
}
