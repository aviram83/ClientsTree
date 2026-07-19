import { createContext, useContext, ReactNode } from 'react';
import { useAuthLogic, AuthLogic } from '../hooks/useAuthLogic';

type AuthContextType = AuthLogic;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authLogic = useAuthLogic();

  return (
    <AuthContext.Provider value={authLogic}>
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
