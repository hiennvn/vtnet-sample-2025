import React, { useState } from 'react';
import { useAppDispatch } from '../../redux/store';
import { createUser } from '../../redux/slices/userSlice';
import { Role } from '../../types/user';
import toastService from '../../services/toastService';
// Import PasswordStrength with explicit path
import PasswordStrength from '../users/PasswordStrength';
import RoleDropdown from './RoleDropdown';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
}

interface FormData {
  name: string;
  email: string;
  username: string;
  password: string;
  roleIds: number[];
}

interface FormErrors {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  roleIds?: string;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, roles }) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    username: '',
    password: '',
    roleIds: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (formData.roleIds.length === 0) {
      newErrors.roleIds = 'At least one role must be selected';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        roleIds: [...formData.roleIds, roleId],
      });
    } else {
      setFormData({
        ...formData,
        roleIds: formData.roleIds.filter(id => id !== roleId),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(createUser(formData)).unwrap();
      toastService.showSuccess(`User ${formData.name} created successfully`);
      onClose();
    } catch (error) {
      toastService.showError('Failed to create user', {
        showRetry: true,
        onRetry: () => handleSubmit(e),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected roles names for display
  const getSelectedRolesText = () => {
    if (formData.roleIds.length === 0) return 'Select roles';
    
    const selectedRoleNames = roles
      .filter(role => formData.roleIds.includes(role.id))
      .map(role => role.name);
    
    return selectedRoleNames.join(', ');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Create New User</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                value={formData.username}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {formData.password && <PasswordStrength password={formData.password} />}
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label>Roles</label>
              <RoleDropdown
                roles={roles}
                selectedRoleIds={formData.roleIds}
                onChange={handleRoleChange}
                disabled={isSubmitting}
                error={errors.roleIds}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal; 