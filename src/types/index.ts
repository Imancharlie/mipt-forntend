// Authentication Types
export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  phone_number: string;
  student_id?: string;
  program: 'MECHANICAL' | 'ELECTRICAL' | 'CIVIL' | 'COMPUTER' | 'CHEMICAL' | 'TEXTILE_DESIGN' | 'TEXTILE_ENGINEERING' | 'INDUSTRIAL' | 'GEOMATIC' | 'ARCHITECTURE' | 'QUANTITY_SURVEYING';
  pt_phase: 'PT1' | 'PT2' | 'PT3';
  year_of_study: number;
  department: string;
  supervisor_name?: string;
  supervisor_email?: string;
  company_name?: string;
  company_region?: string;
}

export interface LogoutData {
  refresh: string;
}

export interface RefreshData {
  refresh: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  is_staff?: boolean;
}

// User Profile Types
export interface UserProfile {
  id: number;
  student_id: string;
  program: 'MECHANICAL' | 'ELECTRICAL' | 'CIVIL' | 'COMPUTER' | 'CHEMICAL' | 'TEXTILE_DESIGN' | 'TEXTILE_ENGINEERING' | 'INDUSTRIAL' | 'GEOMATIC' | 'ARCHITECTURE' | 'QUANTITY_SURVEYING';
  year_of_study: number;
  pt_phase: 'PT1' | 'PT2' | 'PT3';
  department: string;
  supervisor_name: string;
  supervisor_email?: string;
  phone_number?: string;
  company_name?: string;
  company_region?: string;
  profile_picture?: string;
  user_details: {
    username: string;
    email: string;
    full_name: string;
  };
}

export interface UpdateProfileData {
  student_id?: string;
  first_name?: string;
  last_name?: string;
  program?: string;
  year_of_study?: number;
  pt_phase?: string;
  department?: string;
  supervisor_name?: string;
  supervisor_email?: string;
  phone_number?: string;
  company_name?: string;
  company_region?: string;
}

// Dashboard Types
export interface DashboardData {
  user: UserData;
  stats: {
    daily_reports: number;
    weekly_reports: number;
    submitted_weekly_reports: number;
    general_report_status: string;
  };
  profile_complete: boolean;
}

// Company Types
export interface Company {
  id: number;
  name: string;
  industry_type: string;
  industry_display: string;
  address: string;
  contact_person: string;
  student_count: number;
}

export interface CreateCompanyData {
  name: string;
  address: string;
  contact_person: string;
  phone?: string;
  email?: string;
  website?: string;
  industry_type: string;
  established_year?: number;
  description?: string;
}

// Main Job Types
export interface MainJobOperation {
  id: number;
  step_number: number;
  operation_description: string;
  tools_used: string;
  created_at: string;
  updated_at: string;
}

export interface MainJob {
  id: number;
  weekly_report: number;
  title: string;
  operations: MainJobOperation[];
  created_at: string;
  updated_at: string;
}

export interface CreateMainJobData {
  weekly_report: number;
  title: string;
}

export interface CreateMainJobOperationData {
  main_job: number;
  step_number: number;
  operation_description: string;
  tools_used: string;
}

