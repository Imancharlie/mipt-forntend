import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useToastContext } from '@/contexts/ToastContext';

import { 
  Settings, 
  Palette, 
  Bell, 
  User, 
  Lock, 
  Download, 
  Trash2,
  Save,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/store';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface UserSettings {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    weekly_reminder: boolean;
    daily_reminder: boolean;
  };
  account: {
    username: string;
    email: string;
  };
}

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, colorMode, setColorMode } = useTheme();
  const { user } = useAppStore();
  const { showSuccess, showError, showWarning, showInfo } = useToastContext();
  const [settings, setSettings] = useState<UserSettings>({
    theme: colorMode,
    notifications: {
      email: true,
      push: true,
      weekly_reminder: true,
      daily_reminder: false,
    },
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
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              weekly_reminder: true,
              daily_reminder: false,
            },
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
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            weekly_reminder: true,
            daily_reminder: false,
          },
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
  }, [theme, user]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setColorMode(newTheme);
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

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
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account preferences and settings</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Theme Selection */}
        <div className="card p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">Choose your preferred appearance mode</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'light', name: 'Light Mode', icon: '☀️' },
                { id: 'dark', name: 'Dark Mode', icon: '🌙' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleThemeChange(mode.id as 'light' | 'dark')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    colorMode === mode.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{mode.icon}</div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{mode.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">Manage your notification preferences</p>
            <div className="space-y-2">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleNotificationChange(key, e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 focus:border-orange-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="card p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={settings.account.username}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  account: { ...prev.account, username: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={settings.account.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  account: { ...prev.account, email: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="card p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.current}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          </div>
        </div>

        {/* PWA Install Guide */}
        

     
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}; 