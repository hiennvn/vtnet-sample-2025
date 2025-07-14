import { Project } from '../../types/project';
import { ProjectListItem } from './';
import '../users/UserManagement.css'; // Reusing existing styles
import './ProjectList.css'; // Project-specific styles

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  filters: {
    status: string | null;
    name: string | null;
  };
  onStatusFilter: (status: string | null) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
}

function ProjectList({
  projects,
  loading
}: ProjectListProps) {
  
  if (loading && projects.length === 0) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="project-management">
      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects found</p>
          <p className="empty-state-hint">Try adjusting your filters to see more results</p>
        </div>
      ) : (
        <div className="user-list">
          <div className="user-list-header">
            <div className="user-list-header-item">Name</div>
            <div className="user-list-header-item">Status</div>
            <div className="user-list-header-item">Documents</div>
            <div className="user-list-header-item">Created</div>
          </div>
          
          {projects.map(project => (
            <ProjectListItem 
              key={project.id}
              project={project}
              onClick={() => window.location.href = `/projects/${project.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectList; 