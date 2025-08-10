import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useToastContext } from '@/contexts/ToastContext';
import { adminDashboardService, TokenUsage } from '@/api/adminServices';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Coins, 
  ChevronLeft, 
  Search, 
  Filter, 
  Calendar,
  Shield,
  User,
  Activity,
  Trash2
} from 'lucide-react';

const TokenUsagePage: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToastContext();
  
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    enhancement_type: '',
    content_type: '',
    created_at: '',
    page: 1
  });

  useEffect(() => {
    // Check if user is staff
    if (!user?.is_staff) {
      showError('Access denied. Staff privileges required.');
      navigate('/dashboard');
      return;
    }

    loadTokenUsage();
  }, [user, navigate, filters]); // Removed showError from dependencies to prevent infinite loop

  const loadTokenUsage = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardService.getTokenUsage(filters);
      setTokenUsage(data.results);
      setTotalCount(data.count);
    } catch (error) {
      showError('Failed to load token usage data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsage = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this token usage record?')) return;

    try {
      await adminDashboardService.deleteTokenUsage(id);
      showSuccess('Token usage record deleted successfully');
      loadTokenUsage();
    } catch (error) {
      showError('Failed to delete token usage record');
    }
  };

  const getEnhancementTypeColor = (type: string) => {
    const colors = {
      'weekly_report': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'daily_report': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'general_report': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'default': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  const getContentTypeColor = (type: string) => {
    const colors = {
      'technical_report': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'business_report': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      'academic_report': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      'default': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  if (loading && tokenUsage.length === 0) {
    return <LoadingSpinner message="Loading token usage..." fullScreen />;
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
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Token Usage Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor and manage AI token consumption
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={filters.enhancement_type}
              onChange={(e) => setFilters(prev => ({ ...prev, enhancement_type: e.target.value, page: 1 }))}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Enhancement Types</option>
              <option value="weekly_report">Weekly Report</option>
              <option value="daily_report">Daily Report</option>
              <option value="general_report">General Report</option>
            </select>

            <select
              value={filters.content_type}
              onChange={(e) => setFilters(prev => ({ ...prev, content_type: e.target.value, page: 1 }))}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Content Types</option>
              <option value="technical_report">Technical Report</option>
              <option value="business_report">Business Report</option>
              <option value="academic_report">Academic Report</option>
            </select>

            <input
              type="date"
              value={filters.created_at}
              onChange={(e) => setFilters(prev => ({ ...prev, created_at: e.target.value, page: 1 }))}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <button
              onClick={() => setFilters({ search: '', enhancement_type: '', content_type: '', created_at: '', page: 1 })}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Token Usage Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enhancement Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tokens Used
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cost Estimate
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tokenUsage.map((usage) => (
                  <tr key={usage.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            User #{usage.user}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEnhancementTypeColor(usage.enhancement_type)}`}>
                        {usage.enhancement_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getContentTypeColor(usage.content_type)}`}>
                        {usage.content_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {usage.tokens_consumed.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ${typeof usage.cost_estimate === 'number' ? usage.cost_estimate.toFixed(4) : '0.0000'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(usage.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUsage(usage.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tokenUsage.length === 0 && !loading && (
            <div className="text-center py-12">
              <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No token usage found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        {tokenUsage.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tokens</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tokenUsage.reduce((sum, usage) => sum + usage.tokens_consumed, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${tokenUsage.reduce((sum, usage) => sum + (typeof usage.cost_estimate === 'number' ? usage.cost_estimate : 0), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenUsagePage;
