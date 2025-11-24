import { useContext } from 'react';
import { MotoristaAuthContext } from '../contexts/MotoristaAuthContext';
import type { MotoristaAuthContextData } from '../contexts/MotoristaAuthContext';

export const useMotoristaAuth = (): MotoristaAuthContextData => {
  const context = useContext(MotoristaAuthContext);
  
  if (!context) {
    throw new Error('useMotoristaAuth must be used within MotoristaAuthProvider');
  }
  
  return context;
};
