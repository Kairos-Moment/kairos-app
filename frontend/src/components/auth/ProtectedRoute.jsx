// frontend/src/components/auth/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = () => {
  // 1. Get authentication state from our custom hook
  const { isAuthenticated, isLoading } = useAuth();

  // 2. Handle the initial loading state
  // While the auth status is being checked, we don't want to render anything.
  // This prevents a "flash" of the login page before the user is confirmed.
  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // 3. The core logic: check if the user is authenticated
  if (!isAuthenticated) {
    // If the user is not authenticated, redirect them to the /login page.
    // The `replace` prop is used to prevent the user from clicking the "back"
    // button in their browser and getting back to the protected page.
    return <Navigate to="/login" replace />;
  }

  // 4. If the user is authenticated, render the child route
  // The <Outlet /> component from react-router-dom is a placeholder that
  // will be replaced by the actual page component (e.g., <DashboardPage />).
  return <Outlet />;
};

export default ProtectedRoute;