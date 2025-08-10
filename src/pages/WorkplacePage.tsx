import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useToastContext } from '@/contexts/ToastContext';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Hourglass,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Search,
  Coins,
  Zap,
  FileText
} from 'lucide-react';

// Using Transaction type from @/types instead of local interface

interface UsageStats {
  totalTokensUsed: number;
  totalTokensPurchased: number;
  currentBalance: number;
  weeklyUsage: Array<{ week: string; tokens: number }>;
  monthlyUsage: Array<{ month: string; tokens: number }>;
  enhancementStats: {
    dailyReports: number;
    weeklyReports: number;
    generalReports: number;
  };
}

export const WorkplacePage: React.FC = () => {
  const { 
    user, 
    userBalance, 
    transactions, 
    tokenUsageHistory,
    billingDashboard,
    fetchUserBalance,
    fetchTransactions,
    fetchTokenUsageHistory,
    fetchBillingDashboard
  } = useAppStore();
  const { showError } = useToastContext();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'usage'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUserBalance(),
          fetchTransactions(),
          fetchTokenUsageHistory(),
          fetchBillingDashboard()
        ]);
      } catch (error) {
        showError('Failed to fetch workplace data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []); // Removed store functions from dependencies to prevent infinite loop
  
  // Remove mock transactions state - using real data from store

  // Compute usage stats from real data
  const usageStats: UsageStats = {
    totalTokensUsed: userBalance?.tokens_used || 0,
    totalTokensPurchased: (userBalance?.available_tokens || 0) + (userBalance?.tokens_used || 0) - 400,
    currentBalance: userBalance?.available_tokens || 0,
    weeklyUsage: Array.isArray(tokenUsageHistory) 
      ? tokenUsageHistory.slice(-4).map((usage, index) => ({
          week: `Week ${index + 1}`,
          tokens: usage.tokens_used
        }))
      : [],
    monthlyUsage: [], // Can be computed from tokenUsageHistory with proper date grouping
    enhancementStats: {
      dailyReports: Array.isArray(tokenUsageHistory) 
        ? tokenUsageHistory.filter(usage => usage.usage_type === 'FULLFILLED').length 
        : 0,
      weeklyReports: Array.isArray(tokenUsageHistory) 
        ? tokenUsageHistory.filter(usage => usage.usage_type === 'PARTIAL').length 
        : 0,
      generalReports: Array.isArray(tokenUsageHistory) 
        ? tokenUsageHistory.filter(usage => usage.usage_type === 'EMPTY').length 
        : 0
    }
  };

  const filteredTransactions = transactions?.filter(transaction =>
    transaction.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transaction_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.amount.toString().includes(searchTerm)
  ) || [];

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Hourglass className="w-4 h-4 text-yellow-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Removed getTypeIcon function - not needed with real transaction data

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workplace data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                Workplace
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Track your usage, transactions, and activity
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back,</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{user?.first_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{usageStats.currentBalance}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">tokens</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Coins className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Used</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{usageStats.totalTokensUsed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">tokens</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Purchased</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{usageStats.totalTokensPurchased}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">tokens</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('transactions')}
              className="flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm border-orange-500 text-orange-600 dark:text-orange-400"
            >
              <Activity className="w-4 h-4" />
              Transactions
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content - Only Transactions */}
      <div className="space-y-6">
        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:ring-orange-400 dark:focus:border-orange-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Transaction History</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        Token purchase by {transaction.sender_name}
                        {transaction.wakala_name && ` via ${transaction.wakala_name}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(transaction.transaction_status)}
                        <span className={`text-xs font-medium ${
                          transaction.transaction_status === 'APPROVED' ? 'text-green-600 dark:text-green-400' :
                          transaction.transaction_status === 'PENDING' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.transaction_status.charAt(0) + transaction.transaction_status.slice(1).toLowerCase()}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{transaction.payment_method}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {transaction.transaction_status === 'APPROVED' && (
                      <p className="font-bold text-green-600 dark:text-green-400">+{transaction.tokens_generated} tokens</p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.amount} TSH</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkplacePage;
