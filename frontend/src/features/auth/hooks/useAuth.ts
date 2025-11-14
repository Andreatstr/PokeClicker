import {useContext} from 'react';
import {AuthContext} from '@features/auth';

/**
 * Hook to access authentication context
 * Provides user data, authentication state, and auth methods (login, logout, register, etc.)
 *
 * @throws {Error} If used outside of AuthProvider
 * @returns Authentication context with user data and auth methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
