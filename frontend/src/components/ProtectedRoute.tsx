import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
