import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function PrivateRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><span className="loader" />Đang tải...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}