import { apiClient, handleApiError } from './client';
import { AxiosError } from 'axios';
import { Transaction, UserBalance, BillingStats } from '@/types';

// Types
export interface DashboardStats {
  total_users: number;
  active_users: number;
  new_users_this_week: number;
  new_users_this_month: number;
  total_daily_reports: number;
  total_weekly_reports: number;
  reports_this_week: number;
  reports_this_month: number;
  total_companies: number;
  active_companies: number;
  total_tokens_used: number;
  tokens_this_week: number;
  tokens_this_month: number;
}

export interface AdminUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  date_joined: string;
  profile_picture?: string;
  profile: {
    student_id: string;
    program: string;
    department: string;
    phone_number?: string;
    company_name?: string;
    company_region?: string;
  };
}

export interface UsersResponse {
  users: AdminUser[];
  total_users: number;
  active_users: number;
  new_users_today: number;
  new_users_week: number;
  pagination: {
    page: number;
    pages: number;
    has_next: boolean;
    has_previous: boolean;
    total_count: number;
  };
}

export interface UserActionRequest {
  user_ids: number[];
  action: 'BAN' | 'UNBAN' | 'DELETE' | 'ACTIVATE';
  reason: string;
}

export interface TokenAnalytics {
  days: number;
  start_date: string;
  end_date: string;
  daily_usage: {
    created_at__date: string;
    total_tokens: number;
    count: number;
  }[];
  user_usage: {
    user__username: string;
    total_tokens: number;
    count: number;
  }[];
  enhancement_usage: {
    enhancement_type: string;
    total_tokens: number;
    count: number;
  }[];
  content_usage: {
    content_type: string;
    total_tokens: number;
    count: number;
  }[];
  total_tokens: number;
  period_tokens: number;
  total_enhancements: number;
  period_enhancements: number;
}

export interface ReportAnalytics {
  days: number;
  start_date: string;
  end_date: string;
  daily_reports_stats: {
    created_at__date: string;
    count: number;
    total_hours: number;
  }[];
  weekly_reports_stats: {
    created_at__date: string;
    count: number;
    total_hours: number;
  }[];
  user_report_activity: {
    student__username: string;
    report_count: number;
    total_hours: number;
  }[];
  total_weekly_reports: number;
  completed_weekly_reports: number;
  completion_rate: number;
  program_stats: {
    student__profile__program: string;
    report_count: number;
    total_hours: number;
  }[];
}

export interface RecentActivity {
  recent_users: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    date_joined: string;
  }[];
  recent_reports: {
    student__username: string;
    student__first_name: string;
    student__last_name: string;
    date: string;
    hours_spent: number;
    created_at: string;
  }[];
  recent_ai_logs: {
    user__username: string;
    user__first_name: string;
    user__last_name: string;
    enhancement_type: string;
    content_type: string;
    tokens_consumed: number;
    created_at: string;
  }[];
  recent_actions: {
    admin_user: string;
    target_user: string;
    action: string;
    reason: string;
    created_at: string;
  }[];
  program_stats: {
    program: string;
    count: number;
  }[];
  industry_stats: {
    industry_type: string;
    count: number;
  }[];
}

export interface TokenUsage {
  id: number;
  user: number;
  tokens_consumed: number;
  enhancement_type: string;
  content_type: string;
  cost_estimate: number | null;
  created_at: string;
}

export interface UserAction {
  id: number;
  admin_user: string;
  target_user: string;
  action: string;
  reason: string;
  created_at: string;
}

export interface SystemMetrics {
  id: number;
  total_users: number;
  total_reports: number;
  total_companies: number;
  total_tokens_used: number;
  total_cost: number;
  date: string;
  created_at: string;
}

