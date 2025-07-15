import { FolderDTO } from '../types/folder';
import axiosInstance from './axios';

/**
 * Get root folders for a project
 * @param projectId The project ID
 * @returns Promise with list of root folders
 */
export const getProjectRootFolders = async (projectId: number): Promise<FolderDTO[]> => {
  const response = await axiosInstance.get<FolderDTO[]>(`/api/projects/${projectId}/folders`);
  return response.data;
};

/**
 * Get subfolders for a folder
 * @param folderId The folder ID
 * @returns Promise with list of subfolders
 */
export const getSubfolders = async (folderId: number): Promise<FolderDTO[]> => {
  const response = await axiosInstance.get<FolderDTO[]>(`/api/folders/${folderId}/subfolders`);
  return response.data;
};

/**
 * Get a folder by ID
 * @param folderId The folder ID
 * @returns Promise with folder data
 */
export const getFolderById = async (folderId: number): Promise<FolderDTO> => {
  const response = await axiosInstance.get<FolderDTO>(`/api/folders/${folderId}`);
  return response.data;
};

/**
 * Create a new folder
 * @param name The folder name
 * @param projectId The project ID
 * @param parentFolderId The parent folder ID (optional)
 * @returns Promise with the created folder
 */
export const createFolder = async (
  name: string,
  projectId: number,
  parentFolderId?: number
): Promise<FolderDTO> => {
  const response = await axiosInstance.post<FolderDTO>('/api/folders', {
    name,
    projectId,
    parentFolderId
  });
  return response.data;
}; 