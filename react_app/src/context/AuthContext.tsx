// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, ReactNode, FC } from 'react';
import api from '../api';

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string, userType: 'customer' | 'staff') => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const login = async (email: string, password: string, userType: 'customer' | 'staff') => {
    const res = await api.post<{ token: string }>('/auth/login', { email, password, type_of_user: userType });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
