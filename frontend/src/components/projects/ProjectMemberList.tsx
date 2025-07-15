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

  useEffect(() => {
    dispatch(fetchProjectMembers(projectId) as any);
  }, [dispatch, projectId]);

  const handleEditClick = (member: ProjectMember) => {
    setEditingMemberId(member.userId);
    setEditRole(member.role);
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditRole('');
  };

  const handleSaveEdit = (userId: number) => {
    const memberData: ProjectMemberUpdate = { role: editRole };
    dispatch(updateProjectMember({ projectId, userId, memberData }) as any);
    setEditingMemberId(null);
    setEditRole('');
  };

  const handleRemoveMember = (userId: number) => {
    if (window.confirm('Are you sure you want to remove this member from the project?')) {
      dispatch(removeProjectMember({ projectId, userId }) as any);
    }
  };

  if (loading) {
    return <div>Loading project members...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="project-member-list">
      <h3>Project Members</h3>
      {members.length === 0 ? (
        <p>No members found for this project.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.userId}>
                <td>{member.userName}</td>
                <td>{member.userEmail}</td>
                <td>
                  {editingMemberId === member.userId ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                    >
                      <option value="ROLE_PROJECT_MANAGER">Project Manager</option>
                      <option value="ROLE_TEAM_MEMBER">Member</option>
                    </select>
                  ) : (
                    getRoleDisplayName(member.role)
                  )}
                </td>
                {canManage && (
                  <td>
                    {editingMemberId === member.userId ? (
                      <div className="action-buttons">
                        <button onClick={() => handleSaveEdit(member.userId)}>Save</button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button onClick={() => handleEditClick(member)}>Edit</button>
                        <button 
                          onClick={() => handleRemoveMember(member.userId)}
                          className="remove-button"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Helper function to display role names in a more user-friendly way
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'PROJECT_MANAGER':
      return 'Project Manager';
    case 'DEVELOPER':
      return 'Developer';
    case 'DESIGNER':
      return 'Designer';
    case 'VIEWER':
      return 'Viewer';
    default:
      return role;
  }
};

export default ProjectMemberList; 