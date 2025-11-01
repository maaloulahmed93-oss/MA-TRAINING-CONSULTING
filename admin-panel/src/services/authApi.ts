import axios from 'axios';

/**
 * Authentication API Service
 * Handles login verification against admin users database
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://matc-backend.onrender.com';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator';
  avatar?: string;
  lastLogin?: Date;
  createdAt: Date;
}

/**
 * Verify login credentials against admin users database
 */
export const verifyLogin = async (credentials: LoginCredentials): Promise<AdminUser> => {
  try {
    // Get all admin users
    const response = await axios.get(`${API_BASE_URL}/api/admin-users`);
    
    if (!response.data.success) {
      throw new Error('Failed to fetch users');
    }

    const users = response.data.data;

    // Find user with matching email and password
    const user = users.find(
      (u: AdminUser & { password?: string }) =>
        u.email.toLowerCase() === credentials.email.toLowerCase() &&
        u.password === credentials.password
    );

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Update last login
    try {
      await axios.patch(`${API_BASE_URL}/api/admin-users/${user.id}/last-login`);
    } catch (error) {
      console.warn('Failed to update last login:', error);
      // Don't fail login if last login update fails
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      lastLogin: new Date()
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Service d\'authentification non disponible');
      }
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
    throw error;
  }
};

/**
 * Check if backend is available
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin-users`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