// Daily Reports Types
export interface DailyReport {
  id: number;
  date: string;
  description: string;
  hours_spent: number;
  week_number: number;
  skills_learned?: string;
  challenges_faced?: string;
  supervisor_feedback?: string;
  is_submitted: boolean;
  is_editable: boolean;
  student_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDailyReportData {
  date?: string;
  description: string;
  hours_spent: number;
  week_number: number;
  skills_learned?: string;
  challenges_faced?: string;
  supervisor_feedback?: string;
}

// Weekly Reports Types
export interface WeeklyReport {
  id: number;
  week_number: number;
  start_date: string;
  end_date: string;
  summary: string;
  main_job_title: string;
  main_job_description: string;
  objectives_met?: string;
  learning_outcomes?: string;
  supervisor_comments?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  total_hours: number;
  is_ai_enhanced: boolean;
  can_submit: boolean;
  student_name: string;
  main_job: MainJob;
  daily_reports: DailyReport[];
  created_at: string;
  updated_at: string;
}

export interface CreateWeeklyReportData {
  week_number: number;
  start_date: string;
  end_date: string;
  summary: string;
  main_job_title: string;
  main_job_description: string;
  objectives_met?: string;
  learning_outcomes?: string;
  supervisor_comments?: string;
  // Daily report fields
  daily_monday?: string;
  hours_monday?: number;
  daily_tuesday?: string;
  hours_tuesday?: number;
  daily_wednesday?: string;
  hours_wednesday?: number;
  daily_thursday?: string;
  hours_thursday?: number;
  daily_friday?: string;
  hours_friday?: number;
}

export interface GenerateWeeklyData {
  week_number: number;
  start_date: string;
  end_date: string;
}

// General Reports Types
export interface GeneralReport {
  id: number;
  title: string;
  introduction?: string;
  company_overview?: string;
  training_objectives?: string;
  methodology?: string;
  achievements?: string;
  challenges_faced?: string;
  skills_acquired?: string;
  recommendations?: string;
  conclusion?: string;
  acknowledgments?: string;
  status: 'DRAFT' | 'COMPLETED' | 'SUBMITTED' | 'APPROVED';
  is_ai_enhanced: boolean;
  word_count: number;
  weekly_reports_count: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

// AI Enhancement Types
export interface EnhanceTextData {
  text: string;
  type: 'improve' | 'expand' | 'summarize' | 'grammar';
}

export interface EnhanceTextResponse {
  success: boolean;
  enhanced_text?: string;
  tokens_used?: number;
  original_length?: number;
  enhanced_length?: number;
  error?: string;
}

export interface EnhanceDailyData {
  daily_report_id: number;
  field: 'description' | 'skills_learned' | 'challenges_faced';
  type: 'improve' | 'expand' | 'summarize' | 'grammar';
}

export interface EnhanceWeeklyData {
  weekly_report_id: number;
  field: 'summary' | 'main_job_description' | 'objectives_met' | 'learning_outcomes';
  type: 'improve' | 'expand' | 'summarize' | 'grammar';
}

export interface EnhanceGeneralData {
  field: 'introduction' | 'company_overview' | 'training_objectives' | 'methodology' | 'achievements' | 'challenges_faced' | 'skills_acquired' | 'recommendations' | 'conclusion';
  type: 'improve' | 'expand' | 'summarize' | 'grammar';
}

export interface GenerateSummaryData {
  week_number: number;
}

export interface GenerateSummaryResponse {
  success: boolean;
  summary?: string;
  tokens_used?: number;
  error?: string;
}

export interface SuggestImprovementsData {
  text: string;
  type: 'daily' | 'weekly' | 'general';
}

export interface AIUsageStats {
  total_enhancements: number;
  total_tokens: number;
  enhancement_types: Array<{enhancement_type: string; count: number}>;
  content_types: Array<{content_type: string; count: number}>;
  recent_enhancements: Array<{
    content_type: string;
    enhancement_type: string;
    tokens_consumed: number;
    created_at: string;
  }>;
}

// Export Types
export interface BulkExportData {
  report_ids: number[];
  type: 'pdf' | 'docx';
  report_type: 'daily' | 'weekly' | 'general';
}

// UI State Types
export type Theme = 'orange' | 'purple' | 'green';

export interface AppError {
  message: string;
  type: 'network' | 'validation' | 'auth' | 'general';
  field?: string;
  retry?: () => void;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Form Types
export interface RegistrationSteps {
  step1: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  step2: {
    email: string;
    password: string;
    password_confirm: string;
  };
  step3: {
    student_id: string;
    program: string;
    pt_phase: 'PT1' | 'PT2' | 'PT3';
    academic_year: number;
    supervisor_name: string;
    supervisor_email?: string;
    area_of_field: string;
    region: string;
  };
}

export interface WeeklyProgress {
  data: DailyReport[];
  meta: {
    total_hours: number;
    report_count: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Reminder Settings Types
export interface ReminderSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM"
  days: string[]; // ['monday', 'tuesday', etc.]
  notification_type: 'browser' | 'email' | 'both';
  message?: string;
}

export interface ReminderNotification {
  id: string;
  user_id: number;
  title: string;
  message: string;
  scheduled_time: string;
  is_sent: boolean;
  created_at: string;
}

// Billing Types
export interface UserBalance {
  id: number;
  user: string;
  user_full_name: string;
  available_tokens: number;
  payment_status: 'FREE_TRIAL' | 'UNSUBSCRIBED' | 'SUBSCRIBED';
  tokens_used: number;
  can_use_ai: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user: string;
  user_full_name: string;
  user_phone_number: string;
  sender_name: string;
  payment_method: 'DIRECT' | 'WAKALA';
  wakala_name?: string;
  transaction_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  amount: string;
  tokens_generated: number;
  confirmed_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionData {
  user_phone_number: string;
  sender_name: string;
  payment_method: 'DIRECT' | 'WAKALA';
  wakala_name?: string;
  amount: number;
}

export interface TokenUsage {
  id: number;
  user: string;
  usage_type: 'FULLFILLED' | 'PARTIAL' | 'EMPTY';
  tokens_used: number;
  weekly_report_id: number;
  created_at: string;
}



export interface BillingDashboardData {
  balance: {
    available_tokens: number;
    payment_status: string;
    tokens_used: number;
  };
  recent_transactions: Transaction[];
  pending_transactions: number;
  total_spent: number;
  can_use_ai: boolean;
}

export interface PaymentInfo {
  payment_number: string;
  payment_instructions: string[];
  token_calculation: string;
  usage_costs: {
    fullfilled: string;
    partial: string;
    empty: string;
  };
}

export interface BillingStats {
  total_revenue: number;
  pending_transactions: number;
  approved_transactions: number;
  rejected_transactions: number;
  total_tokens_distributed: number;
  active_subscribers: number;
}

// API Response interfaces for billing
export interface ApiBillingStatsResponse {
  transactions: {
    pending: number;
    approved: number;
    rejected: number;
    active_subscribers: number;
  };
  revenue: {
    total: number;
  };
  tokens: {
    total: number;
  };
}

export interface ApiTransactionsResponse {
  count: number;
  next: any;
  previous: any;
  results: Transaction[];
}

// Resources and Reports Types
export interface ReportResource {
  id: number;
  department: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'final' | 'general';
  document: string; // URL to the document
  uploaded_at: string;
  title?: string;
  description?: string;
  file_size?: string;
  file_type?: string;
}

export interface ReportFilters {
  department: string;
  report_type: string;
  search: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  coordinator: {
    name: string;
    email: string;
    phone: string;
    office_location: string;
  };
  documents: DepartmentDocument[];
  whatsapp_group: {
    name: string;
    invite_link: string;
  };
}

export interface DepartmentDocument {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  category: string;
}

export interface ResourcesData {
  departments: Department[];
  general_documents: DepartmentDocument[];
  office_hours: {
    weekdays: string;
    location: string;
  };
} 