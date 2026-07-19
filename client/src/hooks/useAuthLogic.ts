import { useState, useEffect, useRef } from 'react';
import * as api from '../api';
import { injectShowErrorModal, injectLogout } from '../api/api';
import { useProfileStore } from '../store/profileStore';

export interface AuthLogic {
  token: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  showErrorModal: (message: string) => void;
  closeErrorModal: () => void;
}

export const useAuthLogic = (): AuthLogic => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const effectRan = useRef(false);

  const showErrorModal = (message: string) => {
    setErrorMessage(message);
  };

  const closeErrorModal = () => {
    setErrorMessage(null);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    useProfileStore.getState().clearProfile();
  };

  useEffect(() => {
    injectShowErrorModal(showErrorModal);
    injectLogout(logout);
  }, []);

  useEffect(() => {
    if (effectRan.current === false) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        useProfileStore.getState().fetchProfile();
      }
      return () => {
        effectRan.current = true;
      };
    }
  }, []);

  const login = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.login(data);
      const { token } = response.data;
      setToken(token);
      localStorage.setItem('token', token);
      await useProfileStore.getState().fetchProfile();
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

  return { token, login, register, logout, isLoading, errorMessage, showErrorModal, closeErrorModal };
};
