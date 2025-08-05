// Mock data for development when backend endpoints are not available
import { DailyReport, WeeklyReport, MainJob } from '@/types';

export const mockDailyReports: DailyReport[] = [
  {
    id: 1,
    week_number: 1,
    date: '2025-07-21',
    description: 'Introduction to company procedures and safety protocols',
    hours_spent: 8,
    skills_learned: 'Safety protocols, company procedures',
    challenges_faced: 'Learning new safety procedures',
    supervisor_feedback: 'Good understanding of safety protocols',
    is_submitted: true,
    is_editable: false,
    student_name: 'John Doe',
    created_at: '2025-07-21T08:00:00Z',
    updated_at: '2025-07-21T08:00:00Z'
  },
  {
    id: 2,
    week_number: 1,
    date: '2025-07-22',
    description: 'Basic machine operation training',
    hours_spent: 7,
    skills_learned: 'Machine operation basics',
    challenges_faced: 'Understanding complex machinery',
    supervisor_feedback: 'Shows good potential',
    is_submitted: true,
    is_editable: false,
    student_name: 'John Doe',
    created_at: '2025-07-22T08:00:00Z',
    updated_at: '2025-07-22T08:00:00Z'
  },
  {
    id: 3,
    week_number: 1,
    date: '2025-07-23',
    description: 'Hands-on practice with equipment',
    hours_spent: 8,
    skills_learned: 'Practical equipment operation',
    challenges_faced: 'Coordination with team members',
    supervisor_feedback: 'Excellent teamwork',
    is_submitted: true,
    is_editable: false,
    student_name: 'John Doe',
    created_at: '2025-07-23T08:00:00Z',
    updated_at: '2025-07-23T08:00:00Z'
  },
  {
    id: 4,
    week_number: 1,
    date: '2025-07-24',
    description: 'Quality control procedures',
    hours_spent: 6,
    skills_learned: 'Quality control methods',
    challenges_faced: 'Attention to detail required',
    supervisor_feedback: 'Good attention to detail',
    is_submitted: true,
    is_editable: false,
    student_name: 'John Doe',
    created_at: '2025-07-24T08:00:00Z',
    updated_at: '2025-07-24T08:00:00Z'
  },
  {
    id: 5,
    week_number: 1,
    date: '2025-07-25',
    description: 'Documentation and report writing',
    hours_spent: 5,
    skills_learned: 'Technical writing, documentation',
    challenges_faced: 'Organizing information clearly',
    supervisor_feedback: 'Well-structured reports',
    is_submitted: true,
    is_editable: false,
    student_name: 'John Doe',
    created_at: '2025-07-25T08:00:00Z',
    updated_at: '2025-07-25T08:00:00Z'
  }
];

export const mockWeeklyReports: WeeklyReport[] = [
  {
    id: 1,
    week_number: 1,
    start_date: '2025-07-21',
    end_date: '2025-07-25',
    total_hours: 34,
    summary: 'Machine operation training and safety procedures',
    main_job_title: 'Machine Operation Training',
    main_job_description: 'Comprehensive training on machine operation and safety protocols',
    objectives_met: 'Safety protocols mastered, basic machine operation learned',
    learning_outcomes: 'Improved understanding of industrial safety and machine operation',
    supervisor_comments: 'Excellent progress in understanding safety procedures',
    status: 'DRAFT',
    is_ai_enhanced: false,
    can_submit: true,
    student_name: 'John Doe',
    daily_reports: mockDailyReports,
    main_job: {
      id: 1,
      weekly_report: 1,
      title: 'Machine Operation Training',
      operations: [
        {
          id: 1,
          step_number: 1,
          operation_description: 'Safety briefing and equipment introduction',
          tools_used: 'Safety equipment, training manuals',
          created_at: '2025-07-21T08:00:00Z',
          updated_at: '2025-07-21T08:00:00Z'
        },
        {
          id: 2,
          step_number: 2,
          operation_description: 'Basic machine setup and calibration',
          tools_used: 'Calibration tools, measurement devices',
          created_at: '2025-07-21T09:00:00Z',
          updated_at: '2025-07-21T09:00:00Z'
        },
        {
          id: 3,
          step_number: 3,
          operation_description: 'Production run with supervision',
          tools_used: 'Production machinery, quality control tools',
          created_at: '2025-07-21T10:00:00Z',
          updated_at: '2025-07-21T10:00:00Z'
        }
      ],
      created_at: '2025-07-21T08:00:00Z',
      updated_at: '2025-07-21T08:00:00Z'
    },
    created_at: '2025-07-21T08:00:00Z',
    updated_at: '2025-07-21T08:00:00Z'
  }
];

export const mockDashboardStats = {
  total_reports: 5,
  total_hours: 34,
  completed_weeks: 1,
  remaining_weeks: 7,
  current_week: 1
};

// Helper function to check if we should use mock data
export const shouldUseMockData = (error: any): boolean => {
  return error?.response?.status === 404 || error?.response?.status === 500;
};

// Helper function to get mock data with delay to simulate API call
export const getMockDataWithDelay = <T>(data: T, delay: number = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}; 