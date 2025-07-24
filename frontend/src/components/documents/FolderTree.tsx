import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { fetchProjectRootFolders, fetchSubfolders, deleteFolder } from '../../redux/slices/folderSlice';
import { FolderDTO } from '../../types/folder';
import DeleteFolderConfirmation from './DeleteFolderConfirmation';
import toastService from '../../services/toastService';
import './FolderTree.css';

interface FolderTreeProps {
  projectId: number;
  onFolderSelect: (folder: FolderDTO) => void;
  selectedFolderId?: number | null;
  isProjectManager?: boolean;
}

/**
 * Component for displaying a hierarchical folder tree
 */
const FolderTree: React.FC<FolderTreeProps> = ({ 
  projectId, 
  onFolderSelect, 
  selectedFolderId,
  isProjectManager = false
}) => {
  const dispatch = useAppDispatch();
  const { folders, loading, error } = useAppSelector((state) => state.folders);
  const { documents } = useAppSelector((state) => state.documents);
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({});
  const [loadedFolders, setLoadedFolders] = useState<Record<number, boolean>>({});
  const [folderToDelete, setFolderToDelete] = useState<FolderDTO | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNonEmptyFolder, setIsNonEmptyFolder] = useState(false);

  // Load root folders on component mount
  useEffect(() => {
    dispatch(fetchProjectRootFolders(projectId));
  }, [dispatch, projectId]);

  // Check if a folder has subfolders
  const hasFolderChildren = (folderId: number): boolean => {
    return folders.some(folder => folder.parentFolderId === folderId);
  };

  // Check if a folder has documents
  const hasFolderDocuments = (folderId: number): boolean => {
    return documents.some(document => document.folderId === folderId);
  };

  // Check if a folder is empty (no subfolders and no documents)
  const isFolderEmpty = (folder: FolderDTO): boolean => {
    return !hasFolderChildren(folder.id) && !hasFolderDocuments(folder.id);
  };

  // Handle folder expansion
  const handleFolderToggle = async (folder: FolderDTO, event: React.MouseEvent) => {
    event.stopPropagation();
    const isExpanded = expandedFolders[folder.id] || false;
    
    // If expanding and not loaded yet, fetch subfolders
    if (!isExpanded && !loadedFolders[folder.id]) {
      await dispatch(fetchSubfolders(folder.id));
      setLoadedFolders({ ...loadedFolders, [folder.id]: true });
    }
    
    setExpandedFolders({ ...expandedFolders, [folder.id]: !isExpanded });
  };

  // Handle folder selection
  const handleFolderSelect = (folder: FolderDTO) => {
    onFolderSelect(folder);
  };

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent, folder: FolderDTO) => {
    e.stopPropagation(); // Prevent folder selection
    setFolderToDelete(folder);
    
    // Check if folder is empty
    const isEmpty = isFolderEmpty(folder);
    setIsNonEmptyFolder(!isEmpty);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (folderToDelete && !isNonEmptyFolder) {
      try {
        await dispatch(deleteFolder(folderToDelete.id)).unwrap();
        toastService.showSuccess(`Folder "${folderToDelete.name}" deleted successfully`);
        
        // If the deleted folder was selected, clear selection
        if (selectedFolderId === folderToDelete.id) {
          onFolderSelect({ id: 0 } as FolderDTO); // This will trigger a navigation to root
        }
      } catch (error) {
        toastService.showError('Failed to delete folder');
      } finally {
        setIsDeleteModalOpen(false);
        setFolderToDelete(null);
      }
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setFolderToDelete(null);
    setIsNonEmptyFolder(false);
  };

  // Recursive function to render folder and its children
  const renderFolder = (folder: FolderDTO, level: number = 0) => {
    const isExpanded = expandedFolders[folder.id] || false;
    const isSelected = selectedFolderId === folder.id;
    const childFolders = folders.filter(child => child.parentFolderId === folder.id);
    const hasChildren = childFolders.length > 0 || !loadedFolders[folder.id];
    
    return (
      <div key={folder.id} className="folder-tree-item" style={{ marginLeft: `${level * 16}px` }}>
        <div 
          className={`folder-tree-node ${isSelected ? 'selected' : ''}`}
          onClick={() => handleFolderSelect(folder)}
        >
          <div className="folder-tree-node-content">
            {hasChildren && (
              <span 
                className={`folder-toggle ${isExpanded ? 'expanded' : ''}`}
                onClick={(e) => handleFolderToggle(folder, e)}
              >
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
            <span className="folder-icon">📁</span>
            <span className="folder-name">{folder.name}</span>
          </div>
          
          {isProjectManager && (
            <div className="folder-actions">
              <button 
                className="btn-icon btn-danger folder-delete-btn"
                onClick={(e) => handleDeleteClick(e, folder)}
                title="Delete folder"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          )}
        </div>
        
        {isExpanded && childFolders.length > 0 && (
          <div className="folder-children">
            {childFolders.map(childFolder => renderFolder(childFolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading && folders.length === 0) {
    return <div className="folder-tree-loading">Loading folders...</div>;
  }

  if (error) {
    return <div className="folder-tree-error">Error: {error}</div>;
  }

  // Get root folders
  const rootFolders = folders.filter(folder => folder.parentFolderId === null);

  return (
    <>
      <div className="folder-tree">
        <div className="folder-tree-header">Folders</div>
        <div className="folder-tree-content">
          {rootFolders.length > 0 ? (
            rootFolders.map(folder => renderFolder(folder))
          ) : (
            <div className="folder-tree-empty">No folders found</div>
          )}
        </div>
      </div>

      {folderToDelete && (
        <DeleteFolderConfirmation
          folderName={folderToDelete.name}
          isOpen={isDeleteModalOpen}
          isNonEmpty={isNonEmptyFolder}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </>
  );
};

export default FolderTree; 