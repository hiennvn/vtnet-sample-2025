import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  fetchProjectById, 
  selectSelectedProject, 
  selectProjectLoading, 
  selectProjectError,
  deleteProject
} from '../redux/slices/projectSlice';
import { fetchProjectDocuments } from '../redux/slices/documentSlice';
import './ProjectDetailsPage.css';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const project = useAppSelector(selectSelectedProject);
  const loading = useAppSelector(selectProjectLoading);
  const error = useAppSelector(selectProjectError);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { documents, loading: documentsLoading } = useAppSelector((state) => state.documents);
  const [activeTab, setActiveTab] = useState('documents');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(Number(id)));
      dispatch(fetchProjectDocuments(Number(id)));
    }
  }, [dispatch, id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/projects/${id}/edit`);
    }
  };

  const handleManageMembers = () => {
    if (id) {
      navigate(`/projects/${id}/members`);
    }
  };
  
  const handleViewDocuments = () => {
    if (id) {
      navigate(`/projects/${id}/documents`);
    }
  };
  
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    setDropdownOpen(false);
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };
  
  const handleDeleteConfirm = async () => {
    if (id && project) {
      try {
        await dispatch(deleteProject(Number(id))).unwrap();
        navigate('/projects');
      } catch (error) {
        console.error('Failed to delete project', error);
      } finally {
        setIsDeleteDialogOpen(false);
      }
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string | undefined | null): string => {
    if (!fileType) return 'fa-file'; // Default icon
    
    const type = fileType.toLowerCase();
    if (type.includes('image') || type.endsWith('png') || type.endsWith('jpg') || type.endsWith('jpeg') || type.endsWith('gif')) {
      return 'fa-file-image';
    } else if (type.endsWith('pdf')) {
      return 'fa-file-pdf';
    } else if (type.includes('excel') || type.endsWith('xlsx') || type.endsWith('xls') || type.endsWith('csv')) {
      return 'fa-file-excel';
    } else if (type.includes('powerpoint') || type.endsWith('ppt') || type.endsWith('pptx')) {
      return 'fa-file-powerpoint';
    } else if (type.includes('word') || type.endsWith('doc') || type.endsWith('docx')) {
      return 'fa-file-word';
    } else if (type.includes('text') || type.endsWith('txt')) {
      return 'fa-file-alt';
    } else {
      return 'fa-file';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="content-area">
        <div className="loading-state">
          <div className="spinner"></div>
          <div>Loading project details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-area">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="content-area">
        <div className="error-message">
          Project not found
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      {/* Project Header */}
      <div className="project-header">
        <div className="project-header-top">
          <h1 className="page-title">{project.name}</h1>
          <div className="project-actions">
            <button className="fluent-button outline" onClick={handleEdit}>
              Edit Project
            </button>
            <button className="fluent-button outline" onClick={handleManageMembers}>
              Manage Members
            </button>
            <div className="dropdown" ref={dropdownRef}>
              <button className="fluent-button outline" onClick={toggleDropdown}>
                <i className="fas fa-ellipsis-h"></i>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-item">Archive Project</div>
                  <div className="dropdown-item" onClick={handleDeleteClick}>Delete Project</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <p className="project-description">
          {project.description || 'No description provided'}
        </p>
        
        <div className="project-meta">
          <div className="meta-item">
            <i className="fas fa-calendar-alt"></i>
            <span>Created: {formatDate(project.createdAt)}</span>
          </div>
          <div className="meta-item">
            <i className="fas fa-tag"></i>
            <span>Status: <span className={`project-status status-${project.status.toLowerCase()}`}>{project.status}</span></span>
          </div>
          <div className="meta-item">
            <i className="fas fa-file-alt"></i>
            <span>{documents.length} documents</span>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </div>
        <div 
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => handleManageMembers()}
        >
          Members
        </div>
        <div 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </div>
      </div>
      
      {/* Document Area */}
      <div className="document-area">
        <div className="document-toolbar">
          <div className="breadcrumb-path">
            <span className="folder">Project Root</span>
          </div>
          <div className="document-actions">
            <button className="fluent-button accent" onClick={handleViewDocuments}>
              <i className="fas fa-upload" style={{ marginRight: '8px' }}></i>
              Upload
            </button>
            <button className="fluent-button outline">
              <i className="fas fa-folder-plus" style={{ marginRight: '8px' }}></i>
              New Folder
            </button>
          </div>
        </div>
        
        {/* Document list */}
        {documentsLoading ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <p>No documents in this project yet</p>
            <button className="fluent-button accent" onClick={handleViewDocuments}>
              Upload Documents
            </button>
          </div>
        ) : (
          <div className="document-list">
            {documents.map((document) => (
              <div key={document.id} className="document-item" onClick={() => handleViewDocuments()}>
                <div className="document-icon">
                  <i className={`fas ${getFileIcon(document.fileType)}`}></i>
                </div>
                <div className="document-info">
                  <div className="document-name">{document.name || 'Unnamed document'}</div>
                  <div className="document-meta">
                    <span>Added by {typeof document.createdBy === 'object' && document.createdBy !== null
                      ? (document.createdBy as any).name || 'Unknown'
                      : document.createdBy || 'Unknown'}</span>
                    <span>{formatDate(document.createdAt)}</span>
                  </div>
                </div>
                <div className="document-actions">
                  <button className="fluent-button stealth">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Delete Project</h3>
              <button className="close-button" onClick={handleDeleteCancel}>×</button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete <strong>{project.name}</strong>?</p>
              <p>This action cannot be undone and all associated documents will be permanently deleted.</p>
            </div>
            <div className="modal-footer">
              <button className="fluent-button outline" onClick={handleDeleteCancel}>Cancel</button>
              <button className="fluent-button accent" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage; 