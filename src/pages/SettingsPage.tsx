import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useToastContext } from '@/contexts/ToastContext';

import { 
  Settings, 
  User, 
  Lock, 
  Download, 
  Trash2,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Database
} from 'lucide-react';
import { useAppStore } from '@/store';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface UserSettings {
  account: {
    username: string;
    email: string;
  };
}

export const SettingsPage: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAppStore();
  const { showSuccess, showError, showWarning, showInfo } = useToastContext();
  const [settings, setSettings] = useState<UserSettings>({
    account: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        // Simulate API call - replace with actual backend endpoint
        const response = await fetch('/api/user/settings/');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          // Use default settings if API fails
          setSettings({
            account: {
              username: user?.username || '',
              email: user?.email || '',
            },
          });
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
        // Use default settings
        setSettings({
          account: {
            username: user?.username || '',
            email: user?.email || '',
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    try {
      // Simulate API call - replace with actual backend endpoint
      const response = await fetch('/api/user/settings/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        showSuccess('Settings saved successfully!');
      } else {
        showError('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showError('Failed to save settings. Please try again.');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showError('New passwords do not match!');
      return;
    }

    if (passwordData.new.length < 8) {
      showError('Password must be at least 8 characters long!');
      return;
    }

    try {
      // Simulate API call - replace with actual backend endpoint
      const response = await fetch('/api/user/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.current,
          new_password: passwordData.new,
        }),
      });
      
      if (response.ok) {
        showSuccess('Password changed successfully!');
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        showError('Failed to change password. Please check your current password.');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      showError('Failed to change password. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      // Simulate API call - replace with actual backend endpoint
      const response = await fetch('/api/user/export-data/');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mipt-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showSuccess('Data exported successfully!');
      } else {
        showInfo('Export feature coming soon!');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      showInfo('Export feature coming soon!');
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmed) {
      // Simulate account deletion
      showInfo('Account deletion feature coming soon!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <LoadingSpinner size="lg" color="primary" message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-6 h-6 text-orange-500 dark:text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account preferences and security</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Account Information */}
        <div className="card p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update your personal details</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={settings.account.username}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  account: { ...prev.account, username: e.target.value }
                }))}
                className="input-field"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={settings.account.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  account: { ...prev.account, email: e.target.value }
                }))}
                className="input-field"
                placeholder="Enter your email address"
              />
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Change your password to keep your account secure</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.current}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                  className="input-field pr-12"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                  className="input-field"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                  className="input-field"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <button
              onClick={handlePasswordChange}
              className="btn-primary flex items-center gap-2 text-sm px-6 py-3 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            >
              <Lock className="w-4 h-4" />
              Update Password
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="card p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Management</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Export your data or manage your account</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExportData}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 group"
            >
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Export Data</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Download your personal data</p>
              </div>
            </button>
            
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
            >
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors">
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Account</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Permanently remove your account</p>
              </div>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSaveSettings}
            className="btn-primary flex items-center gap-2 text-sm px-8 py-3 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}; 