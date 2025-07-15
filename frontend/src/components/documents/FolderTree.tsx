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

  // Handle folder expansion
  const handleFolderToggle = (folder: FolderDTO) => {
    const isExpanded = expandedFolders[folder.id] || false;
    
    // If expanding and not loaded yet, fetch subfolders
    if (!isExpanded && folder.hasSubfolders && !loadedFolders[folder.id]) {
      dispatch(fetchSubfolders(folder.id));
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
    
    return (
      <div key={folder.id} className="folder-tree-item" style={{ marginLeft: `${level * 16}px` }}>
        <div 
          className={`folder-tree-node ${isSelected ? 'selected' : ''}`}
          onClick={() => handleFolderSelect(folder)}
        >
          {folder.hasSubfolders && (
            <span 
              className={`folder-toggle ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleFolderToggle(folder);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          <span className="folder-icon">📁</span>
          <span className="folder-name">{folder.name}</span>
        </div>
        
        {isExpanded && (
          <div className="folder-children">
            {folders
              .filter(child => child.parentFolderId === folder.id)
              .map(childFolder => renderFolder(childFolder, level + 1))}
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

  return (
    <div className="folder-tree">
      <div className="folder-tree-header">Folders</div>
      <div className="folder-tree-content">
        {folders
          .filter(folder => folder.parentFolderId === null)
          .map(folder => renderFolder(folder))}
      </div>
    </div>
  );
};

export default FolderTree; 