import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom';
import {render, screen} from '../../../../test/utils';
import {PokeClicker} from '../PokeClicker';
import {createMockUser} from '../../../../test/factories';
import type {User} from '../../../auth';

// Mock useAuth
const mockUpdateUser = vi.fn();
const mockAuth = {
  user: null as User | null,
  token: null,
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: mockUpdateUser,
  isAuthenticated: false,
};

vi.mock('@features/auth', async () => {
  const actual = await vi.importActual('@features/auth');
  return {
    ...actual,
    useAuth: () => mockAuth,
  };
});

// Mock game mutations
const mockUpgradeStat = vi.fn();
vi.mock('../hooks/useGameMutations', () => ({
  useGameMutations: () => ({
    upgradeStat: mockUpgradeStat,
    loading: false,
    error: null,
  }),
}));

// Mock global candy context (replaces useCandySync and useAutoclicker)
vi.mock('@/contexts/useCandyContext', () => ({
  useCandyContext: () => ({
    localRareCandy: '1000',
    displayError: null,
    setDisplayError: vi.fn(),
    addCandy: vi.fn(),
    deductCandy: vi.fn(),
    flushPendingCandy: vi.fn(),
  }),
}));

// Mock clicker actions hook
vi.mock('../hooks/useClickerActions', () => ({
  useClickerActions: () => ({
    isAnimating: false,
    candies: [],
    handleClick: vi.fn(),
    handleUpgrade: vi.fn(),
  }),
}));

// Mock game assets cache
vi.mock('@/lib/gameAssetsCache', () => ({
  gameAssetsCache: {
    preloadClickerAssets: vi.fn().mockResolvedValue(undefined),
    getWishiWashiSprite: vi.fn().mockResolvedValue(''),
    getCandyImage: vi.fn().mockResolvedValue(''),
    getRareCandyIcon: vi.fn().mockResolvedValue(''),
    getPokemonBackground: vi.fn().mockResolvedValue(''),
  },
}));

describe('PokeClicker component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.user = null;
    mockAuth.isAuthenticated = false;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should render game interface with main sections', () => {
    const mockUser = createMockUser();
    mockAuth.user = mockUser;
    mockAuth.isAuthenticated = true;

    render(<PokeClicker />);

    expect(screen.getByText('CLICKER UPGRADES')).toBeInTheDocument();
  });

  it('should show unauthenticated message when not logged in', () => {
    mockAuth.user = null;
    mockAuth.isAuthenticated = false;

    render(<PokeClicker />);

    expect(screen.getByText('Please Log In')).toBeInTheDocument();
  });

  it('should render in dark mode when isDarkMode is true', () => {
    const mockUser = createMockUser();
    mockAuth.user = mockUser;
    mockAuth.isAuthenticated = true;

    const {container} = render(<PokeClicker isDarkMode={true} />);

    // Just verify it renders without errors in dark mode
    expect(container).toBeTruthy();
    expect(screen.getByText('CLICKER UPGRADES')).toBeInTheDocument();
  });
});
