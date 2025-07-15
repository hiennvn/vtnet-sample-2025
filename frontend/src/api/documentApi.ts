import { DocumentDTO } from '../types/document';
import axiosInstance from './axios';

/**
 * Get all documents for a project
 * @param projectId The project ID
 * @returns Promise with list of documents
 */
export const getProjectDocuments = async (projectId: number): Promise<DocumentDTO[]> => {
  const response = await axiosInstance.get<DocumentDTO[]>(`/api/projects/${projectId}/documents`);
  return response.data;
};

/**
 * Get all documents for a folder
 * @param folderId The folder ID
 * @returns Promise with list of documents
 */
export const getFolderDocuments = async (folderId: number): Promise<DocumentDTO[]> => {
  const response = await axiosInstance.get<DocumentDTO[]>(`/api/folders/${folderId}/documents`);
  return response.data;
};

/**
 * Get a document by ID
 * @param documentId The document ID
 * @returns Promise with document data
 */
export const getDocumentById = async (documentId: number): Promise<DocumentDTO> => {
  const response = await axiosInstance.get<DocumentDTO>(`/api/documents/${documentId}`);
  return response.data;
};

/**
 * Search documents by name within a project
 * @param projectId The project ID
 * @param query The search query
 * @returns Promise with list of matching documents
 */
export const searchDocuments = async (projectId: number, query: string): Promise<DocumentDTO[]> => {
  const response = await axiosInstance.get<DocumentDTO[]>(`/api/projects/${projectId}/documents/search`, {
    params: { query }
  });
  return response.data;
}; 