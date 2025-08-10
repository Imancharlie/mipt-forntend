import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Menu, X, User, Settings, LogOut, Home, FileText, Calendar, BookOpen, Award, CreditCard, HelpCircle, Coins, Activity, Shield, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, theme, userBalance, fetchUserBalance, loading } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user balance on mount - only when user exists and balance is missing
  React.useEffect(() => {
    if (user && !userBalance) {
      fetchUserBalance().catch(console.error);
    }
  }, [user, userBalance]); // Removed fetchUserBalance from dependencies to prevent infinite loop

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefreshBalance = () => {
    if (user) {
      fetchUserBalance().catch(console.error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Daily Reports', href: '/daily-report', icon: FileText },
    { name: 'Weekly Reports', href: '/weekly-report', icon: Calendar },
    { name: 'General Report', href: '/general-report', icon: BookOpen },
    { name: 'PT Assessment', href: '/pt-assessment', icon: Award },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Workplace', href: '/workplace', icon: Activity },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Help Center', href: '/help', icon: HelpCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
    ...(user?.is_staff ? [{ name: 'Admin Dashboard', href: '/admin', icon: Shield }] : []),
  ];

  const isActive = (href: string) => location.pathname === href;

  // Render token display with different states
  const renderTokenDisplay = () => {
    if (loading?.userBalance) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600">
          <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Loading...</span>
        </div>
      );
    }

    if (!userBalance) {
      return (
        <button
          onClick={handleRefreshBalance}
          className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full border border-yellow-200 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-800/40 transition-colors"
          title="Click to refresh balance"
        >
          <AlertCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
          <span className="text-xs text-yellow-700 dark:text-yellow-300">Refresh</span>
        </button>
      );
    }

    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full border border-orange-200 dark:border-orange-700">
        <Coins className="w-3 h-3 text-orange-600 dark:text-orange-400" />
        <span className="text-xs font-medium text-orange-700 dark:text-orange-300">{userBalance.available_tokens}</span>
        <span className="text-xs text-orange-500 dark:text-orange-400">tokens</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40`}>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-lg text-${theme}-600 hover:bg-${theme}-50`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">MIPT</h1>
              <p className="text-xs text-gray-600">Practical Training</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Token Display */}
            {renderTokenDisplay()}
            
            {/* User Profile in Navbar */}
            {user && (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors"
              >
                {/* User Avatar */}
                <div className="relative">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover shadow-md border border-white"
                    />
                  ) : (
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md border border-white">
                      <span className="text-white font-bold text-sm lg:text-base">
                        {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                      </span>
                    </div>
                  )}
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border border-white shadow-sm"></div>
                </div>
                
                {/* User Info */}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Online</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-lg hover:bg-gray-50 ${
                theme === 'orange' ? 'text-orange-600' :
                theme === 'purple' ? 'text-purple-600' :
                theme === 'green' ? 'text-green-600' :
                'text-orange-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive(item.href)
                        ? `${
                            theme === 'orange' ? 'bg-orange-100 text-orange-700' :
                            theme === 'purple' ? 'bg-purple-100 text-purple-700' :
                            theme === 'green' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}; 