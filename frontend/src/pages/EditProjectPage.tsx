import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  fetchProjectById, 
  updateProject, 
  selectSelectedProject, 
  selectProjectLoading, 
  selectProjectError 
} from '../redux/slices/projectSlice';
import { ProjectUpdatePayload } from '../types/project';
import EditProjectForm from '../components/projects/EditProjectForm';
import toastService from '../services/toastService';

const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || '0', 10);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const project = useAppSelector(selectSelectedProject);
  const loading = useAppSelector(selectProjectLoading);
  const error = useAppSelector(selectProjectError);

  useEffect(() => {
    if (projectId > 0) {
      dispatch(fetchProjectById(projectId));
    }
  }, [dispatch, projectId]);

  const handleSubmit = async (projectData: ProjectUpdatePayload) => {
    try {
      const resultAction = await dispatch(updateProject({ id: projectId, projectData }));
      if (updateProject.fulfilled.match(resultAction)) {
        toastService.showSuccess(`Project "${resultAction.payload.name}" updated successfully`);
        navigate(`/projects/${projectId}`);
      }
    } catch (error) {
      toastService.showError('Failed to update project');
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };

  if (error) {
    return (
      <div className="content-area">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  if (!project && loading) {
    return (
      <div className="content-area">
        <div className="loading">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="content-area">
        <div className="alert alert-warning">
          Project not found
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Edit Project</h1>
        </div>
        <div className="card-content">
          <p className="description">
            Update the project details below.
          </p>
          <EditProjectForm
            project={project}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProjectPage; 