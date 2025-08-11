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
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import CreateTransactionForm from '@/components/CreateTransactionForm';

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
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationTransaction, setVerificationTransaction] = useState<Transaction | null>(null);
  const [showCreateTransactionModal, setShowCreateTransactionModal] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    status: '',
    payment_method: '',
    page: 1,
    user_id: ''
  });

  // Check if user has staff privileges
  useEffect(() => {
    if (user) {
      console.log('👤 User info:', {
        id: user.id,
        username: user.username,
        is_staff: user.is_staff
      });
      
      if (!user.is_staff) {
        console.warn('⚠️ User does not have staff privileges');
        showError('Access denied. Staff privileges required.');
        navigate('/dashboard');
        return;
      } else {
        console.log('✅ User has staff privileges, loading dashboard...');
        loadDashboardData();
      }
    } else {
      console.log('👤 No user found, redirecting to login...');
    }
  }, [user, navigate, showError]);

  // Reload data when filters change
  useEffect(() => {
    if (user?.is_staff) {
      loadTransactionsAndUpdateState(filters);
    }
  }, [filters.status, filters.payment_method, filters.user_id, filters.page]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading billing dashboard data...');
      
      // Load real data from backend
      const [statsData, transactionsData, pendingData] = await Promise.all([
        loadBillingStats(),
        loadTransactions(filters),
        loadPendingTransactions()
      ]);
      
      console.log('API Response - Stats:', statsData);
      console.log('API Response - Transactions:', transactionsData);
      console.log('API Response - Pending:', pendingData);
      
      setStats(statsData);
      setTransactions(transactionsData || []);
      setPendingTransactions(pendingData || []);
      
      console.log('State updated - transactions:', transactionsData?.length || 0);
      console.log('State updated - pending:', pendingData?.length || 0);
    } catch (error) {
      console.error('Dashboard load error:', error);
      showError('Failed to load billing dashboard data. Using mock data for demonstration.');
      // Set mock data on error
      setTransactions(getMockTransactions());
      setPendingTransactions(getMockPendingTransactions());
      setStats(getMockStats());
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh authentication token
  const refreshAuthToken = async () => {
    try {
      console.log('🔄 Attempting to refresh authentication token...');
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.error('❌ No refresh token available');
        showError('No refresh token available. Please log in again.');
        return false;
      }
      
      const response = await fetch('https://mipt.pythonanywhere.com/api/auth/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token refresh successful:', data);
        
        // Update tokens in localStorage
        if (data.access) {
          localStorage.setItem('access_token', data.access);
          console.log('🔑 New access token saved');
          showSuccess('Authentication token refreshed successfully!');
          return true;
        }
      } else {
        console.error('❌ Token refresh failed:', response.status);
        showError('Failed to refresh token. Please log in again.');
        return false;
      }
    } catch (error) {
      console.error('💥 Token refresh error:', error);
      showError('Token refresh failed. Please log in again.');
      return false;
    }
    
    return false;
  };

  // Function to check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    console.log('🔐 Authentication Status Check:');
    console.log('  - Access Token:', token ? `${token.substring(0, 20)}...` : 'None');
    console.log('  - Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None');
    console.log('  - Token Length:', token?.length || 0);
    
    if (token) {
      try {
        // Decode JWT token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiration = new Date(payload.exp * 1000);
        const now = new Date();
        
        console.log('  - Token Expiration:', expiration.toISOString());
        console.log('  - Current Time:', now.toISOString());
        console.log('  - Is Expired:', now > expiration);
        console.log('  - Time Until Expiry:', Math.floor((expiration.getTime() - now.getTime()) / 1000), 'seconds');
        
        if (now > expiration) {
          console.warn('⚠️ Token is expired!');
          showError('Authentication token is expired. Please log in again.');
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('❌ Failed to decode token:', error);
        return false;
      }
    }
    
    return false;
  };

  // Function to test API connectivity
  const testApiConnection = async () => {
    try {
      console.log('🧪 Testing API connection...');
      
      // Check authentication status first
      if (!checkAuthStatus()) {
        return null;
      }
      
      // Get the current authentication token
      const token = localStorage.getItem('access_token');
      console.log('🔑 Auth token available:', !!token);
      
      if (!token) {
        console.error('❌ No authentication token found');
        showError('No authentication token found. Please log in again.');
        return null;
      }
      
      const response = await fetch('https://mipt.pythonanywhere.com/api/billing/staff/transactions/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🌐 API Response Status:', response.status);
      console.log('🌐 API Response Headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🌐 API Response Data:', data);
        return data;
      } else if (response.status === 401) {
        console.error('❌ Authentication failed (401 Unauthorized)');
        showError('Authentication failed. Please log in again.');
        // Redirect to login or refresh token
        return null;
      } else {
        console.error('🌐 API Error Status:', response.status);
        showError(`API Error: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('🌐 API Connection Error:', error);
      showError('Failed to connect to API. Please check your connection.');
      return null;
    }
  };

  // Function to load transactions and update state
  const loadTransactionsAndUpdateState = async (filters: TransactionFilters) => {
    try {
      console.log('🔄 Loading transactions with filters:', filters);
      const transactionsData = await loadTransactions(filters);
      console.log('📊 Transactions loaded:', transactionsData);
      setTransactions(transactionsData);
      console.log('✅ Transactions state updated with:', transactionsData.length, 'transactions');
      
      // Show success message
      if (transactionsData.length > 0) {
        showSuccess(`Successfully loaded ${transactionsData.length} transactions!`);
      } else {
        showSuccess('No transactions found matching the current filters.');
      }
    } catch (error) {
      console.error('❌ Failed to load and update transactions:', error);
      showError('Failed to load transactions. Please try again.');
      
      // Try to test API connection
      console.log('🔍 Testing API connection as fallback...');
      const apiTest = await testApiConnection();
      if (apiTest) {
        console.log('🌐 API is reachable, trying to parse data...');
        // Try to use the test data
        if (apiTest.data && Array.isArray(apiTest.data)) {
          setTransactions(apiTest.data);
          console.log('✅ Used API test data:', apiTest.data.length, 'transactions');
        }
      }
    }
  };

  const loadBillingStats = async (): Promise<BillingStats> => {
    try {
      const response = await adminDashboardService.billing.getBillingStats();
      console.log('Billing stats response:', response);
      
      if (response.success && response.data) {
        const data = response.data;
        return {
          total_revenue: data.revenue?.total || 0,
          pending_transactions: data.transactions?.pending || 0,
          approved_transactions: data.transactions?.approved || 0,
          rejected_transactions: data.transactions?.rejected || 0,
          total_tokens_distributed: data.tokens?.total_generated || 0,
          active_subscribers: data.transactions?.approved || 0
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Failed to load billing stats:', error);
      return getMockStats();
    }
  };

  const loadTransactions = async (filters: TransactionFilters): Promise<Transaction[]> => {
    try {
      setTransactionsLoading(true);
      console.log('🔍 Loading transactions with filters:', filters);
      
      // Use the staff endpoint to get ALL transactions across all users
      const response = await adminDashboardService.billing.getTransactions({
        status: filters.status || undefined,
        payment_method: filters.payment_method || undefined,
        page: filters.page,
        user_id: filters.user_id ? parseInt(filters.user_id) : undefined
      });
      
      console.log('📡 Staff transactions API response:', response);
      console.log('📊 Response structure:', {
        success: response.success,
        hasData: !!response.data,
        dataType: typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'Not an array'
      });
      
      if (response.success && response.data && Array.isArray(response.data)) {
        console.log('✅ Successfully loaded', response.data.length, 'transactions');
        return response.data;
      } else if (response.success && response.data) {
        console.log('⚠️ Response successful but data format unexpected:', response.data);
        // Try to handle different response formats
        if (typeof response.data === 'object' && 'results' in response.data && Array.isArray(response.data.results)) {
          console.log('📋 Found results in data.results:', response.data.results.length, 'transactions');
          return response.data.results as Transaction[];
        }
        return [];
      } else {
        console.log('❌ Response not successful or no data');
        return [];
      }
    } catch (error) {
      console.error('💥 Failed to load staff transactions:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      return getMockTransactions();
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadPendingTransactions = async (): Promise<Transaction[]> => {
    try {
      // Use the staff endpoint to get pending transactions across all users
      const response = await adminDashboardService.billing.getPendingTransactions();
      console.log('Staff pending transactions response:', response);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to load staff pending transactions:', error);
      return getMockPendingTransactions();
    }
  };

  // Mock data functions
  const getMockStats = (): BillingStats => ({
    total_revenue: 15000,
    pending_transactions: 2,
    approved_transactions: 25,
    rejected_transactions: 3,
    total_tokens_distributed: 4500,
    active_subscribers: 18
  });

  const getMockTransactions = (): Transaction[] => [
              {
                id: 1,
                user: 'john_doe',
                user_full_name: 'John Doe',
                user_phone_number: '0712345678',
                sender_name: 'John Doe',
                payment_method: 'DIRECT',
      wakala_name: undefined,
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
  ];

  const getMockPendingTransactions = (): Transaction[] => [
              {
                id: 3,
                user: 'mike_johnson',
                user_full_name: 'Mike Johnson',
                user_phone_number: '0734567890',
                sender_name: 'Mike Johnson',
                payment_method: 'DIRECT',
              
                transaction_status: 'PENDING',
                amount: '2000.00',
                tokens_generated: 0,
              
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
                
                created_at: new Date(Date.now() - 1800000).toISOString(),
                updated_at: new Date(Date.now() - 1800000).toISOString()
              }
  ];

  const handleApproveTransaction = async (transactionId: number) => {
    if (!window.confirm('Are you sure you want to approve this transaction?')) return;

    try {
      setActionLoading(transactionId);
      const response = await adminDashboardService.billing.approveTransaction(transactionId);
      
      if (response.success) {
        showSuccess(response.message || 'Transaction approved successfully');
        // Reload data to reflect changes
        await loadDashboardData();
      } else {
        showError(response.message || 'Failed to approve transaction');
      }
    } catch (error) {
      console.error('Approval error:', error);
      showError('Failed to approve transaction');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectTransaction = async (transactionId: number) => {
    if (!window.confirm('Are you sure you want to reject this transaction?')) {
      return;
    }

    try {
      setActionLoading(transactionId);
      const response = await adminDashboardService.billing.rejectTransaction(transactionId);
      
      if (response.success) {
        showSuccess(response.message || 'Transaction rejected successfully');
        // Reload data to reflect changes
        await loadDashboardData();
      } else {
        showError(response.message || 'Failed to reject transaction');
      }
    } catch (error) {
      console.error('Rejection error:', error);
      showError('Failed to reject transaction');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTransaction = async (transactionData: {
    user_id: number;
    user_phone_number: string;
    sender_name: string;
    payment_method: 'DIRECT' | 'WAKALA';
    wakala_name?: string;
    amount: number;
  }) => {
    try {
      const response = await adminDashboardService.billing.createTransaction(transactionData);
      
      if (response.success) {
        showSuccess(response.message || 'Transaction created successfully');
        setShowCreateTransactionModal(false);
        // Reload data to show new transaction
        await loadDashboardData();
      } else {
        showError(response.message || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Transaction creation error:', error);
      showError('Failed to create transaction');
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
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Billing Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage transactions and user billing
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={loadDashboardData}
              className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateTransactionModal(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Create Transaction</span>
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Pending Transactions</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.pending_transactions}
                  </p>
                  <p className="text-xs sm:text-sm text-yellow-600 mt-1">Awaiting approval</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-yellow-500">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Approved Transactions</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.approved_transactions}
                  </p>
                  <p className="text-xs sm:text-sm text-green-600 mt-1">Successfully processed</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-green-500">
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(stats.total_revenue)}
                  </p>
                  <p className="text-xs sm:text-sm text-blue-600 mt-1">All time</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-blue-500">
                  <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscribers</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.active_subscribers}
                  </p>
                  <p className="text-xs sm:text-sm text-purple-600 mt-1">Paid users</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-purple-500">
                  <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Tokens Distributed</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.total_tokens_distributed.toLocaleString()}
                  </p>
                  <p className="text-xs sm:text-sm text-orange-600 mt-1">All time</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-orange-500">
                  <Coins className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Rejected Transactions</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.rejected_transactions}
                  </p>
                  <p className="text-xs sm:text-sm text-red-600 mt-1">Declined</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-red-500">
                  <XCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Section */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Recent Activity
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        transaction.transaction_status === 'APPROVED' ? 'bg-green-500' :
                        transaction.transaction_status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {transaction.user_full_name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {transaction.payment_method} • {formatCurrency(parseFloat(transaction.amount))}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                    No recent transactions
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                Quick Actions
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => window.open('/admin/users', '_blank')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">User Management</span>
                  <span className="sm:hidden">User Management</span>
                </button>
                <button
                  onClick={() => window.open('/admin', '_blank')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                >
                  <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin Dashboard</span>
                </button>
                <button
                  onClick={() => window.open('/admin/analytics', '_blank')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                >
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">View Analytics</span>
                  <span className="sm:hidden">Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Transactions Section */}
        {pendingTransactions && pendingTransactions.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 sm:p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-800 dark:text-yellow-400 text-sm sm:text-base">
                  {pendingTransactions.length} transaction(s) awaiting approval across all users
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Pending Approvals
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  All pending transactions requiring staff verification
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        User
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Payment Method
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(pendingTransactions || []).map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                {transaction.user_full_name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {transaction.sender_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                              {formatCurrency(parseFloat(transaction.amount))}
                            </span>
                            <span className="text-xs text-gray-500">
                              (~{Math.round(parseFloat(transaction.amount) * 0.3)} tokens)
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-col gap-1">
                            {getPaymentMethodBadge(transaction.payment_method)}
                            {transaction.wakala_name && (
                              <p className="text-xs text-gray-500 truncate">via {transaction.wakala_name}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                              {transaction.user_phone_number}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowTransactionModal(true);
                              }}
                              className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setVerificationTransaction(transaction);
                                setShowVerificationModal(true);
                              }}
                              className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Verify payment"
                            >
                              <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleApproveTransaction(transaction.id)}
                              disabled={actionLoading === transaction.id}
                              className="p-1.5 sm:p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoading === transaction.id ? (
                                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectTransaction(transaction.id)}
                              disabled={actionLoading === transaction.id}
                              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              {actionLoading === transaction.id ? (
                                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
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
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  All Transactions
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Complete transaction history across all users in the system
                </p>
                {transactionsLoading && (
                  <div className="flex items-center gap-2 mt-2">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                    <span className="text-xs text-blue-600">Loading transactions...</span>
                  </div>
                )}
              </div>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
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

                <button
                  onClick={() => loadTransactions(filters)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  title="Refresh transactions data"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">Loading transactions...</span>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      User
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount & Tokens
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Method
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirmed By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(transactions || []).map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                              {transaction.user_full_name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {transaction.sender_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                            {formatCurrency(parseFloat(transaction.amount))}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.tokens_generated} tokens generated
                          </p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col gap-1">
                          {getPaymentMethodBadge(transaction.payment_method)}
                          {transaction.wakala_name && (
                            <p className="text-xs text-gray-500 truncate">via {transaction.wakala_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        {getStatusBadge(transaction.transaction_status)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {transaction.confirmed_by_name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {(!transactions || transactions.length === 0) && (
            <div className="text-center py-8 sm:py-12">
              <CreditCard className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                No transactions found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {filters.status || filters.payment_method || filters.user_id 
                  ? 'No transactions match the current filters. Try adjusting your search criteria.'
                  : 'Transactions will appear here once users start making payments.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => {
                    setFilters({ status: '', payment_method: '', page: 1, user_id: '' });
                    loadTransactionsAndUpdateState({ status: '', payment_method: '', page: 1, user_id: '' });
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => {
                    console.log('📋 Loading sample data for testing...');
                    setTransactions(getMockTransactions());
                    showSuccess('Loaded sample data for testing purposes');
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                >
                  Load Sample Data
                </button>
              </div>
            </div>
          )}

          {/* Transactions Summary */}
          {transactions && transactions.length > 0 && (
            <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing <strong>{transactions.length}</strong> transaction{transactions.length !== 1 ? 's' : ''}
                  {filters.status && ` with status: ${filters.status}`}
                  {filters.payment_method && ` using ${filters.payment_method} payment method`}
                  {filters.user_id && ` for user: ${filters.user_id}`}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    Total: {transactions.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Details Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">User</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">{selectedTransaction.user_full_name}</p>
                </div>
                
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Sender Name</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">{selectedTransaction.sender_name}</p>
                </div>
                
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">{selectedTransaction.user_phone_number}</p>
                </div>
                
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Amount</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">{formatCurrency(parseFloat(selectedTransaction.amount))}</p>
                </div>
                
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</label>
                  <div className="mt-1">{getPaymentMethodBadge(selectedTransaction.payment_method)}</div>
                </div>
                
                {selectedTransaction.wakala_name && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Wakala Agent</label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">{selectedTransaction.wakala_name}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.transaction_status)}</div>
                </div>
                
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                    {new Date(selectedTransaction.created_at).toLocaleString()}
                  </p>
                </div>
                
                {selectedTransaction.transaction_status === 'PENDING' && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-4">
                    <button
                      onClick={() => {
                        handleApproveTransaction(selectedTransaction.id);
                        setShowTransactionModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleRejectTransaction(selectedTransaction.id);
                        setShowTransactionModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
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

        {/* Create Transaction Modal */}
        {showCreateTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Create Transaction
                </h3>
                <button
                  onClick={() => setShowCreateTransactionModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                >
                  ×
                </button>
              </div>
              
              <CreateTransactionForm
                onSubmit={handleCreateTransaction}
                onCancel={() => setShowCreateTransactionModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingDashboardPage;