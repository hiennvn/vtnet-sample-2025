import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { createProject, selectProjectLoading } from '../redux/slices/projectSlice';
import { ProjectCreatePayload } from '../types/project';
import { ProjectForm } from '../components/projects';
import toastService from '../services/toastService';
import '../components/users/UserManagement.css'; // Import shared card styles
import '../components/projects/ProjectPage.css'; // Import project page styles

const CreateProjectPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector(selectProjectLoading);

  const handleSubmit = async (projectData: ProjectCreatePayload) => {
    try {
      const resultAction = await dispatch(createProject(projectData));
      if (createProject.fulfilled.match(resultAction)) {
        const newProject = resultAction.payload;
        toastService.showSuccess(`Project "${newProject.name}" created successfully`);
        navigate(`/projects/${newProject.id}`);
      }
    } catch (error) {
      toastService.showError('Failed to create project');
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <div className="content-area">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Create New Project</h1>
        </div>
        <div className="card-content">
          <p className="description">
            Create a new project by providing a name and optional description.
          </p>
          <ProjectForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage; 