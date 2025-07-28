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
  
  // Format the relative time for "updated X time ago"
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return `${date.toLocaleDateString()}`;
    }
  };
  
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
      <h1 className="page-title">Projects</h1>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Projects</h2>
          <button 
            className="fluent-button accent"
            onClick={() => navigate('/projects/create')}
          >
            + New Project
          </button>
        </div>
        
        <div className="filter-bar" style={{ marginBottom: '16px' }}>
          <button 
            className="fluent-button outline"
            onClick={() => handleStatusFilter('ARCHIVED')}
          >
            <i className="fas fa-archive" style={{ marginRight: '8px' }}></i>
            View Archived Projects
          </button>
        </div>
        
        <div id="projects-grid" className="project-grid">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <div>Loading projects...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-message">No projects found</div>
          ) : (
            projects.map(project => (
              <div 
                key={project.id} 
                className="project-card" 
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="project-header">
                  <h3 className="project-title">{project.name}</h3>
                  <span className={`project-status status-${project.status.toLowerCase()}`}>
                    {project.status}
                  </span>
                </div>
                <div className="project-body">
                  <p className="project-desc">
                    {project.description || `This is the ${project.name} project. Click to view details, documents, and manage team members.`}
                  </p>
                  <div className="project-meta">
                    <span>{project.documentCount || 0} documents</span>
                    <span>Updated {formatRelativeTime(project.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
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
              Page {currentPage + 1} of {Math.max(1, pagination.totalPages)}
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
  )
}

export default ProjectsPage 