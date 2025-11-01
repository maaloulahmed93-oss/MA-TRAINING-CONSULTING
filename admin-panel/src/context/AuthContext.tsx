import React, { createContext, useReducer, useEffect } from 'react';
import { User, AuthContextType, LoginCredentials } from '../types/index';

/**
 * Authentication Context for managing user authentication state
 * Ready for backend integration
 */

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: User };

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'RESTORE_SESSION':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

// Import du mock user
import { MOCK_USER } from '../constants/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedUser = localStorage.getItem('admin_user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            // Vérification minimale des propriétés attendues
            if (user && user.email && user.role) {
              dispatch({ type: 'RESTORE_SESSION', payload: user });
            } else {
              localStorage.removeItem('admin_user');
              dispatch({ type: 'LOGIN_FAILURE' });
            }
          } catch {
            console.warn('Session corrompue, suppression...');
            localStorage.removeItem('admin_user');
            dispatch({ type: 'LOGIN_FAILURE' });
          }
        } else {
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Try real API authentication first
      try {
        const { verifyLogin } = await import('../services/authApi');
        const user = await verifyLogin(credentials);
        
        // Save to localStorage
        localStorage.setItem('admin_user', JSON.stringify(user));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        return;
      } catch (apiError) {
        console.warn('API authentication failed, trying fallback:', apiError);
        
        // Fallback to mock authentication if API fails
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@matc.com';
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
        
        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          const user = { ...MOCK_USER, lastLogin: new Date() };
          
          localStorage.setItem('admin_user', JSON.stringify(user));
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          return;
        }
        
        // If both API and fallback fail, throw the API error
        throw apiError;
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('admin_user');
    dispatch({ type: 'LOGOUT' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


