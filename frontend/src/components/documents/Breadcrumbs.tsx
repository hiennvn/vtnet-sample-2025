import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../redux/store';
import { fetchFolderById } from '../../redux/slices/folderSlice';
import { FolderDTO } from '../../types/folder';
import './Breadcrumbs.css';

interface BreadcrumbsProps {
  projectId: number;
  projectName: string;
  currentFolder: FolderDTO | null;
  onNavigate: (folderId: number | null) => void;
}

interface BreadcrumbItem {
  id: number | null;
  name: string;
  isProject: boolean;
}

/**
 * Component for displaying breadcrumb navigation
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ projectId, projectName, currentFolder, onNavigate }) => {
  const dispatch = useAppDispatch();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Build breadcrumb path when current folder changes
  useEffect(() => {
    const buildBreadcrumbs = async () => {
      // Start with project as root
      const breadcrumbPath: BreadcrumbItem[] = [
        { id: null, name: projectName, isProject: true }
      ];

      if (currentFolder) {
        let folder = currentFolder;
        const folderPath: BreadcrumbItem[] = [
          { id: folder.id, name: folder.name, isProject: false }
        ];

        // Traverse up the folder hierarchy
        while (folder.parentFolderId) {
          try {
            const parentFolder = await dispatch(fetchFolderById(folder.parentFolderId)).unwrap();
            folderPath.unshift({ id: parentFolder.id, name: parentFolder.name, isProject: false });
            folder = parentFolder;
          } catch (error) {
            console.error('Error fetching parent folder:', error);
            break;
          }
        }

        // Combine project root with folder path
        setBreadcrumbs([...breadcrumbPath, ...folderPath]);
      } else {
        setBreadcrumbs(breadcrumbPath);
      }
    };

    buildBreadcrumbs();
  }, [dispatch, projectId, projectName, currentFolder]);

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    onNavigate(item.id);
  };

  return (
    <div className="breadcrumbs">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          <span
            className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
            onClick={() => handleBreadcrumbClick(item)}
          >
            {item.isProject ? <span className="breadcrumb-project-icon">📁</span> : ''}
            {item.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs; 