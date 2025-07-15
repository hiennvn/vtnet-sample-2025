import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../redux/store'
import { 
  fetchProjects, 
  selectProjects, 
  selectProjectLoading, 
  selectProjectPagination,
  selectProjectFilters,
  setStatusFilter
} from '../redux/slices/projectSlice'
import ProjectList from '../components/projects/ProjectList'
import ProjectFilter from '../components/projects/ProjectFilter'
import UserSearch from '../components/users/UserSearch'
import toastService from '../services/toastService'
import '../components/users/UserManagement.css'
import './ProjectsPage.css'

// Define possible role formats
interface RoleObject {
  id: number;
  name: string;
}

// User might have roles as strings or as objects
interface User {
  id: number;
  name: string;
  email: string;
  roles: Array<string | RoleObject>;
}

function ProjectsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const projects = useAppSelector(selectProjects)
  const loading = useAppSelector(selectProjectLoading)
  const pagination = useAppSelector(selectProjectPagination)
  const filters = useAppSelector(selectProjectFilters)
  
  const authState = useAppSelector(state => state.auth)
  const user = authState.user as User | null
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Check if user has Director or Admin role
  const hasRequiredRole = user?.roles?.some(role => {
    if (typeof role === 'string') {
      return role === 'DIRECTOR' || role === 'ROLE_ADMIN' || role === 'ADMIN'
    } else if (role && typeof role === 'object' && 'name' in role) {
      return role.name === 'DIRECTOR' || role.name === 'ROLE_ADMIN' || role.name === 'ADMIN'
    }
    return false
  })
  
  // Load projects on component mount
  useEffect(() => {
    if (hasRequiredRole) {
      dispatch(fetchProjects({ page: 0, size: 10 }))
        .unwrap()
        .catch(() => {
          toastService.showError('Failed to load projects', {
            showRetry: true,
            onRetry: () => dispatch(fetchProjects({ page: 0, size: 10 }))
          })
        })
    }
  }, [dispatch, hasRequiredRole])
  
  // Redirect if not authorized
  useEffect(() => {
    if (user && !hasRequiredRole) {
      navigate('/')
    }
  }, [user, hasRequiredRole, navigate])
  
  // Handle status filter
  const handleStatusFilter = (status: string | null) => {
    dispatch(setStatusFilter(status))
    setCurrentPage(0)
    
    dispatch(fetchProjects({ 
      page: 0, 
      size: 10,
      status: status || undefined,
      name: searchQuery || undefined
    }))
      .unwrap()
      .then(() => {
        if (status) {
          toastService.showInfo(`Filtered by status: ${status}`)
        } else {
          toastService.showInfo('Showing all projects')
        }
      })
      .catch(() => {
        toastService.showError('Failed to filter projects', {
          showRetry: true,
          onRetry: () => handleStatusFilter(status)
        })
      })
  }
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(0)
    
    if (query.trim()) {
      dispatch(fetchProjects({ 
        page: 0, 
        size: 10,
        name: query,
        status: filters.status || undefined
      }))
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
      dispatch(fetchProjects({ 
        page: 0, 
        size: 10,
        status: filters.status || undefined
      }))
        .unwrap()
        .catch(() => {
          toastService.showError('Failed to load projects', {
            showRetry: true,
            onRetry: () => dispatch(fetchProjects({ page: 0, size: 10 }))
          })
        })
    }
  }
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    
    dispatch(fetchProjects({ 
      page, 
      size: 10,
      status: filters.status || undefined,
      name: searchQuery || undefined
    }))
      .unwrap()
      .catch(() => {
        toastService.showError('Failed to load page', {
          showRetry: true,
          onRetry: () => handlePageChange(page)
        })
      })
  }
  
  if (!user) {
    return (
      <div className="content-area">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Projects</h1>
          </div>
          <div className="card-content loading-state">
            <div className="spinner"></div>
            <div>Loading...</div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!hasRequiredRole) {
    return (
      <div className="content-area">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Projects</h1>
          </div>
          <div className="card-content">
            <div className="unauthorized-message">
              <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
              Unauthorized: You must be a Director or Admin to view this page.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-area">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Projects</h1>
          <button 
            className="btn btn-primary btn-add-project"
            onClick={() => navigate('/projects/create')}
          >
            <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
            Add Project
          </button>
        </div>
        
        <div className="filter-section">
          <UserSearch onSearch={handleSearch} initialValue={searchQuery} />
          <ProjectFilter 
            onStatusFilter={handleStatusFilter} 
            selectedStatus={filters.status} 
          />
        </div>
        
        <div className="card-content">
          <ProjectList 
            projects={projects}
            loading={loading}
            pagination={pagination}
            filters={filters}
            onStatusFilter={handleStatusFilter}
            onPageChange={handlePageChange}
            currentPage={currentPage}
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
                Page {currentPage + 1} of {Math.max(1, pagination.totalPages)}
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
      </div>
    </div>
  )
}

export default ProjectsPage 