// Admin Dashboard Services
export const adminDashboardService = {
  // Dashboard Statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get('/admin-dashboard/api/dashboard/stats/');
      return response.data.data; // Extract the data property
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // User Management
  getUsers: async (params: {
    search?: string;
    program?: string;
    status?: string;
    date?: string;
    page?: number;
  } = {}): Promise<UsersResponse> => {
    try {
      const response = await apiClient.get('/admin-dashboard/api/users/', { params });
      return response.data.data; // Extract the data property
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  performUserAction: async (actionData: UserActionRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/admin-dashboard/api/users/actions/', actionData);
      return response.data.data || response.data; // Extract data property if it exists, otherwise use response.data
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // Token Analytics
  getTokenAnalytics: async (days: number = 30): Promise<TokenAnalytics> => {
    try {
      const response = await apiClient.get('/admin-dashboard/api/tokens/analytics/', {
        params: { days }
      });
      return response.data.data; // Extract the data property
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // Report Analytics
  getReportAnalytics: async (days: number = 30): Promise<ReportAnalytics> => {
    try {
      const response = await apiClient.get('/admin-dashboard/api/reports/analytics/', {
        params: { days }
      });
      return response.data.data; // Extract the data property
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // Recent Activity
  getRecentActivity: async (): Promise<RecentActivity> => {
    try {
      const response = await apiClient.get('/admin-dashboard/api/recent-activity/');
      return response.data.data; // Extract the data property
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // Token Usage Management
  getTokenUsage: async (params: {
    enhancement_type?: string;
    content_type?: string;
    created_at?: string;
    search?: string;
    page?: number;
  } = {}): Promise<{ results: TokenUsage[]; count: number }> => {
    try {
      const response = await apiClient.get('/admin-dashboard/api/token-usage/', { params });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  createTokenUsage: async (data: Partial<TokenUsage>): Promise<TokenUsage> => {
    try {
      const response = await apiClient.post('/admin-dashboard/api/token-usage/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  updateTokenUsage: async (id: number, data: Partial<TokenUsage>): Promise<TokenUsage> => {
    try {
      const response = await apiClient.put(`/admin-dashboard/api/token-usage/${id}/`, data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  deleteTokenUsage: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin-dashboard/api/token-usage/${id}/`);
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // User Actions Management
  getUserActions: async (params: {
    action?: string;
    created_at?: string;
    search?: string;
    page?: number;
  } = {}): Promise<{ results: UserAction[]; count: number }> => {
    try {
      const response = await apiClient.get('/admin-dashboard/api/user-actions/', { params });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  createUserAction: async (data: Partial<UserAction>): Promise<UserAction> => {
    try {
      const response = await apiClient.post('/admin-dashboard/api/user-actions/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // System Metrics Management
  getSystemMetrics: async (params: {
    date?: string;
    page?: number;
  } = {}): Promise<{ results: SystemMetrics[]; count: number }> => {
    try {
      const response = await apiClient.get('/admin-dashboard/api/system-metrics/', { params });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  createSystemMetrics: async (data: Partial<SystemMetrics>): Promise<SystemMetrics> => {
    try {
      const response = await apiClient.post('/admin-dashboard/api/system-metrics/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  updateSystemMetrics: async (id: number, data: Partial<SystemMetrics>): Promise<SystemMetrics> => {
    try {
      const response = await apiClient.put(`/admin-dashboard/api/system-metrics/${id}/`, data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  deleteSystemMetrics: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin-dashboard/api/system-metrics/${id}/`);
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // Billing System Integration
  billing: {
    // Get all transactions with filters (staff only - returns all transactions across all users)
    getTransactions: async (params?: {
      status?: 'PENDING' | 'APPROVED' | 'REJECTED';
      payment_method?: 'DIRECT' | 'WAKALA';
      page?: number;
      user_id?: number;
    }): Promise<{ success: boolean; data: Transaction[]; pagination?: any }> => {
      try {
        // This endpoint requires staff privileges and returns ALL transactions
        const response = await apiClient.get('/billing/staff/transactions/', { params });
        console.log('Staff transactions API response:', response.data);
        
        // Handle the actual backend response structure
        if (response.data && typeof response.data === 'object') {
          // Backend returns: { count, next, previous, results: [...] }
          if ('results' in response.data && Array.isArray(response.data.results)) {
            return {
              success: true,
              data: response.data.results,
              pagination: {
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous
              }
            };
          }
          // If it's already an array, wrap it
          if (Array.isArray(response.data)) {
            return {
              success: true,
              data: response.data,
              pagination: {}
            };
          }
        }
        
        // Fallback to original structure
        return response.data;
      } catch (error) {
        console.error('Failed to get staff transactions:', error);
        handleApiError(error as AxiosError);
        throw error;
      }
    },

    // Get pending transactions for approval (staff only - returns pending transactions across all users)
    getPendingTransactions: async (): Promise<{ success: boolean; data: Transaction[] }> => {
      try {
        // This endpoint requires staff privileges and returns ALL pending transactions
        const response = await apiClient.get('/billing/staff/transactions/pending_transactions/');
        console.log('Staff pending transactions API response:', response.data);
        
        // Handle the actual backend response structure
        if (response.data && typeof response.data === 'object') {
          // Backend returns: { count, next, previous, results: [...] }
          if ('results' in response.data && Array.isArray(response.data.results)) {
            return {
              success: true,
              data: response.data.results
            };
          }
          // If it's already an array, wrap it
          if (Array.isArray(response.data)) {
            return {
              success: true,
              data: response.data
            };
          }
        }
        
        // Fallback to original structure
        return response.data;
      } catch (error) {
        console.error('Failed to get staff pending transactions:', error);
        handleApiError(error as AxiosError);
        throw error;
      }
    },

    // Create transaction on behalf of user
    createTransaction: async (data: {
      user_id: number;
      user_phone_number: string;
      sender_name: string;
      payment_method: 'DIRECT' | 'WAKALA';
      wakala_name?: string;
      amount: number;
    }): Promise<{ success: boolean; message: string; data: Transaction }> => {
      try {
        const response = await apiClient.post('/billing/staff/transactions/', data);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
        throw error;
      }
    },

    // Approve transaction
    approveTransaction: async (transactionId: number): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await apiClient.post(`/billing/staff/transactions/${transactionId}/approve_transaction/`);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
        throw error;
      }
    },

    // Reject transaction
    rejectTransaction: async (transactionId: number): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await apiClient.post(`/billing/staff/transactions/${transactionId}/reject_transaction/`);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
        throw error;
      }
    },

    // Get user balance
    getUserBalance: async (userId: number): Promise<{ success: boolean; data: UserBalance }> => {
      try {
        const response = await apiClient.get(`/billing/balance/${userId}/`);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
        throw error;
      }
    },

    // Get billing statistics from the new backend endpoint
    getBillingStats: async (): Promise<{ success: boolean; data: any }> => {
      try {
        const response = await apiClient.get('/billing/staff/stats/');
        return response.data;
      } catch (error) {
        console.error('Failed to get billing stats:', error);
        throw handleApiError(error as AxiosError);
      }
    },

    // Get all user balances for staff view
    getUserBalances: async (): Promise<{ success: boolean; data: any }> => {
      try {
        const response = await apiClient.get('/billing/staff/user_balances/');
        return response.data;
      } catch (error) {
        console.error('Failed to get user balances:', error);
        throw handleApiError(error as AxiosError);
      }
    },

    // Get token usage statistics
    getTokenUsageStats: async (days: number = 30): Promise<{ success: boolean; data: any }> => {
      try {
        const response = await apiClient.get('/billing/staff/token_usage/', {
          params: { days }
        });
        return response.data;
      } catch (error) {
        console.error('Failed to get token usage stats:', error);
        throw handleApiError(error as AxiosError);
      }
    },

    // Get dashboard data for users
    getDashboardData: async (): Promise<{ success: boolean; data: any }> => {
      try {
        const response = await apiClient.get('/billing/dashboard/dashboard_data/');
        return response.data;
      } catch (error) {
        console.error('Failed to get dashboard data:', error);
        throw handleApiError(error as AxiosError);
      }
    },

    // Get payment info
    getPaymentInfo: async (): Promise<{ success: boolean; data: any }> => {
      try {
        const response = await apiClient.get('/billing/dashboard/payment_info/');
        return response.data;
      } catch (error) {
        console.error('Failed to get payment info:', error);
        throw handleApiError(error as AxiosError);
      }
    },

    // Get usage history
    getUsageHistory: async (): Promise<{ success: boolean; data: any }> => {
      try {
        const response = await apiClient.get('/billing/token-usage/usage_history/');
        return response.data;
      } catch (error) {
        console.error('Failed to get usage history:', error);
        throw handleApiError(error as AxiosError);
      }
    },
  },

  // User export functionality
  exportUsers: async (filters: {
    search?: string;
    program?: string;
    status?: string;
    date?: string;
    format?: 'csv' | 'xlsx';
  }): Promise<{ success: boolean; data: string; message?: string }> => {
    try {
      const response = await apiClient.get('/admin/users/export/', { 
        params: filters,
        responseType: 'text'
      });
      return { success: true, data: response.data };
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  // API Health Check
  healthCheck: async (): Promise<{ success: boolean; message: string; endpoints: string[] }> => {
    try {
      console.log('Performing API health check...');
      
      // Test basic connectivity
      const response = await apiClient.get('/');
      console.log('Health check response:', response);
      
      return {
        success: true,
        message: 'API is reachable',
        endpoints: ['/']
      };
    } catch (error) {
      console.error('API health check failed:', error);
      return {
        success: false,
        message: 'API is not reachable',
        endpoints: []
      };
    }
  }
};
