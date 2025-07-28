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
      // Load root folders when component mounts
      dispatch(fetchProjectRootFolders(parseInt(projectId)));
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
    return (
      <div className="content-area">
        <div className="loading-state">
          <div className="spinner"></div>
          <div>Loading project...</div>
        </div>
      </div>
    );
  }

  const locationText = currentFolder ? `${currentFolder.name}` : 'Root';

  return (
    <>
      <div className="content-area">
        <h1 className="page-title">{selectedProject.name} - Documents</h1>
        
        <div className="card">
          <div className="card-header">
            <Breadcrumbs
              projectId={parseInt(projectId!)}
              projectName={selectedProject.name}
              currentFolder={currentFolder}
              onNavigate={handleBreadcrumbNavigate}
            />
            
            {isProjectManager && (
              <div className="document-actions">
                <button 
                  className="fluent-button outline"
                  onClick={toggleCreateFolderDialog}
                >
                  <i className="fas fa-folder-plus" style={{ marginRight: '8px' }}></i>
                  New Folder
                </button>
                <button 
                  className="fluent-button accent"
                  onClick={toggleUploadForm}
                >
                  <i className="fas fa-upload" style={{ marginRight: '8px' }}></i>
                  Upload Document
                </button>
              </div>
            )}
          </div>
          
          <div className="document-container">
            <div className="document-sidebar">
              <FolderTree
                projectId={parseInt(projectId!)}
                onFolderSelect={handleFolderSelect}
                selectedFolderId={currentFolder?.id}
                isProjectManager={isProjectManager}
              />
            </div>
            
            <div className="document-content">
              {showCreateFolder && isProjectManager && (
                <div className="document-form-container">
                  <CreateFolderDialog
                    projectId={parseInt(projectId!)}
                    parentFolderId={currentFolder?.id}
                    onClose={toggleCreateFolderDialog}
                    onSuccess={handleFolderCreated}
                  />
                </div>
              )}
              
              {showUpload && isProjectManager && (
                <div className="document-form-container">
                  <DocumentUpload
                    projectId={parseInt(projectId!)}
                    folderId={currentFolder?.id}
                    onUploadComplete={handleUploadComplete}
                  />
                </div>
              )}
              
              {documentsLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <div>Loading documents...</div>
                </div>
              ) : documents.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-folder-open"></i>
                  <p>No documents found in this location.</p>
                  {isProjectManager && (
                    <button 
                      className="fluent-button accent"
                      onClick={toggleUploadForm}
                    >
                      Upload Documents
                    </button>
                  )}
                </div>
              ) : (
                <DocumentList
                  onDocumentSelect={handleDocumentSelect}
                  selectedDocumentId={selectedDocument?.id}
                  isProjectManager={isProjectManager}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDocumentsPage; 