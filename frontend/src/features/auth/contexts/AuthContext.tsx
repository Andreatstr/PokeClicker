import {useState, useEffect, type ReactNode} from 'react';
import {logger} from '@/lib/logger';
import {apolloClient} from '@/lib/apolloClient';
import {AuthContext} from './AuthContextDefinition';
import type {User} from '@/lib/graphql/types';
import {DELETE_USER_MUTATION} from '@/lib/graphql/mutations';

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        // Validate user data
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

        // Don't clear onboarding on page reload - let OnboardingContext handle it.
        // OnboardingContext checks sessionStorage for guest users, which persists during session.
        // This allows onboarding to show on new login, but not on page reload within the same session.
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

    // For guest users, clear onboarding flags on new login so the tour restarts,
    // but rely on sessionStorage to avoid replaying on simple reloads.
    if (newUser.isGuestUser || newUser.username?.toLowerCase() === 'guest') {
      sessionStorage.removeItem('onboarding_completed_session');
      localStorage.removeItem('onboarding_completed');
    }

    await apolloClient.resetStore();
  };

  const logout = async () => {
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
