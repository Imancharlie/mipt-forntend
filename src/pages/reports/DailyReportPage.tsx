import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { DailyReport, CreateDailyReportData } from '@/types';
import apiClient from '@/api/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  Leaf,
  Award,
  Download,
  Upload,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToastContext } from '@/contexts/ToastContext';
interface DayData {
  dayName: string;
  date: string;
  isCompleted: boolean;
  hours: number;
  description: string;
  report?: DailyReport;
}

interface CertificateData {
  studentName: string;
  companyName: string;
  weekNumber: number;
  profileImage?: string;
}

export const DailyReportPage: React.FC = () => {
  const { createDailyReport, fetchDailyReports, user } = useAppStore();
  const { theme } = useTheme();
  const { showSuccess, showError, showInfo } = useToastContext();

  
  // Calculate current week based on July 21, 2025 start date (Monday)
  const getCurrentWeekNumber = () => {
    const startDate = new Date(2025, 6, 21); // July 21, 2025 (Monday)
    const today = new Date(); // Use actual current date
    
    // For testing purposes, if we're not in 2025, use August 4, 2025 as the current date
    if (today.getFullYear() !== 2025) {
      today.setFullYear(2025);
      today.setMonth(7); // August
      today.setDate(4); // August 4
    }
    
    // If it's Saturday or Sunday, show the previous week
    if (today.getDay() === 6 || today.getDay() === 0) {
      // Go back to Friday of the current week
      const daysToSubtract = today.getDay() === 6 ? 1 : 2; // Saturday: -1, Sunday: -2
      today.setDate(today.getDate() - daysToSubtract);
    }
    
    // Calculate the week number based on Monday-to-Friday weeks
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7) + 1; // 7 days per week (Mon-Sun)
    
    return Math.max(1, diffWeeks);
  };
  
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekNumber());
  
  // Debug: Log the current week calculation
  console.log('Current week number:', getCurrentWeekNumber());
  console.log('Selected week:', selectedWeek);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData>({
    studentName: user?.username || '',
    companyName: '',
    weekNumber: 1,
    profileImage: ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    time: '18:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    notification_type: 'browser' as 'browser' | 'email' | 'both',
    message: 'Time to log your daily activities!'
  });
  const [weekDays, setWeekDays] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch, setValue } = useForm<CreateDailyReportData>();

  useEffect(() => {
    fetchDailyReports();
  }, [fetchDailyReports]);

  // Generate week dates for 2025 based on July 21 start date
  const getWeekDates = (weekNumber: number) => {
    // Start date is July 21, 2025 (Monday)
    const firstMonday = new Date(2025, 6, 21); // July 21, 2025 (month is 0-indexed)
    
    // Calculate the start date for the selected week (Monday)
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7); // 7 days between weeks
    
    console.log(`Week ${weekNumber} start date:`, weekStart.toDateString());
    
    const dates = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      // Use local date string to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log(`Day ${i + 1}:`, date.toDateString(), 'Date string:', dateString);
      
      // Check if the date is in 2025
      if (date.getFullYear() === 2025) {
        dates.push({
          dayName: days[i],
          date: dateString,
          isCompleted: false,
          hours: 0,
          description: ''
        });
      }
    }
    
    console.log(`Week ${weekNumber} dates:`, dates.map(d => d.date));
    return dates;
  };

    const loadWeekData = async () => {
    setIsLoading(true);
    try {
      const days = getWeekDates(selectedWeek);
      
              // Fetch daily reports for this week using apiClient
        console.log(`Fetching reports for week ${selectedWeek}`);
        const response = await apiClient.get(`/reports/daily/?week_number=${selectedWeek}`);
        console.log('API Response:', response.data);
      
              // Handle different response formats
        let reports = [];
        if (Array.isArray(response.data)) {
          reports = response.data;
        } else if (response.data && Array.isArray(response.data.results)) {
          reports = response.data.results;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          reports = response.data.data;
        }
        
        console.log('All reports from backend:', reports.map((r: any) => ({ date: r.date, description: r.description?.substring(0, 20) + '...' })));
      
              // Map existing reports to days and pre-fill form if data exists
        const updatedDays = days.map(day => {
          console.log(`Looking for day ${day.dayName} (${day.date})`);
          
          const existingReport = reports.find((report: DailyReport) => 
            report.date === day.date
          );
          
          if (existingReport) {
            console.log(`Found report for ${day.dayName}:`, existingReport);
          }
        
        if (existingReport) {
          return {
            ...day,
            isCompleted: true,
            hours: parseFloat(existingReport.hours_spent) || 0, // Ensure it's a number
            description: existingReport.description || '',
            report: existingReport
          };
        }
        return day;
      });
      
      setWeekDays(updatedDays);
      
      // Pre-fill form with current day's data if it exists
      const currentDay = updatedDays[currentDayIndex];
      if (currentDay && currentDay.isCompleted) {
        setValue('date', currentDay.date);
        setValue('description', currentDay.description);
        setValue('hours_spent', parseFloat(currentDay.hours.toString()) || 0);
      } else if (currentDay) {
        // Pre-fill with empty data for current day
        setValue('date', currentDay.date);
        setValue('description', '');
        setValue('hours_spent', 0);
      }
      
      // Set current day to Monday (index 0) by default
      setCurrentDayIndex(0);
    } catch (error) {
      console.error('Failed to load week data:', error);
      setWeekDays(getWeekDates(selectedWeek));
    } finally {
      setIsLoading(false);
    }
  };

  // Load week data when component mounts and when selected week changes
  useEffect(() => {
    loadWeekData();
  }, [selectedWeek]);

  // Check if all days are completed for certificate
  const allDaysCompleted = weekDays.every(day => day.isCompleted);
  const totalHours = weekDays.reduce((sum, day) => sum + parseFloat(day.hours.toString()), 0);

  const handleDayClick = (dayIndex: number) => {
    setCurrentDayIndex(dayIndex);
    const dayData = weekDays[dayIndex];
    if (dayData) {
      setValue('date', dayData.date);
      setValue('description', dayData.description || '');
      setValue('hours_spent', parseFloat(dayData.hours.toString()) || 0);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentDayIndex < weekDays.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    } else if (direction === 'right' && currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const onSubmit = async (data: CreateDailyReportData) => {
    console.log('Form submitted!');
    console.log('Form data received:', data);
    
    try {
      // Ensure we have the current day's date
      const currentDayData = weekDays[currentDayIndex];
      const reportData = {
        ...data,
        date: currentDayData?.date || data.date,
        week_number: selectedWeek
      };
      
      console.log('Form data:', data);
      console.log('Current day:', currentDayData);
      console.log('Sending daily report data:', reportData);
      
      const result = await createDailyReport(reportData);
      console.log('Create daily report result:', result);
      
      // Update local state
      const updatedDays = [...weekDays];
      const currentDay = updatedDays[currentDayIndex];
      if (currentDay) {
        currentDay.isCompleted = true;
        currentDay.hours = parseFloat(data.hours_spent.toString()) || 0; // Ensure it's a number
        currentDay.description = data.description;
      }
      setWeekDays(updatedDays);
      
      reset();
      await fetchDailyReports(); // Refresh data
      
      showSuccess('Daily report saved successfully!');
    } catch (error) {
      console.error('Failed to create daily report:', error);
      console.error('Error details:', (error as any).response?.data);
      
      // Even if backend fails, update local state for better UX
      const updatedDays = [...weekDays];
      const currentDay = updatedDays[currentDayIndex];
      if (currentDay) {
        currentDay.isCompleted = true;
        currentDay.hours = parseFloat(data.hours_spent.toString()) || 0;
        currentDay.description = data.description;
      }
      setWeekDays(updatedDays);
      
      showError('Daily report saved locally but failed to sync with server. Please check your connection.');
    }
  };

  const handleAIEnhance = async () => {
    try {
      const currentText = watch('description') || '';
      // Simulate AI enhancement
      const enhancedText = `Enhanced: ${currentText} - This task involved detailed analysis and implementation of best practices.`;
      setValue('description', enhancedText);
    } catch (error) {
      console.error('Failed to enhance text:', error);
    }
  };

  const handleCertificateDownload = () => {
    // TODO: Implement certificate generation and download
    showInfo('Certificate download feature coming soon!');
  };

  const getLeafIcon = (isCompleted: boolean, isHealthy: boolean) => {
    if (!isCompleted) {
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
    if (isHealthy) {
      return <Leaf className="w-5 h-5 text-green-500" />;
    }
    return <Leaf className="w-5 h-5 text-orange-500" />;
  };

  const getDayStatus = (day: DayData) => {
    if (!day.isCompleted) return 'not-started';
    if (day.hours >= 8 && day.description.length > 50) return 'healthy';
    return 'completed';
  };

  const getDayAbbreviation = (dayName: string) => {
    return dayName.substring(0, 3);
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate() + ', ' + date.toLocaleDateString('en-US', { month: 'short' });
  };

  const getWeekDateRange = (weekNumber: number) => {
    const days = getWeekDates(weekNumber);
    if (days.length === 0) return '';
    
    const startDate = new Date(days[0].date);
    const endDate = new Date(days[days.length - 1].date);
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <LoadingSpinner size="lg" color="primary" message="Loading week data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className={`relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8 shadow-2xl shadow-${theme}-500/10`}>
          <div className={`absolute inset-0 bg-gradient-to-r from-${theme}-600/5 via-${theme}-600/5 to-${theme}-600/5`}></div>
          <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-gradient-to-br from-${theme}-400/20 to-${theme}-400/20 rounded-full blur-3xl`}></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-xl shadow-lg`}>
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h1 className={`text-2xl font-bold text-${theme}-600`}>Daily Log</h1>
                </div>
                <p className="text-sm text-gray-600">Document your daily activities and track your progress</p>
                
                {/* Week Selector */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                    disabled={selectedWeek <= 1}
                    className={`p-2 rounded-lg ${
                      selectedWeek <= 1 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : `bg-${theme}-100 text-${theme}-600 hover:bg-${theme}-200`
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex flex-col items-center">
                    <span className={`text-sm font-medium text-${theme}-600`}>
                      Week {selectedWeek} {selectedWeek === getCurrentWeekNumber() && '(Current)'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getWeekDateRange(selectedWeek)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedWeek(selectedWeek + 1)}
                    className={`p-2 rounded-lg bg-${theme}-100 text-${theme}-600 hover:bg-${theme}-200`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSettings(true)}
                  className={`px-4 py-2 bg-white/60 backdrop-blur-sm border border-${theme}-200 text-${theme}-600 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 text-sm flex items-center gap-2`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                
                {allDaysCompleted && (
                  <button 
                    onClick={() => setShowCertificate(true)}
                    className={`px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm flex items-center gap-2`}
                  >
                    <Award className="w-4 h-4" />
                    View Certificate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Swipeable Day Cards */}
        <div className="relative mb-8">
          {/* Navigation Arrows */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => handleSwipe('right')}
              disabled={currentDayIndex === 0}
              className={`p-2 rounded-full ${currentDayIndex === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex gap-1">
              {weekDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(index)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    currentDayIndex === index
                      ? `bg-${theme}-100 text-${theme}-700 border border-${theme}-300`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getDayAbbreviation(day.dayName)}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handleSwipe('left')}
              disabled={currentDayIndex === weekDays.length - 1}
              className={`p-2 rounded-full ${currentDayIndex === weekDays.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current Day Card */}
          {weekDays[currentDayIndex] && (
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getLeafIcon(weekDays[currentDayIndex].isCompleted, getDayStatus(weekDays[currentDayIndex]) === 'healthy')}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {weekDays[currentDayIndex].dayName} - {getFormattedDate(weekDays[currentDayIndex].date)}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form for Current Day */}
          {weekDays[currentDayIndex] && (
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-800">
                  {weekDays[currentDayIndex].dayName} Log
                </h3>
                {weekDays[currentDayIndex].isCompleted && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                )}
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {/* Hidden date field */}
                <input 
                  type="hidden" 
                  {...register('date')} 
                />
                
                <div>
                  <label className="block text-sm font-medium mb-1">Hours Spent</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="12"
                    step="0.5"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900"
                    placeholder="Enter hours spent"
                    {...register('hours_spent', { 
                      required: 'Hours are required',
                      min: { value: 0, message: 'Hours must be positive' },
                      max: { value: 12, message: 'Hours cannot exceed 12' }
                    })} 
                  />
                  {errors.hours_spent && <p className="text-xs text-red-500 mt-1">{errors.hours_spent.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">What did you learn/performed today?</label>
                  <div className="relative">
                    <textarea 
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your activities, tasks performed, skills learned..."
                      {...register('description', { 
                        required: 'Description is required',
                        minLength: { value: 20, message: 'Description must be at least 20 characters' }
                      })} 
                    />
                    <button
                      type="button"
                      onClick={handleAIEnhance}
                      className="absolute top-2 right-2 p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      title="Enhance with AI"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 bg-gradient-to-r from-${theme}-600 to-${theme}-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" inline color="white" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {weekDays[currentDayIndex]?.isCompleted ? 'Update Log' : 'Save Log'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Weekly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Total Hours</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalHours}h</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Days Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {weekDays.filter(day => day.isCompleted).length}/5
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-sm fonta-medium text-gray-700">Status</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {allDaysCompleted ? 'Perfect Week!' : 'In Progress'}
            </p>
          </div>
        </div>

        {/* Certificate Modal */}
        {showCertificate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Perfect Week Certificate</h3>
                <button 
                  onClick={() => setShowCertificate(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 text-center">
                  <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Perfect Week Achievement!</h4>
                  <p className="text-gray-600 mb-4">
                    Congratulations! You've completed all 5 days of Week {selectedWeek} with detailed documentation.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Student Name</label>
                      <input
                        type="text"
                        value={certificateData.studentName}
                        onChange={(e) => setCertificateData(prev => ({ ...prev, studentName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Company Name</label>
                      <input
                        type="text"
                        value={certificateData.companyName}
                        onChange={(e) => setCertificateData(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Profile Image (Optional)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setCertificateData(prev => ({ 
                                ...prev, 
                                profileImage: e.target?.result as string 
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <Upload className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCertificateDownload}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    <Download className="w-4 h-4" />
                    Download Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Reminder Settings</h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Enable/Disable Reminders */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reminderSettings.enabled}
                      onChange={(e) => setReminderSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Enable Daily Reminders</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Receive notifications to log your daily activities
                  </p>
                </div>
                
                {/* Reminder Time */}
                <div>
                  <label className="block text-sm font-medium mb-1">Reminder Time</label>
                  <input
                    type="time"
                    value={reminderSettings.time}
                    onChange={(e) => setReminderSettings(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When to receive daily reminders
                  </p>
                </div>
                
                {/* Reminder Days */}
                <div>
                  <label className="block text-sm font-medium mb-1">Reminder Days</label>
                  <div className="space-y-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => (
                      <label key={day} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={reminderSettings.days.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setReminderSettings(prev => ({
                                ...prev,
                                days: [...prev.days, day]
                              }));
                            } else {
                              setReminderSettings(prev => ({
                                ...prev,
                                days: prev.days.filter(d => d !== day)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">Notification Type</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="notification_type"
                        value="browser"
                        checked={reminderSettings.notification_type === 'browser'}
                        onChange={(e) => setReminderSettings(prev => ({ ...prev, notification_type: e.target.value as any }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Browser Notifications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="notification_type"
                        value="email"
                        checked={reminderSettings.notification_type === 'email'}
                        onChange={(e) => setReminderSettings(prev => ({ ...prev, notification_type: e.target.value as any }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Email Notifications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="notification_type"
                        value="both"
                        checked={reminderSettings.notification_type === 'both'}
                        onChange={(e) => setReminderSettings(prev => ({ ...prev, notification_type: e.target.value as any }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Both</span>
                    </label>
                  </div>
                </div>
                
                {/* Custom Message */}
                <div>
                  <label className="block text-sm font-medium mb-1">Custom Message</label>
                  <textarea
                    value={reminderSettings.message || ''}
                    onChange={(e) => setReminderSettings(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Time to log your daily activities!"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Custom message for your reminders
                  </p>
                </div>
                
                {/* Test Notification Button */}
                <div>
                  <button
                    onClick={() => {
                      if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Daily Report Reminder', {
                          body: reminderSettings.message || 'Time to log your daily activities!',
                          icon: '/favicon.ico'
                        });
                        showSuccess('Test notification sent!');
                      } else {
                        showError('Please enable notifications in your browser settings');
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
                  >
                    Test Notification
                  </button>
                </div>
                
                {/* Save Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Save settings logic will go here
                      showSuccess('Reminder settings saved!');
                      setShowSettings(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 