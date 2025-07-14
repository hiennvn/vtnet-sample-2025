import api from './axios';
import { Project, ProjectFetchParams, ProjectsResponse } from '../types/project';

/**
 * Get all projects with pagination and optional filtering
 */
export const getProjects = async (params: ProjectFetchParams): Promise<ProjectsResponse> => {
  try {
    const { page = 0, size = 10, status, name } = params;
    let url = `/projects?page=${page}&size=${size}`;
    
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    
    if (name) {
      url += `&name=${encodeURIComponent(name)}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get project by ID
 */
export const getProjectById = async (id: number): Promise<Project> => {
  try {
    const response = await api.get(`/projects/${id}`);
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

const projectApi = {
  getProjects,
  getProjectById
};

export default projectApi; 