import { Project } from '../../types/project';
import { formatDate } from '../../utils/dateUtils';

interface ProjectListItemProps {
  project: Project;
  onClick: () => void;
}

function ProjectListItem({ project, onClick }: ProjectListItemProps) {
  // Convert status to lowercase and replace spaces with underscores for CSS class
  const statusClass = project.status.toLowerCase().replace(/\s+/g, '_');
  
  // Format status for display (capitalize first letter of each word)
  const formattedStatus = project.status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="user-list-item" onClick={onClick}>
      <div className="user-list-item-field">{project.name}</div>
      <div className="user-list-item-field">
        <span className={`status-badge status-${statusClass}`}>
          {formattedStatus}
        </span>
      </div>
      <div className="user-list-item-field">{project.documentCount}</div>
      <div className="user-list-item-field">{formatDate(project.createdAt)}</div>
    </div>
  );
}

export default ProjectListItem; 