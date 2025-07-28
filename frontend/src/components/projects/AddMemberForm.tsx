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
  onClose?: () => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ projectId, onAddSuccess, onClose }) => {
  const dispatch = useDispatch();
  const availableUsers = useSelector(selectAvailableUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedRole, setSelectedRole] = useState<string>('ROLE_TEAM_MEMBER');
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    dispatch(fetchAvailableUsers(projectId) as any);
  }, [dispatch, projectId]);

  const handleSubmit = () => {
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
          setSelectedRole('ROLE_TEAM_MEMBER');
          setFormError(null);
          if (onAddSuccess) {
            onAddSuccess();
          }
          if (onClose) {
            onClose();
          }
        }
      });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowResults(e.target.value.trim().length > 0);
  };

  const handleSelectUser = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSearchTerm(userName);
    setShowResults(false);
  };

  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && availableUsers.length === 0) {
    return (
      <div className="dialog-body">
        <div className="loading-state" style={{ padding: '20px 0' }}>
          <div className="spinner"></div>
          <div>Loading available users...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dialog-body">
        {error && <div className="error-message">Error: {error}</div>}
        {formError && <div className="error-message">{formError}</div>}
        
        <div className="form-group">
          <label className="form-label">Search User</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d1d1' }}
          />
        </div>
        
        {showResults && (
          <div className="search-results">
            {filteredUsers.length === 0 ? (
              <div className="search-no-results">No users found</div>
            ) : (
              filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="search-result-item"
                  onClick={() => handleSelectUser(user.id, user.name)}
                >
                  <div className="search-result-avatar">
                    <div className="avatar">{user.name.charAt(0)}</div>
                  </div>
                  <div className="search-result-info">
                    <div className="search-result-name">{user.name}</div>
                    <div className="search-result-email">{user.email}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        <div className="form-group" style={{ marginTop: '24px' }}>
          <label className="form-label">Project Role</label>
          <select
            className="form-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d1d1' }}
          >
            <option value="ROLE_PROJECT_MANAGER">Project Manager</option>
            <option value="ROLE_TEAM_MEMBER">Team Member</option>
          </select>
        </div>
      </div>
      
      <div className="dialog-footer">
        <button 
          className="fluent-button outline" 
          onClick={onClose}
        >
          Cancel
        </button>
        <button 
          className="fluent-button accent"
          onClick={handleSubmit}
          disabled={loading || selectedUserId === ''}
        >
          Add to Project
        </button>
      </div>
    </>
  );
};

export default AddMemberForm; 