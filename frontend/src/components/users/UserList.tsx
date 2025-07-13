import React from 'react';
import { User } from '../../types/user';
import { formatDate } from '../../utils/dateUtils';

interface UserListProps {
  users: User[];
  loading: boolean;
  onEdit: (userId: number) => void;
  onDelete: (userId: number) => void;
  onResetPassword: (userId: number) => void;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  loading, 
  onEdit, 
  onDelete, 
  onResetPassword 
}) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <p>No users found.</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                {user.roles.map(role => role.name).join(', ')}
              </td>
              <td>
                <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{formatDate(user.createdAt)}</td>
              <td className="actions">
                <button 
                  className="btn btn-icon" 
                  onClick={() => onEdit(user.id)}
                  title="Edit user"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="btn btn-icon" 
                  onClick={() => onResetPassword(user.id)}
                  title="Reset password"
                >
                  <i className="fas fa-key"></i>
                </button>
                <button 
                  className="btn btn-icon btn-danger" 
                  onClick={() => onDelete(user.id)}
                  title="Delete user"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList; 