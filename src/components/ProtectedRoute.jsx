import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, role, children }) => {
  if (!user || (role && user.role !== role)) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;