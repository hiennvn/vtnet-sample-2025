import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchProjectById, selectSelectedProject, selectProjectLoading, selectProjectError } from '../redux/slices/projectSlice';
import { Card, CardHeader, CardContent, Typography, Button, Skeleton, Alert, Stack, Divider } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, People as PeopleIcon, Folder as FolderIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import './ProjectDetailsPage.css';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const project = useAppSelector(selectSelectedProject);
  const loading = useAppSelector(selectProjectLoading);
  const error = useAppSelector(selectProjectError);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(Number(id)));
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

  if (loading) {
    return (
      <Card>
        <CardHeader title={<Skeleton variant="text" width="60%" />} />
        <CardContent>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="70%" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Project not found
      </Alert>
    );
  }

  return (
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
              <strong>Documents:</strong> {project.documentCount || 0}
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
            >
              Upload Document
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
            No documents available in this project yet.
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetailsPage; 