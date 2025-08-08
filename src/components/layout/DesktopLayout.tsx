import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Calendar, 
  BookOpen, 
  User, 
  Settings,
  LogOut,
  Award,
  CreditCard,
  HelpCircle,
  Coins
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useTheme } from '../ThemeProvider';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, aiUsageStats } = useAppStore();
  const { theme, setTheme, colorMode } = useTheme();

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/daily-report', icon: FileText, label: 'Daily Reports' },
    { path: '/weekly-report', icon: Calendar, label: 'Weekly Reports' },
    { path: '/general-report', icon: BookOpen, label: 'General Report' },
    { path: '/pt-assessment', icon: Award, label: 'PT Assessment' },
    { path: '/resources', icon: BookOpen, label: 'Resources' },
    { path: '/billing', icon: CreditCard, label: 'Billing' },
    { path: '/help', icon: HelpCircle, label: 'Help Center' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleThemeChange = () => {
    const themes: Array<'orange' | 'purple' | 'green'> = ['orange', 'purple', 'green'];
    const currentIndex = themes.indexOf(theme as any);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <div className="desktop-container flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MIPT</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Industrial Training Reports</p>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md border border-white">
                  <span className="text-sm font-bold text-white">
                    {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                  </span>
                </div>
                {/* Online Status Indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border border-white shadow-sm"></div>
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Online</p>
              </div>
              
              {/* Token Display */}
              {aiUsageStats && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full border border-blue-200 dark:border-blue-700">
                  <Coins className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{aiUsageStats.total_tokens}</span>
                  <span className="text-xs text-blue-500 dark:text-blue-400">tokens</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      isActive 
                        ? `${
                            theme === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                            theme === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                            theme === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                            'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                          }` 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <button
              onClick={handleThemeChange}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Change Theme</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}; 