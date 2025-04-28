import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.JSX.Element }> = ({ children }) => {
  const auth = useContext(AuthContext);
  if (!auth || !auth.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};