import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchProjectById } from '../redux/slices/projectSlice';
import { fetchFolderDocuments, fetchProjectDocuments } from '../redux/slices/documentSlice';
import { fetchFolderById } from '../redux/slices/folderSlice';
import FolderTree from '../components/documents/FolderTree';
import DocumentList from '../components/documents/DocumentList';
import Breadcrumbs from '../components/documents/Breadcrumbs';
import { DocumentDTO } from '../types/document';
import { FolderDTO } from '../types/folder';
import './ProjectDocumentsPage.css';

/**
 * Page component for project documents
 */
const ProjectDocumentsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { selectedProject } = useAppSelector((state) => state.projects);
  const [currentFolder, setCurrentFolder] = useState<FolderDTO | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentDTO | null>(null);

  // Load project data on component mount
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(parseInt(projectId)));
    }
  }, [dispatch, projectId]);

  // Load documents for current folder or project root
  useEffect(() => {
    if (projectId) {
      if (currentFolder) {
        dispatch(fetchFolderDocuments(currentFolder.id));
      } else {
        dispatch(fetchProjectDocuments(parseInt(projectId)));
      }
    }
  }, [dispatch, projectId, currentFolder]);

  // Handle folder selection
  const handleFolderSelect = (folder: FolderDTO) => {
    setCurrentFolder(folder);
    setSelectedDocument(null);
  };

  // Handle document selection
  const handleDocumentSelect = (document: DocumentDTO) => {
    setSelectedDocument(document);
    // In a future user story, we would navigate to document viewer here
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = async (folderId: number | null) => {
    if (folderId === null) {
      setCurrentFolder(null);
    } else {
      try {
        const folder = await dispatch(fetchFolderById(folderId)).unwrap();
        setCurrentFolder(folder);
      } catch (error) {
        console.error('Error navigating to folder:', error);
      }
    }
    setSelectedDocument(null);
  };

  if (!selectedProject) {
    return <div className="project-documents-loading">Loading project...</div>;
  }

  return (
    <div className="project-documents-page">
      <h1 className="project-documents-title">{selectedProject.name} - Documents</h1>
      
      <Breadcrumbs
        projectId={parseInt(projectId!)}
        projectName={selectedProject.name}
        currentFolder={currentFolder}
        onNavigate={handleBreadcrumbNavigate}
      />
      
      <div className="project-documents-container">
        <div className="project-documents-sidebar">
          <FolderTree
            projectId={parseInt(projectId!)}
            onFolderSelect={handleFolderSelect}
            selectedFolderId={currentFolder?.id}
          />
        </div>
        
        <div className="project-documents-content">
          <DocumentList
            onDocumentSelect={handleDocumentSelect}
            selectedDocumentId={selectedDocument?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentsPage; 