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

/**
 * Upload a document
 * @param name The document name
 * @param projectId The project ID
 * @param folderId The folder ID (optional)
 * @param file The file to upload
 * @returns Promise with the created document
 */
export const uploadDocument = async (
  name: string,
  projectId: number,
  file: File,
  folderId?: number
): Promise<DocumentDTO> => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('projectId', projectId.toString());
  formData.append('file', file);
  
  if (folderId) {
    formData.append('folderId', folderId.toString());
  }
  
  const response = await axiosInstance.post<DocumentDTO>(
    '/api/documents',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  
  return response.data;
}; 

/**
 * Delete a document by ID
 * @param documentId The document ID to delete
 * @returns Promise with void
 */
export const deleteDocument = async (documentId: number): Promise<void> => {
  await axiosInstance.delete(`/api/documents/${documentId}`);
}; 