import React, { createContext, useState, ReactNode, FC } from 'react';
import api from '../api/client';

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

  const login = async (
    email: string,
    password: string,
    userType: 'customer' | 'staff'
  ) => {
    const res = await api.post<{ jwToken: string }>(
      '/auth/login',
      { email, password, user_type: userType }
    );

    // 2) Store the "jwToken" that your API returns
    const jwt = res.data.jwToken;
    localStorage.setItem('token', jwt);
    setToken(jwt);
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
