import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/store';
import { LoginData } from '@/types';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { authService } from '@/api/services';
import { useToastContext } from '@/contexts/ToastContext';

export const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>();
  const { login, loading, error, clearError } = useAppStore();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { showError, showSuccess } = useToastContext();

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetStage, setResetStage] = useState<'request' | 'confirm'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const requestReset = async () => {
    if (!resetEmail) {
      showError('Please enter your email');
      return;
    }
    setSubmitting(true);
    try {
      await authService.requestPasswordReset(resetEmail);
      showSuccess('Reset code sent. Check your email.');
      setResetStage('confirm');
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Failed to send reset code';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmReset = async () => {
    if (!resetEmail || !resetToken || !newPassword) {
      showError('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      await authService.confirmPasswordReset({ email: resetEmail, token: resetToken, new_password: newPassword });
      showSuccess('Password reset successfully. You can now log in.');
      setForgotOpen(false);
      setResetStage('request');
      setResetToken('');
      setNewPassword('');
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Failed to reset password';
      showError(msg);
    } finally {
      setSubmitting(false);
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
          <div className="mt-3 text-right">
            <button type="button" onClick={() => setForgotOpen(true)} className="text-sm text-orange-600 hover:text-orange-700 underline">
              Forgot password?
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Don&apos;t have an account?</span>{' '}
          <a href="/register" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium hover:underline">Register</a>
        </div>
      </div>
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md mx-4 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-orange-600 dark:text-orange-400">Reset Password</h4>
              <button onClick={() => setForgotOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {resetStage === 'request' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      className="input-field"
                      type="email"
                      placeholder="your.email@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  <button onClick={requestReset} disabled={submitting} className="btn-primary w-full">
                    {submitting ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      className="input-field"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reset Code</label>
                    <input
                      className="input-field"
                      placeholder="Enter the code received"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <input
                      className="input-field"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <button onClick={confirmReset} disabled={submitting} className="btn-primary w-full">
                    {submitting ? 'Resetting...' : 'Reset Password'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 