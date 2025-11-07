import {Suspense, lazy, useState, useEffect} from 'react';
import {
  Navbar,
  LoadingSpinner,
  CandyCounterOverlay,
  BackgroundMusic,
  ErrorDisplay,
  OnboardingOverlay,
} from '@/components';
import {
  useTheme,
  usePageNavigation,
  useScrollLock,
  usePreloading,
  usePokemonModal,
  useOnboarding,
} from '@/hooks';

// Lazy load heavy components
const LoginScreen = lazy(() =>
  import('@features/auth').then((module) => ({default: module.LoginScreen}))
);
const PokeClicker = lazy(() =>
  import('@features/clicker').then((module) => ({default: module.PokeClicker}))
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
const PokedexPage = lazy(() =>
  import('@features/pokedex').then((module) => ({default: module.PokedexPage}))
);
const PokemonMap = lazy(() =>
  import('@features/map').then((module) => ({default: module.PokemonMap}))
);
const RanksPage = lazy(() =>
  import('@features/ranks').then((module) => ({
    default: module.RanksPage,
  }))
);

function App() {
  const {isDarkMode, toggleTheme} = useTheme();
  const {currentPage, setCurrentPage} = usePageNavigation();
  const {
    selectedPokemon,
    allPokemon,
    isModalOpen,
    handlePokemonClick,
    handleCloseModal,
    handleSelectPokemon,
    handlePurchase,
  } = usePokemonModal();

  const {step, isActive, nextStep, previousStep, skipTutorial} =
    useOnboarding();

  // Track if map is in fullscreen mode
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  useScrollLock(false); // Disable scroll lock to allow scrolling on mobile
  usePreloading(currentPage);

  // Override body background when in fullscreen
  useEffect(() => {
    if (isMapFullscreen) {
      document.body.style.backgroundColor = '#9FA0A0';
      document.documentElement.style.backgroundColor = '#9FA0A0';
    } else {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    }
  }, [isMapFullscreen]);

  // Function to programmatically open the first Pokemon modal for tutorial
  const handleOpenFirstPokemon = () => {
    const tryClick = () => {
      const container = document.querySelector(
        '[data-onboarding="pokemon-card"]'
      );
      const clickable = container?.querySelector<HTMLElement>(
        '[role="button"], aside[role="button"]'
      );
      if (clickable) {
        clickable.click();
        return true;
      }
      return false;
    };
    if (tryClick()) return;

    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts += 1;
      if (tryClick() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 300);
  };

  const getMainClassName = () => {
    const baseClasses = 'min-h-screen pt-0';
    // Allow scrolling on mobile for map page
    const mapClasses = 'px-2 sm:px-4 md:px-6 lg:px-8 pb-4 overflow-y-auto';
    const defaultClasses = 'px-4 sm:px-6 md:px-8 pb-8';
    return `${baseClasses} ${currentPage === 'map' ? mapClasses : defaultClasses}`;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'pokedex':
        return (
          <>
            <PokedexPage
              isDarkMode={isDarkMode}
              onPokemonClick={handlePokemonClick}
            />
            <CandyCounterOverlay isDarkMode={isDarkMode} />
          </>
        );

      case 'ranks':
        return (
          <section className="py-8">
            <Suspense
              fallback={
                <LoadingSpinner
                  message="Loading ranks..."
                  isDarkMode={isDarkMode}
                />
              }
            >
              <RanksPage isDarkMode={isDarkMode} />
            </Suspense>
          </section>
        );

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
          <section className="py-2 md:py-0">
            <PokemonMap
              isDarkMode={isDarkMode}
              onFullscreenChange={setIsMapFullscreen}
            />
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
      <ErrorDisplay />
      {/* Hide navbar when map is in fullscreen */}
      {!isMapFullscreen && (
        <Navbar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      )}
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
            style={{
              backgroundColor: isMapFullscreen
                ? '#9FA0A0'
                : 'var(--background)',
            }}
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
                allPokemon={allPokemon}
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
      {/* Keep music player visible and playing in fullscreen */}
      <div className="relative">
        <BackgroundMusic
          isDarkMode={isDarkMode}
          showControls={!isMapFullscreen}
        />
      </div>

      {/* Onboarding Tutorial Overlay - hide when in fullscreen */}
      {isActive && currentPage !== 'login' && !isMapFullscreen && (
        <OnboardingOverlay
          step={step}
          onNext={() => {
            if (step === 19) {
              // Last step (index 19 = 20th step)
              skipTutorial();
            } else {
              nextStep();
            }
          }}
          onPrevious={previousStep}
          onSkip={skipTutorial}
          onNavigate={setCurrentPage}
          onOpenFirstPokemon={handleOpenFirstPokemon}
          onClosePokemonModal={handleCloseModal}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
}

export default App;
