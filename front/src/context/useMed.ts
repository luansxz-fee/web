import { useContext } from 'react';
import { MedContext } from './MedContext';

export const useMed = () => {
  const context = useContext(MedContext);
  if (!context) {
    throw new Error('useMed deve ser usado dentro de um MedProvider');
  }
  return context;
};