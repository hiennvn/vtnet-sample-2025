import React, { useState, useEffect } from 'react';
import { Project, ProjectUpdatePayload } from '../../types/project';
import './ProjectForm.css';

interface EditProjectFormProps {
  project: Project;
  onSubmit: (data: ProjectUpdatePayload) => void;
  onCancel: () => void;
  loading: boolean;
}

const EditProjectForm: React.FC<EditProjectFormProps> = ({ 
  project, 
  onSubmit, 
  onCancel, 
  loading 
}) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState(project.status);
  const [errors, setErrors] = useState<{ name?: string; status?: string }>({});

  // Load project data when the component mounts or when the project changes
  useEffect(() => {
    setName(project.name);
    setDescription(project.description || '');
    setStatus(project.status);
  }, [project]);

  const validate = (): boolean => {
    const newErrors: { name?: string; status?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (name.length > 255) {
      newErrors.name = 'Project name must be less than 255 characters';
    }
    
    if (!status) {
      newErrors.status = 'Status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        name,
        description: description.trim() ? description : undefined,
        status
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div className="form-group">
        <label htmlFor="project-name">Project Name *</label>
        <input
          id="project-name"
          type="text"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          required
        />
        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="project-description">Description</label>
        <textarea
          id="project-description"
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="project-status">Status *</label>
        <select
          id="project-status"
          className={`form-control ${errors.status ? 'is-invalid' : ''}`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
          required
        >
          <option value="">Select a status</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        {errors.status && <div className="invalid-feedback">{errors.status}</div>}
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="btn btn-outline" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditProjectForm; 