import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from './UI';

/** Sends each role to its own dashboard after login or on a bare /dashboard visit. */
export default function RoleRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <LoadingScreen label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} replace />;
}
