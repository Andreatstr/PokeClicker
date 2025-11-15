import {createContext} from 'react';
import type {User} from '@/lib/graphql/types';

/**
 * Authentication context value shape
 * Manages user authentication state and operations
 */
interface AuthContextType {
  /** Currently authenticated user, or null if not logged in */
  user: User | null;
  /** JWT authentication token */
  token: string | null;
  /** Log in with a token and user data */
  login: (token: string, user: User) => Promise<void>;
  /** Log out and clear authentication state. Pass clearOnboarding=true when deleting account */
  logout: (clearOnboarding?: boolean) => Promise<void>;
  /** Update the current user data in state and storage */
  updateUser: (user: User) => void;
  /** Convenience flag indicating if a user is currently authenticated */
  isAuthenticated: boolean;
}

/**
 * Context for authentication state management
 *
 * @remarks
 * Do not consume directly - use the useAuth hook from @features/auth instead
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
