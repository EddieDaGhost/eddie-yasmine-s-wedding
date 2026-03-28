import { Navigate } from "react-router-dom";
import { useAdminAuthContext } from "@/contexts/AdminAuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAdminAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-sans text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}
