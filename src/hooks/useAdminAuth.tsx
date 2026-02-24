import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('nge_admin_token');
      const email = localStorage.getItem('nge_admin_email');
      
      if (token && email) {
        // Basic token validation (in production, this should be more secure)
        try {
          const decoded = atob(token);
          const [storedEmail, timestamp] = decoded.split(':');
          
          // Check if token is not older than 24 hours
          const tokenAge = Date.now() - parseInt(timestamp);
          const isTokenValid = tokenAge < 24 * 60 * 60 * 1000; // 24 hours
          
          if (storedEmail === email && isTokenValid) {
            setIsAuthenticated(true);
          } else {
            // Token expired or invalid
            localStorage.removeItem('nge_admin_token');
            localStorage.removeItem('nge_admin_email');
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Invalid token format
          localStorage.removeItem('nge_admin_token');
          localStorage.removeItem('nge_admin_email');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('nge_admin_token');
    localStorage.removeItem('nge_admin_email');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  return { isAuthenticated, isLoading, logout };
};
