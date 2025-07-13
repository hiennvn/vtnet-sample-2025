import api from './axios';
import { Role } from '../types/user';

/**
 * Get all roles
 */
export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get role by ID
 */
export const getRoleById = async (id: number): Promise<Role> => {
  try {
    const response = await api.get(`/roles/${id}`);
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
      return new Error('The requested role was not found.');
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

const roleApi = {
  getAllRoles,
  getRoleById
}

export default roleApi 