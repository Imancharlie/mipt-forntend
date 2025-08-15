import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';
import { useToastContext } from '@/contexts/ToastContext';
import { useAppStore } from '@/store';
import { AIEnhancementButton } from '@/components/AIEnhancementButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  PlusCircle, 
 
  Edit, 
  Save, 
  X, 
  AlertCircle,
  ArrowLeft,
  FileDown
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRef } from 'react';
import { getWeekDates } from '@/utils/dateUtils';
import { weeklyReportService, mainJobService } from '@/api/services';
import { testApiConnection, testWeeklyReportEndpoint } from '@/utils/debug';
import { CreateDailyReportData } from '@/types';

interface DailyReport {
  id: number;
  date: string;
  description: string;
  hours_spent: number;
  day_name?: string;
}

interface MainJobOperation {
  id: number;
  step_number: number;
  operation_description: string;
  tools_used: string;
}

interface WeeklyReportData {
  id?: number;
  week_number: number;
  start_date: string;
  end_date: string;
  total_hours: number;
  daily_reports: DailyReport[];
  main_job: {
    id?: number;
    title: string;
    operations: MainJobOperation[];
  };
}

export const WeeklyReportDetailPage: React.FC = () => {
  const params = useParams<{ weekNumber: string }>();
  const weekNumber = params?.weekNumber;
  const { fetchUserBalance } = useAppStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToastContext();
  
  const [reportData, setReportData] = useState<WeeklyReportData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingDaily, setIsAddingDaily] = useState(false);
  const [isEditingMainJob, setIsEditingMainJob] = useState(false);
  const [isEditingMainJobTitle, setIsEditingMainJobTitle] = useState(false);
  const [dailyHours, setDailyHours] = useState<{[key: string]: number}>({});
  const [dailyDescriptions, setDailyDescriptions] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedData = useRef(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  useEffect(() => {
    // close export menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const loadWeekData = async () => {
      if (!weekNumber) return;
      
      setIsLoading(true);
      
      try {
        const weekNum = parseInt(weekNumber);
        console.log('Loading week data for week:', weekNum);
        
        hasLoadedData.current = true;
        
        // Test API connection only once
        await testApiConnection();
        await testWeeklyReportEndpoint(weekNum);
        
        // Fetch weekly report from backend
        const weeklyReport = await weeklyReportService.getWeeklyReportByWeek(weekNum);
        console.log('Weekly report from backend:', weeklyReport);
        console.log('Main job from backend:', weeklyReport?.main_job);
        
        // Fetch daily reports for this week from backend
        const weekDailyReports = await weeklyReportService.getDailyReportsByWeek(weekNum);
        console.log('Daily reports from backend:', weekDailyReports);
        
        // Calculate total hours
        const totalHours = weekDailyReports.reduce((sum, report) => sum + report.hours_spent, 0);

        // Calculate week dates using utility function
        const weekDates = getWeekDates(weekNum);

        // Fetch main job operations if main job exists
        let mainJobOperations: MainJobOperation[] = [];
        if (weeklyReport?.main_job?.id) {
          try {
            console.log('Fetching operations for main job ID:', weeklyReport.main_job.id);
            mainJobOperations = await mainJobService.getOperations(weeklyReport.main_job.id);
            console.log('Main job operations from backend:', mainJobOperations);
          } catch (error) {
            console.warn('Failed to fetch main job operations:', error);
            console.error('Error details:', error);
          }
        } else {
          console.log('No main job ID found, skipping operations fetch');
        }

        setReportData({
          id: weeklyReport?.id,
          week_number: weekNum,
          start_date: weekDates.startDateStr,
          end_date: weekDates.endDateStr,
          total_hours: totalHours,
          daily_reports: weekDailyReports || [],
          main_job: {
            id: weeklyReport?.main_job?.id,
            title: weeklyReport?.main_job?.title || '',
            operations: mainJobOperations
          }
        });

        // Initialize dailyHours state with existing daily reports
        const initialDailyHours: { [key: string]: number } = {};
        const initialDailyDescriptions: { [key: string]: string } = {};
        
        // Map daily reports to days based on date
        weekDailyReports.forEach(report => {
          const reportDate = new Date(report.date);
          const dayName = reportDate.toLocaleDateString('en-US', { weekday: 'long' });
          if (dayName) {
            initialDailyHours[dayName] = report.hours_spent || 0;
            initialDailyDescriptions[dayName] = report.description || '';
          }
        });
        
        setDailyHours(initialDailyHours);
        setDailyDescriptions(initialDailyDescriptions);
      } catch (error) {
        console.error('Failed to load week data:', error);
        setReportData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWeekData();
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [weekNumber]); // Only depend on weekNumber

  // Calculate total hours automatically
  const calculateTotalHours = () => {
    let total = 0;
    
    // Calculate total from current form data (dailyHours state) and existing daily reports
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(dayName => {
      const dailyReport = getDailyReportForDay(dayName);
      let dayHours = 0;
      
      // Priority: dailyHours state (user input) > daily report from backend
      if (dailyHours[dayName] !== undefined) {
        dayHours = typeof dailyHours[dayName] === 'number' ? dailyHours[dayName] : parseFloat(dailyHours[dayName]) || 0;
      } else if (dailyReport?.hours_spent !== undefined) {
        dayHours = typeof dailyReport.hours_spent === 'number' ? dailyReport.hours_spent : parseFloat(dailyReport.hours_spent) || 0;
      }
      
      total += dayHours;
    });
    
    return total;
  };

  const handleSaveReport = async (data: any) => {
    try {
      console.log('Saving report:', data);
      
      if (!weekNumber) return;
      const weekNum = parseInt(weekNumber);
      const weekDates = getWeekDates(weekNum);
      
      // Prepare the weekly report data with daily reports
      const weeklyReportData = {
        week_number: weekNum,
        start_date: weekDates.startDateStr,
        end_date: weekDates.endDateStr,
        summary: data.summary || `Week ${weekNum} Report`,
        main_job_title: data.main_job_title || reportData?.main_job?.title || 'Main Job',
        main_job_description: data.main_job_description || 'Description of main job',
        // Include daily report data for each day
        daily_monday: data.daily_monday || '',
        hours_monday: data.hours_monday || 0,
        daily_tuesday: data.daily_tuesday || '',
        hours_tuesday: data.hours_tuesday || 0,
        daily_wednesday: data.daily_wednesday || '',
        hours_wednesday: data.hours_wednesday || 0,
        daily_thursday: data.daily_thursday || '',
        hours_thursday: data.hours_thursday || 0,
        daily_friday: data.daily_friday || '',
        hours_friday: data.hours_friday || 0,
        total_hours: calculateTotalHours(),
      };
      
      try {
        // Try to save to backend
        let updatedReport;
        if (reportData?.id) {
          // Update existing report
          updatedReport = await weeklyReportService.updateWeeklyReport(reportData.id, weeklyReportData);
        } else {
          // Create new report
          updatedReport = await weeklyReportService.createWeeklyReport(weeklyReportData);
        }
        
        // Update the report data with the backend response to get the main job ID
        if (updatedReport) {
          console.log('Weekly report saved, backend response:', updatedReport);
          console.log('Current operations before update:', reportData?.main_job?.operations);
          
          setReportData(prev => prev ? {
            ...prev,
            id: updatedReport.id,
            main_job: {
              id: updatedReport.main_job?.id,
              title: updatedReport.main_job?.title || data.main_job_title || 'Main Job',
              operations: prev.main_job?.operations || [] // Keep existing operations
            }
          } : prev);
          
          // Refresh operations from backend to ensure they're properly loaded
          if (updatedReport.main_job?.id) {
            try {
              console.log('Refreshing operations for main job ID:', updatedReport.main_job.id);
              const refreshedOperations = await mainJobService.getOperations(updatedReport.main_job.id);
              console.log('Refreshed operations from backend:', refreshedOperations);
              
              setReportData(prev => prev ? {
                ...prev,
                main_job: {
                  ...prev.main_job,
                  operations: refreshedOperations
                }
              } : prev);
            } catch (error) {
              console.warn('Failed to refresh operations after weekly report save:', error);
            }
          }
        }
        
        showSuccess('Report saved successfully!');
      } catch (backendError) {
        console.warn('Backend save failed, saving locally:', backendError);
        // Save locally when backend is unavailable
        const updatedReportData: WeeklyReportData = {
          id: reportData?.id || Date.now(), // Use timestamp as local ID
          week_number: reportData?.week_number || weekNum,
          start_date: reportData?.start_date || weekDates.startDateStr,
          end_date: reportData?.end_date || weekDates.endDateStr,
          total_hours: calculateTotalHours(),
          daily_reports: reportData?.daily_reports || [],
          main_job: reportData?.main_job || {
            title: '',
            operations: []
          }
        };
        setReportData(updatedReportData);
        showInfo('Report saved locally (backend unavailable)');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save report:', error);
      showError('Failed to save report. Please try again.');
    }
  };

  const handleAddDailyReport = async (data: any) => {
    try {
      if (!weekNumber) {
        showError('Week number not found');
        return;
      }
      const weekNum = parseInt(weekNumber);

      // Check for duplicate
      if (reportData?.daily_reports.some(r => r.date === data.date)) {
        showWarning('A daily report for this date already exists.');
        return;
      }

      const payload: CreateDailyReportData = { 
        ...data, 
        week_number: weekNum,
        date: data.date,
        description: data.description,
        hours_spent: parseFloat(data.hours_spent)
      };
      
      // POST to backend
      await weeklyReportService.createDailyReport(payload);
      
      // Re-fetch daily reports for this week
      const weekDailyReports = await weeklyReportService.getDailyReportsByWeek(weekNum);
      
      // Update state with new daily reports
      setReportData(prev => prev ? { 
        ...prev, 
        daily_reports: weekDailyReports,
        total_hours: weekDailyReports.reduce((sum, report) => {
          const hours = typeof report.hours_spent === 'number' ? report.hours_spent : parseFloat(report.hours_spent) || 0;
          return sum + hours;
        }, 0)
      } : prev);
      
      setIsAddingDaily(false);
      showSuccess('Daily report added successfully!');
    } catch (error: any) {
      // Log and display backend error message
      const backendMsg = error?.response?.data?.message || error?.response?.data?.detail || JSON.stringify(error?.response?.data) || error.message;
      showError('Failed to add daily report: ' + backendMsg);
      console.error('Failed to add daily report:', error);
    }
  };



  // New handlers for main job operations editing
  const handleSaveMainJobOperations = async () => {
    try {
      if (!reportData?.main_job?.id) {
        showWarning('Main job not found. Please save the weekly report first.');
        return;
      }

      // Get all the form data for operations
      const formData = getValues();
      const mainJobId = reportData.main_job.id!;
      
      // Update existing operations first
      const updatedOperations: MainJobOperation[] = [];
      for (const operation of reportData.main_job.operations) {
        const operationDescription = formData[`operation_${operation.id}`] || operation.operation_description;
        const toolsUsed = formData[`tools_${operation.id}`] || operation.tools_used;
        
        // Update operation in backend
        const updatedOperation = await mainJobService.updateOperation(mainJobId, operation.id, {
          operation_description: operationDescription,
          tools_used: toolsUsed,
        });
        
        updatedOperations.push(updatedOperation);
      }

      // Create new operation if exists
      const newOperationDescription = formData.new_operation_description;
      const newToolsUsed = formData.new_tools_used;
      
      if (newOperationDescription && newToolsUsed) {
        // Create new operation in backend
        const createdOperation = await mainJobService.createOperation(mainJobId, {
          main_job: mainJobId,
          step_number: updatedOperations.length + 1,
          operation_description: newOperationDescription,
          tools_used: newToolsUsed,
        });
        
        updatedOperations.push(createdOperation);
      }

      // Update state with real database IDs
      setReportData(prev => prev ? {
        ...prev,
        main_job: {
          ...prev.main_job,
          operations: updatedOperations
        }
      } : prev);

      setIsEditingMainJob(false);
      showSuccess('Main job operations saved successfully!');
    } catch (error) {
      console.error('Failed to save main job operations:', error);
      showError('Failed to save main job operations: ' + (error as any)?.message || 'Unknown error');
    }
  };

  const handleSaveMainJobTitle = async () => {
    try {
      if (!reportData?.main_job?.id) {
        showWarning('Main job not found. Please save the weekly report first.');
        return;
      }

      const formData = getValues();
      const newTitle = formData.main_job_title || reportData.main_job.title;

      // Update main job title in backend
      const mainJobId = reportData.main_job.id!;
      await mainJobService.updateMainJob(mainJobId, {
        title: newTitle
      });

      // Update state
      setReportData(prev => prev ? {
        ...prev,
        main_job: {
          ...prev.main_job,
          title: newTitle
        }
      } : prev);

      // Refresh operations to ensure they're properly loaded
      try {
        const refreshedOperations = await mainJobService.getOperations(mainJobId);
        setReportData(prev => prev ? {
          ...prev,
          main_job: {
            ...prev.main_job,
            operations: refreshedOperations
          }
        } : prev);
      } catch (error) {
        console.warn('Failed to refresh operations after title update:', error);
      }

      setIsEditingMainJobTitle(false);
      showSuccess('Main job title saved successfully!');
    } catch (error) {
      console.error('Failed to save main job title:', error);
      showError('Failed to save main job title: ' + (error as any)?.message || 'Unknown error');
    }
  };

  const handleDeleteOperation = async (operationId: number) => {
    try {
      if (!reportData?.main_job?.id) {
        showWarning('Main job not found.');
        return;
      }

      // Remove from state
      setReportData(prev => prev ? {
        ...prev,
        main_job: {
          ...prev.main_job,
          operations: prev.main_job.operations.filter(op => op.id !== operationId)
        }
      } : prev);

      // Delete from backend
      const mainJobId = reportData.main_job.id!;
      await mainJobService.deleteOperation(mainJobId, operationId);

      showSuccess('Operation deleted successfully!');
    } catch (error) {
      console.error('Failed to delete operation:', error);
      showError('Failed to delete operation: ' + (error as any)?.message || 'Unknown error');
    }
  };

  const handleDownloadReport = async (format: 'pdf' | 'docx') => {
    try {
      if (!weekNumber) return;
      
      const weekNum = parseInt(weekNumber);
      
      // Check if there's actual data to download
      if (!reportData || reportData.daily_reports.length === 0) {
        showWarning('⚠️ Be careful! No data available to download. Please add daily reports and complete the weekly report before downloading.');
        return;
      }
      
      // Check if the report has meaningful content
      const hasContent = reportData.daily_reports.some(report => 
        report.description && report.description.trim().length > 0
      );
      
      if (!hasContent) {
        showWarning('⚠️ Be careful! The report contains no meaningful content. Please add descriptions to your daily reports before downloading.');
        return;
      }
      
      try {
        // Try to download from backend
        let blob: Blob;
        
        if (format === 'pdf') {
          blob = await weeklyReportService.downloadWeeklyReportPDF(weekNum);
        } else {
          blob = await weeklyReportService.downloadWeeklyReportDOCX(weekNum);
        }
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `week-${weekNum}-report.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showSuccess(`Downloaded ${format.toUpperCase()} report from backend!`);
      } catch (backendError) {
        console.warn(`Backend download failed for ${format}, creating mock download:`, backendError);
        
        // Create mock download when backend is unavailable
        const mockContent = `Week ${weekNum} Report\n\nThis is a mock ${format.toUpperCase()} report.\nBackend is currently unavailable.\n\nReport Data:\n${JSON.stringify(reportData, null, 2)}`;
        const blob = new Blob([mockContent], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `week-${weekNum}-report.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showInfo(`Downloaded mock ${format.toUpperCase()} report (backend unavailable)`);
      }
    } catch (error) {
      console.error(`Failed to download ${format.toUpperCase()}:`, error);
      showError(`Failed to download ${format.toUpperCase()} report. Please try again.`);
    }
  };

  const getDayAbbreviation = (dayName: string) => {
    return dayName.substring(0, 3);
  };

  const getDailyReportForDay = (dayName: string) => {
    if (!reportData?.daily_reports) return undefined;
    return reportData.daily_reports.find(report => {
      const reportDate = new Date(report.date);
      const reportDayName = reportDate.toLocaleDateString('en-US', { weekday: 'long' });
      return reportDayName === dayName;
    });
  };

  const handleHoursChange = (dayName: string, hours: number) => {
    setDailyHours(prev => ({
      ...prev,
      [dayName]: hours
    }));
  };

  const handleDescriptionChange = (dayName: string, description: string) => {
    setDailyDescriptions(prev => ({
      ...prev,
      [dayName]: description
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-3">
        <LoadingSpinner size="md" message="Loading weekly report..." />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-3">
        <AlertCircle className={`w-5 h-5 text-${theme}-500 mb-2`} />
        <p className="text-gray-600 text-xs mb-4">Weekly report not found</p>
        <button
          onClick={async () => {
            try {
              if (!weekNumber) return;
              const weekNum = parseInt(weekNumber);
              const weekDates = getWeekDates(weekNum);
              
              await weeklyReportService.createWeeklyReport({
                week_number: weekNum,
                start_date: weekDates.startDateStr,
                end_date: weekDates.endDateStr,
                summary: `Week ${weekNum} Report`,
                main_job_title: 'Main Job',
                main_job_description: 'Description of main job'
              });
              
              // Reload the page data
              window.location.reload();
            } catch (error) {
              console.error('Failed to create report:', error);
              showError('Failed to create report. Please try again.');
            }
          }}
          className={`btn-primary flex items-center gap-2 px-4 py-2 text-sm`}
        >
          <PlusCircle className="w-4 h-4" />
          Create Week {weekNumber} Report
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 lg:p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-4 lg:mb-6">
        <div className="flex items-center gap-2 lg:gap-4 mb-3 lg:mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`p-1.5 lg:p-2 rounded-lg bg-${theme}-100 text-${theme}-600 hover:bg-${theme}-200`}
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <div>
            <h1 className={`text-lg lg:text-2xl xl:text-3xl font-bold text-${theme}-600`}>
              Week {reportData.week_number} Report
            </h1>
            <p className="text-gray-600 text-xs lg:text-sm">
              {new Date(reportData.start_date).toLocaleDateString()} - {new Date(reportData.end_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className={`btn-primary flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2`}
              >
                <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                Edit Report
              </button>
              
              {/* AI Enhancement Button */}
              {(reportData.week_number ?? reportData.id) && (
                <AIEnhancementButton
                  weeklyReportId={reportData.week_number ?? reportData.id}
                  reportData={reportData}
                  onEnhancementComplete={async (_data) => {
                    // Refresh the user balance to show updated tokens
                    try {
                      await fetchUserBalance();
                    } catch (error) {
                      console.error('Failed to refresh user balance:', error);
                    }
                    // Refresh the page data after enhancement
                    window.location.reload();
                  }}
                  className="text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2"
                />
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSubmit(handleSaveReport)}
                className={`btn-primary flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2`}
              >
                <Save className="w-3 h-3 lg:w-4 lg:h-4" />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className={`btn-secondary flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2`}
              >
                <X className="w-3 h-3 lg:w-4 lg:h-4" />
                Cancel
              </button>
            </div>
          )}
          
          {/* <button
            onClick={() => handleDownloadReport('pdf')}
            className={`btn-secondary flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2`}
          >
            <Download className="w-3 h-3 lg:w-4 lg:h-4" />
            PDF
          </button> */}
          
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className={`btn-secondary flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2`}
              aria-haspopup="menu"
              aria-expanded={showExportMenu}
            >
              <FileDown className="w-3 h-3 lg:w-4 lg:h-4" />
              Export
            </button>
            {showExportMenu && (
              <div
                role="menu"
                className="absolute z-40 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden"
              >
                <button
                  role="menuitem"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    setShowExportMenu(false);
                    handleDownloadReport('pdf');
                  }}
                >
                  PDF
                </button>
                <button
                  role="menuitem"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    setShowExportMenu(false);
                    handleDownloadReport('docx');
                  }}
                >
                  DOCX
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="space-y-4 lg:space-y-6">
        {/* Report Header */}
        <div className="card p-3 lg:p-4">
          <div className="text-center mb-4 lg:mb-6">
            <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-2">College of Engineering and Technology (CoET)</h2>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-8 text-xs lg:text-sm">
              <div className="flex items-center gap-1 lg:gap-2">
                <span className="font-medium">Weekly Report No:</span>
                {isEditing ? (
                  <input
                    {...register('week_number')}
                    defaultValue={reportData.week_number}
                    className="w-12 lg:w-16 p-1 border border-gray-300 rounded text-center text-xs"
                  />
                ) : (
                  <span className="font-bold">{reportData.week_number}</span>
                )}
              </div>
              <div className="flex items-center gap-1 lg:gap-2">
                <span className="font-medium">from:</span>
                {isEditing ? (
                  <input
                    type="date"
                    {...register('start_date')}
                    defaultValue={reportData.start_date}
                    className="p-1 border border-gray-300 rounded text-xs"
                  />
                ) : (
                  <span>{new Date(reportData.start_date).toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex items-center gap-1 lg:gap-2">
                <span className="font-medium">to:</span>
                {isEditing ? (
                  <input
                    type="date"
                    {...register('end_date')}
                    defaultValue={reportData.end_date}
                    className="p-1 border border-gray-300 rounded text-xs"
                  />
                ) : (
                  <span>{new Date(reportData.end_date).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Work Log */}
        <div className="card p-3 lg:p-4">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">Daily Work Log</h2>
            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  onClick={handleSubmit(handleSaveReport)}
                  className={`btn-primary flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2`}
                >
                  <Save className="w-3 h-3 lg:w-4 lg:h-4" />
                  Save
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-xs lg:text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-1 py-2 lg:px-2 lg:py-3 text-left font-semibold w-12">Day</th>
                  <th className="border border-gray-300 px-2 py-2 lg:px-4 lg:py-3 text-left font-semibold">Brief description of work performed</th>
                  <th className="border border-gray-300 px-1 py-2 lg:px-2 lg:py-3 text-left font-semibold w-16">hr</th>
                </tr>
              </thead>
              <tbody>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((dayName) => {
                  const dailyReport = getDailyReportForDay(dayName);
                  // Ensure hours are properly converted to numbers
                  let currentHours = 0;
                  if (dailyHours[dayName] !== undefined) {
                    currentHours = typeof dailyHours[dayName] === 'number' ? dailyHours[dayName] : parseFloat(dailyHours[dayName]) || 0;
                  } else if (dailyReport?.hours_spent !== undefined) {
                    currentHours = typeof dailyReport.hours_spent === 'number' ? dailyReport.hours_spent : parseFloat(dailyReport.hours_spent) || 0;
                  }
                  const currentDescription = dailyDescriptions[dayName] ?? dailyReport?.description ?? '';
                  
                                      return (
                      <tr key={dayName} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-1 py-2 lg:px-2 lg:py-3 font-medium text-center">
                          {getDayAbbreviation(dayName)}
                        </td>
                                                <td className="border border-gray-300 px-2 py-2 lg:px-4 lg:py-3">
                          {isEditing ? (
                            <textarea
                              {...register(`daily_${dayName.toLowerCase()}`)}
                              defaultValue={currentDescription}
                              onChange={(e) => handleDescriptionChange(dayName, e.target.value)}
                              className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs resize-none"
                              placeholder="Describe work performed..."
                              rows={4}
                              style={{ minHeight: '80px' }}
                            />
                          ) : (
                            <p className="text-gray-900 text-xs lg:text-sm">{currentDescription || 'No work recorded'}</p>
                          )}
                        </td>
                                              <td className="border border-gray-300 px-1 py-2 lg:px-2 lg:py-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              {...register(`hours_${dayName.toLowerCase()}`)}
                              defaultValue={currentHours}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                handleHoursChange(dayName, value);
                              }}
                              className="w-12 p-1 border border-gray-300 rounded text-xs text-center"
                              min="0"
                              max="24"
                              step="0.5"
                            />
                          ) : (
                            <span className="font-medium text-xs lg:text-sm">{currentHours}</span>
                          )}
                        </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border border-gray-300 px-1 py-2 lg:px-2 lg:py-3 text-xs lg:text-sm text-center">Total</td>
                  <td className="border border-gray-300 px-2 py-2 lg:px-4 lg:py-3"></td>
                  <td className="border border-gray-300 px-1 py-2 lg:px-2 lg:py-3 text-center text-xs lg:text-sm">
                    {isEditing ? calculateTotalHours() : calculateTotalHours()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Main Job Section */}
        <div className="card p-3 lg:p-4">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">Main Job & Operations</h2>
            <div className="flex gap-2">
              {!isEditingMainJob ? (
                <button
                  onClick={() => setIsEditingMainJob(true)}
                  className={`btn-primary flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2`}
                >
                  <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                  Edit Operations
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveMainJobOperations}
                    className={`btn-primary flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2`}
                  >
                    <Save className="w-3 h-3 lg:w-4 lg:h-4" />
                    Save Operations
                  </button>
                  <button
                    onClick={() => setIsEditingMainJob(false)}
                    className={`btn-secondary flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2`}
                  >
                    <X className="w-3 h-3 lg:w-4 lg:h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Main Job Title */}
          <div className="mb-4 lg:mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs lg:text-sm font-medium">Main Job Title</label>
              {!isEditingMainJobTitle ? (
                <button
                  onClick={() => setIsEditingMainJobTitle(true)}
                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit Title
                </button>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveMainJobTitle}
                    className="text-green-600 hover:text-green-800 text-xs flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingMainJobTitle(false)}
                    className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {isEditingMainJobTitle ? (
              <input
                {...register('main_job_title')}
                defaultValue={reportData.main_job.title}
                className="input-field text-xs lg:text-sm"
                placeholder="Enter main job title..."
              />
            ) : (
              <p className="text-gray-900 text-sm lg:text-lg font-medium">{reportData.main_job.title || 'No main job defined'}</p>
            )}
          </div>

          {/* Operations Table */}
          {/* To adjust column widths, modify the w-* classes in the th elements above */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-xs lg:text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-1 py-2 lg:px-2 lg:py-3 text-left font-semibold w-8">#</th>
                  <th className="border border-gray-300 px-2 py-2 lg:px-4 lg:py-3 text-left font-semibold">Operation</th>
                  <th className="border border-gray-300 px-2 py-2 lg:px-4 lg:py-3 text-left font-semibold">Tools, Machinery, Equipment</th>
                </tr>
              </thead>
              <tbody>
                {reportData.main_job.operations.length > 0 ? (
                  reportData.main_job.operations.map((operation) => (
                    <tr key={operation.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-1 py-2 lg:px-2 lg:py-3 font-medium text-center">
                        {operation.step_number}
                        {isEditingMainJob && (
                          <button
                            onClick={() => handleDeleteOperation(operation.id)}
                            className="ml-2 text-red-500 hover:text-red-700 text-xs"
                            title="Delete operation"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 lg:px-4 lg:py-3">
                        {isEditingMainJob ? (
                          <textarea
                            {...register(`operation_${operation.id}`)}
                            defaultValue={operation.operation_description}
                            className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs resize-none"
                            rows={5}
                            style={{ minHeight: '100px' }}
                            placeholder="Describe the operation..."
                          />
                        ) : (
                          <p className="text-gray-900 text-xs lg:text-sm">{operation.operation_description}</p>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 lg:px-4 lg:py-3">
                        {isEditingMainJob ? (
                          <textarea
                            {...register(`tools_${operation.id}`)}
                            defaultValue={operation.tools_used}
                            className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs resize-none"
                            rows={3}
                            style={{ minHeight: '60px' }}
                            placeholder="List tools, machinery, equipment..."
                          />
                        ) : (
                          <p className="text-gray-900 text-xs lg:text-sm">{operation.tools_used}</p>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="border border-gray-300 px-2 py-4 lg:px-4 lg:py-8 text-center text-gray-500 text-xs lg:text-sm">
                      No operations defined yet
                    </td>
                  </tr>
                )}
                
                {/* Add new operation row when editing main job */}
                {isEditingMainJob && (
                  <tr className="hover:bg-gray-50 border-t-2 border-gray-400 bg-blue-50">
                    <td className="border border-gray-300 px-1 py-2 lg:px-2 lg:py-3 font-medium text-center text-blue-600">
                      {reportData.main_job.operations.length + 1}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 lg:px-4 lg:py-3">
                      <textarea
                        {...register('new_operation_description')}
                        className="w-full p-1 lg:p-2 border border-blue-300 rounded text-xs resize-none"
                        placeholder="Describe the new operation..."
                        rows={5}
                        style={{ minHeight: '100px' }}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2 lg:px-4 lg:py-3">
                      <textarea
                        {...register('new_tools_used')}
                        className="w-full p-1 lg:p-2 border border-blue-300 rounded text-xs resize-none"
                        placeholder="List tools, machinery, equipment..."
                        rows={3}
                        style={{ minHeight: '60px' }}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Daily Report Modal */}
      {isAddingDaily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md">
            <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Add Daily Report</h3>
            <form onSubmit={handleSubmit(handleAddDailyReport)} className="space-y-3 lg:space-y-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-2">Date</label>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  className="input-field text-xs lg:text-sm"
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message?.toString()}</p>}
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-2">Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  className="input-field text-xs lg:text-sm"
                  rows={3}
                  placeholder="Describe the work performed..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message?.toString()}</p>}
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-2">Hours Spent</label>
                <input
                  type="number"
                  {...register('hours_spent', { required: 'Hours is required', min: 0, max: 24 })}
                  className="input-field text-xs lg:text-sm"
                  min="0"
                  max="24"
                  step="0.5"
                />
                {errors.hours_spent && <p className="text-red-500 text-xs mt-1">{errors.hours_spent.message?.toString()}</p>}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1 text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2">Add Report</button>
                <button
                  type="button"
                  onClick={() => setIsAddingDaily(false)}
                  className="btn-secondary flex-1 text-xs lg:text-sm px-3 py-1.5 lg:px-4 lg:py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}; 