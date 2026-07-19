import { createContext, useContext, ReactNode } from 'react';
import { useTreeLogic, TreeLogic } from '../hooks/useTreeLogic';

type TreeContextType = TreeLogic;

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export const TreeProvider = ({ children }: { children: ReactNode }) => {
  const treeLogic = useTreeLogic();

  return (
    <TreeContext.Provider value={treeLogic}>
      {children}
    </TreeContext.Provider>
  );
};

export const useTree = () => {
  const context = useContext(TreeContext);
  if (context === undefined) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
};
