import {useState, useEffect, type ReactNode} from 'react';
import {logger} from '@/lib/logger';
import {apolloClient} from '@/lib/apolloClient';
import {AuthContext, type User} from './AuthContextDefinition';

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
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
    // Clear cache and refetch all active queries with new auth context
    await apolloClient.resetStore();
  };

  const logout = async () => {
    // Update React state first
    setToken(null);
    setUser(null);
    // Remove token from storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Evict all ROOT_QUERY entries and garbage collect
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
