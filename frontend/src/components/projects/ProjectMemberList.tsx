import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProjectMembers, 
  removeProjectMember, 
  updateProjectMember,
  selectMembers,
  selectLoading,
  selectError
} from '../../redux/slices/projectMemberSlice';
import { ProjectMember, ProjectMemberUpdate } from '../../types/projectMember';
import './ProjectMemberList.css';

interface ProjectMemberListProps {
  projectId: number;
  canManage: boolean;
}

const ProjectMemberList: React.FC<ProjectMemberListProps> = ({ projectId, canManage }) => {
  const dispatch = useDispatch();
  const members = useSelector(selectMembers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<string>('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);

  useEffect(() => {
    dispatch(fetchProjectMembers(projectId) as any);
  }, [dispatch, projectId]);

  const handleChangeRole = (member: ProjectMember) => {
    setSelectedMember(member);
    setEditRole(member.role);
    setShowRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setShowRoleDialog(false);
    setSelectedMember(null);
    setEditRole('');
  };

  const handleSaveRole = () => {
    if (selectedMember) {
      const memberData: ProjectMemberUpdate = { role: editRole };
      dispatch(updateProjectMember({ 
        projectId, 
        userId: selectedMember.userId, 
        memberData 
      }) as any);
      setShowRoleDialog(false);
      setSelectedMember(null);
      setEditRole('');
    }
  };

  const handleRemoveMember = (userId: number, userName: string) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from the project?`)) {
      dispatch(removeProjectMember({ projectId, userId }) as any);
    }
  };

  // Get role display name and CSS class
  const getRoleInfo = (role: string): { displayName: string, cssClass: string } => {
    switch (role) {
      case 'ROLE_DIRECTOR':
      case 'DIRECTOR':
        return { displayName: 'Director', cssClass: 'role-director' };
      case 'ROLE_PROJECT_MANAGER':
      case 'PROJECT_MANAGER':
        return { displayName: 'Project Manager', cssClass: 'role-pm' };
      case 'ROLE_TEAM_MEMBER':
      case 'TEAM_MEMBER':
        return { displayName: 'Team Member', cssClass: 'role-member' };
      default:
        return { displayName: 'Member', cssClass: 'role-member' };
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return <div className="loading-state">
      <div className="spinner"></div>
      <div>Loading project members...</div>
    </div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <>
      <table className="members-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Member</th>
            <th style={{ width: '20%' }}>Role</th>
            <th style={{ width: '20%' }}>Added On</th>
            <th style={{ width: '20%' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>
                No members found for this project.
              </td>
            </tr>
          ) : (
            members.map((member) => {
              const roleInfo = getRoleInfo(member.role);
              return (
                <tr key={member.userId}>
                  <td>
                    <div className="member-info">
                      <div className="member-avatar">
                        <div className="avatar">{member.userName.charAt(0)}</div>
                      </div>
                      <div>
                        <div className="member-name">{member.userName}</div>
                        <div className="member-email">{member.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`member-role ${roleInfo.cssClass}`}>
                      {roleInfo.displayName}
                    </span>
                  </td>
                  <td>{member.addedAt ? formatDate(member.addedAt) : 'Unknown'}</td>
                  <td>
                    <div className="member-actions">
                      {canManage && (
                        <>
                          <button 
                            className="fluent-button outline"
                            onClick={() => handleChangeRole(member)}
                          >
                            Change Role
                          </button>
                          {/* Don't allow removing directors */}
                          {!member.role.includes('DIRECTOR') && (
                            <button 
                              className="fluent-button outline"
                              onClick={() => handleRemoveMember(member.userId, member.userName)}
                            >
                              Remove
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Change Role Dialog */}
      {showRoleDialog && selectedMember && (
        <>
          <div className="dialog-backdrop" onClick={handleCloseRoleDialog}></div>
          <div className="add-member-dialog">
            <div className="dialog-header">
              <div className="dialog-title">Change Member Role</div>
              <div className="dialog-close" onClick={handleCloseRoleDialog}>×</div>
            </div>
            <div className="dialog-body">
              <div className="member-info" style={{ marginBottom: '24px' }}>
                <div className="member-avatar">
                  <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '18px' }}>
                    {selectedMember.userName.charAt(0)}
                  </div>
                </div>
                <div>
                  <div className="member-name">{selectedMember.userName}</div>
                  <div className="member-email">{selectedMember.userEmail}</div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Project Role</label>
                <select 
                  className="form-select"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d1d1' }}
                >
                  <option value="ROLE_PROJECT_MANAGER">Project Manager</option>
                  <option value="ROLE_TEAM_MEMBER">Team Member</option>
                </select>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="fluent-button outline" onClick={handleCloseRoleDialog}>Cancel</button>
              <button className="fluent-button accent" onClick={handleSaveRole}>Update Role</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProjectMemberList; 