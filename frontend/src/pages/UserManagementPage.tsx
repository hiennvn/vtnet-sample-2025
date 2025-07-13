import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/store'
import { fetchUsers, searchUsers } from '../redux/slices/userSlice'
import { fetchAllRoles } from '../redux/slices/roleSlice'
import { selectUsers, selectUserLoading, selectUserPagination } from '../redux/slices/userSlice'
import { selectRoles } from '../redux/slices/roleSlice'
// Import components with explicit type imports
import UserList from '../components/users/UserList'
import UserSearch from '../components/users/UserSearch'
import RoleFilter from '../components/users/RoleFilter'
import CreateUserModal from '../components/users/CreateUserModal'
import EditUserModal from '../components/users/EditUserModal'
import DeleteUserDialog from '../components/users/DeleteUserDialog'
import toastService from '../services/toastService'
import '../components/users/UserManagement.css'

function UserManagementPage() {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectUsers)
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
  
  return (
    <div className="content-area">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">User Management</h1>
          <button 
            className="btn btn-primary" 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <i className="fas fa-user-plus" style={{ marginRight: '8px' }}></i>
            Add User
          </button>
        </div>
        
        <div className="filter-section">
          <UserSearch onSearch={handleSearch} initialValue={searchQuery} />
          <RoleFilter 
            roles={roles} 
            selectedRoleId={selectedRoleId}
            onRoleSelect={handleRoleFilter} 
          />
        </div>
        
        <UserList 
          users={users} 
          loading={loading} 
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onResetPassword={handleResetPassword}
        />
        
        {pagination.totalPages > 1 && (
          <div className="pagination-controls">
            <button 
              className="btn btn-outline"
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            
            <span className="pagination-info">
              Page {currentPage + 1} of {pagination.totalPages}
            </span>
            
            <button 
              className="btn btn-outline"
              disabled={currentPage >= pagination.totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
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
    </div>
  )
}

export default UserManagementPage 