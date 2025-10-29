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
        const parsedUser = JSON.parse(savedUser);

        // Validate and migrate user data to ensure stats exist
        if (parsedUser && typeof parsedUser === 'object') {
          if (!parsedUser.stats || typeof parsedUser.stats !== 'object') {
            logger.warn(
              'User data missing stats object, clearing localStorage',
              'AuthContext'
            );
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            return;
          }

          const defaultStats = {
            hp: 1,
            attack: 1,
            defense: 1,
            spAttack: 1,
            spDefense: 1,
            speed: 1,
            clickPower: 1,
            passiveIncome: 1,
          };

          parsedUser.stats = {
            ...defaultStats,
            ...parsedUser.stats,
          };
        }

        setToken(savedToken);
        setUser(parsedUser);
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
    await apolloClient.resetStore();
  };

  const logout = async () => {
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
