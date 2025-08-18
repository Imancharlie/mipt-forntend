import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UserData,
  UserProfile,
  DashboardData,
  DailyReport,
  WeeklyReport,
  GeneralReport,
  Company,
  CreateCompanyData,
  AIUsageStats,
  Theme,
  AppError,
  LoadingState,
  LoginData,
  RegisterData,
  UpdateProfileData,
  CreateDailyReportData,
  CreateWeeklyReportData,
  EnhanceTextData,
  EnhanceTextResponse,
  UserBalance,
  Transaction,
  CreateTransactionData,
  TokenUsage,
  BillingDashboardData,
  PaymentInfo,
  ReportResource,
} from '@/types';
import {
  authService,
  profileService,
  dashboardService,
  dailyReportService,
  weeklyReportService,
  generalReportService,
  companyService,
  aiService,
  exportService,
  mainJobService,
  billingService,
  resourcesService,
} from '@/api/services';
import { adminDashboardService } from '@/api/adminServices';
import { 
  isTokenExpired, 
  updateLastActivity, 
  getLastActivity
} from '@/utils/auth';
import { setAuthToken } from '@/api/client';

interface AppState {
  // Authentication
  user: UserData | null;
  tokens: {
    access: string | null;
    refresh: string | null;
  };
  isAuthenticated: boolean;
  
  // User Profile
  profile: UserProfile | null;
  profileComplete: boolean;
  
  // Dashboard
  dashboardStats: DashboardData | null;
  weeklyProgress: any | null;
  
  // Reports
  dailyReports: DailyReport[];
  weeklyReports: WeeklyReport[];
  generalReport: GeneralReport | null;
  
  // Companies
  companies: Company[];
  
  // AI Usage
  aiUsageStats: AIUsageStats | null;
  
  // Billing
  userBalance: UserBalance | null;
  transactions: Transaction[];
  tokenUsageHistory: TokenUsage[];
  billingDashboard: BillingDashboardData | null;
  paymentInfo: PaymentInfo | null;
  
  // Resources & Reports
  resources: {
    reports: ReportResource[];
    loading: boolean;
    filters: {
      department: string;
      report_type: string;
      search: string;
    };
  };
  
  // User Management (Admin)
  adminUsers: {
    users: any[];
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersWeek: number;
    pagination: {
      page: number;
      pages: number;
      hasNext: boolean;
      hasPrevious: boolean;
      totalCount: number;
    } | null;
  } | null;
  adminUserBalances: Record<number, UserBalance>;
  adminLoading: {
    users: boolean;
    userActions: boolean;
    userBalances: boolean;
  };
  
  // UI State
  theme: Theme;
  loading: LoadingState;
  balanceLoading: boolean;
  dashboardLoading: boolean;
  dailyReportsLoading: boolean;
  weeklyReportsLoading: boolean;
  error: AppError | null;
  
