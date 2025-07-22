import React, { useState, useRef } from 'react';
import { Role } from '../../types/user';
import { useClickOutside } from '../../hooks/useClickOutside';
import './RoleDropdown.css';

interface RoleDropdownProps {
  roles: Role[];
  selectedRoleIds: number[];
  onChange: (roleId: number, checked: boolean) => void;
  disabled?: boolean;
  error?: string;
}

function RoleDropdown({ roles, selectedRoleIds, onChange, disabled = false, error }: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useClickOutside(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getSelectedRolesText = () => {
    if (selectedRoleIds.length === 0) return 'Select roles';
    
    const selectedRoleNames = roles
      .filter(role => selectedRoleIds.includes(role.id))
      .map(role => role.name);
    
    return selectedRoleNames.join(', ');
  };

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button 
        type="button" 
        className={`dropdown-toggle form-control text-left ${error ? 'is-invalid' : ''}`}
        onClick={toggleDropdown}
        disabled={disabled}
      >
        {getSelectedRolesText()}
        <span className="caret"></span>
      </button>
      {isOpen && (
        <div className="dropdown-menu show">
          {roles.map(role => (
            <div className="dropdown-item" key={role.id}>
              <div className="form-check">
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={(e) => onChange(role.id, e.target.checked)}
                  disabled={disabled}
                  className="form-check-input"
                />
                <label htmlFor={`role-${role.id}`} className="form-check-label">
                  {role.name}
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

export default RoleDropdown; 