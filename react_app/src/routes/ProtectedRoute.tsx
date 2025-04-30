import React, { useContext, ReactNode } from 'react';
import { Navigate }            from 'react-router-dom';
import { AuthContext }         from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
