/**
 * Data transfer object for Folder entity
 */
export interface FolderDTO {
  id: number;
  name: string;
  path: string;
  projectId: number;
  parentFolderId: number | null;
  createdAt: string;
  createdBy: string;
} 