import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addProjectMember, 
  fetchAvailableUsers,
  selectAvailableUsers,
  selectLoading,
  selectError
} from '../../redux/slices/projectMemberSlice';
import { ProjectMemberCreate } from '../../types/projectMember';
import './AddMemberForm.css';

interface AddMemberFormProps {
  projectId: number;
  onAddSuccess?: () => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ projectId, onAddSuccess }) => {
  const dispatch = useDispatch();
  const availableUsers = useSelector(selectAvailableUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedRole, setSelectedRole] = useState<string>('DEVELOPER');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAvailableUsers(projectId) as any);
  }, [dispatch, projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUserId === '') {
      setFormError('Please select a user');
      return;
    }

    const memberData: ProjectMemberCreate = {
      userId: selectedUserId as number,
      role: selectedRole
    };

    dispatch(addProjectMember({ projectId, memberData }) as any)
      .then((result: any) => {
        if (!result.error) {
          setSelectedUserId('');
          setSelectedRole('DEVELOPER');
          setFormError(null);
          if (onAddSuccess) {
            onAddSuccess();
          }
        }
      });
  };

  if (loading && availableUsers.length === 0) {
    return <div>Loading available users...</div>;
  }

  return (
    <div className="add-member-form">
      <h3>Add Project Member</h3>
      {error && <div className="error-message">Error: {error}</div>}
      {formError && <div className="error-message">{formError}</div>}
      
      {availableUsers.length === 0 ? (
        <p>No users available to add to this project.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="user">User:</label>
            <select
              id="user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
              required
            >
              <option value="">Select a user</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              required
            >
              <option value="ROLE_PROJECT_MANAGER">Project Manager</option>
              <option value="ROLE_TEAM_MEMBER">Member</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="add-button"
            disabled={loading || selectedUserId === ''}
          >
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddMemberForm; 