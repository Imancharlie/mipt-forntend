import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { DailyReport, CreateDailyReportData } from '@/types';
import { apiClient } from '@/api/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle,
  AlertCircle,
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
  
  // Simplified current week calculation
  const getCurrentWeekNumber = () => {
    const today = new Date();
    const startDate = new Date(2025, 6, 21); // July 21, 2025 (Monday)
    
    // For testing purposes, if we're not in 2025, use August 4, 2025 as the current date
    if (today.getFullYear() !== 2025) {
      today.setFullYear(2025);
      today.setMonth(7); // August
      today.setDate(4); // August 4
    }
    
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7) + 1;
    
    return Math.max(1, Math.min(8, diffWeeks));
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

  
  // Find target day index when navigating from dashboard
  const findTargetDayIndex = (targetDate: string | null, weekDays: DayData[]) => {
    if (!targetDate || weekDays.length === 0) return 0;
    
    const targetIndex = weekDays.findIndex(day => day.date === targetDate);
    return targetIndex >= 0 ? targetIndex : 0;
  };


  const [weekDays, setWeekDays] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, trigger } = useForm<CreateDailyReportData>();

  // Simplified current day detection
  const getCurrentDayOfWeek = () => {
    const today = new Date();
    // Convert to Monday-based (0 = Monday, 1 = Tuesday, etc.)
    const dayOfWeek = today.getDay();
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  // Check if today is a weekday
  const isTodayWeekday = () => {
    const currentDay = getCurrentDayOfWeek();
    return currentDay >= 0 && currentDay <= 4;
  };

  // Get the current day index for the week (0-4 for Monday-Friday)
  const getCurrentDayIndex = () => {
    const currentDay = getCurrentDayOfWeek();
    return currentDay >= 0 && currentDay <= 4 ? currentDay : 0;
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
          
          // Determine day status - compare dates properly
          const isCurrentDay = isTodayWeekday() && index === currentDayOfWeek;
          const isPastDay = date < today && !isCurrentDay;
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
        } else if (isTodayWeekday()) {
          // Use current day of week if no target date
          setCurrentDayIndex(currentDayOfWeek);
        } else {
          // If it's weekend, default to Monday
          setCurrentDayIndex(0);
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
          const dateStr = date.getFullYear() + '-' + 
            String(date.getMonth() + 1).padStart(2, '0') + '-' + 
            String(date.getDate()).padStart(2, '0');
          
          const isCurrentDay = isTodayWeekday() && index === currentDayOfWeek;
          const isPastDay = date < today && !isCurrentDay;
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
        } else if (isTodayWeekday()) {
          setCurrentDayIndex(currentDayOfWeek);
        } else {
          setCurrentDayIndex(0);
        }
    } finally {
      setIsLoading(false);
    }
  };

    loadWeekData();
  }, [selectedWeek, setValue]);
  
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
    <div className="p-3 lg:p-6 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
            <div>
            <h1 className={`text-xl lg:text-2xl font-bold text-${theme}-600 mb-1`}>
                Daily Reports
              </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
                Week {selectedWeek} • {getWeekDateRange(selectedWeek)}
              </p>
            </div>
                

                </div>
              </div>
              
      {/* Enhanced Weekday Navigation */}
      <div className="mb-4">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold text-gray-800 dark:text-gray-200">Week {selectedWeek} Days</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                disabled={selectedWeek <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">Week {selectedWeek}</span>
              <button 
                onClick={() => setSelectedWeek(Math.min(8, selectedWeek + 1))}
                disabled={selectedWeek >= 8}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Enhanced Day Cards */}
          <div className="grid grid-cols-5 gap-2">
            {weekDays.map((day, index) => {
              const isActive = currentDayIndex === index;
              const status = getDayStatus(day);
              
              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(index)}
                  className={`relative p-2 rounded-lg transition-all duration-300 border ${
                    isActive
                      ? `bg-${theme}-50 border-${theme}-300 shadow-md scale-105`
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:scale-102'
                  }`}
                >
                  {/* Current Day Indicator */}
                  {day.isCurrentDay && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse shadow-md"></div>
                  )}
                  
                  {/* Day Header */}
                  <div className="text-center mb-2">
                    <div className={`text-xs font-semibold ${
                      day.isCurrentDay ? 'text-green-600' : 'text-gray-700'
                    }`}>
                  {getDayAbbreviation(day.dayName)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getFormattedDate(day.date)}
                    </div>
            </div>
            
                  {/* Status Icon */}
                  <div className="flex justify-center mb-2">
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
                  
                  {/* Status Text */}
                  <div className="text-center">
                    <div className="text-xs text-gray-500 px-1 py-0.5 rounded-full bg-gray-100">
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
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 mb-6 shadow-lg">
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
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {weekDays[currentDayIndex].dayName} - {getFormattedDate(weekDays[currentDayIndex].date)}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {weekDays[currentDayIndex].isCurrentDay ? 'Today\'s Log' : 
                   weekDays[currentDayIndex].isCompleted ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
            
                {weekDays[currentDayIndex].isCompleted && (
              <span className="px-3 py-1.5 text-sm rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium">
                    Completed
                  </span>
                )}
              </div>
              
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('date')} />
                
                <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Hours Spent</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="12"
                    step="0.5"
                className="input-field input-field-sm"
                placeholder="Enter hours spent (0-12)"
                    {...register('hours_spent', { 
                      required: 'Hours are required',
                      min: { value: 0, message: 'Hours must be positive' },
                      max: { value: 12, message: 'Hours cannot exceed 12' }
                    })} 
                  />
              {errors.hours_spent && <p className="text-sm text-red-500 dark:text-red-400 mt-2">{errors.hours_spent.message}</p>}
                </div>
                
                <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">What did you learn/performed today?</label>
                    <textarea 
                rows={4}
                className="input-field input-field-sm textarea"
                placeholder="Describe your activities, tasks performed, skills learned, challenges faced, and achievements..."
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
              {errors.description && <p className="text-sm text-red-500 dark:text-red-400 mt-2">{errors.description.message}</p>}
                </div>

            <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                className={`flex-1 px-6 py-3 bg-gradient-to-r from-${theme}-600 to-${theme}-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" inline color="white" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                {weekDays[currentDayIndex]?.isCompleted ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}

        {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Hours</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalHours}h</p>
          </div>
          
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Days Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {weekDays.filter(day => day.isCompleted).length}/5
            </p>
          </div>
          
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Status</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {weekDays.find(day => day.isCurrentDay) ? 'Today Active' : 
             allDaysCompleted ? 'Week Complete!' : 'In Progress'}
            </p>
          </div>
        </div>



    </div>
  );
}; 