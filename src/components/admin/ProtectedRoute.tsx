import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAdminAuth();

  if (loading) return <p>Loading...</p>;

  if (!session) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}