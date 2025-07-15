import api from './axios';
import { ProjectMember, ProjectMemberCreate, ProjectMemberUpdate } from '../types/projectMember';
import { User } from '../types/user';

/**
 * Get all members of a project
 */
export const getProjectMembers = async (projectId: number): Promise<ProjectMember[]> => {
  try {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project members:", error);
    throw handleApiError(error);
  }
};

/**
 * Add a member to a project
 */
export const addProjectMember = async (projectId: number, memberData: ProjectMemberCreate): Promise<ProjectMember> => {
  try {
    const response = await api.post(`/projects/${projectId}/members`, memberData);
    return response.data;
  } catch (error) {
    console.error("Error adding project member:", error);
    throw handleApiError(error);
  }
};

/**
 * Update a project member's role
 */
export const updateProjectMember = async (
  projectId: number,
  userId: number,
  memberData: ProjectMemberUpdate
): Promise<ProjectMember> => {
  try {
    const response = await api.put(`/projects/${projectId}/members/${userId}`, memberData);
    return response.data;
  } catch (error) {
    console.error("Error updating project member:", error);
    throw handleApiError(error);
  }
};

/**
 * Remove a member from a project
 */
export const removeProjectMember = async (projectId: number, userId: number): Promise<void> => {
  try {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  } catch (error) {
    console.error("Error removing project member:", error);
    throw handleApiError(error);
  }
};

/**
 * Get users who are not members of a project
 */
export const getAvailableUsers = async (projectId: number): Promise<User[]> => {
  try {
    const response = await api.get(`/projects/${projectId}/members/available`);
    return response.data;
  } catch (error) {
    console.error("Error fetching available users:", error);
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
    
    if (status === 409) {
      // Conflict
      return new Error('User is already a member of this project.');
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

const projectMemberApi = {
  getProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
  getAvailableUsers
};

export default projectMemberApi; 