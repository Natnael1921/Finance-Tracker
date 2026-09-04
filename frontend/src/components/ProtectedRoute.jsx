import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-950">
        <div className="spinner w-10 h-10" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requireSuperAdmin && user.role !== 'superadmin') return <Navigate to="/dashboard" replace />;

  return children;
}
