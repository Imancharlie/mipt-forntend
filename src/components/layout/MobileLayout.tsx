import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Menu, X, User, Settings, LogOut, Home, FileText, Calendar, BookOpen, Award, CreditCard, HelpCircle, Coins } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, theme, aiUsageStats } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Daily Reports', href: '/daily-report', icon: FileText },
    { name: 'Weekly Reports', href: '/weekly-report', icon: Calendar },
    { name: 'General Report', href: '/general-report', icon: BookOpen },
    { name: 'PT Assessment', href: '/pt-assessment', icon: Award },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Help Center', href: '/help', icon: HelpCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (href: string) => location.pathname === href;

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
            {aiUsageStats && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
                <Coins className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">{aiUsageStats.total_tokens}</span>
                <span className="text-xs text-blue-500">tokens</span>
              </div>
            )}
            
            {/* User Profile in Navbar */}
            {user && (
              <div className="flex items-center gap-2">
                {/* User Avatar */}
                <div className="relative">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md border border-white">
                    <span className="text-white font-bold text-sm lg:text-base">
                      {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                    </span>
                  </div>
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border border-white shadow-sm"></div>
                </div>
                
                {/* User Info */}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-gray-600">Online</p>
                </div>
              </div>
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