import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useToastContext } from '@/contexts/ToastContext';
import { adminDashboardService } from '@/api/adminServices';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PaymentVerificationModal } from '@/components/PaymentVerificationModal';
import { Transaction, UserBalance } from '@/types';
import { 
  CreditCard, 
  ChevronLeft, 
  DollarSign, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  RefreshCw,
  Shield,
  Coins,
  TrendingUp,
  AlertTriangle,
  Eye,
  Phone,
  User,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface BillingStats {
  total_revenue: number;
  pending_transactions: number;
  approved_transactions: number;
  rejected_transactions: number;
  total_tokens_distributed: number;
  active_subscribers: number;
}

interface TransactionFilters {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | '';
  payment_method: 'DIRECT' | 'WAKALA' | '';
  page: number;
  user_id: string;
}

const BillingDashboardPage: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToastContext();
  
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationTransaction, setVerificationTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    status: '',
    payment_method: '',
    page: 1,
    user_id: ''
  });

  useEffect(() => {
    // Check if user is staff
    if (!user?.is_staff) {
      showError('Access denied. Staff privileges required.');
      navigate('/dashboard');
      return;
    }

    loadDashboardData();
  }, [user, navigate, showError, filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading billing dashboard data...');
      
      // First, check if the API is reachable
      console.log('Performing API health check...');
      try {
        const healthResult = await adminDashboardService.healthCheck();
        console.log('API Health Check Result:', healthResult);
      } catch (healthError) {
        console.error('API Health Check failed:', healthError);
      }
      
      const [statsData, transactionsData, pendingData] = await Promise.all([
        loadBillingStats(),
        adminDashboardService.billing.getTransactions(filters).catch((error) => {
          console.error('Failed to load transactions:', error);
          // Return mock data for testing
          return { 
            success: false, 
            data: [
              {
                id: 1,
                user: 'john_doe',
                user_full_name: 'John Doe',
                user_phone_number: '0712345678',
                sender_name: 'John Doe',
                payment_method: 'DIRECT',
                wakala_name: null,
                transaction_status: 'APPROVED',
                amount: '5000.00',
                tokens_generated: 1500,
                confirmed_by_name: 'Admin User',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              {
                id: 2,
                user: 'jane_smith',
                user_full_name: 'Jane Smith',
                user_phone_number: '0723456789',
                sender_name: 'Jane Smith',
                payment_method: 'WAKALA',
                wakala_name: 'M-Pesa Agent Kariakoo',
                transaction_status: 'REJECTED',
                amount: '3000.00',
                tokens_generated: 0,
                confirmed_by_name: 'Admin User',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                updated_at: new Date(Date.now() - 86400000).toISOString()
              }
            ]
          };
        }),
        adminDashboardService.billing.getPendingTransactions().catch((error) => {
          console.error('Failed to load pending transactions:', error);
          // Return mock data for testing
          return { 
            success: false, 
            data: [
              {
                id: 3,
                user: 'mike_johnson',
                user_full_name: 'Mike Johnson',
                user_phone_number: '0734567890',
                sender_name: 'Mike Johnson',
                payment_method: 'DIRECT',
                wakala_name: null,
                transaction_status: 'PENDING',
                amount: '2000.00',
                tokens_generated: 0,
                confirmed_by_name: null,
                created_at: new Date(Date.now() - 3600000).toISOString(),
                updated_at: new Date(Date.now() - 3600000).toISOString()
              },
              {
                id: 4,
                user: 'sarah_wilson',
                user_full_name: 'Sarah Wilson',
                user_phone_number: '0745678901',
                sender_name: 'Sarah Wilson',
                payment_method: 'WAKALA',
                wakala_name: 'Vodacom M-Pesa',
                transaction_status: 'PENDING',
                amount: '4000.00',
                tokens_generated: 0,
                confirmed_by_name: null,
                created_at: new Date(Date.now() - 1800000).toISOString(),
                updated_at: new Date(Date.now() - 1800000).toISOString()
              }
            ]
          };
        })
      ]);
      
      console.log('API Response - Stats:', statsData);
      console.log('API Response - Transactions:', transactionsData);
      console.log('API Response - Pending:', pendingData);
      
      setStats(statsData);
      setTransactions(transactionsData?.data || []);
      setPendingTransactions(pendingData?.data || []);
      
      console.log('State updated - transactions:', transactionsData?.data?.length || 0);
      console.log('State updated - pending:', pendingData?.data?.length || 0);
    } catch (error) {
      console.error('Dashboard load error:', error);
      showError('Failed to load billing dashboard data. Backend may not be running.');
      // Set default empty values on error
      setTransactions([]);
      setPendingTransactions([]);
      setStats({
        total_revenue: 0,
        pending_transactions: 0,
        approved_transactions: 0,
        rejected_transactions: 0,
        total_tokens_distributed: 0,
        active_subscribers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBillingStats = async (): Promise<BillingStats> => {
    try {
      console.log('BillingDashboardPage: Calling getBillingStats...');
      const stats = await adminDashboardService.billing.getBillingStats();
      console.log('BillingDashboardPage: Received stats:', stats);
      return stats;
    } catch (error) {
      console.error('BillingDashboardPage: Failed to load billing stats:', error);
      // Fallback with mock data if endpoint doesn't exist yet
      const fallbackStats = {
        total_revenue: 15000,
        pending_transactions: pendingTransactions?.length || 2,
        approved_transactions: 25,
        rejected_transactions: 3,
        total_tokens_distributed: 4500,
        active_subscribers: 18
      };
      console.log('BillingDashboardPage: Using fallback stats:', fallbackStats);
      return fallbackStats;
    }
  };

  const handleApproveTransaction = async (transactionId: number) => {
    if (!window.confirm('Are you sure you want to approve this transaction?')) return;

    try {
      setActionLoading(transactionId);
      await adminDashboardService.billing.approveTransaction(transactionId);
      showSuccess('Transaction approved successfully');
      loadDashboardData();
    } catch (error) {
      showError('Failed to approve transaction');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectTransaction = async (transactionId: number) => {
    if (!window.confirm('Are you sure you want to reject this transaction?')) return;

    try {
      setActionLoading(transactionId);
      await adminDashboardService.billing.rejectTransaction(transactionId);
      showSuccess('Transaction rejected successfully');
      loadDashboardData();
    } catch (error) {
      showError('Failed to reject transaction');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      'APPROVED': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      'REJECTED': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </div>
    );
  };

  const getPaymentMethodBadge = (method: string) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      method === 'DIRECT' 
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    }`}>
      {method}
    </span>
  );

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} TZS`;

  if (loading) {
    return <LoadingSpinner message="Loading billing dashboard..." fullScreen />;
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
                Billing Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage transactions and user billing
              </p>
            </div>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.pending_transactions}
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">Awaiting approval</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.approved_transactions}
                  </p>
                  <p className="text-sm text-green-600 mt-1">Successfully processed</p>
                </div>
                <div className="p-3 rounded-full bg-green-500">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(stats.total_revenue)}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">All time</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.active_subscribers}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">Paid users</p>
                </div>
                <div className="p-3 rounded-full bg-purple-500">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tokens Distributed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.total_tokens_distributed.toLocaleString()}
                  </p>
                  <p className="text-sm text-orange-600 mt-1">All time</p>
                </div>
                <div className="p-3 rounded-full bg-orange-500">
                  <Coins className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.rejected_transactions}
                  </p>
                  <p className="text-sm text-red-600 mt-1">Declined</p>
                </div>
                <div className="p-3 rounded-full bg-red-500">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Transactions Section */}
        {pendingTransactions && pendingTransactions.length > 0 && (
          <div className="mb-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-800 dark:text-yellow-400">
                  {pendingTransactions.length} transaction(s) awaiting approval
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pending Approvals
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
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
                    {(pendingTransactions || []).map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {transaction.user_full_name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {transaction.sender_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(parseFloat(transaction.amount))}
                            </span>
                            <span className="text-sm text-gray-500">
                              (~{Math.round(parseFloat(transaction.amount) * 0.3)} tokens)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getPaymentMethodBadge(transaction.payment_method)}
                          {transaction.wakala_name && (
                            <p className="text-xs text-gray-500 mt-1">via {transaction.wakala_name}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {transaction.user_phone_number}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowTransactionModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setVerificationTransaction(transaction);
                                setShowVerificationModal(true);
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Verify payment"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproveTransaction(transaction.id)}
                              disabled={actionLoading === transaction.id}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoading === transaction.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectTransaction(transaction.id)}
                              disabled={actionLoading === transaction.id}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              {actionLoading === transaction.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* All Transactions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Transactions
              </h3>
              
              {/* Filters */}
              <div className="flex items-center gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any, page: 1 }))}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <select
                  value={filters.payment_method}
                  onChange={(e) => setFilters(prev => ({ ...prev, payment_method: e.target.value as any, page: 1 }))}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Methods</option>
                  <option value="DIRECT">Direct</option>
                  <option value="WAKALA">Wakala</option>
                </select>

                <input
                  type="text"
                  placeholder="Search user..."
                  value={filters.user_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, user_id: e.target.value, page: 1 }))}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount & Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmed By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(transactions || []).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.user_full_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {transaction.sender_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(parseFloat(transaction.amount))}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.tokens_generated} tokens generated
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentMethodBadge(transaction.payment_method)}
                      {transaction.wakala_name && (
                        <p className="text-xs text-gray-500 mt-1">via {transaction.wakala_name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(transaction.transaction_status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {transaction.confirmed_by_name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!transactions || transactions.length === 0) && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Transactions will appear here once users start making payments.
              </p>
            </div>
          )}
        </div>

        {/* Transaction Details Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">User</label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.user_full_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sender Name</label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.sender_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</label>
                  <p className="text-gray-900 dark:text-white">{selectedTransaction.user_phone_number}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</label>
                  <p className="text-gray-900 dark:text-white">{formatCurrency(parseFloat(selectedTransaction.amount))}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</label>
                  <div className="mt-1">{getPaymentMethodBadge(selectedTransaction.payment_method)}</div>
                </div>
                
                {selectedTransaction.wakala_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Wakala Agent</label>
                    <p className="text-gray-900 dark:text-white">{selectedTransaction.wakala_name}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.transaction_status)}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedTransaction.created_at).toLocaleString()}
                  </p>
                </div>
                
                {selectedTransaction.transaction_status === 'PENDING' && (
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        handleApproveTransaction(selectedTransaction.id);
                        setShowTransactionModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleRejectTransaction(selectedTransaction.id);
                        setShowTransactionModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Verification Modal */}
        <PaymentVerificationModal
          isOpen={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false);
            setVerificationTransaction(null);
          }}
          transaction={verificationTransaction}
          onVerificationComplete={() => {
            loadDashboardData();
          }}
        />
      </div>
    </div>
  );
};

export default BillingDashboardPage;
