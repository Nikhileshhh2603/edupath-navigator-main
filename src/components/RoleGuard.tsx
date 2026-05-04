import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/use-auth";

export const RoleGuard = ({ allow, children }: { allow: AppRole[]; children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen paper-bg flex items-center justify-center text-ink-soft">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!role || !allow.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};
