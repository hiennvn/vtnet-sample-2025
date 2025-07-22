import React, { useEffect, useState } from 'react';
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
import { Card, CardHeader, CardContent, Typography, Button, Skeleton, Alert, Stack, Divider } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, People as PeopleIcon, Folder as FolderIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import './ProjectDetailsPage.css';
import '../components/users/UserManagement.css';
import '../components/documents/DocumentList.css';
import DeleteProjectConfirmation from '../components/projects/DeleteProjectConfirmation';
import toastService from '../services/toastService';
import { DocumentDTO } from '../types/document';
import { formatDate } from '../utils/dateUtils';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const project = useAppSelector(selectSelectedProject);
  const loading = useAppSelector(selectProjectLoading);
  const error = useAppSelector(selectProjectError);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { documents, loading: documentsLoading } = useAppSelector((state) => state.documents);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(Number(id)));
      dispatch(fetchProjectDocuments(Number(id)));
    }
  }, [dispatch, id]);

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
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };
  
  const handleDeleteConfirm = async () => {
    if (id && project) {
      try {
        await dispatch(deleteProject(Number(id))).unwrap();
        toastService.showSuccess('Project deleted successfully');
        navigate('/projects');
      } catch (error) {
        toastService.showError('Failed to delete project');
      } finally {
        setIsDeleteDialogOpen(false);
      }
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string | undefined | null): string => {
    if (!fileType) return '📎'; // Default icon for undefined or null fileType
    
    const type = fileType.toLowerCase();
    if (type.includes('image') || type.endsWith('png') || type.endsWith('jpg') || type.endsWith('jpeg') || type.endsWith('gif')) {
      return '🖼️';
    } else if (type.endsWith('pdf')) {
      return '📄';
    } else if (type.includes('excel') || type.endsWith('xlsx') || type.endsWith('xls') || type.endsWith('csv')) {
      return '📊';
    } else if (type.includes('powerpoint') || type.endsWith('ppt') || type.endsWith('pptx')) {
      return '📑';
    } else if (type.includes('word') || type.endsWith('doc') || type.endsWith('docx')) {
      return '📝';
    } else if (type.includes('text') || type.endsWith('txt')) {
      return '📃';
    } else {
      return '📎';
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
  };

  // Handle document selection
  const handleDocumentSelect = (document: DocumentDTO) => {
    // In the future, navigate to document viewer
    console.log('Selected document:', document);
  };

  // Calculate the total document count including files in folders
  const documentCount = documents ? documents.length : project?.documentCount || 0;

  if (loading) {
    return (
      <div className="content-area">
        <Card>
          <CardHeader title={<Skeleton variant="text" width="60%" />} />
          <CardContent>
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="70%" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-area">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="content-area">
        <Alert severity="info" sx={{ mb: 2 }}>
          Project not found
        </Alert>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="project-details-page">
        <Card className="card">
          <CardHeader
            title={project.name}
            action={
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<PeopleIcon />}
                  onClick={handleManageMembers}
                >
                  Members
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteClick}
                >
                  Delete
                </Button>
              </Stack>
            }
          />
          <Divider />
          <CardContent className="card-content">
            <Typography variant="body1" className="description">
              {project.description || 'No description provided'}
            </Typography>
            
            <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Status:</strong> {project.status}
              </Typography>
              <Typography variant="body2">
                <strong>Created:</strong> {format(new Date(project.createdAt), 'MMM d, yyyy')}
              </Typography>
              <Typography variant="body2">
                <strong>Documents:</strong> {documentCount}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardHeader 
            title="Documents" 
            action={
              <Button 
                variant="contained" 
                startIcon={<FolderIcon />}
                onClick={handleViewDocuments}
              >
                Browse Documents
              </Button>
            }
          />
          <Divider />
          <CardContent>
            {documentsLoading ? (
              <div className="document-list-loading">Loading documents...</div>
            ) : documents.length === 0 ? (
              <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
                No documents available in this project yet.
              </Typography>
            ) : (
              <div className="document-list" style={{ maxHeight: '400px' }}>
                <div className="document-list-header">
                  <div className="document-list-header-name">Name</div>
                  <div className="document-list-header-size">Size</div>
                  <div className="document-list-header-created">Created</div>
                  <div className="document-list-header-by">Created By</div>
                </div>
                <div className="document-list-content">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className="document-list-item"
                      onClick={() => handleDocumentSelect(document)}
                    >
                      <div className="document-list-item-name">
                        <span className="document-icon">{getFileIcon(document.fileType)}</span>
                        <span className="document-name">{document.name || 'Unnamed document'}</span>
                      </div>
                      <div className="document-list-item-size">{document.size ? formatFileSize(document.size) : 'Unknown'}</div>
                      <div className="document-list-item-created">{document.createdAt ? formatDate(document.createdAt) : 'Unknown'}</div>
                      <div className="document-list-item-by">
                        {typeof document.createdBy === 'object' && document.createdBy !== null
                          ? (document.createdBy as any).name || 'Unknown'
                          : document.createdBy || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <DeleteProjectConfirmation
          projectName={project.name}
          isOpen={isDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </div>
  );
};

export default ProjectDetailsPage; 