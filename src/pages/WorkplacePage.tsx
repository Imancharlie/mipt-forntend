import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useToastContext } from '@/contexts/ToastContext';
import { billingService } from '@/api/services';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Hourglass,
  Search,
  Coins,
  Loader2
} from 'lucide-react';

interface Transaction {
  id: number;
  user: string;
  user_full_name: string;
  user_phone_number: string;
  sender_name: string;
  payment_method: 'DIRECT' | 'WAKALA';
  transaction_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  amount: string;
  tokens_generated: number;
  wakala_name?: string;
  confirmed_by_name?: string;
  created_at: string;
  updated_at: string;
}

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
    tokenUsageHistory,
    fetchUserBalance,
    fetchTokenUsageHistory
  } = useAppStore();
  const { showError } = useToastContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneralLoading, setIsGeneralLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);

  // Fetch general data (balance, usage history) on component mount
  useEffect(() => {
    const fetchGeneralData = async () => {
      setIsGeneralLoading(true);
      try {
        await Promise.all([
          fetchUserBalance(),
          fetchTokenUsageHistory()
        ]);
      } catch (error) {
        showError('Failed to fetch workspace data');
      } finally {
        setIsGeneralLoading(false);
      }
    };
    
    fetchGeneralData();
  }, []);

  // Fetch transactions separately - this won't block the page from loading
  const fetchTransactions = async () => {
    if (transactionsLoaded) return; // Don't fetch if already loaded
    
    setIsTransactionsLoading(true);
    try {
      const response = await billingService.getUserTransactions();
      if (response.success) {
        setTransactions(response.data);
        setTransactionsLoaded(true);
      } else {
        throw new Error('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showError('Failed to load transactions');
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  // Trigger transaction fetch when component mounts (non-blocking)
  useEffect(() => {
    fetchTransactions();
  }, []);

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

  const filteredTransactions = transactions.filter(transaction =>
    transaction.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transaction_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.amount.toString().includes(searchTerm)
  );

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'PENDING':
        return <Hourglass className="w-3 h-3 text-yellow-500" />;
      case 'REJECTED':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isGeneralLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                Workplace
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track your usage, transactions, and activity
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back,</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{user?.first_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Coins className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Current Balance</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{usageStats.currentBalance} tokens</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Used</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{usageStats.totalTokensUsed} tokens</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Purchased</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{usageStats.totalTokensPurchased} tokens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-4">
        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Activity className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Transaction History</h2>
            </div>
            <div className="flex-1 relative max-w-md ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field input-field-sm pl-10"
              />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isTransactionsLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="text-center">
                <Loader2 className="animate-spin h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading transactions...</p>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center p-6">
              <Activity className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {searchTerm ? 'No transactions found matching your search' : 'No transactions yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                        <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                          {transaction.sender_name}
                          {transaction.wakala_name && (
                            <span className="text-gray-500 dark:text-gray-400 text-xs"> via {transaction.wakala_name}</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {getStatusIcon(transaction.transaction_status)}
                          <span className={`text-xs font-medium ${
                            transaction.transaction_status === 'APPROVED' ? 'text-green-600 dark:text-green-400' :
                            transaction.transaction_status === 'PENDING' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.transaction_status.charAt(0) + transaction.transaction_status.slice(1).toLowerCase()}
                          </span>
                          <span className="text-gray-400 text-xs">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{transaction.payment_method.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      {transaction.transaction_status === 'APPROVED' && (
                        <p className="font-semibold text-green-600 dark:text-green-400 text-sm">+{transaction.tokens_generated}</p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.amount} TSH</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkplacePage;