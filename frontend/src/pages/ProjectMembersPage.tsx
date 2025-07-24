import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById, selectSelectedProject } from '../redux/slices/projectSlice';
import { clearMembers } from '../redux/slices/projectMemberSlice';
import ProjectMemberList from '../components/projects/ProjectMemberList';
import AddMemberForm from '../components/projects/AddMemberForm';
import MainLayout from '../layouts/MainLayout';
import './ProjectMembersPage.css';
import '../components/users/UserManagement.css';

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

  if (!project) {
    return (
      <MainLayout>
        <div className="content-area">
          <div className="loading">Loading project details...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="content-area">
        <div className="project-members-page">
          <div className="card">
            <div className="card-header">
              <button className="btn btn-outline" onClick={handleBackClick}>
                <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
                Back to Project
              </button>
              <h1 className="card-title">Project Members: {project.name}</h1>
            </div>
            
            <div className="card-content">
              <div className="members-container">
                <ProjectMemberList 
                  projectId={Number(projectId)} 
                  canManage={hasManagePermission} 
                />
                
                {hasManagePermission && (
                  <AddMemberForm projectId={Number(projectId)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProjectMembersPage; 