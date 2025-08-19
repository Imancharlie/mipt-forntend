import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { profileService } from '@/api/services';

export const AccountActivationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { colorMode } = useTheme();
  const { profile, isAuthenticated, fetchProfile } = useAppStore();
  const isVerified = (profile as any)?.email_verified === true;
  
  // removed legacy isLoading from previous status-check flow
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'success' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

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
    <div className={`min-h-screen flex items-center justify-center p-4 ${colorMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg ${
        colorMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h2 className="text-3xl font-bold mb-2">Account Activation</h2>
          <p className={`text-lg ${getStatusColor()}`}>
            {getStatusMessage()}
          </p>
        </div>

        {/* Email Display */}
        {email && (
          <div className={`p-4 rounded-lg ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <p className="text-sm text-gray-500 mb-1">Email Address:</p>
            <p className="font-medium">{email}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 rounded-lg bg-red-100 border border-red-300">
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {resendSuccess && (
          <div className="p-4 rounded-lg bg-green-100 border border-green-300">
            <p className="text-green-700 text-sm">
              Verification email sent successfully! Please check your inbox.
            </p>
          </div>
        )}

        {/* OTP Form & Actions */}
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm text-gray-600">Enter the 6-digit code sent to your email</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className={`w-full px-3 py-3 text-center tracking-widest text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                colorMode === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              onClick={handleVerifyOtp}
              disabled={verifyLoading || otpCode.length < 4}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {verifyLoading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Verifying...</span>
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {resendLoading ? 'Sending code...' : 'Resend Code'}
            </button>
          </div>

          {/* Back to Login */}
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Login
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>Didn't receive the email? Check your spam folder or contact support.</p>
        </div>
      </div>
    </div>
  );
};
