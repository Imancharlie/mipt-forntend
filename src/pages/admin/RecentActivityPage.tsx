import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useToastContext } from '@/contexts/ToastContext';
import { adminDashboardService, RecentActivity } from '@/api/adminServices';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Activity, 
  ChevronLeft, 
  Users, 
  FileText, 
  Shield,
  Clock,
  Coins,
  AlertTriangle,
  Building,
  TrendingUp
} from 'lucide-react';

const RecentActivityPage: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const { showError } = useToastContext();
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is staff
    if (!user?.is_staff) {
      showError('Access denied. Staff privileges required.');
      navigate('/dashboard');
      return;
    }

    loadRecentActivity();
  }, [user, navigate]); // Removed showError from dependencies to prevent infinite loop

  const loadRecentActivity = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardService.getRecentActivity();
      setRecentActivity(data);
    } catch (error) {
      showError('Failed to load recent activity');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const colors = {
      'BAN': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'UNBAN': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'DELETE': 'bg-red-200 text-red-900 dark:bg-red-800/30 dark:text-red-300',
      'ACTIVATE': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'SUSPEND': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'RESTORE': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  if (loading) {
    return <LoadingSpinner message="Loading recent activity..." fullScreen />;
  }

  if (!recentActivity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Activity
          </h2>
          <button
            onClick={loadRecentActivity}
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <Shield className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor recent system activity and user actions
              </p>
            </div>
          </div>
          <button
            onClick={loadRecentActivity}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent User Registrations
              </h3>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.recent_users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(user.date_joined).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.recent_users.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No recent user registrations
                </p>
              )}
            </div>
          </div>

          {/* Recent AI Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent AI Usage
              </h3>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.recent_ai_logs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <Coins className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {log.user__first_name} {log.user__last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {log.enhancement_type.replace('_', ' ')} - {log.tokens_consumed} tokens
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {log.content_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.recent_ai_logs.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No recent AI usage
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Admin Actions & Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Admin Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Admin Actions
              </h3>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.recent_actions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {action.admin_user} → {action.target_user}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(action.action)}`}>
                          {action.action}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {action.reason}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(action.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(action.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.recent_actions.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No recent admin actions
                </p>
              )}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Reports
              </h3>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.recent_reports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {report.student__first_name} {report.student__last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{report.student__username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {report.hours_spent}h on {new Date(report.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(report.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.recent_reports.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No recent reports
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Program Statistics */}
          {recentActivity.program_stats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Program Distribution
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
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

          {/* Industry Statistics */}
          {recentActivity.industry_stats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-6 h-6 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Industry Distribution
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {recentActivity.industry_stats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.count}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.industry_type}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivityPage;
