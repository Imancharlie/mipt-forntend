import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useToastContext } from '@/contexts/ToastContext';
import { adminDashboardService, UsersResponse } from '@/api/adminServices';
import { UserBalance } from '@/types';
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
  AlertTriangle
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
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose, userBalance, loadingBalance }) => {
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
              
              {loadingBalance ? (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <LoadingSpinner size="sm" />
                  Loading token information...
                </div>
              ) : userBalance ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Available Tokens</p>
                    <p className="text-lg font-bold text-green-600">{userBalance.available_tokens.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Tokens Used</p>
                    <p className="text-lg font-bold text-purple-600">{userBalance.tokens_used.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Payment Status</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {userBalance.payment_status.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No token information available</p>
              )}
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
    
    // Ensure token is set in API client
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      showError('No access token found. Please log in again.');
      return;
    }
    
    // Set the token in the API client
    setAuthToken(accessToken);
    
    try {
      await fetchAdminUserBalance(userId);
    } catch (error) {
      console.error(`Failed to load balance for user ${userId}:`, error);
      showError(`Failed to load balance for user ${userId}`);
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
                            const balance = adminUserBalances[userData.id];
                            const isLoading = adminLoading.userBalances;
                            
                            if (isLoading) {
                              return <LoadingSpinner size="sm" />;
                            }
                            
                            if (balance) {
                              return (
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {balance.available_tokens.toLocaleString()}
                                </span>
                              );
                            }
                            
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadUserBalance(userData.id);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Load
                              </button>
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
        />
      )}
    </div>
  );
};

export default UserManagementPage;