import {useState, useEffect, type ReactNode} from 'react';
import {logger} from '@/lib/logger';
import {apolloClient} from '@/lib/apolloClient';
import {AuthContext} from './AuthContextDefinition';
import type {User} from '@/lib/graphql/types';
import {DELETE_USER_MUTATION} from '@/lib/graphql/mutations';

/**
 * Authentication provider that manages user login state and persistence
 *
 * @remarks
 * Features:
 * - Persists auth state to localStorage (token and user data)
 * - Automatically restores session on page load
 * - Validates stored user data to prevent corruption issues
 * - Handles guest user cleanup on logout (deletes user from backend)
 * - Coordinates with OnboardingContext for guest user tutorial flow
 * - Resets Apollo cache on login/logout to prevent stale data
 *
 * @param children - Child components to wrap
 */
export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore authentication state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        // Validate user data structure to prevent runtime errors
        if (
          !parsedUser ||
          typeof parsedUser !== 'object' ||
          !parsedUser.stats ||
          typeof parsedUser.stats !== 'object'
        ) {
          logger.warn(
            'Invalid user data in localStorage, clearing',
            'AuthContext'
          );
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          return;
        }

        setToken(savedToken);
        setUser(parsedUser);

        // Onboarding persistence is managed by OnboardingContext
        // sessionStorage for guests allows tutorial on new login but not on reload
      } catch (e) {
        logger.logError(e, 'ParseSavedUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (newToken: string, newUser: User) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    // Clear onboarding flags for guest users to restart tutorial on new login
    // sessionStorage ensures tutorial doesn't replay on page reload during same session
    if (newUser.isGuestUser || newUser.username?.toLowerCase() === 'guest') {
      sessionStorage.removeItem('onboarding_completed_session');
      localStorage.removeItem('onboarding_completed');
    }

    // Reset Apollo cache to prevent data from previous session leaking
    await apolloClient.resetStore();
  };

  const logout = async () => {
    // Delete guest users from backend to clean up temporary accounts
    if (user?.isGuestUser ?? user?.username?.toLowerCase() === 'guest') {
      try {
        await apolloClient.mutate({
          mutation: DELETE_USER_MUTATION,
        });
      } catch (err) {
        logger.logError(err, 'DeleteGuestUser');
      }
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Clear Apollo cache to remove all cached query data
    apolloClient.cache.evict({id: 'ROOT_QUERY'});
    apolloClient.cache.gc();
  };

  const updateUser = (newUser: User) => {
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{user, token, login, logout, updateUser, isAuthenticated: !!token}}
    >
      {children}
    </AuthContext.Provider>
  );
}
