import React from 'react';

interface ProjectFilterProps {
  onStatusFilter: (status: string | null) => void;
  selectedStatus: string | null;
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({ 
  onStatusFilter, 
  selectedStatus 
}) => {
  // Project statuses based on backend values
  const statuses = ['ACTIVE', 'ARCHIVED', 'COMPLETED', 'ON_HOLD'];
  
  return (
    <div className="role-filter">
      <label htmlFor="status-select" className="filter-label">Filter by status:</label>
      <select
        id="status-select"
        className="role-select"
        value={selectedStatus || ''}
        onChange={(e) => {
          const value = e.target.value;
          onStatusFilter(value || null);
        }}
      >
        <option value="">All statuses</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProjectFilter; 