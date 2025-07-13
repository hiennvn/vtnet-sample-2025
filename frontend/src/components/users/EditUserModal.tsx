import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { fetchUserById, updateUser, selectSelectedUser } from '../../redux/slices/userSlice';
import { Role, User } from '../../types/user';
import toastService from '../../services/toastService';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  roles: Role[];
}

interface FormData {
  name: string;
  email: string;
  username: string;
  password: string;
  active: boolean;
  roleIds: number[];
}

interface FormErrors {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  roleIds?: string;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  roles 
}) => {
  const dispatch = useAppDispatch();
  const selectedUser = useAppSelector(selectSelectedUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    username: '',
    password: '',
    active: true,
    roleIds: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      dispatch(fetchUserById(userId))
        .unwrap()
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          toastService.showError('Failed to load user data', {
            showRetry: true,
            onRetry: () => dispatch(fetchUserById(userId)),
          });
          onClose();
        });
    }
  }, [dispatch, isOpen, userId, onClose]);

  // Update form data when user data is loaded
  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name,
        email: selectedUser.email,
        username: selectedUser.username || '',
        password: '',
        active: selectedUser.active,
        roleIds: selectedUser.roles.map((role: Role) => role.id),
      });
      setIsLoading(false);
    }
  }, [selectedUser]);

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

    if (formData.password && formData.password.length < 8) {
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
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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

    // Only include password if it was changed
    const updateData = {
      ...formData,
      password: formData.password || undefined,
    };

    try {
      await dispatch(updateUser({ id: userId, userData: updateData })).unwrap();
      toastService.showSuccess(`User ${formData.name} updated successfully`);
      onClose();
    } catch (error) {
      toastService.showError('Failed to update user', {
        showRetry: true,
        onRetry: () => handleSubmit(e),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit User</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {isLoading ? (
          <div className="modal-body">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading user data...</p>
            </div>
          </div>
        ) : (
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
                <label htmlFor="password">Password (leave blank to keep unchanged)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Enter new password or leave blank"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              <div className="form-group">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    className="form-check-input"
                    checked={formData.active}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="active" className="form-check-label">
                    Active
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Roles</label>
                <div className="role-checkboxes">
                  {roles.map(role => (
                    <div className="form-check" key={role.id}>
                      <input
                        type="checkbox"
                        id={`role-${role.id}`}
                        checked={formData.roleIds.includes(role.id)}
                        onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                        disabled={isSubmitting}
                        className="form-check-input"
                      />
                      <label htmlFor={`role-${role.id}`} className="form-check-label">
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.roleIds && <div className="invalid-feedback">{errors.roleIds}</div>}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditUserModal; 