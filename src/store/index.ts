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
} from '@/api/services';
import { isTokenExpired } from '@/utils/auth';

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
  
  // UI State
  theme: Theme;
  loading: LoadingState;
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
  setTheme: (theme: Theme) => void;
  setLoading: (loading: LoadingState) => void;
  setError: (error: AppError | null) => void;
  
  // API Actions
  login: (credentials: LoginData) => Promise<void>;
  registerAndLogin: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
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
  
  // Utility Actions
  clearError: () => void;
  clearLoading: () => void;
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
      theme: 'orange',
      loading: { isLoading: false },
      error: null,

      // Setters
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
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
      setTheme: (theme) => set({ theme }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API Actions
      login: async (credentials) => {
        set({ loading: { isLoading: true, message: 'Logging in...' } });
        try {
          const response = await authService.login(credentials);
          set({ 
            user: response.user,
            tokens: { access: response.access, refresh: response.refresh },
            isAuthenticated: true,
            loading: { isLoading: false },
            error: null // Clear any previous errors
          });
          
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
          
          if (tokens.refresh && !isTokenExpired(tokens.refresh)) {
            try {
              await authService.logout({ refresh: tokens.refresh });
            } catch (logoutError) {
              // If logout API fails, we still want to clear local state
              console.warn('Logout API call failed, but clearing local state:', logoutError);
            }
          }
          
          set({ 
            user: null,
            tokens: { access: null, refresh: null },
            isAuthenticated: false,
            profile: null,
            dashboardStats: null,
            loading: { isLoading: false }
          });
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
        }
      },

      updateProfile: async (data) => {
        set({ loading: { isLoading: true, message: 'Updating profile...' } });
        try {
          const profile = await profileService.updateProfile(data);
          set({ profile, loading: { isLoading: false } });
        } catch (error) {
          set({ 
            error: { message: 'Profile update failed', type: 'general' },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      fetchDashboard: async () => {
        set({ loading: { isLoading: true, message: 'Loading dashboard...' } });
        try {
          const dashboardStats = await dashboardService.getDashboard();
          set({ dashboardStats, loading: { isLoading: false } });
        } catch (error) {
          console.warn('Using mock data for dashboard');
          set({ 
            dashboardStats: null,
            loading: { isLoading: false }
          });
        }
      },

      fetchDailyReports: async () => {
        set({ loading: { isLoading: true, message: 'Loading daily reports...' } });
        try {
          const dailyReports = await dailyReportService.getDailyReports();
          set({ dailyReports, loading: { isLoading: false } });
        } catch (error) {
          console.warn('Using mock data for daily reports');
          set({ 
            dailyReports: [],
            loading: { isLoading: false }
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
        set({ loading: { isLoading: true, message: 'Loading weekly reports...' } });
        try {
          const weeklyReports = await weeklyReportService.getWeeklyReports();
          set({ weeklyReports, loading: { isLoading: false } });
        } catch (error) {
          console.warn('Using mock data for weekly reports');
          set({ 
            weeklyReports: [],
            loading: { isLoading: false }
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

      fetchProfile: async () => {
        set({ loading: { isLoading: true, message: 'Loading profile...' } });
        try {
          const profile = await profileService.getProfile();
          set({ profile, loading: { isLoading: false } });
        } catch (error) {
          set({ 
            error: { message: 'Failed to load profile', type: 'network' },
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

      enhanceWeeklyReportWithAI: async (weeklyReportId, additionalInstructions) => {
        set({ loading: { isLoading: true, message: 'Enhancing weekly report with AI...' } });
        try {
          const enhancedReport = await weeklyReportService.enhanceWithAI(weeklyReportId, additionalInstructions);
          
          // Update the weekly reports list with the enhanced report
          const { weeklyReports } = get();
          const updatedReports = weeklyReports.map(report => 
            report.id === weeklyReportId ? enhancedReport : report
          );
          
          set({ 
            weeklyReports: updatedReports,
            loading: { isLoading: false }
          });
          
          console.log('Weekly report enhanced successfully:', enhancedReport);
        } catch (error) {
          console.error('AI enhancement error:', error);
          set({ 
            error: { message: 'Failed to enhance weekly report', type: 'general' },
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

      // Utility Actions
      clearError: () => set({ error: null }),
      clearLoading: () => set({ loading: { isLoading: false } }),
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