import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useToastContext } from '@/contexts/ToastContext';
import { adminDashboardService, UsersResponse } from '@/api/adminServices';
import { UserBalance, BackendUserBalance } from '@/types';
import { setAuthToken } from '@/api/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Users, 
  Search, 
  Filter, 
  Ban, 
  UserCheck, 
  Trash2, 
  CheckSquare, 
  Square,
  ChevronLeft,
  ChevronRight,
  Shield,
  Coins,
  Phone,
  Building2,
  Calendar,
  User,
  X,
  ExternalLink,
  Download,
  MoreVertical,
  Edit,
  Eye,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface UserFilters {
  search: string;
  program: string;
  status: string;
  date: string;
  page: number;
}

interface UserDetailModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  userBalance: UserBalance | null;
  loadingBalance: boolean;
  tokenSummary: any;
  adminUserBalances: any;
  loadUserBalance: (userId: number) => Promise<void>;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose, userBalance, loadingBalance, tokenSummary, adminUserBalances, loadUserBalance }) => {
  if (!isOpen) return null;

  const openWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {user.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Student ID:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{user.profile?.student_id || 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Program:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{user.profile?.program || 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Department:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{user.profile?.department || 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Company:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{user.profile?.company_name || 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Company Region:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{user.profile?.company_region || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date Joined:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(user.date_joined).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone:</span>
                  {user.profile?.phone_number ? (
                    <button
                      onClick={() => openWhatsApp(user.profile.phone_number)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <span>{user.profile.phone_number}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500">N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* Token Information */}
            <div className="border-t pt-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-600" />
                Token Information
              </h4>
              
              {(() => {
                // First check if we have the balance in the token summary (most reliable)
                const summaryBalance = tokenSummary?.balances?.find((b: any) => {
                  // Try different possible structures
                  if (b.user?.id === user.id) return true;
                  if (b.id === user.id) return true;
                  if (b.user === user.username) return true;
                  return false;
                });
                
                // Also check if we have it in the store
                const storeBalance = adminUserBalances[user.id];
                
                // Use summary balance if available, otherwise use store balance
                const displayBalance = summaryBalance || storeBalance;
                
                if (loadingBalance) {
                  return (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <LoadingSpinner size="sm" />
                      Loading token information...
                    </div>
                  );
                }
                
                if (displayBalance) {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Available Tokens</p>
                        <p className="text-lg font-bold text-green-600">
                          {displayBalance.available_tokens.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Tokens Used</p>
                        <p className="text-lg font-bold text-purple-600">
                          {displayBalance.tokens_used.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Payment Status</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {displayBalance.payment_status.toLowerCase().replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div className="text-center py-4">
                    <Coins className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 mb-3">No token information available</p>
                    <button
                      onClick={() => loadUserBalance(user.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Load Token Information
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagementPage: React.FC = () => {
  const { 
    user, 
    adminUsers, 
    adminUserBalances, 
    adminLoading,
    fetchAdminUsers, 
    performAdminUserAction, 
    fetchAdminUserBalance,
    initializeAuth
  } = useAppStore();
  
  const navigate = useNavigate();
  const { showError, showSuccess, showWarning } = useToastContext();
  
  // Local state for UI
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  
  // Token summary state
  const [tokenSummary, setTokenSummary] = useState<{ balances: BackendUserBalance[]; summary: any } | null>(null);
  const [tokenSummaryLoading, setTokenSummaryLoading] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    program: '',
    status: '',
    date: '',
    page: 1
  });

  // Load users using store function
  const loadUsers = async () => {
    try {
      await fetchAdminUsers(filters);
    } catch (error) {
      console.error('Failed to load users:', error);
      showError('Failed to load users. Please try again.');
    }
  };

  // Load user balance using store function
  const loadUserBalance = async (userId: number) => {
    if (adminUserBalances[userId] || adminLoading.userBalances) return;
    
    // Debug authentication before API call
    console.log('loadUserBalance - Before API call:', {
      userId,
      accessToken: localStorage.getItem('access_token') ? 'Present' : 'Missing',
      accessTokenValue: localStorage.getItem('access_token')?.substring(0, 20) + '...',
      user: user?.username,
      isStaff: user?.is_staff
    });
    
    // Since the individual user balance API is broken (returns same user data),
    // we rely on the token summary data which is already loaded
    if (tokenSummary && tokenSummary.balances) {
      const userBalance = tokenSummary.balances.find((balance: any) => {
        // Try different possible structures
        if (balance.user?.id === userId) return true;
        if (balance.id === userId) return true;
        if (balance.user === userId) return true;
        return false;
      });
      
      if (userBalance) {
        console.log(`Found balance for user ${userId} in token summary:`, userBalance);
        return; // Balance is already available in the table via tokenSummary
      }
    }
    
    console.warn(`User ${userId} not found in token summary. Individual API calls are disabled due to backend issues.`);
    showError(`User ${userId} balance not available. Please refresh the token summary.`);
  };

  // Load token summary
  const loadTokenSummary = async () => {
    try {
      setTokenSummaryLoading(true);
      const response = await adminDashboardService.billing.getUserBalances();
      if (response.success) {
        setTokenSummary(response.data);
        
        // Also populate individual user balances from the response
        if (response.data.balances) {
          // Create a map of user balances for quick lookup
          const balancesMap: { [key: number]: BackendUserBalance } = {};
          response.data.balances.forEach((balance: BackendUserBalance) => {
            // Try to get the user ID from different possible locations
            const userId = balance.user?.id || balance.id || (typeof balance.user === 'number' ? balance.user : undefined);
            if (userId !== undefined && typeof userId === 'number') {
              balancesMap[userId] = balance;
            }
          });
          
          // Update the store with all user balances at once
          // This will make the tokens immediately visible in the table
          // Note: We don't call individual API calls since they're broken (return same user data)
          // Instead, we rely on the token summary data which is already complete
          console.log(`Loaded ${response.data.balances.length} user balances from token summary`);
          console.log('Raw token summary response:', response.data.balances);
          console.log('User balances available:', response.data.balances.map(b => ({ 
            userId: b.user?.id || b.id || (typeof b.user === 'number' ? b.user : undefined), 
            username: b.user?.username || (typeof b.user === 'string' ? b.user : undefined), 
            available: b.available_tokens,
            used: b.tokens_used,
            status: b.payment_status
          })));
        }
      } else {
        showError('Failed to load token summary');
      }
    } catch (error) {
      console.error('Failed to load token summary:', error);
      showError('Failed to load token summary');
    } finally {
      setTokenSummaryLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is staff
    if (!user?.is_staff) {
      showError('Access denied. Staff privileges required.');
      navigate('/dashboard');
      return;
    }

    // Debug authentication state
    console.log('UserManagementPage - Authentication state:', {
      user: user,
      isStaff: user?.is_staff,
      tokens: localStorage.getItem('access_token') ? 'Present' : 'Missing',
      isAuthenticated: user ? 'Yes' : 'No'
    });

    // Ensure authentication is initialized
    if (user && !localStorage.getItem('access_token')) {
      console.warn('No access token found, attempting to re-authenticate...');
      // Try to initialize authentication
      initializeAuth().catch(() => {
        showError('Authentication token missing. Please log in again.');
        navigate('/login');
      });
      return;
    }

    loadUsers();
    loadTokenSummary(); // Load token summary on mount
  }, [user, navigate, showError, filters, initializeAuth]); // Added initializeAuth to dependency array

  const handleFilterChange = (key: keyof UserFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : Number(value) // Reset to page 1 when other filters change
    }));
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (!adminUsers) return;
    
    if (selectedUsers.length === adminUsers.users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(adminUsers.users.map(user => user.id));
    }
  };

  const handleUserClick = async (userData: any) => {
    setSelectedUser(userData);
    setShowUserDetail(true);
    
    // Load user balance
    try {
      await loadUserBalance(userData.id);
    } catch (error) {
      console.error('Failed to load user balance:', error);
    }
  };

  const openWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBulkAction = async (action: 'BAN' | 'UNBAN' | 'DELETE' | 'ACTIVATE', reason: string = '') => {
    if (selectedUsers.length === 0) {
      showWarning('Please select users first');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action.toLowerCase()} ${selectedUsers.length} user(s)?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoading(true);
      await performAdminUserAction({
        user_ids: selectedUsers,
        action,
        reason: reason || `Bulk ${action.toLowerCase()} action`
      });
      
      showSuccess(`Successfully ${action.toLowerCase()}ned ${selectedUsers.length} user(s)`);
      setSelectedUsers([]);
      setShowBulkActions(false);
      loadUsers();
    } catch (error) {
      showError(`Failed to ${action.toLowerCase()} users`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle individual user action
  const handleIndividualUserAction = async (userId: number, action: 'BAN' | 'UNBAN' | 'DELETE' | 'ACTIVATE', reason: string = '') => {
    const userData = adminUsers?.users.find(u => u.id === userId);
    if (!userData) return;

    const actionText = action === 'BAN' ? 'ban' : action === 'UNBAN' ? 'unban' : action === 'DELETE' ? 'delete' : 'activate';
    const confirmMessage = `Are you sure you want to ${actionText} ${userData.first_name} ${userData.last_name}?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoading(true);
      await performAdminUserAction({
        user_ids: [userId],
        action,
        reason: reason || `${actionText} action by admin`
      });
      
      showSuccess(`Successfully ${actionText}ed ${userData.first_name} ${userData.last_name}`);
      loadUsers(); // Refresh the user list
    } catch (error) {
      showError(`Failed to ${actionText} user`);
    } finally {
      setActionLoading(false);
    }
  };

  // Export users to CSV
  const exportUsersToCSV = async () => {
    if (!adminUsers?.users.length) {
      showWarning('No users to export');
      return;
    }

    try {
      setExportLoading(true);
      const response = await adminDashboardService.exportUsers({
        ...filters,
        format: 'csv'
      });
      
      if (response.success && response.data) {
        // Create and download CSV file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showSuccess('Users exported successfully!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export users. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      isActive 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  if (adminLoading.users && !adminUsers) {
    return <LoadingSpinner message="Loading users..." fullScreen />;
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
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage user accounts and permissions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {adminUsers && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(adminUsers.totalUsers || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-green-600">
                {(adminUsers.activeUsers || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 dark:text-gray-400">New This Week</p>
              <p className="text-2xl font-bold text-blue-600">
                {(adminUsers.newUsersWeek || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 dark:text-gray-400">New Today</p>
              <p className="text-2xl font-bold text-purple-600">
                {(adminUsers.newUsersToday || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Token Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm lg:text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-purple-600" />
              Token Overview
            </h3>
            <button
              onClick={loadTokenSummary}
              disabled={tokenSummaryLoading}
              className="flex items-center gap-2 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              {tokenSummaryLoading ? (
                <LoadingSpinner size="sm" inline color="white" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Refresh
            </button>
          </div>
          
          {tokenSummary ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Total Users</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {tokenSummary.summary.total_users.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Users with Tokens</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {tokenSummary.summary.users_with_tokens.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Available</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {tokenSummary.summary.total_tokens_available.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Total Used</p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                  {tokenSummary.summary.total_tokens_used.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Coins className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">No token summary available</p>
              <button
                onClick={loadTokenSummary}
                disabled={tokenSummaryLoading}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {tokenSummaryLoading ? 'Loading...' : 'Load Token Summary'}
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters & Actions</h3>
            <button
              onClick={exportUsersToCSV}
              disabled={!adminUsers?.users.length || exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export Users
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={filters.program}
              onChange={(e) => handleFilterChange('program', e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Programs</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Data Science">Data Science</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              disabled={selectedUsers.length === 0}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedUsers.length > 0
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Filter className="w-4 h-4" />
              Actions ({selectedUsers.length})
            </button>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedUsers.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-orange-800 dark:text-orange-400">
                Bulk Actions ({selectedUsers.length} users selected)
              </h3>
              <button
                onClick={() => setShowBulkActions(false)}
                className="text-orange-600 hover:text-orange-800"
              >
                ×
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction('BAN')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                Ban Users
              </button>
              <button
                onClick={() => handleBulkAction('UNBAN')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                Unban Users
              </button>
              <button
                onClick={() => handleBulkAction('ACTIVATE')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                Activate
              </button>
              <button
                onClick={() => {
                  if (window.confirm('This action cannot be undone. Are you sure?')) {
                    handleBulkAction('DELETE');
                  }
                }}
                disabled={actionLoading}
                className="flex items-center gap-2 px-3 py-1 bg-red-800 hover:bg-red-900 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Users
              </button>
            </div>
            {actionLoading && (
              <div className="mt-3 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <LoadingSpinner size="sm" />
                Processing...
              </div>
            )}
          </div>
        )}

        {/* Users Table */}
        {adminUsers && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="w-12 px-3 py-3 text-center">
                      <button
                        onClick={handleSelectAll}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Select All"
                      >
                        {selectedUsers.length === adminUsers.users.length ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tokens
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {adminUsers.users.map((userData) => (
                    <tr
                      key={userData.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedUsers.includes(userData.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="w-12 px-3 py-4 text-center">
                        <button
                          onClick={() => handleSelectUser(userData.id)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          {selectedUsers.includes(userData.id) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => handleUserClick(userData)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            {userData.profile_picture ? (
                              <img 
                                src={userData.profile_picture} 
                                alt={`${userData.first_name} ${userData.last_name}`}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {userData.first_name?.[0]}{userData.last_name?.[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {userData.first_name} {userData.last_name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              @{userData.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {userData.profile?.program || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {userData.profile?.phone_number ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openWhatsApp(userData.profile.phone_number);
                            }}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            <span>{userData.profile.phone_number}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(userData.is_active)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-purple-600" />
                          {(() => {
                            // First check if we have the balance in the token summary (most reliable)
                            // The backend might be returning balances without nested user objects
                            const summaryBalance = tokenSummary?.balances?.find(b => {
                              // Try different possible structures
                              if (b.user?.id === userData.id) return true;
                              if (b.id === userData.id) return true;
                              if (b.user === userData.username) return true;
                              return false;
                            });
                            
                            // Also check if we have it in the store
                            const balance = adminUserBalances[userData.id];
                            const isLoading = adminLoading.userBalances;
                            
                            if (isLoading) {
                              return <LoadingSpinner size="sm" />;
                            }
                            
                            // Prioritize summary balance over store balance
                            const displayBalance = summaryBalance || balance;
                            
                            if (displayBalance) {
                              return (
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-green-600 font-medium">
                                      {displayBalance.available_tokens.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-500">available</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-orange-600 font-medium">
                                      {displayBalance.tokens_used.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-500">used</span>
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {displayBalance.payment_status}
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Not available
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(userData.date_joined).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserClick(userData);
                            }}
                            className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Logic for dropdown menu
                              }}
                              className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="More actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {/* Dropdown content would go here */}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {adminUsers?.pagination && (
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((adminUsers.pagination?.page || 1) - 1) * 50 + 1} to{' '}
                    {Math.min((adminUsers.pagination?.page || 1) * 50, adminUsers.pagination?.totalCount || 0)} of{' '}
                    {adminUsers.pagination?.totalCount || 0} users
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                      disabled={!adminUsers.pagination?.hasPrevious}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Page {adminUsers.pagination?.page || 1} of {adminUsers.pagination?.pages || 1}
                    </span>
                    <button
                      onClick={() => handleFilterChange('page', filters.page + 1)}
                      disabled={!adminUsers.pagination?.hasNext}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={showUserDetail}
          onClose={() => setShowUserDetail(false)}
          userBalance={adminUserBalances[selectedUser.id] || null}
          loadingBalance={adminLoading.userBalances && !adminUserBalances[selectedUser.id]}
          tokenSummary={tokenSummary}
          adminUserBalances={adminUserBalances}
          loadUserBalance={loadUserBalance}
        />
      )}
    </div>
  );
};

export default UserManagementPage;