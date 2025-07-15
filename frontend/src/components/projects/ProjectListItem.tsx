import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Project } from '../../types/project';
import './ProjectListItem.css';

interface ProjectListItemProps {
  project: Project;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="project-item" onClick={handleClick}>
      <div className="project-name">{project.name}</div>
      <div className="project-status">
        <span className={`status-badge ${project.status.toLowerCase()}`}>
          {project.status}
        </span>
      </div>
      <div className="project-documents">{project.documentCount} documents</div>
      <div className="project-date">{format(new Date(project.createdAt), 'MMM d, yyyy')}</div>
    </div>
  );
};

export default ProjectListItem; 