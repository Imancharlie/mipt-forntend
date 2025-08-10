import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/store';
import { LoginData } from '@/types';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>();
  const { login, loading, error, clearError } = useAppStore();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const onSubmit = async (data: LoginData) => {
    if (isLoggingIn) return; // Prevent multiple submissions
    
    clearError(); // Clear any previous errors
    setIsLoggingIn(true);
    
    try {
      await login(data);
    } catch (error: any) {
      // Error is already handled by the store, but we can add additional logging here
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    
    switch (error.type) {
      case 'auth':
        if (error.message.includes('401') || error.message.includes('Invalid credentials')) {
          return 'Invalid username or password. Please check your credentials and try again.';
        }
        return error.message;
      case 'network':
        return 'Network error. Please check your internet connection and try again. If the problem persists, contact support.';
      case 'validation':
        return error.message;
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-400 text-center">Sign In</h2>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{getErrorMessage()}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              className="input-field"
              {...register('username', { required: 'Username is required' })}
              autoComplete="username"
            />
            
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                {...register('password', { required: 'Password is required' })}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          
          <button
            type="submit"
            className={`btn-primary w-full flex items-center justify-center gap-2 ${isLoggingIn ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isLoggingIn || isSubmitting}
          >
            {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Sign In
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Don&apos;t have an account?</span>{' '}
          <a href="/register" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium hover:underline">Register</a>
        </div>
      </div>
    </div>
  );
}; 