import React from 'react';
import { Role } from '../../types/user';

interface RoleFilterProps {
  roles: Role[];
  selectedRoleId: number | null;
  onRoleSelect: (roleId: number | null) => void;
}

const RoleFilter: React.FC<RoleFilterProps> = ({ 
  roles, 
  selectedRoleId, 
  onRoleSelect 
}) => {
  return (
    <div className="role-filter">
      <label htmlFor="role-select" className="filter-label">Filter by role:</label>
      <select
        id="role-select"
        className="role-select"
        value={selectedRoleId || ''}
        onChange={(e) => {
          const value = e.target.value;
          onRoleSelect(value ? Number(value) : null);
        }}
      >
        <option value="">All roles</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleFilter; 