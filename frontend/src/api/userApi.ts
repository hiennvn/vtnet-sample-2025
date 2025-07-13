import api from './axios';
import { User, UserCreateRequest, UserUpdateRequest, UserResponse } from '../types/user';

/**
 * Get all users with pagination
 */
export const getUsers = async (page: number = 0, size: number = 10): Promise<any> => {
  try {
    const response = await api.get(`/users?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a new user
 */
export const createUser = async (userData: UserCreateRequest): Promise<User> => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (id: number, userData: UserUpdateRequest): Promise<User> => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Search users
 */
export const searchUsers = async (query: string, page: number = 0, size: number = 10): Promise<any> => {
  try {
    const response = await api.get(`/users/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Handle API errors
 */
const handleApiError = (error: any): Error => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    if (status === 400 && data.fieldErrors) {
      // Validation error
      return {
        message: 'Validation error',
        fieldErrors: data.fieldErrors,
      } as any;
    }
    
    if (status === 401) {
      // Unauthorized
      return new Error('Authentication required. Please log in.');
    }
    
    if (status === 403) {
      // Forbidden
      return new Error('You do not have permission to perform this action.');
    }
    
    if (status === 404) {
      // Not found
      return new Error('The requested resource was not found.');
    }
    
    if (status >= 500) {
      // Server error
      return new Error('A server error occurred. Please try again later.');
    }
    
    // Other errors
    return new Error(data.message || 'An error occurred while processing your request.');
  } else if (error.request) {
    // The request was made but no response was received
    return new Error('No response received from server. Please check your connection.');
  } else {
    // Something happened in setting up the request
    return new Error('An error occurred while setting up the request.');
  }
};

const userApi = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers
}

export default userApi 