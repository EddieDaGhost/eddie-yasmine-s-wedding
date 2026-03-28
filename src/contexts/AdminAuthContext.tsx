import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface AdminAuthContextType {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    setSession(data.session);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AdminAuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuthContext = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuthContext must be used within an AdminAuthProvider");
  }
  return context;
};
