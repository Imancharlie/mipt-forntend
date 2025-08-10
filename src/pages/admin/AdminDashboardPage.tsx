import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useToastContext } from '@/contexts/ToastContext';
import { adminDashboardService, DashboardStats, RecentActivity } from '@/api/adminServices';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Users, 
  FileText, 
  Building, 
  Coins, 
  TrendingUp, 
  Calendar,
  Activity,
  AlertCircle,
  Shield,
  BarChart3,
  Settings
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend.value}% from last period
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboardPage: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const { showError } = useToastContext();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is staff
    if (!user?.is_staff) {
      showError('Access denied. Staff privileges required.');
      navigate('/dashboard');
      return;
    }

    loadDashboardData();
  }, [user, navigate, showError]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        adminDashboardService.getDashboardStats(),
        adminDashboardService.getRecentActivity()
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      showError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." fullScreen />;
  }

  if (!stats || !recentActivity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Dashboard
          </h2>
          <button
            onClick={loadDashboardData}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            System overview and management tools
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
          >
            <Users className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">User Management</span>
          </button>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
          >
            <BarChart3 className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Analytics</span>
          </button>
          <button
            onClick={() => navigate('/admin/token-usage')}
            className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            <Coins className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Token Usage</span>
          </button>
          <button
            onClick={() => navigate('/admin/billing')}
            className="p-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors"
          >
            <Settings className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Billing</span>
          </button>
          <button
            onClick={() => navigate('/admin/activity')}
            className="p-4 bg-orange-600 hover:bg-orange-700 rounded-lg text-white transition-colors"
          >
            <Activity className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Recent Activity</span>
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.total_users}
            icon={Users}
            color="bg-blue-500"
            trend={{
              value: Math.round((stats.new_users_this_week / stats.total_users) * 100),
              isPositive: true
            }}
          />
          <StatCard
            title="Active Users"
            value={stats.active_users}
            icon={Activity}
            color="bg-green-500"
          />
          <StatCard
            title="Total Reports"
            value={stats.total_weekly_reports}
            icon={FileText}
            color="bg-purple-500"
            trend={{
              value: Math.round((stats.reports_this_week / stats.total_weekly_reports) * 100),
              isPositive: true
            }}
          />
          <StatCard
            title="Tokens Used"
            value={stats.total_tokens_used}
            icon={Coins}
            color="bg-orange-500"
            trend={{
              value: Math.round((stats.tokens_this_week / stats.total_tokens_used) * 100),
              isPositive: true
            }}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Companies"
            value={stats.total_companies}
            icon={Building}
            color="bg-indigo-500"
          />
          <StatCard
            title="New Users This Week"
            value={stats.new_users_this_week}
            icon={Calendar}
            color="bg-pink-500"
          />
          <StatCard
            title="Reports This Month"
            value={stats.reports_this_month}
            icon={FileText}
            color="bg-teal-500"
          />
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Users
            </h3>
            <div className="space-y-3">
              {recentActivity.recent_users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(user.date_joined).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent AI Logs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent AI Usage
            </h3>
            <div className="space-y-3">
              {recentActivity.recent_ai_logs.slice(0, 5).map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {log.user__first_name} {log.user__last_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {log.enhancement_type} - {log.tokens_consumed} tokens
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Program Statistics */}
        {recentActivity.program_stats.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Program Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentActivity.program_stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.count}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.program}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;


