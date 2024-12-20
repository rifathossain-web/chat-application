// src/components/PrivateRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // Adjust the path as necessary

const PrivateRoute = ({ element, requiredRole, ...rest }) => {
  const { user } = useAuth(); // Assuming user object contains role information

  // If there's no authenticated user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a requiredRole is specified, check if the user has the role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/not-authorized" replace />;
  }

  // If authenticated and authorized, render the component
  return element;
};

export default PrivateRoute;
