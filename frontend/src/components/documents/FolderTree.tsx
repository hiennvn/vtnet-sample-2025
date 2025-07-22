import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { fetchProjectRootFolders, fetchSubfolders } from '../../redux/slices/folderSlice';
import { FolderDTO } from '../../types/folder';
import './FolderTree.css';

interface FolderTreeProps {
  projectId: number;
  onFolderSelect: (folder: FolderDTO) => void;
  selectedFolderId?: number | null;
}

/**
 * Component for displaying a hierarchical folder tree
 */
const FolderTree: React.FC<FolderTreeProps> = ({ projectId, onFolderSelect, selectedFolderId }) => {
  const dispatch = useAppDispatch();
  const { folders, loading, error } = useAppSelector((state) => state.folders);
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({});
  const [loadedFolders, setLoadedFolders] = useState<Record<number, boolean>>({});

  // Load root folders on component mount
  useEffect(() => {
    dispatch(fetchProjectRootFolders(projectId));
  }, [dispatch, projectId]);

  // Check if a folder has subfolders
  const hasFolderChildren = (folderId: number): boolean => {
    return folders.some(folder => folder.parentFolderId === folderId);
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
  );
};

export default FolderTree; 