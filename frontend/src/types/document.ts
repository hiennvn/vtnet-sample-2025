/**
 * Data transfer object for Document entity
 */
export interface DocumentDTO {
  id: number;
  name: string;
  path: string;
  projectId: number;
  folderId: number | null;
  fileType: string;
  size: number;
  createdAt: string;
  createdBy: string | { id: number; name: string; email: string; roles?: string[] };
} 