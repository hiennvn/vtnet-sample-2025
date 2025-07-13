import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { login, logout, refreshToken } from '../redux/slices/authSlice';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    roles: string[];
  } | null;
  loginUser: (email: string, password: string) => void;
  logoutUser: () => void;
  hasRole: (role: string) => boolean;
}

export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading, error, accessToken, refreshToken: refreshTokenValue } = 
    useAppSelector((state) => state.auth);

  // Check token expiration and refresh if needed
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
  const loginUser = async (email: string, password: string) => {
    await dispatch(login({ email, password }));
    
    // Get the redirect path from location state or default to home
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  // Handle logout
  const logoutUser = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

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