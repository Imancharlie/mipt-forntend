import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@/api/services';
import { useToastContext } from '@/contexts/ToastContext';

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToastContext();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const uid = params.get('uid') || '';
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!uid || !token) {
      showError('Invalid or missing reset token. Please request a new link.');
      return;
    }
    if (!password || password.length < 8) {
      showError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      showError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await authService.confirmPasswordResetWithUid({ uid, token, password });
      showSuccess('Password reset successful. You can now log in.');
      navigate('/login');
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.response?.data?.detail || 'Failed to reset password';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-semibold mb-6 text-orange-600 dark:text-orange-400">Set a New Password</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              className="input-field"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving...' : 'Save New Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;



