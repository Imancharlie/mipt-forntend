import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import { ToastMessage } from '@/hooks/useToast';

interface ToastContextType {
  toasts: ToastMessage[];
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ toasts, showSuccess, showError, showWarning, showInfo, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}; 