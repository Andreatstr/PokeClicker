import {useState, useEffect} from 'react';
import {Button, UserIcon, SunIcon, MoonIcon, MenuIcon} from '@ui/pixelact';
import {useAuth} from '@features/auth';

interface NavbarProps {
  currentPage: 'clicker' | 'pokedex' | 'login';
  onPageChange: (page: 'clicker' | 'pokedex' | 'login') => void;
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
  const {isAuthenticated, logout, user} = useAuth();

  // Close mobile menu when page changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    onPageChange('login');
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
              onClick={() => onPageChange('clicker')}
            >
              PokeClicker
            </Button>
            <Button
              className="text-xs md:text-sm"
              onClick={() => onPageChange('pokedex')}
            >
              Pokedex
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
                onClick={handleLogout}
                title={`Logged in as ${user?.username}`}
              >
                Logout
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
            <Button
              className="w-full text-sm"
              onClick={() => onPageChange('clicker')}
            >
              PokeClicker
            </Button>
            <Button
              className="w-full text-sm"
              onClick={() => onPageChange('pokedex')}
            >
              Pokedex
            </Button>

            <div className="flex items-center justify-center gap-4 mt-2">
              <Button onClick={onToggleTheme} className="p-2">
                {isDarkMode ? (
                  <SunIcon className="w-4 h-4" />
                ) : (
                  <MoonIcon className="w-4 h-4" />
                )}
              </Button>

              {isAuthenticated ? (
                <Button className="w-full text-sm" onClick={handleLogout}>
                  Logout ({user?.username})
                </Button>
              ) : (
                <Button className="p-2" onClick={() => onPageChange('login')}>
                  <UserIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
