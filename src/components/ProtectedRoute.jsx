import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        color: 'var(--text-color)'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole) {
    // Admins can access all features (including instructor features)
    if (user.role === 'admin') {
      // Admin has access to everything
    } else if (requiredRole === 'instructor' && user.role !== 'instructor') {
      return <Navigate to="/dashboard" replace />;
    } else if (requiredRole === 'admin' && user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (requiredRole !== 'instructor' && requiredRole !== 'admin' && user.role !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;