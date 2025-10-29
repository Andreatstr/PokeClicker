import {Suspense, lazy} from 'react';
import {PokedexPage} from '@features/pokedex';
import {
  Navbar,
  LoadingSpinner,
  CandyCounterOverlay,
  BackgroundMusic,
} from '@/components';
import {
  useTheme,
  usePageNavigation,
  useScrollLock,
  usePreloading,
  usePokemonModal,
} from '@/hooks';

// Lazy load heavy components
const PokeClicker = lazy(() =>
  import('@features/clicker').then((module) => ({default: module.PokeClicker}))
);
const LoginScreen = lazy(() =>
  import('@features/auth').then((module) => ({default: module.LoginScreen}))
);
const PokemonDetailModal = lazy(() =>
  import('@features/pokedex').then((module) => ({
    default: module.PokemonDetailModal,
  }))
);
const ProfileDashboard = lazy(() =>
  import('@features/profile').then((module) => ({
    default: module.ProfileDashboard,
  }))
);
import {PokemonMap} from '@features/map';

function App() {
  const {isDarkMode, toggleTheme} = useTheme();
  const {currentPage, setCurrentPage} = usePageNavigation();
  const {
    selectedPokemon,
    isModalOpen,
    handlePokemonClick,
    handleCloseModal,
    handleSelectPokemon,
    handlePurchase,
  } = usePokemonModal();

  useScrollLock(currentPage === 'map');
  usePreloading(currentPage);

  const getMainClassName = () => {
    const baseClasses = 'min-h-screen pt-0';
    const mapClasses =
      'px-2 sm:px-4 md:px-6 lg:px-8 pb-0 h-screen flex flex-col';
    const defaultClasses = 'px-4 sm:px-6 md:px-8 pb-8';
    return `${baseClasses} ${currentPage === 'map' ? mapClasses : defaultClasses}`;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'clicker':
        return (
          <section className="py-8">
            <Suspense
              fallback={
                <LoadingSpinner
                  message="Loading clicker game..."
                  isDarkMode={isDarkMode}
                />
              }
            >
              <PokeClicker isDarkMode={isDarkMode} />
            </Suspense>
          </section>
        );

      case 'profile':
        return (
          <section className="py-8">
            <Suspense
              fallback={
                <LoadingSpinner
                  message="Loading profile..."
                  isDarkMode={isDarkMode}
                />
              }
            >
              <ProfileDashboard
                isDarkMode={isDarkMode}
                onNavigate={setCurrentPage}
              />
            </Suspense>
          </section>
        );

      case 'map':
        return (
          <section className="py-8 md:py-0">
            <PokemonMap isDarkMode={isDarkMode} />
          </section>
        );

      default: // pokedex
        return (
          <>
            <PokedexPage
              isDarkMode={isDarkMode}
              onPokemonClick={handlePokemonClick}
            />
            <CandyCounterOverlay isDarkMode={isDarkMode} />
          </>
        );
    }
  };

  return (
    <>
      <Navbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
      {currentPage === 'login' ? (
        <Suspense
          fallback={
            <LoadingSpinner
              message="Loading login..."
              isDarkMode={isDarkMode}
            />
          }
        >
          <LoginScreen onNavigate={setCurrentPage} />
        </Suspense>
      ) : (
        <>
          <main
            className={getMainClassName()}
            style={{backgroundColor: 'var(--background)'}}
          >
            {renderPage()}
          </main>

          {isModalOpen && (
            <Suspense
              fallback={
                <LoadingSpinner
                  message="Loading Pokemon details..."
                  isDarkMode={isDarkMode}
                />
              }
            >
              <PokemonDetailModal
                pokemon={selectedPokemon}
                allPokemon={[]}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSelectPokemon={handleSelectPokemon}
                onPurchase={handlePurchase}
                isDarkMode={isDarkMode}
              />
            </Suspense>
          )}
        </>
      )}
      <div className="relative">
        <BackgroundMusic isDarkMode={isDarkMode} />
      </div>
    </>
  );
}

export default App;
