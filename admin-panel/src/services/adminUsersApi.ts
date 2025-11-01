import axios from 'axios';

/**
 * Admin Users API Service
 * Handles all API calls for admin users management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://matc-backend.onrender.com';
const API_ENDPOINT = `${API_BASE_URL}/api/admin-users`;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'moderator';
  avatar?: string;
  lastLogin?: Date | string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface CreateAdminUserDto {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'moderator';
  avatar?: string;
}

export interface UpdateAdminUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'moderator';
  avatar?: string;
}

/**
 * Get all admin users
 */
export const getAllAdminUsers = async (role?: string): Promise<AdminUser[]> => {
  try {
    const params = role && role !== 'all' ? { role } : {};
    const response = await axios.get(API_ENDPOINT, { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

/**
 * Get single admin user by ID
 */
export const getAdminUserById = async (id: string): Promise<AdminUser> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching admin user ${id}:`, error);
    throw error;
  }
};

/**
 * Create new admin user
 */
export const createAdminUser = async (userData: CreateAdminUserDto): Promise<AdminUser> => {
  try {
    const response = await axios.post(API_ENDPOINT, userData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

/**
 * Update admin user
 */
export const updateAdminUser = async (id: string, userData: UpdateAdminUserDto): Promise<AdminUser> => {
  try {
    const response = await axios.put(`${API_ENDPOINT}/${id}`, userData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating admin user ${id}:`, error);
    throw error;
  }
};

/**
 * Delete admin user
 */
export const deleteAdminUser = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Error deleting admin user ${id}:`, error);
    throw error;
  }
};

/**
 * Update user's last login
 */
export const updateLastLogin = async (id: string): Promise<void> => {
  try {
    await axios.patch(`${API_ENDPOINT}/${id}/last-login`);
  } catch (error) {
    console.error(`Error updating last login for user ${id}:`, error);
    throw error;
  }
};

/**
 * Search admin users
 */
export const searchAdminUsers = async (query: string): Promise<AdminUser[]> => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/search`, { params: { query } });
    return response.data.data;
  } catch (error) {
    console.error('Error searching admin users:', error);
    throw error;
  }
};
