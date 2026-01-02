import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to check admin authentication status
 * Returns isAuthenticated and logout function
 */
export const useAdminAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    setIsAuthenticated(authStatus === 'true');
    
    if (authStatus !== 'true') {
      navigate('/admin/login');
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('admin_authenticated');
    navigate('/admin/login');
  };

  return { isAuthenticated, logout };
};
