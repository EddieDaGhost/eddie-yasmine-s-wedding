import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

/**
 * Hook to check admin authentication status using Supabase Auth
 * Returns isAuthenticated, session, and logout function
 */
export const useAdminAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST (before checking session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only update state synchronously
        setSession(session);
        setIsAuthenticated(!!session);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle navigation separately to avoid race conditions
  useEffect(() => {
    // Only redirect if we've determined auth status and user is NOT authenticated
    // AND we're on an admin page that isn't the login page
    if (isAuthenticated === false && location.pathname !== '/admin/login' && location.pathname !== '/admin') {
      navigate('/admin/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }, [navigate]);

  return { isAuthenticated, session, logout };
};
