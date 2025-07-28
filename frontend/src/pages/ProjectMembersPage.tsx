import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById, selectSelectedProject } from '../redux/slices/projectSlice';
import { clearMembers, fetchProjectMembers } from '../redux/slices/projectMemberSlice';
import ProjectMemberList from '../components/projects/ProjectMemberList';
import AddMemberForm from '../components/projects/AddMemberForm';
import MainLayout from '../layouts/MainLayout';
import './ProjectMembersPage.css';

interface RoleObject {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Array<string | RoleObject>;
}

const ProjectMembersPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const project = useSelector(selectSelectedProject);
  const [showAddMemberDialog, setShowAddMemberDialog] = React.useState(false);

  // Check if user has permissions to manage members
  const user = JSON.parse(localStorage.getItem('user_data') || '{}') as User;
  const userRoles = user.roles || [];
  
  const hasManagePermission = userRoles.some(role => {
    const roleName = typeof role === 'string' ? role : role.name;
    return ['ROLE_DIRECTOR', 'ROLE_PROJECT_MANAGER', 'ROLE_ADMIN'].includes(roleName);
  });

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(Number(projectId)) as any);
    }

    return () => {
      dispatch(clearMembers());
    };
  }, [dispatch, projectId]);

  const handleBackClick = () => {
    navigate(`/projects/${projectId}`);
  };

  const toggleAddMemberDialog = () => {
    setShowAddMemberDialog(!showAddMemberDialog);
  };

  if (!project) {
    return (
      <MainLayout>
        <div className="content-area">
          <div className="loading-state">
            <div className="spinner"></div>
            <div>Loading project details...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="content-area">
        {/* Project Header */}
        <div className="project-header">
          <div className="project-header-top">
            <h1 className="page-title">{project.name} - Members</h1>
            <div className="project-actions">
              <button 
                className="fluent-button accent"
                onClick={toggleAddMemberDialog}
              >
                <i className="fas fa-user-plus" style={{ marginRight: '8px' }}></i>
                Add Member
              </button>
            </div>
          </div>
          
          <p className="project-description">
            Manage team members and their roles for the {project.name} project.
          </p>
        </div>
        
        {/* Members Table */}
        <div className="card">
          <ProjectMemberList 
            projectId={Number(projectId)} 
            canManage={hasManagePermission} 
          />
        </div>
        
        {/* Add Member Dialog */}
        {showAddMemberDialog && (
          <>
            <div className="dialog-backdrop" onClick={toggleAddMemberDialog}></div>
            <div className="add-member-dialog">
              <div className="dialog-header">
                <div className="dialog-title">Add Project Member</div>
                <div className="dialog-close" onClick={toggleAddMemberDialog}>×</div>
              </div>
              <AddMemberForm 
                projectId={Number(projectId)} 
                onClose={toggleAddMemberDialog}
                onAddSuccess={() => {
                  toggleAddMemberDialog();
                  dispatch(fetchProjectMembers(Number(projectId)) as any);
                }}
              />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectMembersPage; 