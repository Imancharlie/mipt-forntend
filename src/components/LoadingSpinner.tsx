import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
  inline?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  color = 'primary',
  className = '',
  inline = false
}) => {
  const { theme } = useTheme();
  
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: `text-${theme}-500`,
    white: 'text-white',
    gray: 'text-gray-500'
  };

  const spinner = (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${colorClasses[color]} ${className}`} />
  );

  if (inline) {
    return spinner;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="mb-2">
        {spinner}
      </div>
      {message && (
        <p className="text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
}; 