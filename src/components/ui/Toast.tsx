import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { ToastMessage } from '@/hooks/useToast';

export interface ToastProps extends ToastMessage {
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  message, 
  duration = 4000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match the exit animation duration
  };

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 left-4 sm:left-auto sm:right-4 z-50 max-w-sm w-auto sm:w-full transform transition-all duration-300 ease-out";
    
    if (isExiting) {
      return `${baseStyles} translate-x-full opacity-0`;
    }
    
    if (isVisible) {
      return `${baseStyles} translate-x-0 opacity-100`;
    }
    
    return `${baseStyles} translate-x-full opacity-0`;
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: 'text-green-500',
          iconComponent: CheckCircle
        };
      case 'error':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-500',
          iconComponent: AlertCircle
        };
      case 'warning':
        return {
          bg: 'bg-orange-50 border-orange-200',
          text: 'text-orange-800',
          icon: 'text-orange-500',
          iconComponent: AlertCircle
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-500',
          iconComponent: AlertCircle
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-500',
          iconComponent: AlertCircle
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.iconComponent;

  return (
    <div className={getToastStyles()}>
      <div className={`${styles.bg} border rounded-lg shadow-lg p-4 flex items-start gap-3`}>
        <IconComponent className={`w-5 h-5 mt-0.5 ${styles.icon} flex-shrink-0`} />
        <div className={`flex-1 ${styles.text}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className={`${styles.text} hover:opacity-70 transition-opacity p-1 rounded`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}; 