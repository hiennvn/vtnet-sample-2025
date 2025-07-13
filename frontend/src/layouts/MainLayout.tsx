import { ReactNode, useState, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useClickOutside } from '../hooks/useClickOutside'
import './MainLayout.css'

interface MainLayoutProps {
  children: ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const { user, logoutUser } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
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
                        <span key={index} className="role-badge">{role}</span>
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
    </div>
  )
}

export default MainLayout 