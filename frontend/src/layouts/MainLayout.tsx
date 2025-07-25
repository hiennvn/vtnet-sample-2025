import { ReactNode, useState, useRef, useCallback, useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
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
  
  return (
    <div className="main-layout">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <h1>VTNet</h1>
            </Link>
          </div>
          <nav className="main-nav">
            <ul>
              <li className={isActive('/projects') ? 'active' : ''}>
                <Link to="/projects">
                  <i className="fas fa-project-diagram"></i>
                  Projects
                </Link>
              </li>
              <li className={isActive('/documents') ? 'active' : ''}>
                <Link to="/documents">
                  <i className="fas fa-file-alt"></i>
                  Documents
                </Link>
              </li>
              <li className={isActive('/users') ? 'active' : ''}>
                <Link to="/users">
                  <i className="fas fa-users"></i>
                  Users
                </Link>
              </li>
            </ul>
          </nav>
          <div className="user-menu" ref={dropdownRef}>
            <div className="user-profile" onClick={toggleDropdown}>
              <span className="user-name">{user?.name || 'User'}</span>
              <div className="avatar">{getUserInitials()}</div>
              
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
      </header>
      
      <main className="app-content">
        {children}
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} VTNet Project Management System</p>
        </div>
      </footer>
      
      {/* Chatbot */}
      <ChatbotButton onClick={toggleChatbot} isOpen={isChatbotOpen} />
      <ChatbotInterface 
        onClose={() => setIsChatbotOpen(false)} 
        projectId={currentProjectId} 
        isOpen={isChatbotOpen}
        isDirector={isDirector}
      />
    </div>
  )
}

export default MainLayout 