import { ReactNode, useState, useRef, useCallback, useEffect } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useClickOutside } from '../hooks/useClickOutside'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../redux/store'
import { setProjectContext, setGlobalMode } from '../redux/slices/chatSlice'
import ChatbotButton from '../components/common/ChatbotButton'
import ChatbotInterface from '../components/common/ChatbotInterface'
import './MainLayout.css'

interface MainLayoutProps {
  children: ReactNode
  projectId?: number
}

function MainLayout({ children, projectId }: MainLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const dispatch = useDispatch()
  const { user, logoutUser } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const { user: stateUser } = useSelector((state: RootState) => state.auth)
  
  // Extract project ID from URL parameters
  const urlProjectId = params.id || params.projectId
  
  // Determine if we're in a project context
  const isProjectRoute = location.pathname.includes('/projects/') && urlProjectId
  const currentProjectId = isProjectRoute ? parseInt(urlProjectId as string) : undefined
  
  // Determine if we're in a global context (routes that don't have specific project context)
  const isGlobalRoute = !isProjectRoute && (
    location.pathname === '/users' || 
    location.pathname === '/projects' || 
    location.pathname === '/documents' ||
    location.pathname === '/'
  )
  
  // Check if user is a director
  const isDirector = stateUser?.roles?.some((role: any) => {
    if (typeof role === 'string') {
      return role === 'ROLE_DIRECTOR' || role === 'DIRECTOR' || role === 'ROLE_ADMIN'
    } else if (role && typeof role === 'object' && 'name' in role) {
      return role.name === 'ROLE_DIRECTOR' || role.name === 'DIRECTOR'
    }
    return false
  }) || false
  
  // Set project context and global mode when route changes
  useEffect(() => {
    if (currentProjectId) {
      // We're in a project context, set project mode
      dispatch(setProjectContext(currentProjectId))
    } else if (isGlobalRoute) {
      // We're in a global route, set global mode
      dispatch(setGlobalMode(true)) // This will set isGlobalMode to true
    }
  }, [currentProjectId, isGlobalRoute, dispatch])
  
  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }
  
  // Handle logout
  const handleLogout = () => {
    logoutUser()
  }
  
  // Toggle user dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }
  
  // Close dropdown when clicking outside
  const closeDropdown = useCallback(() => {
    setShowDropdown(false)
  }, [])
  
  // Use click outside hook
  useClickOutside<HTMLDivElement>(dropdownRef, closeDropdown)
  
  // Get user initials for avatar
  const getUserInitials = (): string => {
    if (!user || !user.name) return '?'
    
    const nameParts = user.name.split(' ')
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    
    return nameParts[0][0].toUpperCase()
  }
  
  // Toggle chatbot visibility
  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen)
  }
  
  // Format role display
  const formatRoleDisplay = (role: any): string => {
    if (typeof role === 'string') {
      return role
    } else if (role && typeof role === 'object' && 'name' in role) {
      return role.name
    }
    return 'Unknown Role'
  }
  
  // Get breadcrumb based on current location
  const getBreadcrumb = () => {
    if (location.pathname === '/projects') {
      return (
        <div className="breadcrumb">
          <span className="breadcrumb-item">Home</span> / 
          <span className="breadcrumb-item active">Projects</span>
        </div>
      )
    }
    
    if (location.pathname === '/users') {
      return (
        <div className="breadcrumb">
          <span className="breadcrumb-item">Home</span> / 
          <span className="breadcrumb-item active">Users</span>
        </div>
      )
    }
    
    if (location.pathname.includes('/projects/') && urlProjectId) {
      return (
        <div className="breadcrumb">
          <span className="breadcrumb-item" onClick={() => navigate('/')}>Home</span> / 
          <span className="breadcrumb-item" onClick={() => navigate('/projects')}>Projects</span> /
          <span className="breadcrumb-item active">Project Details</span>
        </div>
      )
    }
    
    return (
      <div className="breadcrumb">
        <span className="breadcrumb-item">Home</span>
      </div>
    )
  }
  
  return (
    <div className="layout-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo">
          <i className="fas fa-project-diagram" style={{ color: '#0078d4', fontSize: '24px' }}></i>
          <h1>VTNet</h1>
        </div>
        <nav className="navigation">
          <div 
            className={`nav-item ${isActive('/') && !isActive('/projects') && !isActive('/users') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${isActive('/projects') ? 'active' : ''}`}
            onClick={() => navigate('/projects')}
          >
            <i className="fas fa-folder"></i>
            <span>Projects</span>
          </div>
          <div 
            className={`nav-item ${isActive('/users') ? 'active' : ''}`}
            onClick={() => navigate('/users')}
          >
            <i className="fas fa-users"></i>
            <span>Users</span>
          </div>
          <div className="nav-item">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </div>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          {getBreadcrumb()}
          <div className="user-actions">
            <div className="search-container">
              <input type="text" className="search-input" placeholder="Search projects and documents..." />
            </div>
            <div className="user-profile" ref={dropdownRef} onClick={toggleDropdown}>
              <div className="avatar-container">
                <div className="avatar">{getUserInitials()}</div>
              </div>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user?.name}</strong>
                    <div>{user?.email}</div>
                    <div className="user-roles">
                      {user?.roles?.map((role, index) => (
                        <span key={index} className="role-badge">
                          {formatRoleDisplay(role)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ul>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><button onClick={handleLogout}>Logout</button></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Content */}
        {children}
      </main>
      
      {/* Chatbot */}
      <div className="chatbot-toggle" onClick={toggleChatbot}>
        <i className="fas fa-comment-dots"></i>
      </div>
      
      {isChatbotOpen && (
        <ChatbotInterface
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
          projectId={currentProjectId || undefined}
          isDirector={isDirector}
        />
      )}
    </div>
  )
}

export default MainLayout 