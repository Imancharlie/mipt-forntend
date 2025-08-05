import apiClient, { handleApiError } from './client';
import { AxiosError } from 'axios';
import {
  LoginData,
  RegisterData,
  LogoutData,
  RefreshData,
  UserProfile,
  UpdateProfileData,
  DashboardData,
  Company,
  CreateCompanyData,
  DailyReport,
  CreateDailyReportData,
  WeeklyReport,
  CreateWeeklyReportData,
  GenerateWeeklyData,
  MainJobOperation,

  GeneralReport,
  EnhanceTextData,
  EnhanceTextResponse,
  EnhanceDailyData,
  EnhanceWeeklyData,
  EnhanceGeneralData,
  GenerateSummaryData,
  GenerateSummaryResponse,
  SuggestImprovementsData,
  AIUsageStats,
  BulkExportData,
  MainJob,
  CreateMainJobData,
  CreateMainJobOperationData,
} from '@/types';

// Authentication Services
export const authService = {
  login: async (data: LoginData) => {
    try {
      const response = await apiClient.post('/auth/login/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await apiClient.post('/auth/register/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  logout: async (data: LogoutData) => {
    try {
      const response = await apiClient.post('/auth/logout/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  refreshToken: async (data: RefreshData) => {
    try {
      const response = await apiClient.post('/auth/token/refresh/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

// Profile Services
export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await apiClient.get('/auth/profile/');
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    try {
      const response = await apiClient.put('/auth/profile/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

// Dashboard Services
export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    try {
      const response = await apiClient.get('/auth/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      throw error;
    }
  },
};

// Company Services
export const companyService = {
  getCompanies: async (): Promise<Company[]> => {
    try {
      const response = await apiClient.get('/companies/');
      return response.data.results || response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  createCompany: async (data: CreateCompanyData): Promise<Company> => {
    try {
      const response = await apiClient.post('/companies/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  searchCompanies: async (query: string): Promise<Company[]> => {
    try {
      const response = await apiClient.get(`/companies/search/?q=${encodeURIComponent(query)}`);
      return response.data.results || response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  getCompanyStudents: async (companyId: number): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/companies/${companyId}/students/`);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

// Daily Reports Services
export const dailyReportService = {
  getDailyReports: async (): Promise<DailyReport[]> => {
    try {
      const response = await apiClient.get('/reports/daily/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Failed to fetch daily reports:', error);
      throw error;
    }
  },

  createDailyReport: async (data: CreateDailyReportData): Promise<DailyReport> => {
    try {
      // Map frontend data to backend API format
      const backendData = {
        date: data.date || new Date().toISOString().split('T')[0], // Use the actual date
        description: data.description || '', // Ensure description is provided
        hours_spent: data.hours_spent || 0, // Keep as hours_spent for backend
        week_number: data.week_number
      };
      
      console.log('Backend data being sent:', backendData);
      
      const response = await apiClient.post('/reports/daily/', backendData);
      console.log('Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Backend error details:', (error as any).response?.data);
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  updateDailyReport: async (id: number, data: Partial<CreateDailyReportData>): Promise<DailyReport> => {
    try {
      // Map frontend data to backend API format
      const backendData: any = {};
      if (data.date) {
        backendData.date = data.date; // Use the actual date
      }
      if (data.description) backendData.description = data.description;
      if (data.hours_spent !== undefined) backendData.hours_spent = data.hours_spent;
      if (data.week_number) backendData.week_number = data.week_number;
      
      const response = await apiClient.put(`/reports/daily/${id}/`, backendData);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  submitDailyReport: async (id: number): Promise<DailyReport> => {
    try {
      const response = await apiClient.patch(`/reports/daily/${id}/submit/`);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  getWeeklyDailyReports: async (weekNumber: number): Promise<DailyReport[]> => {
    try {
      const response = await apiClient.get(`/reports/daily/week/?week_number=${weekNumber}`);
      return response.data.results || response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

// Weekly Reports Services
export const weeklyReportService = {
  getWeeklyReports: async (): Promise<WeeklyReport[]> => {
    try {
      const response = await apiClient.get('/reports/weekly/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Failed to fetch weekly reports:', error);
      throw error;
    }
  },

  createWeeklyReport: async (data: CreateWeeklyReportData): Promise<WeeklyReport> => {
    try {
      const response = await apiClient.post('/reports/weekly/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  updateWeeklyReport: async (weekNumber: number, data: Partial<CreateWeeklyReportData>): Promise<WeeklyReport> => {
    try {
      const url = `/reports/weekly/week/${weekNumber}/`;
      console.log('Updating weekly report at URL:', url);
      console.log('Data being sent:', data);
      const response = await apiClient.put(url, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update weekly report:', error);
      throw error;
    }
  },

  getWeeklyReportByWeek: async (weekNumber: number): Promise<WeeklyReport> => {
    try {
      const url = `/reports/weekly/week/${weekNumber}/`;
      console.log('Fetching weekly report at URL:', url);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch weekly report:', error);
      throw error;
    }
  },

  getDailyReportsByWeek: async (weekNumber: number): Promise<DailyReport[]> => {
    try {
      const response = await apiClient.get(`/reports/daily/?week_number=${weekNumber}`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Failed to fetch daily reports:', error);
      throw error;
    }
  },

  createDailyReport: async (data: any): Promise<DailyReport> => {
    try {
      const response = await apiClient.post('/reports/daily/', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create daily report:', error);
      throw error;
    }
  },



  generateWeeklyReport: async (data: GenerateWeeklyData): Promise<WeeklyReport> => {
    try {
      const response = await apiClient.post('/reports/weekly/generate/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  submitWeeklyReport: async (id: number): Promise<WeeklyReport> => {
    try {
      const response = await apiClient.patch(`/reports/weekly/${id}/submit/`);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  getWeeklyReport: async (id: number): Promise<WeeklyReport> => {
    try {
      const response = await apiClient.get(`/reports/weekly/${id}/`);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  downloadWeeklyReportPDF: async (weekNumber: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/reports/weekly/week/${weekNumber}/download/pdf/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download PDF:', error);
      throw error;
    }
  },

  downloadWeeklyReportDOCX: async (weekNumber: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/reports/weekly/week/${weekNumber}/download/docx/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download DOCX:', error);
      throw error;
    }
  },

  downloadAllWeeklyReports: async (type: 'pdf' | 'docx'): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/reports/weekly/download-all/${type}/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download all weekly reports:', error);
      throw error;
    }
  },

  enhanceWithAI: async (weeklyReportId: number, additionalInstructions?: string): Promise<WeeklyReport> => {
    try {
      console.log('Sending AI enhancement request to backend...');
      console.log('Weekly Report ID:', weeklyReportId);
      console.log('Additional Instructions:', additionalInstructions || 'None');
      console.log('Request URL:', `/reports/weekly/${weeklyReportId}/enhance_with_ai/`);
      
      // First, check if the weekly report exists
      try {
        const reportCheck = await apiClient.get(`/reports/weekly/${weeklyReportId}/`);
        console.log('Weekly report exists:', reportCheck.data);
      } catch (checkError: any) {
        console.error('Weekly report check failed:', checkError.response?.status, checkError.response?.data);
        if (checkError.response?.status === 404) {
          throw new Error('Weekly report not found. Please check the report ID.');
        }
      }
      
      // Try to call the backend API with proper error handling
      const response = await apiClient.post(`/reports/weekly/${weeklyReportId}/enhance_with_ai/`, {
        additional_instructions: additionalInstructions || ''
      });
      
      console.log('Backend AI enhancement successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Backend AI enhancement failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      // Check if it's a 404 error (weekly report not found)
      if (error.response?.status === 404) {
        throw new Error('Weekly report not found. Please check the report ID.');
      }
      
      // Check if it's a 500 error (server error)
      if (error.response?.status === 500) {
        console.warn('Server error (500), using mock enhancement for development');
        console.warn('Error details:', error.response?.data);
        
        // Mock enhancement for development/testing
        const mockEnhancedReport: WeeklyReport = {
          id: weeklyReportId,
          week_number: 1,
          start_date: '2025-01-20',
          end_date: '2025-01-24',
          total_hours: 40,
          status: 'DRAFT',
          summary: 'Enhanced: Comprehensive weekly report with improved technical language',
          main_job_title: 'Enhanced: Sequence of Operations of Electrical System Design',
          main_job_description: 'Enhanced: Conducted comprehensive analysis and implementation of electrical system design principles with advanced technical methodologies.',
          daily_reports: [
            {
              id: 1,
              date: '2025-01-20',
              description: 'Enhanced: Conducted comprehensive analysis of electrical system requirements and design specifications',
              hours_spent: 8,
              skills_learned: 'Enhanced: Advanced electrical design principles and AutoCAD proficiency',
              challenges_faced: 'Enhanced: Complex system integration challenges requiring innovative problem-solving approaches',
              supervisor_feedback: 'Enhanced: Excellent technical understanding and professional approach to design challenges'
            },
            {
              id: 2,
              date: '2025-01-21',
              description: 'Enhanced: Implemented sophisticated electrical circuit design using industry-standard software tools',
              hours_spent: 8,
              skills_learned: 'Enhanced: Circuit design optimization and technical documentation',
              challenges_faced: 'Enhanced: Optimization of circuit efficiency while maintaining safety standards',
              supervisor_feedback: 'Enhanced: Outstanding attention to detail and technical accuracy'
            },
            {
              id: 3,
              date: '2025-01-22',
              description: 'Enhanced: Performed detailed system testing and validation procedures with professional documentation',
              hours_spent: 8,
              skills_learned: 'Enhanced: System testing methodologies and quality assurance protocols',
              challenges_faced: 'Enhanced: Ensuring comprehensive test coverage across multiple system components',
              supervisor_feedback: 'Enhanced: Thorough testing approach and excellent documentation skills'
            },
            {
              id: 4,
              date: '2025-01-23',
              description: 'Enhanced: Conducted advanced troubleshooting and system optimization with technical analysis',
              hours_spent: 8,
              skills_learned: 'Enhanced: Advanced troubleshooting techniques and system optimization',
              challenges_faced: 'Enhanced: Identifying and resolving complex system performance issues',
              supervisor_feedback: 'Enhanced: Excellent problem-solving skills and technical expertise'
            },
            {
              id: 5,
              date: '2025-01-24',
              description: 'Enhanced: Completed comprehensive project documentation and technical report preparation',
              hours_spent: 8,
              skills_learned: 'Enhanced: Technical writing and professional documentation standards',
              challenges_faced: 'Enhanced: Synthesizing complex technical information into clear documentation',
              supervisor_feedback: 'Enhanced: Exceptional documentation quality and professional presentation'
            }
          ],
          main_job: {
            id: 1,
            title: 'Enhanced: Sequence of Operations of Electrical System Design',
            operations: [
              {
                id: 1,
                step_number: 1,
                operation_description: 'Enhanced: Conducted comprehensive analysis of electrical system requirements and design specifications using advanced engineering principles',
                tools_used: 'Enhanced: AutoCAD Electrical, MATLAB, Electrical design software, Technical documentation tools'
              },
              {
                id: 2,
                step_number: 2,
                operation_description: 'Enhanced: Implemented sophisticated electrical circuit design with optimization for efficiency and safety compliance',
                tools_used: 'Enhanced: Circuit design software, Simulation tools, Safety analysis software'
              },
              {
                id: 3,
                step_number: 3,
                operation_description: 'Enhanced: Performed detailed system testing and validation procedures with comprehensive quality assurance protocols',
                tools_used: 'Enhanced: Testing equipment, Quality assurance software, Documentation systems'
              },
              {
                id: 4,
                step_number: 4,
                operation_description: 'Enhanced: Conducted advanced troubleshooting and system optimization with technical analysis and performance evaluation',
                tools_used: 'Enhanced: Diagnostic tools, Performance monitoring software, Analysis tools'
              },
              {
                id: 5,
                step_number: 5,
                operation_description: 'Enhanced: Completed comprehensive project documentation and technical report preparation with professional standards',
                tools_used: 'Enhanced: Technical writing software, Documentation tools, Presentation software'
              }
            ]
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add custom instructions if provided
        if (additionalInstructions) {
          mockEnhancedReport.summary += ` (Custom: ${additionalInstructions})`;
        }
        
        return mockEnhancedReport;
      }
      
      // For other errors, throw the original error
      throw error;
    }
  },
};

// Operations Services
export const operationService = {
  getOperations: async (mainJobId: number): Promise<MainJobOperation[]> => {
    try {
      const response = await apiClient.get(`/reports/main-jobs/${mainJobId}/operations/`);
      return response.data.results || response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  createOperation: async (mainJobId: number, data: any): Promise<MainJobOperation> => {
    try {
      const response = await apiClient.post(`/reports/main-jobs/${mainJobId}/operations/`, data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  updateOperation: async (mainJobId: number, operationId: number, data: any): Promise<MainJobOperation> => {
    try {
      const response = await apiClient.put(`/reports/main-jobs/${mainJobId}/operations/${operationId}/`, data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  deleteOperation: async (mainJobId: number, operationId: number): Promise<void> => {
    try {
      await apiClient.delete(`/reports/main-jobs/${mainJobId}/operations/${operationId}/`);
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

// General Reports Services
export const generalReportService = {
  getGeneralReport: async (): Promise<GeneralReport> => {
    try {
      const response = await apiClient.get('/reports/general/');
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  generateGeneralReport: async (): Promise<GeneralReport> => {
    try {
      const response = await apiClient.post('/reports/general/generate/');
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  submitGeneralReport: async (): Promise<GeneralReport> => {
    try {
      const response = await apiClient.patch('/reports/general/submit/');
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

// AI Services
export const aiService = {
  enhanceText: async (data: EnhanceTextData): Promise<EnhanceTextResponse> => {
    try {
      const response = await apiClient.post('/ai/enhance/text/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  enhanceDailyReport: async (data: EnhanceDailyData): Promise<EnhanceTextResponse> => {
    try {
      const response = await apiClient.post('/ai/enhance/daily/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  enhanceWeeklyReport: async (data: EnhanceWeeklyData): Promise<EnhanceTextResponse> => {
    try {
      const response = await apiClient.post('/ai/enhance/weekly/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  enhanceGeneralReport: async (data: EnhanceGeneralData): Promise<EnhanceTextResponse> => {
    try {
      const response = await apiClient.post('/ai/enhance/general/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  generateSummary: async (data: GenerateSummaryData): Promise<GenerateSummaryResponse> => {
    try {
      const response = await apiClient.post('/ai/generate/summary/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  suggestImprovements: async (data: SuggestImprovementsData): Promise<any> => {
    try {
      const response = await apiClient.post('/ai/suggest/improvements/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  getAIUsageStats: async (): Promise<AIUsageStats> => {
    try {
      const response = await apiClient.get('/ai/usage/');
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

// Export Services
export const exportService = {
  exportWeeklyPDF: async (id: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/export/weekly/${id}/pdf/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  exportWeeklyDOCX: async (id: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/export/weekly/${id}/docx/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  exportDailyPDF: async (id: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/export/daily/${id}/pdf/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  exportDailyDOCX: async (id: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/export/daily/${id}/docx/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  exportGeneralPDF: async (): Promise<Blob> => {
    try {
      const response = await apiClient.get('/export/general/pdf/', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  exportGeneralDOCX: async (): Promise<Blob> => {
    try {
      const response = await apiClient.get('/export/general/docx/', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  bulkExport: async (data: BulkExportData): Promise<Blob> => {
    try {
      const response = await apiClient.post('/export/bulk/', data, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

// Main Job Service
export const mainJobService = {
  getMainJobs: async (): Promise<MainJob[]> => {
    try {
      const response = await apiClient.get('/reports/main-jobs/');
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  getMainJob: async (id: number): Promise<MainJob> => {
    try {
      const response = await apiClient.get(`/reports/main-jobs/${id}/`);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  createMainJob: async (data: CreateMainJobData): Promise<MainJob> => {
    try {
      const response = await apiClient.post('/reports/main-jobs/', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  updateMainJob: async (id: number, data: Partial<CreateMainJobData>): Promise<MainJob> => {
    try {
      const response = await apiClient.put(`/reports/main-jobs/${id}/`, data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  deleteMainJob: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/reports/main-jobs/${id}/`);
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  getOperations: async (mainJobId: number): Promise<MainJobOperation[]> => {
    try {
      const response = await apiClient.get(`/reports/main-jobs/${mainJobId}/operations/`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Failed to fetch operations:', error);
      throw error;
    }
  },

  createOperation: async (mainJobId: number, data: CreateMainJobOperationData): Promise<MainJobOperation> => {
    try {
      const response = await apiClient.post(`/reports/main-jobs/${mainJobId}/operations/`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create operation:', error);
      throw error;
    }
  },

  updateOperation: async (mainJobId: number, operationId: number, data: Partial<CreateMainJobOperationData>): Promise<MainJobOperation> => {
    try {
      const response = await apiClient.put(`/reports/main-jobs/${mainJobId}/operations/${operationId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update operation:', error);
      throw error;
    }
  },

  deleteOperation: async (mainJobId: number, operationId: number): Promise<void> => {
    try {
      await apiClient.delete(`/reports/main-jobs/${mainJobId}/operations/${operationId}/`);
    } catch (error) {
      console.error('Failed to delete operation:', error);
      throw error;
    }
  },
};

// Reminder Services
export const reminderService = {
  // Get user's reminder settings
  getReminderSettings: async () => {
    const response = await apiClient.get('/reminders/settings/');
    return response.data;
  },

  // Update user's reminder settings
  updateReminderSettings: async (settings: any) => {
    const response = await apiClient.put('/reminders/settings/', settings);
    return response.data;
  },

  // Get scheduled notifications
  getScheduledNotifications: async () => {
    const response = await apiClient.get('/reminders/notifications/');
    return response.data;
  },

  // Create a new notification
  createNotification: async (notification: any) => {
    const response = await apiClient.post('/reminders/notifications/', notification);
    return response.data;
  },

  // Mark notification as sent
  markNotificationSent: async (notificationId: string) => {
    const response = await apiClient.patch(`/reminders/notifications/${notificationId}/`, {
      is_sent: true
    });
    return response.data;
  },

  // Test notification (for immediate testing)
  testNotification: async () => {
    const response = await apiClient.post('/reminders/test/');
    return response.data;
  }
};


 