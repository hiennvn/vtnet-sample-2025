import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/store'
import { fetchUsers, searchUsers } from '../redux/slices/userSlice'
import { fetchAllRoles } from '../redux/slices/roleSlice'
import { selectUsers, selectUserLoading, selectUserPagination } from '../redux/slices/userSlice'
import { selectRoles } from '../redux/slices/roleSlice'
import { User, Role } from '../types/user'
// Import components with explicit type imports
import CreateUserModal from '../components/users/CreateUserModal'
import EditUserModal from '../components/users/EditUserModal'
import DeleteUserDialog from '../components/users/DeleteUserDialog'
import toastService from '../services/toastService'
import './UserManagementPage.css'

// Extended user interface for display purposes
interface ExtendedUser extends User {
  projectCount?: number;
  lastActive?: string;
}

function UserManagementPage() {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectUsers) as ExtendedUser[]
  const roles = useAppSelector(selectRoles)
  const loading = useAppSelector(selectUserLoading)
  const pagination = useAppSelector(selectUserPagination)
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUserName, setSelectedUserName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  
  // Load users and roles on component mount
  useEffect(() => {
    dispatch(fetchUsers({ page: 0, size: 10 }))
      .unwrap()
      .catch(() => {
        toastService.showError('Failed to load users', {
          showRetry: true,
          onRetry: () => dispatch(fetchUsers({ page: 0, size: 10 }))
        })
      })
      
    dispatch(fetchAllRoles())
      .unwrap()
      .catch(() => {
        toastService.showError('Failed to load roles', {
          showRetry: true,
          onRetry: () => dispatch(fetchAllRoles())
        })
      })
  }, [dispatch])
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(0)
    
    if (query.trim()) {
      dispatch(searchUsers({ query, page: 0, size: 10 }))
        .unwrap()
        .then(() => {
          if (query.trim().length > 0) {
            toastService.showInfo(`Showing search results for "${query}"`)
          }
        })
        .catch(() => {
          toastService.showError('Search failed', {
            showRetry: true,
            onRetry: () => handleSearch(query)
          })
        })
    } else {
      dispatch(fetchUsers({ page: 0, size: 10 }))
        .unwrap()
        .catch(() => {
          toastService.showError('Failed to load users', {
            showRetry: true,
            onRetry: () => dispatch(fetchUsers({ page: 0, size: 10 }))
          })
        })
    }
  }
  
  // Handle role filter
  const handleRoleFilter = (roleId: number | null) => {
    setSelectedRoleId(roleId)
    setCurrentPage(0)
    
    // If role is selected, filter by role
    if (roleId !== null) {
      const role = roles.find(r => r.id === roleId)
      if (role) {
        dispatch(searchUsers({ query: role.name, page: 0, size: 10 }))
          .unwrap()
          .then(() => {
            toastService.showInfo(`Filtered by role: ${role.name}`)
          })
          .catch(() => {
            toastService.showError('Failed to filter users', {
              showRetry: true,
              onRetry: () => handleRoleFilter(roleId)
            })
          })
      }
    } else {
      // If no role selected, show all users or maintain current search
      if (searchQuery.trim()) {
        dispatch(searchUsers({ query: searchQuery, page: 0, size: 10 }))
          .unwrap()
          .catch(() => {
            toastService.showError('Search failed', {
              showRetry: true,
              onRetry: () => handleSearch(searchQuery)
            })
          })
      } else {
        dispatch(fetchUsers({ page: 0, size: 10 }))
          .unwrap()
          .then(() => {
            toastService.showInfo('Showing all users')
          })
          .catch(() => {
            toastService.showError('Failed to load users', {
              showRetry: true,
              onRetry: () => dispatch(fetchUsers({ page: 0, size: 10 }))
            })
          })
      }
    }
  }
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    
    if (searchQuery.trim()) {
      dispatch(searchUsers({ query: searchQuery, page, size: 10 }))
        .unwrap()
        .catch(() => {
          toastService.showError('Failed to load page', {
            showRetry: true,
            onRetry: () => handlePageChange(page)
          })
        })
    } else {
      dispatch(fetchUsers({ page, size: 10 }))
        .unwrap()
        .catch(() => {
          toastService.showError('Failed to load page', {
            showRetry: true,
            onRetry: () => handlePageChange(page)
          })
        })
    }
  }
  
  // Handle edit user
  const handleEditUser = (userId: number) => {
    setSelectedUserId(userId)
    setIsEditModalOpen(true)
  }
  
  // Handle delete user
  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUserId(userId)
      setSelectedUserName(user.name)
      setIsDeleteDialogOpen(true)
    }
  }
  
  // Handle reset password
  const handleResetPassword = (userId: number) => {
    // In a real application, we would implement a password reset flow
    // For now, we'll just show a notification
    toastService.showInfo('Password reset functionality would be implemented here')
  }

  // Get role display name and CSS class
  const getRoleInfo = (roleName: string): { displayName: string, cssClass: string } => {
    const lowerRole = roleName.toLowerCase();
    
    if (lowerRole.includes('director')) {
      return { displayName: 'Director', cssClass: 'role-director' };
    } else if (lowerRole.includes('admin')) {
      return { displayName: 'System Admin', cssClass: 'role-admin' };
    } else if (lowerRole.includes('manager') || lowerRole.includes('pm')) {
      return { displayName: 'Project Manager', cssClass: 'role-pm' };
    } else {
      return { displayName: 'Team Member', cssClass: 'role-member' };
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  return (
    <>
      <div className="content-area">
        <h1 className="page-title">Users</h1>
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">User Management</h1>
            <button 
              className="fluent-button accent" 
              onClick={() => setIsCreateModalOpen(true)}
            >
              <i className="fas fa-user-plus" style={{ marginRight: '8px' }}></i>
              Add User
            </button>
          </div>
          
          <div className="filter-bar">
            <span className="filter-label">Filter by role:</span>
            <div className="role-filter">
              <div 
                className={`role-filter-item ${selectedRoleId === null ? 'active' : ''}`}
                onClick={() => handleRoleFilter(null)}
              >
                All
              </div>
              {roles.map(role => (
                <div 
                  key={role.id}
                  className={`role-filter-item ${selectedRoleId === role.id ? 'active' : ''}`}
                  onClick={() => handleRoleFilter(role.id)}
                >
                  {role.name.replace('ROLE_', '').replace('_', ' ')}
                </div>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <div>Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-users"></i>
              <p>No users found</p>
            </div>
          ) : (
            <div className="user-grid">
              {users.map(user => {
                const roleInfo = getRoleInfo(typeof user.roles[0] === 'string' 
                  ? user.roles[0] 
                  : user.roles[0]?.name || 'Team Member');
                
                return (
                  <div key={user.id} className="user-card">
                    <div className="user-header">
                      <div className="user-avatar">
                        <div className="avatar">{user.name.charAt(0)}</div>
                      </div>
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="user-body">
                      <div className={`user-role ${roleInfo.cssClass}`}>{roleInfo.displayName}</div>
                      <div className="user-meta">
                        <div>
                          <i className="fas fa-project-diagram"></i>
                          <span>Projects: {user.projectCount || 0}</span>
                        </div>
                        <div>
                          <i className="fas fa-calendar-alt"></i>
                          <span>Joined: {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</span>
                        </div>
                        <div>
                          <i className="fas fa-clock"></i>
                          <span>Last active: {user.lastActive ? formatDate(user.lastActive) : 'Unknown'}</span>
                        </div>
                      </div>
                      <div className="user-actions">
                        <button 
                          className="fluent-button outline"
                          onClick={() => handleEditUser(user.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="fluent-button outline"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          Reset Password
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {pagination.totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                className="fluent-button outline"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage + 1} of {pagination.totalPages}
              </span>
              
              <button 
                className="fluent-button outline"
                disabled={currentPage >= pagination.totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {isCreateModalOpen && (
        <CreateUserModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          roles={roles}
        />
      )}
      
      {isEditModalOpen && selectedUserId && (
        <EditUserModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userId={selectedUserId}
          roles={roles}
        />
      )}
      
      {isDeleteDialogOpen && selectedUserId && (
        <DeleteUserDialog 
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          userId={selectedUserId}
          userName={selectedUserName}
        />
      )}
    </>
  )
}

export default UserManagementPage 