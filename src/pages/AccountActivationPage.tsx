import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { profileService } from '@/api/services';
import { clearRegistrationProfile } from '@/utils/registrationStorage';

export const AccountActivationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { colorMode } = useTheme();
  const { profile, isAuthenticated, fetchProfile, logout } = useAppStore();
  const isVerified = (profile as any)?.email_verified === true;
  
  // removed legacy isLoading from previous status-check flow
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'success' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [wrongEmailLoading, setWrongEmailLoading] = useState(false);

  const email = searchParams.get('email') || profile?.user_details?.email || '';

  useEffect(() => {
    // If user is already verified, redirect to dashboard
    if (isVerified) {
      navigate('/dashboard');
      return;
    }

    // Check if we have an email in URL params
    if (email && !isVerified) {
      setVerificationStatus('pending');
    }
  }, [profile, email, navigate]);

  const handleVerifyOtp = async () => {
    if (!email) {
      setErrorMessage('Email address is required.');
      return;
    }
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Enter the verification code sent to your email.');
      return;
    }

    setVerifyLoading(true);
    setErrorMessage('');
    setVerificationStatus('verifying');

    try {
      const res = await profileService.verifyEmailOtp({ email, code: otpCode, purpose: 'register' });
      if (res.email_verified) {
        setVerificationStatus('success');
        if (isAuthenticated) {
          try { await fetchProfile(); } catch {}
          setTimeout(() => {
            navigate('/dashboard');
          }, 1200);
        } else {
          setTimeout(() => {
            navigate(`/login?activated=1&email=${encodeURIComponent(email)}`);
          }, 1200);
        }
        return;
      }
      setVerificationStatus('failed');
      setErrorMessage(res?.detail || 'Verification failed.');
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Verification failed. Please try again.';
      const action = err?.response?.data?.action;
      setVerificationStatus('failed');
      setErrorMessage(detail);
      if (action === 'resend') {
        setResendSuccess(false);
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setErrorMessage('Email address is required.');
      return;
    }
    setResendLoading(true);
    setErrorMessage('');
    try {
      // Prefer dedicated OTP sender; fallback to resendVerificationEmail if needed
      if (profileService.sendEmailOtp) {
        await profileService.sendEmailOtp(email, 'register');
      } else if ((profileService as any).resendVerificationEmail) {
        await (profileService as any).resendVerificationEmail(email);
      }
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleWrongEmail = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to go back to registration? This will:\n\n' +
      '• Allow you to register with a different email\n\n' +
      'Click OK to continue or Cancel to stay here.'
    );
    
    if (!confirmed) {
      return;
    }
    
    setWrongEmailLoading(true);
    try {
      // Logout the user to clear authentication state
      await logout();
      
      // Clear stored registration data using utility function
      clearRegistrationProfile();
      
      // Clear any other potential registration data
      localStorage.removeItem('registrationData');
      
      // Redirect to registration page with a message
      navigate('/register?wrongEmail=1');
    } catch (error) {
      console.error('Error handling wrong email:', error);
      // Even if logout fails, try to redirect
      navigate('/register?wrongEmail=1');
    } finally {
      setWrongEmailLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      case 'verifying':
        return <RefreshCw className="w-16 h-16 text-blue-500 animate-spin" />;
      default:
        return <Mail className="w-16 h-16 text-blue-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email verified successfully! Redirecting to dashboard...';
      case 'failed':
        return 'Email verification is still pending.';
      case 'verifying':
        return 'Checking verification status...';
      default:
        return 'Please verify your email address to activate your account.';
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'verifying':
        return 'text-blue-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      colorMode === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className={`max-w-md w-full space-y-6 p-6 rounded-xl shadow-lg border ${
        colorMode === 'dark' 
          ? 'bg-gray-800/95 backdrop-blur-sm border-gray-700 text-white' 
          : 'bg-white/95 backdrop-blur-sm border-gray-200 text-gray-900'
      }`}>
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${
              colorMode === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'
            }`}>
              {getStatusIcon()}
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Account Activation
          </h2>
          <p className={`text-base font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </p>
        </div>

        {/* Email Display */}
        {email && (
          <div className={`p-4 rounded-lg border ${
            colorMode === 'dark' 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-full ${
                colorMode === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
              }`}>
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Email Address</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{email}</p>
              </div>
            </div>
            
            {/* Wrong Email Button */}
            <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
              <button
                onClick={handleWrongEmail}
                disabled={wrongEmailLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-orange-400 disabled:to-red-400 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {wrongEmailLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span className="text-sm">Redirecting...</span>
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Wrong Email?</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-red-700 dark:text-red-300 text-xs font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {resendSuccess && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-green-700 dark:text-green-300 text-xs font-medium">
                Verification email sent successfully! Please check your inbox.
              </p>
            </div>
          </div>
        )}

        {/* OTP Form & Actions */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter the 6-digit verification code
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Check your email for the code we just sent
              </p>
            </div>
            
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className={`w-full px-4 py-3 text-center tracking-widest text-lg font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  colorMode === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                }`}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  otpCode.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  otpCode.length === 6 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
            </div>
            
            <button
              onClick={handleVerifyOtp}
              disabled={verifyLoading || otpCode.length < 4}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
            >
              {verifyLoading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="text-sm">Verifying Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Verify Code</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Sending Code...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Resend Code</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Help Text */}
        <div className="text-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <a 
                href="mailto:miptsoftware@gmail.com" 
                className="text-xs font-medium text-blue-700 dark:text-blue-300"
              >
                Need Help?
              </a>
          </div>
        </div>
      </div>
    </div>
  );
};
