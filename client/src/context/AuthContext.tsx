import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../api/types';
import * as api from '../api';
import { injectShowErrorModal, injectLogout } from '../api/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  showErrorModal: (message: string) => void;
  closeErrorModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showErrorModal = (message: string) => {
    setErrorMessage(message);
  };

  const closeErrorModal = () => {
    setErrorMessage(null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    injectShowErrorModal(showErrorModal);
    injectLogout(logout);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.login(data);
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (data: any) => {
    setIsLoading(true);
    try {
      await api.register(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, errorMessage, showErrorModal, closeErrorModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
