import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  FC
} from 'react';
import api from '../api/client';

interface AuthContextType {
  token:  string | null;
  login:  (
    email: string,
    password: string,
    userType: 'customer' | 'staff'
  ) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  const login = async (
    email: string,
    password: string,
    userType: 'customer' | 'staff'
  ) => {
    const res = await api.post<{ token: string }>('/auth/login', {
      email,
      password,
      userType,
    });
    setToken(res.data.token);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
