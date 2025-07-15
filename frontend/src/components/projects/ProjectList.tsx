import React from 'react';
import { Project } from '../../types/project';
import ProjectListItem from './ProjectListItem';
import './ProjectList.css';

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, loading }) => {
  if (loading) {
    return <div className="loading-message">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return <div className="empty-message">No projects found</div>;
  }

  return (
    <div className="project-list">
      <div className="project-list-header">
        <div className="project-list-header-item">Name</div>
        <div className="project-list-header-item">Status</div>
        <div className="project-list-header-item">Documents</div>
        <div className="project-list-header-item">Created</div>
      </div>
      {projects.map(project => (
        <ProjectListItem key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectList; 