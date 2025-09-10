import React, { createContext, useReducer, useEffect } from 'react';
import { User, AuthState, LoginCredentials } from '../types';

/**
 * Authentication Context for managing user authentication state
 * Ready for backend integration
 */

import { AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: User };

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication - Replace with real API call
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@matc.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
      
      if (credentials.email === adminEmail && credentials.password === adminPassword) {
        const user = { ...MOCK_USER, lastLogin: new Date() };
        
        // Save to localStorage (replace with secure token storage)
        localStorage.setItem('admin_user', JSON.stringify(user));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        throw new Error('Invalid credentials');
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


