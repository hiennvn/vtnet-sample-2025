import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchProjectById } from '../redux/slices/projectSlice';
import { fetchFolderDocuments, fetchProjectDocuments } from '../redux/slices/documentSlice';
import { fetchFolderById, fetchProjectRootFolders, fetchSubfolders } from '../redux/slices/folderSlice';
import { FolderTree, DocumentList, Breadcrumbs, DocumentUpload, CreateFolderDialog } from '../components/documents';
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
  const { documents, loading: documentsLoading } = useAppSelector((state) => state.documents);
  const { user } = useAppSelector((state) => state.auth);
  const [currentFolder, setCurrentFolder] = useState<FolderDTO | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentDTO | null>(null);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false);

  // Check if user is a project manager
  const isProjectManager = user?.roles?.some(role => role === 'ROLE_PROJECT_MANAGER' || role === 'ROLE_ADMIN');

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

  // Handle upload complete
  const handleUploadComplete = () => {
    // Refresh documents list
    if (currentFolder) {
      dispatch(fetchFolderDocuments(currentFolder.id));
    } else if (projectId) {
      dispatch(fetchProjectDocuments(parseInt(projectId)));
    }
    
    // Hide upload form after successful upload
    setShowUpload(false);
  };

  // Toggle upload form visibility
  const toggleUploadForm = () => {
    setShowUpload(!showUpload);
    if (!showUpload) {
      setShowCreateFolder(false);
    }
  };

  // Toggle create folder dialog visibility
  const toggleCreateFolderDialog = () => {
    setShowCreateFolder(!showCreateFolder);
    if (!showCreateFolder) {
      setShowUpload(false);
    }
  };

  // Handle folder creation success
  const handleFolderCreated = () => {
    // Refresh folder list
    if (currentFolder) {
      dispatch(fetchSubfolders(currentFolder.id));
    } else if (projectId) {
      dispatch(fetchProjectRootFolders(parseInt(projectId)));
    }
  };

  if (!selectedProject) {
    return <div className="project-documents-loading">Loading project...</div>;
  }

  const locationText = currentFolder ? `${currentFolder.name}` : 'Root';

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
          <div className="document-actions">
            <div className="document-actions-left">
              <h3>Documents in {locationText}</h3>
            </div>
            
            {isProjectManager && (
              <div className="document-actions-right">
                <button 
                  className="create-folder-button"
                  onClick={toggleCreateFolderDialog}
                >
                  {showCreateFolder ? 'Cancel' : 'New Folder'}
                </button>
                <button 
                  className="upload-toggle-button"
                  onClick={toggleUploadForm}
                >
                  {showUpload ? 'Cancel Upload' : 'Upload Document'}
                </button>
              </div>
            )}
          </div>
          
          {showCreateFolder && isProjectManager && (
            <CreateFolderDialog
              projectId={parseInt(projectId!)}
              parentFolderId={currentFolder?.id}
              onClose={toggleCreateFolderDialog}
              onSuccess={handleFolderCreated}
            />
          )}
          
          {showUpload && isProjectManager && (
            <DocumentUpload
              projectId={parseInt(projectId!)}
              folderId={currentFolder?.id}
              onUploadComplete={handleUploadComplete}
            />
          )}
          
          {documentsLoading ? (
            <div className="project-documents-loading">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="no-documents">
              <p>No documents found in this location.</p>
            </div>
          ) : (
            <DocumentList
              onDocumentSelect={handleDocumentSelect}
              selectedDocumentId={selectedDocument?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentsPage; 