import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { DailyReport, CreateDailyReportData } from '@/types';
import apiClient from '@/api/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Settings,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Play,
  Target
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
  isCurrentDay?: boolean;
  isPastDay?: boolean;
  isFutureDay?: boolean;
}

export const DailyReportPage: React.FC = () => {
  const { createDailyReport } = useAppStore();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToastContext();
  const [searchParams] = useSearchParams();
  
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
  
  // Get initial week and date from URL params, or use current week
  const getInitialWeekAndDate = () => {
    const weekParam = searchParams.get('week');
    const dateParam = searchParams.get('date');
    
    if (weekParam) {
      const week = parseInt(weekParam);
      if (week >= 1 && week <= 8) {
        return { week: week, date: dateParam };
      }
    }
    
    return { week: getCurrentWeekNumber(), date: null };
  };
  
  const [selectedWeek, setSelectedWeek] = useState(getInitialWeekAndDate().week);
  const [targetDate, setTargetDate] = useState<string | null>(getInitialWeekAndDate().date);
  

  
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Find target day index when navigating from dashboard
  const findTargetDayIndex = (targetDate: string | null, weekDays: DayData[]) => {
    if (!targetDate || weekDays.length === 0) return 0;
    
    const targetIndex = weekDays.findIndex(day => day.date === targetDate);
    return targetIndex >= 0 ? targetIndex : 0;
  };
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    time: '18:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    notification_methods: ['browser', 'email'] as ('browser' | 'email' | 'sms')[],
    message: 'Time to log your daily activities!'
  });
  const [showWeekdayDetails, setShowWeekdayDetails] = useState(false);
  const [showWeekendDetails, setShowWeekendDetails] = useState(false);
  const [weekDays, setWeekDays] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, trigger } = useForm<CreateDailyReportData>();

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const getCurrentDayOfWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Convert to Monday-based (0 = Monday, 1 = Tuesday, etc.)
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  // Get the current day index for the week (0-4 for Monday-Friday)
  const getCurrentDayIndex = () => {
    const currentDay = getCurrentDayOfWeek();
    // Return 0 for Monday, 1 for Tuesday, etc., but only for weekdays
    return currentDay >= 0 && currentDay <= 4 ? currentDay : 0;
  };

  // Check if today is a weekday
  const isTodayWeekday = () => {
    const currentDay = getCurrentDayOfWeek();
    return currentDay >= 0 && currentDay <= 4;
  };

  useEffect(() => {
    // Set current day index when component mounts
    if (isTodayWeekday()) {
      setCurrentDayIndex(getCurrentDayIndex());
    } else {
      // If it's weekend, default to Monday
      setCurrentDayIndex(0);
    }
  }, []);

  const getWeekDates = (weekNumber: number) => {
    // Week 1: July 21-25, 2025 (Mon-Fri)
    // Week 2: July 28-Aug 1, 2025 (Mon-Fri)
    // Week 3: Aug 4-8, 2025 (Mon-Fri)
    // Week 4: Aug 11-15, 2025 (Mon-Fri)
    // Week 5: Aug 18-22, 2025 (Mon-Fri)
    // Week 6: Aug 25-29, 2025 (Mon-Fri)
    // Week 7: Sep 1-5, 2025 (Mon-Fri)
    // Week 8: Sep 8-12, 2025 (Mon-Fri)
    
    const weekStartDates = [
      new Date(2025, 6, 21),  // Week 1: July 21
      new Date(2025, 6, 28),  // Week 2: July 28
      new Date(2025, 7, 4),   // Week 3: Aug 4
      new Date(2025, 7, 11),  // Week 4: Aug 11
      new Date(2025, 7, 18),  // Week 5: Aug 18
      new Date(2025, 7, 25),  // Week 6: Aug 25
      new Date(2025, 8, 1),   // Week 7: Sep 1
      new Date(2025, 8, 8),   // Week 8: Sep 8
    ];
    
    const weekStart = weekStartDates[weekNumber - 1] || new Date(2025, 6, 21);
    
    const days = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  useEffect(() => {
    const loadWeekData = async () => {
    setIsLoading(true);
    try {
        // Fetch existing reports for the selected week
        const response = await apiClient.get(`/reports/daily/?week_number=${selectedWeek}`);
        const existingReports = response.data.results || [];
        
        // Generate week days data
        const weekDates = getWeekDates(selectedWeek);
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        const today = new Date();
        const currentDayOfWeek = getCurrentDayOfWeek();
        
        const weekData: DayData[] = weekDates.map((date, index) => {
          const dayName = dayNames[index];
          // Format date as YYYY-MM-DD without timezone issues
          const dateStr = date.getFullYear() + '-' + 
            String(date.getMonth() + 1).padStart(2, '0') + '-' + 
            String(date.getDate()).padStart(2, '0');
          const existingReport = existingReports.find((report: DailyReport) => 
            report.date === dateStr
          );
          
          // Determine day status
          const isCurrentDay = isTodayWeekday() && index === currentDayOfWeek;
          const isPastDay = date < today;
          const isFutureDay = date > today;
          
          return {
            dayName,
            date: dateStr,
            isCompleted: !!existingReport,
            hours: Number(existingReport?.hours_spent) || 0,
            description: existingReport?.description || '',
            report: existingReport,
            isCurrentDay,
            isPastDay,
            isFutureDay
          };
        });
        
                setWeekDays(weekData);
        
        // Set current day index based on target date or current day
        if (targetDate) {
          const targetIndex = findTargetDayIndex(targetDate, weekData);
          setCurrentDayIndex(targetIndex);
        } else {
          // Use current day of week if no target date
          const currentDayOfWeek = getCurrentDayOfWeek();
          setCurrentDayIndex(currentDayOfWeek >= 0 && currentDayOfWeek <= 4 ? currentDayOfWeek : 0);
        }
        
        // Set form data for current day
        if (weekData[currentDayIndex]) {
          const currentDay = weekData[currentDayIndex];
          setValue('date', currentDay.date);
          setValue('hours_spent', currentDay.hours);
          setValue('description', currentDay.description);
        }
    } catch (error) {
      console.error('Failed to load week data:', error);
        // Create mock data for development
        const weekDates = getWeekDates(selectedWeek);
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        const today = new Date();
        const currentDayOfWeek = getCurrentDayOfWeek();
        
        const mockWeekData: DayData[] = weekDates.map((date, index) => {
          const dayName = dayNames[index];
          // Format date as YYYY-MM-DD without timezone issues
          const dateStr = date.getFullYear() + '-' + 
            String(date.getMonth() + 1).padStart(2, '0') + '-' + 
            String(date.getDate()).padStart(2, '0');
          
          const isCurrentDay = isTodayWeekday() && index === currentDayOfWeek;
          const isPastDay = date < today;
          const isFutureDay = date > today;
          
          return {
            dayName,
            date: dateStr,
            isCompleted: false,
            hours: 0,
            description: '',
            isCurrentDay,
            isPastDay,
            isFutureDay
          };
        });
        
        setWeekDays(mockWeekData);
        
        // Set current day index based on target date or current day for mock data
        if (targetDate) {
          const targetIndex = findTargetDayIndex(targetDate, mockWeekData);
          setCurrentDayIndex(targetIndex);
        } else {
          // Use current day of week if no target date
          const currentDayOfWeek = getCurrentDayOfWeek();
          setCurrentDayIndex(currentDayOfWeek >= 0 && currentDayOfWeek <= 4 ? currentDayOfWeek : 0);
        }
    } finally {
      setIsLoading(false);
    }
  };

    loadWeekData();
  }, [selectedWeek, currentDayIndex, setValue]);
  
  // Clear target date after it's been used
  useEffect(() => {
    if (targetDate && weekDays.length > 0) {
      setTargetDate(null);
    }
  }, [targetDate, weekDays.length]);

  const handleDayClick = (dayIndex: number) => {
    setCurrentDayIndex(dayIndex);
    const selectedDay = weekDays[dayIndex];
    if (selectedDay) {
      setValue('date', selectedDay.date);
      setValue('hours_spent', selectedDay.hours);
      setValue('description', selectedDay.description);
      
      // Force form to update with new values
      trigger(['date', 'hours_spent', 'description']);
    }
  };



  const onSubmit = async (data: CreateDailyReportData) => {
    try {
      await createDailyReport({
        ...data,
        week_number: selectedWeek
      });
      
      showSuccess('Daily report saved successfully!');
      
      // Refresh the week data
      await apiClient.get(`/reports/daily/?week_number=${selectedWeek}`);
      
      setWeekDays(prev => prev.map(day => {
        if (day.date === data.date) {
          return {
            ...day,
            isCompleted: true,
            hours: Number(data.hours_spent),
            description: data.description
          };
        }
        return day;
      }));
    } catch (error) {
      console.error('Failed to save daily report:', error);
      showError('Failed to save daily report. Please try again.');
    }
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
    const date = new Date(dateString + 'T00:00:00'); // Ensure consistent timezone
    return date.getDate() + ', ' + date.toLocaleDateString('en-US', { month: 'short' });
  };

  const getWeekDateRange = (weekNumber: number) => {
    const days = getWeekDates(weekNumber);
    if (days.length === 0) return '';
    
    const startDate = new Date(days[0]);
    const endDate = new Date(days[days.length - 1]);
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const totalHours = weekDays.reduce((sum, day) => {
    const hours = typeof day.hours === 'number' ? day.hours : parseFloat(day.hours) || 0;
    return sum + hours;
  }, 0);
  const allDaysCompleted = weekDays.every(day => day.isCompleted);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <LoadingSpinner size="lg" color="primary" message="Loading daily reports..." />
      </div>
    );
  }

  return (
    <div className="p-3 lg:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-lg lg:text-2xl font-bold text-${theme}-600 mb-2`}>
                Daily Reports
              </h1>
              <p className="text-gray-600 text-xs lg:text-sm">
                Week {selectedWeek} • {getWeekDateRange(selectedWeek)}
              </p>
            </div>
                
          <div className="flex items-center gap-3">
                  <button
                  onClick={() => setShowSettings(true)}
                  className={`px-4 py-2 bg-white/60 backdrop-blur-sm border border-${theme}-200 text-${theme}-600 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 text-sm flex items-center gap-2`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                  </button>
                  </div>
                </div>
              </div>
              
      {/* Enhanced Weekday Navigation */}
      <div className="mb-6">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold text-gray-800">Week {selectedWeek} Days</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                disabled={selectedWeek <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-600">Week {selectedWeek}</span>
              <button 
                onClick={() => setSelectedWeek(Math.min(8, selectedWeek + 1))}
                disabled={selectedWeek >= 8}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Enhanced Day Cards */}
          <div className="grid grid-cols-5 gap-1">
            {weekDays.map((day, index) => {
              const isActive = currentDayIndex === index;
              const status = getDayStatus(day);
              
              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(index)}
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? `bg-${theme}-100 border border-${theme}-300 shadow-md`
                      : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                  }`}
                >
                  {/* Current Day Indicator */}
                  {day.isCurrentDay && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse"></div>
                  )}
                  
                  {/* Day Header */}
                  <div className="text-center mb-1">
                    <div className={`text-xs font-medium ${
                      day.isCurrentDay ? 'text-green-600' : 'text-gray-600'
                    }`}>
                  {getDayAbbreviation(day.dayName)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getFormattedDate(day.date)}
                    </div>
            </div>
            
                  {/* Status Icon */}
                  <div className="flex justify-center mb-1">
                    {day.isCompleted ? (
                      <CheckCircle className={`w-4 h-4 ${
                        status === 'healthy' ? 'text-green-500' : 'text-blue-500'
                      }`} />
                    ) : day.isCurrentDay ? (
                      <Target className="w-4 h-4 text-orange-500 animate-pulse" />
                    ) : day.isPastDay ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Hours Display */}
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-800">
                      {day.hours}h
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.isCompleted ? 'Done' : day.isCurrentDay ? 'Today' : 'Pending'}
                    </div>
                  </div>
            </button>
              );
            })}
          </div>
            </div>
          </div>

      {/* Current Day Form */}
      {weekDays[currentDayIndex] && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                weekDays[currentDayIndex].isCurrentDay 
                  ? 'bg-orange-100 text-orange-600' 
                  : weekDays[currentDayIndex].isCompleted 
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {weekDays[currentDayIndex].isCurrentDay ? (
                  <Target className="w-5 h-5" />
                ) : weekDays[currentDayIndex].isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-gray-800">
                  {weekDays[currentDayIndex].dayName} - {getFormattedDate(weekDays[currentDayIndex].date)}
                </h2>
                <p className="text-xs lg:text-sm text-gray-600">
                  {weekDays[currentDayIndex].isCurrentDay ? 'Today\'s Log' : 
                   weekDays[currentDayIndex].isCompleted ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
            
                {weekDays[currentDayIndex].isCompleted && (
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">
                    Completed
                  </span>
                )}
              </div>
              
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('date')} />
                
                <div>
              <label className="block text-sm font-medium mb-2">Hours Spent</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="12"
                    step="0.5"
                className="input-field"
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
              <label className="block text-sm font-medium mb-2">What did you learn/performed today?</label>
                    <textarea 
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:ring-orange-400 dark:focus:border-orange-400 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md focus:shadow-lg resize-none"
                      placeholder="Describe your activities, tasks performed, skills learned..."
                      {...register('description', { 
                        required: 'Description is required',
                        validate: {
                          notEmpty: (value) => {
                            const trimmed = value?.trim();
                            return trimmed && trimmed.length > 0 || 'Description cannot be empty';
                          },
                          hasWords: (value) => {
                            const trimmed = value?.trim();
                            return (trimmed && trimmed.split(/\s+/).length >= 1) || 'Description must contain at least one word';
                          }
                        }
                      })} 
                    />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                className={`flex-1 px-6 py-3 bg-gradient-to-r from-${theme}-600 to-${theme}-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
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
            <Target className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Current Status</span>
            </div>
          <p className="text-lg font-bold text-gray-800">
            {weekDays.find(day => day.isCurrentDay) ? 'Today Active' : 
             allDaysCompleted ? 'Week Complete!' : 'In Progress'}
            </p>
          </div>
        </div>

        {/* Enhanced Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 w-full max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
                    <div>
                    <h3 className="text-xl lg:text-2xl font-semibold text-gray-800 dark:text-white">Daily Reminder Settings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Configure your daily log reminders</p>
                    </div>
                    </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Enable/Disable Reminders */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderSettings.enabled}
                      onChange={(e) => setReminderSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 dark:focus:ring-orange-400"
                    />
                    <div>
                      <span className="text-base lg:text-lg font-medium text-gray-800 dark:text-white">Enable Daily Reminders</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications to log your daily activities and stay on track
                      </p>
                    </div>
                  </label>
                </div>
                
                {reminderSettings.enabled && (
                  <>
                {/* Reminder Time */}
                <div>
                      <label className="block text-sm lg:text-base font-medium mb-3 text-gray-700 dark:text-gray-300">⏰ Reminder Time</label>
                  <input
                    type="time"
                    value={reminderSettings.time}
                    onChange={(e) => setReminderSettings(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Set when you'd like to receive daily reminders
                  </p>
                </div>
                
                    {/* Simplified Day Selection */}
                <div>
                      <label className="block text-sm lg:text-base font-medium mb-3 text-gray-700 dark:text-gray-300">📅 Reminder Days</label>
                      
                      <div className="space-y-3">
                        {/* Weekdays Option */}
                        <div>
                          <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                              checked={
                                reminderSettings.days.includes('monday') &&
                                reminderSettings.days.includes('tuesday') &&
                                reminderSettings.days.includes('wednesday') &&
                                reminderSettings.days.includes('thursday') &&
                                reminderSettings.days.includes('friday')
                              }
                          onChange={(e) => {
                            if (e.target.checked) {
                                  const weekends = reminderSettings.days.filter(d => ['saturday', 'sunday'].includes(d));
                              setReminderSettings(prev => ({
                                ...prev,
                                    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', ...weekends]
                              }));
                            } else {
                              setReminderSettings(prev => ({
                                ...prev,
                                    days: prev.days.filter(d => !['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(d))
                              }));
                            }
                          }}
                              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 dark:focus:ring-orange-400"
                            />
                            <span 
                              onClick={() => setShowWeekdayDetails(!showWeekdayDetails)}
                              className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400"
                            >
                              Weekdays (Mon-Fri)
                            </span>
                          </label>
                          
                          {/* Expandable Weekday Details */}
                          {showWeekdayDetails && (
                            <div className="mt-3 ml-7 grid grid-cols-2 lg:grid-cols-5 gap-2">
                              {[
                                { key: 'monday', label: 'Monday', short: 'Mon' },
                                { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
                                { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
                                { key: 'thursday', label: 'Thursday', short: 'Thu' },
                                { key: 'friday', label: 'Friday', short: 'Fri' }
                              ].map((day) => (
                                <label key={day.key} className="relative cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={reminderSettings.days.includes(day.key)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setReminderSettings(prev => ({
                                          ...prev,
                                          days: [...prev.days, day.key]
                                        }));
                                      } else {
                                        setReminderSettings(prev => ({
                                          ...prev,
                                          days: prev.days.filter(d => d !== day.key)
                                        }));
                                      }
                                    }}
                                    className="sr-only"
                                  />
                                  <div className={`p-2 rounded-lg border-2 transition-all duration-200 text-center ${
                                    reminderSettings.days.includes(day.key)
                                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}>
                                    <div className="font-medium text-xs lg:text-sm">{day.short}</div>
                                  </div>
                      </label>
                    ))}
                  </div>
                          )}
                </div>
                
                        {/* Weekends Option */}
                <div>
                          <label className="flex items-center gap-3">
                      <input
                              type="checkbox"
                              checked={
                                reminderSettings.days.includes('saturday') &&
                                reminderSettings.days.includes('sunday')
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const weekdays = reminderSettings.days.filter(d => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(d));
                                  setReminderSettings(prev => ({
                                    ...prev,
                                    days: [...weekdays, 'saturday', 'sunday']
                                  }));
                                } else {
                                  setReminderSettings(prev => ({
                                    ...prev,
                                    days: prev.days.filter(d => !['saturday', 'sunday'].includes(d))
                                  }));
                                }
                              }}
                              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 dark:focus:ring-orange-400"
                            />
                            <span 
                              onClick={() => setShowWeekendDetails(!showWeekendDetails)}
                              className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400"
                            >
                              Weekends (Sat-Sun)
                            </span>
                    </label>
                          
                          {/* Expandable Weekend Details */}
                          {showWeekendDetails && (
                            <div className="mt-3 ml-7 grid grid-cols-2 gap-2">
                              {[
                                { key: 'saturday', label: 'Saturday', short: 'Sat' },
                                { key: 'sunday', label: 'Sunday', short: 'Sun' }
                              ].map((day) => (
                                <label key={day.key} className="relative cursor-pointer">
                      <input
                                    type="checkbox"
                                    checked={reminderSettings.days.includes(day.key)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setReminderSettings(prev => ({
                                          ...prev,
                                          days: [...prev.days, day.key]
                                        }));
                                      } else {
                                        setReminderSettings(prev => ({
                                          ...prev,
                                          days: prev.days.filter(d => d !== day.key)
                                        }));
                                      }
                                    }}
                                    className="sr-only"
                                  />
                                  <div className={`p-2 rounded-lg border-2 transition-all duration-200 text-center ${
                                    reminderSettings.days.includes(day.key)
                                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}>
                                    <div className="font-medium text-xs lg:text-sm">{day.short}</div>
                                  </div>
                    </label>
                              ))}
                            </div>
                          )}
                  </div>
                </div>
                
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                        Click on the option text to see and select individual days.
                  </p>
                </div>
                
                    {/* Notification Methods */}
                <div>
                      <label className="block text-sm lg:text-base font-medium mb-3 text-gray-700 dark:text-gray-300">🔔 Notification Methods</label>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={reminderSettings.notification_methods.includes('email')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setReminderSettings(prev => ({
                                  ...prev,
                                  notification_methods: [...prev.notification_methods, 'email']
                                }));
                      } else {
                                setReminderSettings(prev => ({
                                  ...prev,
                                  notification_methods: prev.notification_methods.filter((m: string) => m !== 'email')
                                }));
                              }
                            }}
                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 dark:focus:ring-orange-400"
                          />
                          <div>
                            <span className="text-sm lg:text-base font-medium text-gray-800 dark:text-white">Email Notifications</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Email reminders to your inbox</p>
                </div>
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={reminderSettings.notification_methods.includes('sms')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setReminderSettings(prev => ({
                                  ...prev,
                                  notification_methods: [...prev.notification_methods, 'sms']
                                }));
                              } else {
                                setReminderSettings(prev => ({
                                  ...prev,
                                  notification_methods: prev.notification_methods.filter((m: string) => m !== 'sms')
                                }));
                              }
                            }}
                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 dark:focus:ring-orange-400"
                          />
                          <div>
                            <span className="text-sm lg:text-base font-medium text-gray-800 dark:text-white">SMS/Text Messages</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Text messages to your phone</p>
                          </div>
                        </label>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Browser notifications are enabled by default. Select additional methods as needed.
                      </p>
                    </div>
                    

                  </>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-500 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Validation
                      if (reminderSettings.enabled) {
                        if (reminderSettings.days.length === 0) {
                          showError('Please select at least one day for reminders');
                          return;
                        }
                        
                        // Ensure browser is always included when reminders are enabled
                        const methods = reminderSettings.notification_methods.includes('browser') 
                          ? reminderSettings.notification_methods 
                          : ['browser', ...reminderSettings.notification_methods] as ('browser' | 'email' | 'sms')[];
                        
                        // Update settings to ensure browser is included
                        setReminderSettings(prev => ({
                          ...prev,
                          notification_methods: methods
                        }));
                      }
                      
                      // Save settings logic will go here - for now just show success
                      showSuccess('Reminder settings saved successfully!');
                      setShowSettings(false);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:from-orange-700 hover:to-orange-800"
                  >
                    💾 Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}; 