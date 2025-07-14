import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { login, logout, refreshToken, checkAuthState } from '../redux/slices/authSlice';

// Define possible role formats
interface RoleObject {
  id: number;
  name: string;
}

type Role = string | RoleObject;

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    roles: Role[];
  } | null;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading, error, accessToken } = 
    useAppSelector((state) => state.auth);

  // Check token presence on mount and route changes
  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch, location.pathname]);

  // Set up token refresh interval
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Set up token refresh
      const tokenRefreshInterval = setInterval(() => {
        dispatch(refreshToken());
      }, 25 * 60 * 1000); // Refresh token every 25 minutes (5 minutes before expiration)

      return () => {
        clearInterval(tokenRefreshInterval);
      };
    }
  }, [isAuthenticated, accessToken, dispatch]);

  // Handle login
  const loginUser = useCallback(async (email: string, password: string) => {
    await dispatch(login({ email, password }));
    
    // Get the redirect path from location state or default to home
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  }, [dispatch, navigate, location.state]);

  // Handle logout
  const logoutUser = useCallback(async () => {
    await dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  // Check if user has a specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!user || !user.roles) return false;
    
    return user.roles.some(userRole => {
      if (typeof userRole === 'string') {
        return userRole === role;
      } 
      
      // Handle role as object
      if (userRole && typeof userRole === 'object') {
        const roleObj = userRole as RoleObject;
        return roleObj.name === role;
      }
      
      return false;
    });
  }, [user]);

  return {
    isAuthenticated,
    isLoading: loading,
    error,
    user,
    loginUser,
    logoutUser,
    hasRole
  };
} 