  // Actions
  setUser: (user: UserData | null) => void;
  setTokens: (tokens: { access: string | null; refresh: string | null }) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setProfile: (profile: UserProfile | null) => void;
  setProfileComplete: (complete: boolean) => void;
  setDashboardStats: (stats: DashboardData | null) => void;
  setWeeklyProgress: (progress: any) => void;
  setDailyReports: (reports: DailyReport[]) => void;
  setWeeklyReports: (reports: WeeklyReport[]) => void;
  setGeneralReport: (report: GeneralReport | null) => void;
  setCompanies: (companies: Company[]) => void;
  setAIUsageStats: (stats: AIUsageStats | null) => void;
  setUserBalance: (balance: UserBalance | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setTokenUsageHistory: (history: TokenUsage[]) => void;
  setBillingDashboard: (dashboard: BillingDashboardData | null) => void;
  setPaymentInfo: (info: PaymentInfo | null) => void;
  setTheme: (theme: Theme) => void;
  setLoading: (loading: LoadingState) => void;
  setBalanceLoading: (loading: boolean) => void;
  setDashboardLoading: (loading: boolean) => void;
  setDailyReportsLoading: (loading: boolean) => void;
  setWeeklyReportsLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  setResources: (resources: { reports: ReportResource[]; loading: boolean; filters: { department: string; report_type: string; search: string } }) => void;
  
  // API Actions
  login: (credentials: LoginData) => Promise<void>;
  registerAndLogin: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
  removeProfilePicture: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  fetchDailyReports: () => Promise<void>;
  createDailyReport: (data: CreateDailyReportData) => Promise<void>;
  fetchWeeklyReports: () => Promise<void>;
  createWeeklyReport: (data: CreateWeeklyReportData) => Promise<void>;
  fetchGeneralReport: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchCompanies: () => Promise<void>;
  createCompany: (data: CreateCompanyData) => Promise<void>;
  enhanceText: (data: EnhanceTextData) => Promise<EnhanceTextResponse>;
  enhanceWeeklyReportWithAI: (weeklyReportId: number, additionalInstructions?: string) => Promise<void>;
  exportReport: (type: 'pdf' | 'docx', reportType: string, id: number) => Promise<void>;
  downloadAllWeeklyReports: (type: 'pdf' | 'docx') => Promise<void>;
  
  // Billing Actions
  fetchUserBalance: () => Promise<void>;
  createTransaction: (data: CreateTransactionData) => Promise<Transaction>;
  verifyPayment: (transactionId: number, data: { user_phone_number: string; sender_name: string; amount: number }) => Promise<void>;
  fetchTokenUsageHistory: () => Promise<void>;
  fetchBillingDashboard: () => Promise<void>;
  fetchPaymentInfo: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  
  // Resources Actions
  fetchResources: (filters?: { department?: string; report_type?: string; search?: string }) => Promise<void>;
  uploadReport: (data: FormData) => Promise<void>;
  updateResourcesFilters: (filters: { department?: string; report_type?: string; search?: string }) => void;
  
  // User Management Actions (Admin)
  fetchAdminUsers: (filters?: {
    search?: string;
    program?: string;
    status?: string;
    date?: string;
    page?: number;
  }) => Promise<void>;
  performAdminUserAction: (actionData: {
    user_ids: number[];
    action: 'BAN' | 'UNBAN' | 'DELETE' | 'ACTIVATE';
    reason: string;
  }) => Promise<void>;
  fetchAdminUserBalance: (userId: number) => Promise<void>;
  clearAdminUsers: () => void;
  
  // Utility Actions
  clearError: () => void;
  clearLoading: () => void;
  initializeAuth: () => Promise<void>;
  ensureAuthentication: () => void;
  setupAuthListener: () => (() => void);
  silentTokenRefresh: () => Promise<boolean>;
  fastLogout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      tokens: {
        access: null,
        refresh: null,
      },
      isAuthenticated: false,
      profile: null,
      profileComplete: false,
      dashboardStats: null,
      weeklyProgress: null,
      dailyReports: [],
      weeklyReports: [],
      generalReport: null,
      companies: [],
      aiUsageStats: {
        total_enhancements: 12,
        total_tokens: 18500,
        enhancement_types: [
          { enhancement_type: 'weekly_report', count: 8 },
          { enhancement_type: 'daily_report', count: 3 },
          { enhancement_type: 'general_report', count: 1 }
        ],
        content_types: [
          { content_type: 'empty_report', count: 5 },
          { content_type: 'partial_content', count: 4 },
          { content_type: 'complete_content', count: 3 }
        ],
        recent_enhancements: [
          {
            content_type: 'weekly_report',
            enhancement_type: 'comprehensive',
            tokens_consumed: 1800,
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            content_type: 'daily_report',
            enhancement_type: 'grammar_improvement',
            tokens_consumed: 450,
            created_at: '2024-01-14T14:20:00Z'
          }
        ]
      },
      userBalance: null,
      transactions: [],
      tokenUsageHistory: [],
      billingDashboard: null,
      paymentInfo: null,
      resources: {
        reports: [],
        loading: false,
        filters: {
          department: '',
          report_type: '',
          search: '',
        },
      },
      adminUsers: null,
      adminUserBalances: {},
      adminLoading: { users: false, userActions: false, userBalances: false },
      theme: 'orange',
      loading: { isLoading: false },
      balanceLoading: false,
      dashboardLoading: false,
      dailyReportsLoading: false,
      weeklyReportsLoading: false,
      error: null,

      // Setters
      setUser: (user) => set({ user }),
      setTokens: (tokens) => {
        set({ tokens });
        // Also update the token in apiClient and localStorage
        setAuthToken(tokens.access);
        if (tokens.refresh) {
          localStorage.setItem('refresh_token', tokens.refresh);
        } else {
          localStorage.removeItem('refresh_token');
        }
      },
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setProfile: (profile) => set({ profile }),
      setProfileComplete: (profileComplete) => set({ profileComplete }),
      setDashboardStats: (dashboardStats) => set({ dashboardStats }),
      setWeeklyProgress: (weeklyProgress) => set({ weeklyProgress }),
      setDailyReports: (dailyReports) => set({ dailyReports }),
      setWeeklyReports: (weeklyReports) => set({ weeklyReports }),
      setGeneralReport: (generalReport) => set({ generalReport }),
      setCompanies: (companies) => set({ companies }),
      setAIUsageStats: (aiUsageStats) => set({ aiUsageStats }),
      setUserBalance: (userBalance) => set({ userBalance }),
      setTransactions: (transactions) => set({ transactions }),
      setTokenUsageHistory: (tokenUsageHistory) => set({ tokenUsageHistory }),
      setBillingDashboard: (billingDashboard) => set({ billingDashboard }),
      setPaymentInfo: (paymentInfo) => set({ paymentInfo }),
      setTheme: (theme) => set({ theme }),
      setLoading: (loading) => set({ loading }),
      setBalanceLoading: (loading) => set({ balanceLoading: loading }),
      setDashboardLoading: (loading) => set({ dashboardLoading: loading }),
      setDailyReportsLoading: (loading) => set({ dailyReportsLoading: loading }),
      setWeeklyReportsLoading: (loading) => set({ weeklyReportsLoading: loading }),
      setError: (error) => set({ error }),
      setResources: (resources: { reports: ReportResource[]; loading: boolean; filters: { department: string; report_type: string; search: string } }) => set({ resources }),
      setAdminUsers: (adminUsers: any) => set({ adminUsers }),
      setAdminUserBalances: (adminUserBalances: Record<number, UserBalance>) => set({ adminUserBalances }),
      setAdminLoading: (adminLoading: { users: boolean; userActions: boolean; userBalances: boolean }) => set({ adminLoading }),

      // API Actions
      login: async (credentials) => {
        set({ loading: { isLoading: true, message: 'Logging in...' } });
        try {
          const response = await authService.login(credentials);
          
          // Update last activity timestamp
          updateLastActivity();
          
          set({ 
            user: response.user,
            tokens: { access: response.access, refresh: response.refresh },
            isAuthenticated: true,
            loading: { isLoading: false },
            error: null // Clear any previous errors
          });
          
          // Set the token in the apiClient for future requests
          setAuthToken(response.access);
          
          // After successful login, fetch profile to check if it's complete
          try {
            await get().fetchProfile();
          } catch (profileError) {
            console.warn('Failed to fetch profile after login:', profileError);
          }
        } catch (error: any) {
          let errorMessage = 'Login failed';
          let errorType: 'general' | 'network' | 'validation' | 'auth' = 'auth';
          
          // Handle specific error types
          if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
              case 401:
                errorMessage = 'Invalid username or password. Please check your credentials.';
                errorType = 'auth';
                break;
              case 400:
                errorMessage = data?.message || 'Invalid login data. Please check your input.';
                errorType = 'validation';
                break;
              case 500:
                errorMessage = 'Server error. Please try again later or contact support.';
                errorType = 'network';
                break;
              default:
                errorMessage = data?.message || 'Login failed. Please try again.';
                errorType = 'general';
            }
          } else if (error.request) {
            // Network error
            errorMessage = 'Network error. Please check your internet connection and try again.';
            errorType = 'network';
          } else {
            // Other error
            errorMessage = error.message || 'An unexpected error occurred. Please try again.';
            errorType = 'general';
          }
          
          set({ 
            error: { message: errorMessage, type: errorType },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      registerAndLogin: async (data) => {
        set({ loading: { isLoading: true, message: 'Creating account and logging in...' } });
        try {
          // First register the user
          await authService.register(data);
          
          // Then automatically log them in
          const loginData = {
            username: data.username,
            password: data.password
          };
          
          const response = await authService.login(loginData);
          set({ 
            user: response.user,
            tokens: { access: response.access, refresh: response.refresh },
            isAuthenticated: true,
            loading: { isLoading: false },
            error: null
          });
          
          // Set the token in the apiClient for future requests
          setAuthToken(response.access);
          
          // After successful login, fetch profile to check if it's complete
          try {
            await get().fetchProfile();
          } catch (profileError) {
            console.warn('Failed to fetch profile after registration:', profileError);
          }
        } catch (error: any) {
          let errorMessage = 'Registration failed';
          let errorType: 'general' | 'network' | 'validation' | 'auth' = 'auth';
          
          if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
              case 400:
                errorMessage = data?.message || 'Invalid registration data. Please check your input.';
                errorType = 'validation';
                break;
              case 409:
                errorMessage = 'Username or email already exists. Please choose different credentials.';
                errorType = 'validation';
                break;
              case 500:
                errorMessage = 'Server error. Please try again later or contact support.';
                errorType = 'network';
                break;
              default:
                errorMessage = data?.message || 'Registration failed. Please try again.';
                errorType = 'general';
            }
          } else if (error.request) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
            errorType = 'network';
          } else {
            errorMessage = error.message || 'An unexpected error occurred. Please try again.';
            errorType = 'general';
          }
          
          set({ 
            error: { message: errorMessage, type: errorType },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: { isLoading: true, message: 'Logging out...' } });
        try {
          const { tokens } = get();
          
          // Try to logout from backend if token is still valid
          if (tokens.refresh && !isTokenExpired(tokens.refresh)) {
            try {
              await authService.logout({ refresh: tokens.refresh });
            } catch (logoutError) {
              // If logout API fails, we still want to clear local state
              console.warn('Logout API call failed, but clearing local state:', logoutError);
            }
          }
          
          // Clear all offline actions when logging out
          // Note: OfflineQueue functionality removed
          
          set({ 
            user: null,
            tokens: { access: null, refresh: null },
            isAuthenticated: false,
            profile: null,
            dashboardStats: null,
            loading: { isLoading: false }
          });
          
          // Clear the token from apiClient and localStorage
          setAuthToken(null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('last_activity');
          
          // Smooth redirect to login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        } catch (error) {
          // Even if there's an error, clear the auth state
          set({ 
            user: null,
            tokens: { access: null, refresh: null },
            isAuthenticated: false,
            profile: null,
            dashboardStats: null,
            error: { message: 'Logout completed but with warnings', type: 'auth' },
            loading: { isLoading: false }
          });
          
          // Clear the token from apiClient and localStorage
          setAuthToken(null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('last_activity');
          
          // Smooth redirect to login even on error
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      },

      updateProfile: async (data) => {
        set({ loading: { isLoading: true, message: 'Updating profile...' } });
        try {
          console.log('=== UPDATE PROFILE DEBUG ===');
          console.log('Sending profile data:', data);
          
          const profile = await profileService.updateProfile(data);
          
          console.log('Profile update response:', profile);
          console.log('Profile user_details after update:', profile.user_details);
          
          // If first_name or last_name were updated, also update the user object
          const currentUser = get().user;
          if (currentUser && (data.first_name || data.last_name)) {
            const updatedUser = {
              ...currentUser,
              ...(data.first_name && { first_name: data.first_name }),
              ...(data.last_name && { last_name: data.last_name }),
            };
            
            console.log('Updated user object:', updatedUser);
            set({ profile, user: updatedUser, loading: { isLoading: false } });
          } else {
            set({ profile, loading: { isLoading: false } });
          }
          
          console.log('============================');
        } catch (error) {
          console.error('Profile update error:', error);
          set({ 
            error: { message: 'Profile update failed', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      uploadProfilePicture: async (file) => {
        set({ loading: { isLoading: true, message: 'Uploading profile picture...' } });
        try {
          const response = await profileService.uploadProfilePicture(file);
          if (response.success) {
            // Update the user object with the new profile picture URL
            const currentUser = get().user;
            if (currentUser) {
              set({ 
                user: { ...currentUser, profile_picture: response.profile_picture_url },
                loading: { isLoading: false }
              });
            }
            return response.profile_picture_url;
          } else {
            throw new Error(response.message || 'Failed to upload profile picture');
          }
        } catch (error) {
          set({ 
            error: { message: 'Failed to upload profile picture', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      removeProfilePicture: async () => {
        set({ loading: { isLoading: true, message: 'Removing profile picture...' } });
        try {
          const response = await profileService.removeProfilePicture();
          if (response.success) {
            // Update the user object to remove the profile picture
            const currentUser = get().user;
            if (currentUser) {
              set({ 
                user: { ...currentUser, profile_picture: undefined },
                loading: { isLoading: false }
              });
            }
          } else {
            throw new Error(response.message || 'Failed to remove profile picture');
          }
        } catch (error) {
          set({ 
            error: { message: 'Failed to remove profile picture', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      fetchProfile: async () => {
        set({ loading: { isLoading: true, message: 'Loading profile...' } });
        try {
          const profile = await profileService.getProfile();
          
          console.log('=== FETCH PROFILE DEBUG ===');
          console.log('Profile response:', profile);
          console.log('Profile user_details:', profile.user_details);
          console.log('==========================');
          
          // Check if profile contains updated user information and sync with user object
          const currentUser = get().user;
          if (currentUser) {
            let updatedUser = { ...currentUser };
            
            // Extract names from user_details.full_name if available
            if (profile.user_details?.full_name) {
              const nameParts = profile.user_details.full_name.split(' ');
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';
              
              updatedUser = {
                ...updatedUser,
                first_name: firstName,
                last_name: lastName,
                email: profile.user_details.email || currentUser.email,
                username: profile.user_details.username || currentUser.username,
              };
            }
            
            // Update profile picture from profile if available
            if (profile.profile_picture) {
              updatedUser = {
                ...updatedUser,
                profile_picture: profile.profile_picture,
              };
            }
            
            console.log('Updating user object with profile data:', updatedUser);
            set({ profile, user: updatedUser, loading: { isLoading: false } });
          } else {
            set({ profile, loading: { isLoading: false } });
          }
        } catch (error) {
          set({ 
            error: { message: 'Failed to load profile', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      fetchDashboard: async () => {
        set({ dashboardLoading: true });
        try {
          const dashboardStats = await dashboardService.getDashboard();
          set({ dashboardStats, dashboardLoading: false });
        } catch (error: any) {
          console.warn('❌ Dashboard API failed, providing fallback data');
          console.warn('❌ Error details:', error.response?.status, error.response?.data);
          
          // Provide fallback dashboard data instead of null
          const fallbackDashboard = {
            user: {
              id: 0,
              username: 'user',
              email: 'user@example.com',
              first_name: 'User',
              last_name: 'User',
              is_staff: false
            },
            stats: {
              daily_reports: 0,
              weekly_reports: 0,
              submitted_weekly_reports: 0,
              general_report_status: 'pending'
            },
            profile_complete: false
          };
          
          set({ 
            dashboardStats: fallbackDashboard,
            dashboardLoading: false
          });
        }
      },

      fetchDailyReports: async () => {
        set({ dailyReportsLoading: true });
        try {
          const dailyReports = await dailyReportService.getDailyReports();
          set({ dailyReports, dailyReportsLoading: false });
        } catch (error) {
          console.warn('Using mock data for daily reports');
          set({ 
            dailyReports: [],
            dailyReportsLoading: false
          });
        }
      },

      createDailyReport: async (data) => {
        set({ loading: { isLoading: true, message: 'Creating daily report...' } });
        try {
          const newReport = await dailyReportService.createDailyReport(data);
          const { dailyReports } = get();
          set({ 
            dailyReports: [newReport, ...dailyReports],
            loading: { isLoading: false }
          });
        } catch (error) {
          console.warn('Backend not available, using mock data for daily report creation');
          
          // Create a mock report for demonstration
          const mockReport: DailyReport = {
            id: Date.now(),
            date: data.date || new Date().toISOString().split('T')[0],
            description: data.description || '',
            hours_spent: data.hours_spent || 0,
            week_number: data.week_number || 1,
            skills_learned: '',
            challenges_faced: '',
            supervisor_feedback: '',
            is_submitted: false,
            is_editable: true,
            student_name: 'Current User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { dailyReports } = get();
          set({ 
            dailyReports: [mockReport, ...dailyReports],
            loading: { isLoading: false }
          });
        }
      },

      fetchWeeklyReports: async () => {
        set({ weeklyReportsLoading: true });
        try {
          const weeklyReports = await weeklyReportService.getWeeklyReports();
          set({ weeklyReports, weeklyReportsLoading: false });
        } catch (error) {
          console.warn('Using mock data for weekly reports');
          set({ 
            weeklyReports: [],
            weeklyReportsLoading: false
          });
        }
      },

      createWeeklyReport: async (data) => {
        set({ loading: { isLoading: true, message: 'Creating weekly report...' } });
        try {
          const newReport = await weeklyReportService.createWeeklyReport(data);
          const { weeklyReports } = get();
          set({ 
            weeklyReports: [newReport, ...weeklyReports],
            loading: { isLoading: false }
          });
        } catch (error) {
          set({ 
            error: { message: 'Failed to create weekly report', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      fetchGeneralReport: async () => {
        set({ loading: { isLoading: true, message: 'Loading general report...' } });
        try {
          const generalReport = await generalReportService.getGeneralReport();
          set({ generalReport, loading: { isLoading: false } });
        } catch (error) {
          set({ 
            error: { message: 'Failed to load general report', type: 'network' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      fetchCompanies: async () => {
        set({ loading: { isLoading: true, message: 'Loading companies...' } });
        try {
          const companies = await companyService.getCompanies();
          set({ companies, loading: { isLoading: false } });
        } catch (error) {
          set({ 
            error: { message: 'Failed to load companies', type: 'network' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      createCompany: async (data) => {
        set({ loading: { isLoading: true, message: 'Creating company...' } });
        try {
          const company = await companyService.createCompany(data);
          set((state) => ({ 
            companies: [...state.companies, company],
            loading: { isLoading: false }
          }));
        } catch (error) {
          set({ 
            error: { message: 'Failed to create company', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      createMainJob: async (data: any) => {
        set({ loading: { isLoading: true, message: 'Creating main job...' } });
        try {
          const mainJob = await mainJobService.createMainJob(data);
          set({ loading: { isLoading: false } });
          return mainJob;
        } catch (error) {
          set({ 
            error: { message: 'Failed to create main job', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      createMainJobOperation: async (mainJobId: any, data: any) => {
        set({ loading: { isLoading: true, message: 'Creating operation...' } });
        try {
          const operation = await mainJobService.createOperation(mainJobId, data);
          set({ loading: { isLoading: false } });
          return operation;
        } catch (error) {
          set({ 
            error: { message: 'Failed to create operation', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      updateMainJob: async (id: any, data: any) => {
        set({ loading: { isLoading: true, message: 'Updating main job...' } });
        try {
          const mainJob = await mainJobService.updateMainJob(id, data);
          set({ loading: { isLoading: false } });
          return mainJob;
        } catch (error) {
          set({ 
            error: { message: 'Failed to update main job', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      updateMainJobOperation: async (mainJobId: any, operationId: any, data: any) => {
        set({ loading: { isLoading: true, message: 'Updating operation...' } });
        try {
          const operation = await mainJobService.updateOperation(mainJobId, operationId, data);
          set({ loading: { isLoading: false } });
          return operation;
        } catch (error) {
          set({ 
            error: { message: 'Failed to update operation', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      enhanceText: async (data) => {
        set({ loading: { isLoading: true, message: 'Enhancing text with AI...' } });
        try {
          const response = await aiService.enhanceText(data);
          set({ loading: { isLoading: false } });
          return response;
        } catch (error) {
          set({ 
            error: { message: 'AI enhancement failed', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      enhanceWeeklyReportWithAI: async (weeklyReportIdentifier, additionalInstructions) => {
        set({ loading: { isLoading: true, message: 'Enhancing weekly report with AI...' } });
        try {
          // weeklyReportIdentifier can be week_number; ensure we get week data first
          const weeklyReport = await weeklyReportService.getWeeklyReport(weeklyReportIdentifier);

          // Perform AI enhancement directly (backend handles token management)
          const enhancedReport = await weeklyReportService.enhanceWithAI(weeklyReport.week_number, additionalInstructions);
          
          // Update the weekly reports list with the enhanced report
          const { weeklyReports } = get();
          const updatedReports = weeklyReports.map(report => 
            report.id === weeklyReport.id ? enhancedReport : report
          );
          
          set({ 
            weeklyReports: updatedReports,
            loading: { isLoading: false }
          });
          
          console.log('Weekly report enhanced successfully:', enhancedReport);
          
          // Return value is not used by the interface, so we don't return anything
        } catch (error) {
          console.error('AI enhancement error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to enhance weekly report';
          set({ 
            error: { message: errorMessage, type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      exportReport: async (type, reportType, id) => {
        set({ loading: { isLoading: true, message: `Exporting ${type.toUpperCase()}...` } });
        try {
          let blob: Blob;
          if (reportType === 'daily') {
            blob = type === 'pdf' 
              ? await exportService.exportDailyPDF(id)
              : await exportService.exportDailyDOCX(id);
          } else if (reportType === 'weekly') {
            blob = type === 'pdf'
              ? await exportService.exportWeeklyPDF(id)
              : await exportService.exportWeeklyDOCX(id);
          } else {
            blob = type === 'pdf'
              ? await exportService.exportGeneralPDF()
              : await exportService.exportGeneralDOCX();
          }
          
          // Download the file
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${reportType}-report.${type}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          set({ loading: { isLoading: false } });
        } catch (error) {
          set({ 
            error: { message: 'Export failed', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      downloadAllWeeklyReports: async (type: 'pdf' | 'docx') => {
        set({ loading: { isLoading: true, message: `Downloading all weekly reports as ${type.toUpperCase()}...` } });
        try {
          // This would need to be implemented in the backend
          // For now, we'll throw an error that can be caught by the calling component
          set({ loading: { isLoading: false } });
          throw new Error('Downloading all weekly reports combined will be available soon. This feature will combine all 8 weeks into one comprehensive document.');
        } catch (error) {
          set({ 
            error: { message: 'Download failed', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      // Billing Actions
      fetchUserBalance: async () => {
        set({ balanceLoading: true });
        try {
          const response = await billingService.getBalance();
          if (response.success) {
            set({ userBalance: response.data, balanceLoading: false });
          } else {
            throw new Error('Failed to fetch balance');
          }
        } catch (error) {
          set({ 
            error: { message: 'Failed to fetch balance', type: 'network' },
            balanceLoading: false
          });
          throw error;
        }
      },

      createTransaction: async (data) => {
        set({ loading: { isLoading: true, message: 'Creating transaction...' } });
        try {
          const response = await billingService.createTransaction(data);
          if (response.success) {
            // Try to refresh transactions, but don't fail if it doesn't work
            try {
              await get().fetchTransactions();
            } catch (refreshError) {
              console.warn('Failed to refresh transactions after creation:', refreshError);
              // Don't let this break the transaction creation success
            }
            set({ loading: { isLoading: false } });
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to create transaction');
          }
        } catch (error) {
          set({ 
            error: { message: 'Failed to create transaction', type: 'network' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      verifyPayment: async (transactionId, data) => {
        set({ loading: { isLoading: true, message: 'Verifying payment...' } });
        try {
          const response = await billingService.verifyPayment(transactionId, data);
          if (response.success) {
            // Refresh transactions and balance
            await Promise.all([
              get().fetchTransactions(),
              get().fetchUserBalance()
            ]);
            set({ loading: { isLoading: false } });
          } else {
            throw new Error(response.message || 'Failed to verify payment');
          }
        } catch (error) {
          set({ 
            error: { message: 'Failed to verify payment', type: 'network' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },



      fetchTokenUsageHistory: async () => {
        try {
          const response = await billingService.getUsageHistory();
          if (response.success) {
            set({ tokenUsageHistory: Array.isArray(response.data) ? response.data : [] });
          } else {
            throw new Error('Failed to fetch usage history');
          }
        } catch (error) {
          set({ 
            error: { message: 'Failed to fetch usage history', type: 'network' },
            tokenUsageHistory: [] // Ensure it's always an array even on error
          });
          throw error;
        }
      },

      fetchBillingDashboard: async () => {
        set({ loading: { isLoading: true, message: 'Fetching billing data...' } });
        try {
          const response = await billingService.getDashboardData();
          if (response.success) {
            set({ billingDashboard: response.data, loading: { isLoading: false } });
          } else {
            throw new Error('Failed to fetch billing dashboard');
          }
        } catch (error) {
          set({ 
            error: { message: 'Failed to fetch billing data', type: 'network' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      fetchPaymentInfo: async () => {
        try {
          const response = await billingService.getPaymentInfo();
          if (response.success) {
            set({ paymentInfo: response.data });
          } else {
            throw new Error('Failed to fetch payment info');
          }
        } catch (error) {
          set({ error: { message: 'Failed to fetch payment info', type: 'network' } });
          throw error;
        }
      },

      fetchTransactions: async () => {
        try {
          const response = await billingService.getTransactions();
          if (response.success) {
            set({ transactions: Array.isArray(response.data) ? response.data : [] });
          } else {
            throw new Error('Failed to fetch transactions');
          }
        } catch (error) {
          set({ 
            error: { message: 'Failed to fetch transactions', type: 'network' },
            transactions: [] // Ensure it's always an array even on error
          });
          throw error;
        }
      },

      // Resources Actions
      fetchResources: async (filters) => {
        set({ resources: { ...get().resources, loading: true } });
        try {
          const response = await resourcesService.getReports(filters);
          if (response.success) {
            set({ resources: { ...get().resources, reports: response.data, loading: false } });
          } else {
            throw new Error('Failed to fetch resources');
          }
        } catch (error) {
          set({ resources: { ...get().resources, loading: false } });
          throw error;
        }
      },
      uploadReport: async (data) => {
        set({ loading: { isLoading: true, message: 'Uploading report...' } });
        try {
          const response = await resourcesService.uploadReport(data);
          if (response.success) {
            // Refresh resources list
            await get().fetchResources();
            set({ loading: { isLoading: false } });
          } else {
            throw new Error(response.message || 'Failed to upload report');
          }
        } catch (error) {
          set({ loading: { isLoading: false } });
          throw error;
        }
      },
      updateResourcesFilters: (filters) => {
        const currentFilters = get().resources.filters;
        const newFilters = { ...currentFilters, ...filters };
        set({ resources: { ...get().resources, filters: newFilters } });
      },

      // User Management Actions (Admin)
      fetchAdminUsers: async (filters) => {
        set({ adminLoading: { ...get().adminLoading, users: true } });
        try {
          const response = await adminDashboardService.getUsers(filters);
          set({ 
            adminUsers: {
              users: response.users,
              totalUsers: response.total_users,
              activeUsers: response.active_users,
              newUsersToday: response.new_users_today,
              newUsersWeek: response.new_users_week,
              pagination: {
                page: response.pagination.page,
                pages: response.pagination.pages,
                hasNext: response.pagination.has_next,
                hasPrevious: response.pagination.has_previous,
                totalCount: response.pagination.total_count
              }
            }, 
            adminLoading: { ...get().adminLoading, users: false } 
          });
        } catch (error) {
          set({ adminLoading: { ...get().adminLoading, users: false } });
          throw error;
        }
      },
      performAdminUserAction: async (actionData) => {
        set({ adminLoading: { ...get().adminLoading, userActions: true } });
        try {
          const response = await adminDashboardService.performUserAction(actionData);
          if (response.success) {
            // Refresh user list and balances
            await Promise.all([
              get().fetchAdminUsers(),
              get().fetchAdminUserBalance(actionData.user_ids[0]) // Assuming user_ids is an array of one user for simplicity
            ]);
            set({ adminLoading: { ...get().adminLoading, userActions: false } });
          } else {
            throw new Error(response.message || 'Failed to perform admin user action');
          }
        } catch (error) {
          set({ adminLoading: { ...get().adminLoading, userActions: false } });
          throw error;
        }
      },
      fetchAdminUserBalance: async (userId) => {
        set({ adminLoading: { ...get().adminLoading, userBalances: true } });
        try {
          console.log(`Fetching balance for user ${userId}...`);
          const response = await adminDashboardService.billing.getUserBalance(userId);
          console.log(`Balance response for user ${userId}:`, response);
          
          if (response.success) {
            set((state) => ({ adminUserBalances: { ...state.adminUserBalances, [userId]: response.data } }));
            set({ adminLoading: { ...get().adminLoading, userBalances: false } });
          } else {
            console.error(`Balance API returned success: false for user ${userId}:`, response);
            throw new Error(`Failed to fetch admin user balance: API returned success false`);
          }
        } catch (error) {
          console.error(`Error fetching balance for user ${userId}:`, error);
          set({ adminLoading: { ...get().adminLoading, userBalances: false } });
          throw error;
        }
      },
      clearAdminUsers: () => set({ adminUsers: null }),

      // Utility Actions
      clearError: () => set({ error: null }),
      clearLoading: () => set({ loading: { isLoading: false } }),
      
      // Initialize authentication state from persisted data
      initializeAuth: async () => {
        const state = get();
        
        // Prevent multiple simultaneous initializations
        if (state.loading.isLoading) {
          console.log('Authentication initialization already in progress, skipping...');
          return;
        }
        
        // Check if we have tokens in localStorage (they might be more up-to-date)
        const storedAccessToken = localStorage.getItem('access_token');
        const storedRefreshToken = localStorage.getItem('refresh_token');
        
        // Use stored tokens if they exist and are different from store
        if (storedAccessToken && storedAccessToken !== state.tokens.access) {
          state.tokens.access = storedAccessToken;
        }
        if (storedRefreshToken && storedRefreshToken !== state.tokens.refresh) {
          state.tokens.refresh = storedRefreshToken;
        }
        
        if (state.tokens.access && !state.isAuthenticated) {
          set({ loading: { isLoading: true, message: 'Initializing authentication...' } });
          
          try {
            // Check if token is expired
            if (isTokenExpired(state.tokens.access)) {
              console.log('🕐 Access token expired, attempting refresh');
              // Continue to refresh logic below
            }
            
            // Set the token in apiClient
            setAuthToken(state.tokens.access);
            
            // Update last activity
            updateLastActivity();
            
            // Try to fetch profile to verify token is still valid
            await get().fetchProfile();
            set({ isAuthenticated: true, loading: { isLoading: false } });
            console.log('✅ Authentication restored successfully');
          } catch (error) {
            console.warn('Token validation failed, attempting refresh...');
            
            // Try to refresh the token
            if (state.tokens.refresh) {
              try {
                const response = await authService.refreshToken({ refresh: state.tokens.refresh });
                const newTokens = { access: response.access, refresh: response.refresh || state.tokens.refresh };
                
                set({ 
                  tokens: newTokens,
                  isAuthenticated: true 
                });
                
                // Update localStorage and apiClient
                setAuthToken(newTokens.access);
                if (newTokens.refresh) {
                  localStorage.setItem('refresh_token', newTokens.refresh);
                }
                
                console.log('Token refreshed successfully');
                return;
              } catch (refreshError) {
                console.warn('Token refresh failed:', refreshError);
              }
            }
            
            // If refresh failed or no refresh token, clear everything
            console.warn('Clearing invalid authentication state');
            set({ 
              user: null, 
              tokens: { access: null, refresh: null }, 
              isAuthenticated: false 
            });
            setAuthToken(null);
            localStorage.removeItem('refresh_token');
          }
        }
      },

      // Global authentication state manager
      setupAuthListener: () => {
        // Listen for token expiration events from API client
        const handleTokenExpired = () => {
          console.log('🔄 Global auth listener: Token expired, clearing authentication state');
          get().logout(); // This will clear everything and redirect to login
        };

        // Add event listener
        window.addEventListener('auth:token-expired', handleTokenExpired);
        
        // Return cleanup function
        return () => {
          window.removeEventListener('auth:token-expired', handleTokenExpired);
        };
      },

      // Silent token refresh (called automatically by API client)
      silentTokenRefresh: async () => {
        const refreshToken = get().tokens.refresh;
        if (!refreshToken) {
          console.warn('No refresh token available for silent refresh');
          return false;
        }

        try {
          const response = await authService.refreshToken({ refresh: refreshToken });
          const newTokens = { access: response.access, refresh: response.refresh || refreshToken };
          
          set({ tokens: newTokens });
          setAuthToken(newTokens.access);
          
          if (newTokens.refresh) {
            localStorage.setItem('refresh_token', newTokens.refresh);
          }
          
          console.log('🔄 Silent token refresh successful');
          return true;
        } catch (error) {
          console.warn('Silent token refresh failed:', error);
          return false;
        }
      },

      // Fast logout for immediate response (used by logout button)
      fastLogout: () => {
        console.log('🚀 Manual fast logout initiated by user');
        
        // Clear authentication state immediately
        set({ 
          isAuthenticated: false,
          user: null,
          tokens: { access: null, refresh: null },
          profile: null
        });
        
        // Clear tokens from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Clear the token from apiClient
        setAuthToken(null);
        
        // Redirect to login after state is cleared
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      },

      // Safety function to ensure authentication state is correct
      ensureAuthentication: () => {
        const currentState = get();
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        // If no tokens but authenticated, fix the state
        if (!accessToken && !refreshToken && currentState.isAuthenticated) {
          console.log('🔐 Fixing authentication state - no tokens found');
          set({ isAuthenticated: false });
        }
        
        // If tokens exist but not authenticated, check if they're valid
        if (accessToken && refreshToken && !currentState.isAuthenticated) {
          if (!isTokenExpired(accessToken) || !isTokenExpired(refreshToken)) {
            console.log('🔐 Fixing authentication state - valid tokens found');
            set({ isAuthenticated: true });
          }
        }
      },
    }),
    {
      name: 'mipt-store',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        profile: state.profile,
        theme: state.theme,
      }),
    }
  )
); 