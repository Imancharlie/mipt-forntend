import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useToastContext } from '@/contexts/ToastContext';
import { adminDashboardService, TokenAnalytics, ReportAnalytics } from '@/api/adminServices';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  BarChart3, 
  ChevronLeft, 
  Calendar, 
  Coins, 
  FileText, 
  Users, 
  TrendingUp,
  Shield,
  Activity,
  Target
} from 'lucide-react';

interface ChartCardProps {
  title: string;
  data: Array<{ label: string; value: number; color?: string }>;
  type: 'bar' | 'line' | 'pie';
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, type }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  if (type === 'bar') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 truncate">
                {item.label}
              </span>
              <div className="flex items-center gap-2 flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color || 'bg-blue-500'}`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-12 text-right">
                  {item.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.value.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const { showError } = useToastContext();
  
  const [tokenAnalytics, setTokenAnalytics] = useState<TokenAnalytics | null>(null);
  const [reportAnalytics, setReportAnalytics] = useState<ReportAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    // Check if user is staff
    if (!user?.is_staff) {
      showError('Access denied. Staff privileges required.');
      navigate('/dashboard');
      return;
    }

    loadAnalytics();
  }, [user, navigate, days]); // Removed showError from dependencies to prevent infinite loop

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [tokenData, reportData] = await Promise.all([
        adminDashboardService.getTokenAnalytics(days),
        adminDashboardService.getReportAnalytics(days)
      ]);
      setTokenAnalytics(tokenData);
      setReportAnalytics(reportData);
    } catch (error) {
      showError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." fullScreen />;
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
            <Shield className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                System usage and performance metrics
              </p>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 3 months</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        {tokenAnalytics && reportAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tokens</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {tokenAnalytics.total_tokens.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +{tokenAnalytics.period_tokens.toLocaleString()} this period
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500">
                  <Coins className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Enhancements</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {tokenAnalytics.total_enhancements.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    +{tokenAnalytics.period_enhancements} this period
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Reports</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {reportAnalytics.total_weekly_reports.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {reportAnalytics.completion_rate.toFixed(1)}% completion rate
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Daily Usage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {Math.round(tokenAnalytics.period_tokens / days).toLocaleString()}
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    tokens per day
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-500">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Token Usage */}
          {tokenAnalytics && (
            <ChartCard
              title="Daily Token Usage"
              type="bar"
              data={tokenAnalytics.daily_usage.slice(-14).map(item => ({
                label: new Date(item.created_at__date).toLocaleDateString(),
                value: item.total_tokens,
                color: 'bg-purple-500'
              }))}
            />
          )}

          {/* Daily Reports */}
          {reportAnalytics && (
            <ChartCard
              title="Daily Reports Created"
              type="bar"
              data={reportAnalytics.daily_reports_stats.slice(-14).map(item => ({
                label: new Date(item.created_at__date).toLocaleDateString(),
                value: item.count,
                color: 'bg-blue-500'
              }))}
            />
          )}
        </div>

        {/* Enhancement Types & Top Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Enhancement Types */}
          {tokenAnalytics && (
            <ChartCard
              title="Enhancement Types"
              type="bar"
              data={tokenAnalytics.enhancement_usage.map(item => ({
                label: item.enhancement_type.replace('_', ' ').toUpperCase(),
                value: item.total_tokens,
                color: 'bg-green-500'
              }))}
            />
          )}

          {/* Top Token Users */}
          {tokenAnalytics && (
            <ChartCard
              title="Top Token Users"
              type="bar"
              data={tokenAnalytics.user_usage.slice(0, 10).map(item => ({
                label: item.user__username,
                value: item.total_tokens,
                color: 'bg-indigo-500'
              }))}
            />
          )}
        </div>

        {/* Program Statistics & Content Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Program Statistics */}
          {reportAnalytics && (
            <ChartCard
              title="Reports by Program"
              type="bar"
              data={reportAnalytics.program_stats.map(item => ({
                label: item.student__profile__program || 'Unknown',
                value: item.report_count,
                color: 'bg-teal-500'
              }))}
            />
          )}

          {/* Content Types */}
          {tokenAnalytics && (
            <ChartCard
              title="Content Types Enhanced"
              type="bar"
              data={tokenAnalytics.content_usage.map(item => ({
                label: item.content_type.replace('_', ' ').toUpperCase(),
                value: item.total_tokens,
                color: 'bg-pink-500'
              }))}
            />
          )}
        </div>

        {/* User Activity Summary */}
        {reportAnalytics && reportAnalytics.user_report_activity.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Most Active Users (Reports)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportAnalytics.user_report_activity.slice(0, 6).map((user, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.student__username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.student__username}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.total_hours}h total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {user.report_count}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">reports</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
