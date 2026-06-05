'use client';

import { useContext } from 'react';
import { ReactDocContext } from '../components/ReactDocProvider';

export const useExportDoc = () => {
  const context = useContext(ReactDocContext);
  if (!context) {
    throw new Error('useReactDoc must be used within a ReactDocProvider');
  }
  return context;
};
