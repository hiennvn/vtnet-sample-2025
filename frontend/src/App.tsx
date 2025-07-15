import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { createTheme } from '@mui/material';
import ToastContainer from './components/common/ToastContainer';
import MainLayout from './layouts/MainLayout';
import './components/common/Toast.css';
import { useAuth } from './hooks/useAuth';
import { useEffect } from 'react';
import { initializeAuth } from './redux/slices/authSlice';
import { useAppDispatch } from './redux/store';

// Import pages
import UserManagementPage from './pages/UserManagementPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import EditProjectPage from './pages/EditProjectPage';

const theme = createTheme();

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Auth initializer component
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Initialize authentication state on app startup
    dispatch(initializeAuth());
  }, [dispatch]);
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <AuthInitializer>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes with layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Navigate to="/users" replace />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <MainLayout>
              <UserManagementPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/projects" element={
          <ProtectedRoute>
            <MainLayout>
              <ProjectsPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/projects/create" element={
          <ProtectedRoute>
            <MainLayout>
              <CreateProjectPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <MainLayout>
              <ProjectDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/projects/:id/edit" element={
          <ProtectedRoute>
            <MainLayout>
              <EditProjectPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/documents" element={
          <ProtectedRoute>
            <MainLayout>
              <div>Documents Page</div>
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* 404 Page */}
        <Route path="*" element={
          <ProtectedRoute>
            <MainLayout>
              <NotFoundPage />
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthInitializer>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppRoutes />
        </Router>
        
        {/* Toast notification container */}
        <ToastContainer position="top-right" maxToasts={5} />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
