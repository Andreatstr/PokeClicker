import {describe, it, expect, vi} from 'vitest';
import {render} from '../../test/utils';
import {Navbar} from '../Navbar';
import React from 'react';
import {act} from '@testing-library/react';

// Mock the auth module
vi.mock('@features/auth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: {username: 'testuser'},
  })),
  AuthProvider: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

describe('Navbar Semantic HTML', () => {
  const defaultProps = {
    currentPage: 'pokedex' as const,
    onPageChange: vi.fn(),
    isDarkMode: false,
    onToggleTheme: vi.fn(),
  };

  it('should render with current structure (baseline snapshot)', () => {
    const {container} = render(<Navbar {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should render in dark mode (baseline snapshot)', () => {
    const {container} = render(<Navbar {...defaultProps} isDarkMode={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should have header element', () => {
    const {container} = render(<Navbar {...defaultProps} />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should have h1 with PokeClicker title', () => {
    const {container} = render(<Navbar {...defaultProps} />);
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent('PokeClicker');
  });

  it('should have navigation buttons', () => {
    const {getByText} = render(<Navbar {...defaultProps} />);

    // Desktop navigation buttons should be in the document
    expect(getByText('Pokedex')).toBeInTheDocument();
    expect(getByText('Clicker')).toBeInTheDocument();
    expect(getByText('World')).toBeInTheDocument();
    expect(getByText('Ranks')).toBeInTheDocument();
  });

  it('should have theme toggle button', () => {
    const {container} = render(<Navbar {...defaultProps} />);
    const themeButton = container.querySelector('[aria-label*="mode"]');
    expect(themeButton).toBeInTheDocument();
  });

  it('should have profile/login button when authenticated', () => {
    const {container} = render(<Navbar {...defaultProps} />);
    const profileButton = container.querySelector('[aria-label*="Profile"]');
    expect(profileButton).toBeInTheDocument();
  });

  it('should have mobile menu button', () => {
    const {container} = render(<Navbar {...defaultProps} />);
    const menuButton = container.querySelector(
      '[aria-label="Toggle mobile menu"]'
    );
    expect(menuButton).toBeInTheDocument();
  });

  it('should maintain all CSS classes', () => {
    const {container} = render(<Navbar {...defaultProps} />);
    const header = container.querySelector('header');

    expect(header).toHaveClass(
      'px-4',
      'py-2',
      'sm:px-6',
      'sm:py-4',
      'md:px-8',
      'md:py-8'
    );
  });

  it('should use nav element for desktop navigation', () => {
    const {container} = render(<Navbar {...defaultProps} />);
    const nav = container.querySelector('nav[aria-label="Main navigation"]');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('hidden', 'xl:flex', 'items-center', 'gap-4');
  });

  it('should use nav element for mobile navigation when open', () => {
    const {container, getByLabelText} = render(<Navbar {...defaultProps} />);

    // Open mobile menu
    const menuButton = getByLabelText('Toggle mobile menu');
    act(() => {
      menuButton.click();
    });

    const mobileNav = container.querySelector(
      'nav[aria-label="Mobile navigation"]'
    );
    expect(mobileNav).toBeInTheDocument();
    expect(mobileNav).toHaveClass('xl:hidden', 'mt-4', 'p-4');
  });
});
