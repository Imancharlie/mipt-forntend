import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { WeeklyReport } from '@/types';
import { useToastContext } from '@/contexts/ToastContext';
import apiClient from '@/api/client';
import { 
  Loader2, 
  CheckCircle, 
  TrendingUp,
  BookOpen,
  AlertTriangle,
  ChevronRight,
  Download as DownloadIcon,
  Play,
  Eye,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface WeekOverview {
  weekNumber: number;
  status: 'completed' | 'in-progress' | 'not-started';
  completionPercentage: number;
  totalHours: number;
  dailyReportsCount: number;
  startDate: string;
  endDate: string;
  report?: WeeklyReport;
}

export const WeeklyReportPage: React.FC = () => {
  const { weeklyReports, fetchWeeklyReports, loading, downloadAllWeeklyReports } = useAppStore();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  const [isDownloading, setIsDownloading] = useState(false);
  const [dailyReportsData, setDailyReportsData] = useState<{[key: number]: any[]}>({});

  useEffect(() => {
    fetchWeeklyReports();
  }, [fetchWeeklyReports]);

  // Fetch daily reports for each week to get accurate counts
  useEffect(() => {
    const fetchDailyReportsForWeeks = async () => {
      const dailyData: {[key: number]: any[]} = {};
      
      for (let week = 1; week <= 8; week++) {
        try {
          const response = await apiClient.get(`/reports/daily/?week_number=${week}`);
          dailyData[week] = response.data.results || [];
        } catch (error) {
          console.log(`No daily reports found for week ${week}`);
          dailyData[week] = [];
        }
      }
      
      setDailyReportsData(dailyData);
    };

    fetchDailyReportsForWeeks();
  }, []);

  // Generate 8 weeks overview with real progress tracking
  const generateWeeksOverview = (): WeekOverview[] => {
    const weeks: WeekOverview[] = [];
    const currentDate = new Date();
    

    
    for (let week = 1; week <= 8; week++) {
      const weekReport = weeklyReports.find(report => report.week_number === week);
      const weekStartDate = new Date(2025, 0, 20 + (week - 1) * 7); // Starting from January 20, 2025
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 4); // Monday to Friday
      
      let status: 'completed' | 'in-progress' | 'not-started' = 'not-started';
      let completionPercentage = 0;
      let totalHours = 0;
      let dailyReportsCount = 0;
      
      if (weekReport) {
        totalHours = weekReport.total_hours || 0;
        
        // Use daily reports from the separate API call for accurate count
        const weekDailyReports = dailyReportsData[week] || [];
        dailyReportsCount = weekDailyReports.length;
        

        
        // Real progress calculation: 80% from daily reports, 20% from main jobs
        let dailyProgress = 0;
        let mainJobsProgress = 0;
        
        // Calculate daily reports progress (80% weight)
        if (dailyReportsCount > 0) {
          dailyProgress = Math.min((dailyReportsCount / 5) * 0.8, 0.8); // Max 80%
        }
        
        // Calculate main jobs progress (20% weight)
        const hasMainJobs = weekReport.main_job && weekReport.main_job.operations && weekReport.main_job.operations.length > 0;
        const hasMainJobsContent = hasMainJobs && weekReport.main_job.operations.some((operation: any) => 
          operation.operation_description && operation.operation_description.trim().length > 0
        );
        
        if (hasMainJobsContent) {
          mainJobsProgress = 0.2; // Full 20% if main jobs have content
        } else if (hasMainJobs) {
          mainJobsProgress = 0.1; // Partial 10% if main jobs exist but empty
        }
        
        // Total completion percentage
        completionPercentage = Math.round((dailyProgress + mainJobsProgress) * 100);
        
        // Determine status based on completion
        if (completionPercentage >= 100) {
          status = 'completed';
          completionPercentage = 100;
        } else if (completionPercentage > 0) {
          status = 'in-progress';
        } else {
          status = 'not-started';
        }
        
        // Override with report status if it's submitted/approved
        if (weekReport.status === 'SUBMITTED' || weekReport.status === 'APPROVED') {
          status = 'completed';
          completionPercentage = 100;
        }
      } else {
        // Check if this week is in the past
        if (currentDate > weekEndDate) {
          status = 'not-started';
          completionPercentage = 0;
        } else if (currentDate >= weekStartDate && currentDate <= weekEndDate) {
          status = 'in-progress';
          completionPercentage = 0;
        }
      }
      
      weeks.push({
        weekNumber: week,
        status,
        completionPercentage,
        totalHours,
        dailyReportsCount,
        startDate: weekStartDate.toISOString().split('T')[0],
        endDate: weekEndDate.toISOString().split('T')[0],
        report: weekReport
      });
    }
    
    return weeks;
  };

  const weeksOverview = generateWeeksOverview();
  const totalCompletedWeeks = weeksOverview.filter(w => w.status === 'completed').length;
  const totalInProgressWeeks = weeksOverview.filter(w => w.status === 'in-progress').length;
  const totalProgress = (totalCompletedWeeks / 8) * 100;

  const handleWeekClick = (weekNumber: number) => {
    navigate(`/weekly-report/${weekNumber}`);
  };

  const handleDownloadAllReports = async () => {
    if (weeklyReports.length === 0) {
      showError('No reports available to download. Please complete some weekly reports first.');
      return;
    }

    setIsDownloading(true);
    try {
      await downloadAllWeeklyReports('pdf');
      showSuccess('All weekly reports downloaded successfully!');
    } catch (error) {
      console.error('Failed to download reports:', error);
      showError('Failed to download reports. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'in-progress':
        return <Play className="w-4 h-4 text-amber-500" />;
      case 'not-started':
        return <Calendar className="w-4 h-4 text-slate-400" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-emerald-500/10 to-emerald-600/5 border-emerald-200/50';
      case 'in-progress':
        return 'from-amber-500/10 to-amber-600/5 border-amber-200/50';
      case 'not-started':
        return 'from-slate-500/5 to-slate-600/5 border-slate-200/50';
      default:
        return 'from-slate-500/5 to-slate-600/5 border-slate-200/50';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-500';
      case 'in-progress':
        return 'text-amber-500';
      case 'not-started':
        return 'text-slate-400';
      default:
        return 'text-slate-400';
    }
  };

  if (loading.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <LoadingSpinner size="lg" color="primary" message="Loading your training progress..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Glassmorphism Header */}
        <div className={`relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8 shadow-2xl shadow-${theme}-500/10`}>
          <div className={`absolute inset-0 bg-gradient-to-r from-${theme}-600/5 via-${theme}-600/5 to-${theme}-600/5`}></div>
          <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-gradient-to-br from-${theme}-400/20 to-${theme}-400/20 rounded-full blur-3xl`}></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-xl shadow-lg`}>
                    <FileText className="w-5 h-5 text-white" />
              </div>
                  <h1 className={`text-2xl font-bold text-${theme}-600`}>
                    LOG BOOK
                  </h1>
              </div>
                <p className="text-sm text-gray-600">Log book is the commbination of all weekly reports and consist of 20 marks out of 100 of the PT</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Download button */}
              <button 
                onClick={handleDownloadAllReports}
                disabled={isDownloading || weeklyReports.length === 0}
                className={`group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-1 text-sm ${
                  isDownloading || weeklyReports.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <DownloadIcon className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  )}
                  <span>All Reports</span>
                </div>
              </button>
            </div>
            </div>

            {/* Compact Stats Cards - Hidden on mobile, visible on desktop */}
            <div className="hidden md:grid grid-cols-2 gap-6">
              <div className="group relative overflow-hidden bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-4 hover:bg-white/80 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-600">Real Progress</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{totalProgress.toFixed(1)}%</p>
                    <p className="text-xs text-slate-500 mt-1">80% Daily + 20% Jobs</p>
                  </div>
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${totalProgress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                </div>
              </div>
                
              <div className="group relative overflow-hidden bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-4 hover:bg-white/80 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-slate-600">Weeks Status</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{totalCompletedWeeks}<span className="text-lg text-slate-500">/8</span></p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-500 mb-1">In Progress</span>
                    <span className="text-lg font-semibold text-amber-600">{totalInProgressWeeks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Week Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {weeksOverview.map((week, index) => (
            <div 
              key={week.weekNumber}
              onClick={() => handleWeekClick(week.weekNumber)}
              className={`group relative overflow-hidden bg-gradient-to-br ${getStatusColor(week.status)} backdrop-blur-sm border rounded-2xl p-3 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 animate-in slide-in-from-bottom-4`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Status indicator */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(week.status)}
                  <span className="text-xs font-semibold text-slate-700">Week {week.weekNumber}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>

              {/* Progress Circle */}
              <div className="flex justify-center mb-2">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={getProgressColor(week.status)}
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${week.completionPercentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-700">
                      {week.completionPercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Date Range */}
              <div className="text-center mb-2">
                <p className="text-xs text-slate-600 font-medium">
                  {new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(week.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Progress Breakdown */}
              {week.report && (
                <div className="text-center mb-2">
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{week.dailyReportsCount}/5 days</span>
                    <span className="text-slate-400">•</span>
                    <FileText className="w-3 h-3" />
                    <span>{week.report.main_job?.operations?.length || 0} jobs</span>
                  </div>

                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-2 space-y-1">
                {week.report ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWeekClick(week.weekNumber);
                    }}
                    className="w-full bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-white/30 text-slate-700 rounded-lg py-1 px-2 text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWeekClick(week.weekNumber);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm border border-blue-200/30 text-slate-700 rounded-lg py-1 px-2 text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Start
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {weeklyReports.length === 0 && !loading.isLoading && (
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-emerald-600/5"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Begin Your Journey</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                Start your industrial training adventure by creating your first weekly report. 
                Track your progress through 8 weeks of hands-on learning.
              </p>
              <button 
                onClick={() => handleWeekClick(1)}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  <span>Start Week 1</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Download Warning */}
        {weeklyReports.length === 0 && (
          <div className="mt-6 relative overflow-hidden bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Export Unavailable</h4>
                <p className="text-amber-700 text-sm leading-relaxed">
                  Complete your weekly reports first to unlock the export feature. Your progress will be automatically saved.
                </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}; 