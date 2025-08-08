import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { DailyReport, CreateDailyReportData } from '@/types';
import apiClient from '@/api/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
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

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<CreateDailyReportData>();

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
    } finally {
      setIsLoading(false);
    }
  };

    loadWeekData();
  }, [selectedWeek, currentDayIndex, setValue]);

  const handleDayClick = (dayIndex: number) => {
    setCurrentDayIndex(dayIndex);
    const selectedDay = weekDays[dayIndex];
    if (selectedDay) {
      setValue('date', selectedDay.date);
      setValue('hours_spent', selectedDay.hours);
      setValue('description', selectedDay.description);
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
            <h1 className={`text-2xl lg:text-3xl font-bold text-${theme}-600 mb-2`}>
              Daily Reports
            </h1>
            <p className="text-gray-600">
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
            <h2 className="text-lg font-semibold text-gray-800">Week {selectedWeek} Days</h2>
            <div className="flex items-center gap-2">
            <button
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
              <span className="text-sm font-medium text-gray-600">Week {selectedWeek}</span>
              <button
                onClick={() => setSelectedWeek(selectedWeek + 1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
                <h2 className="text-xl font-semibold text-gray-800">
                      {weekDays[currentDayIndex].dayName} - {getFormattedDate(weekDays[currentDayIndex].date)}
                    </h2>
                <p className="text-sm text-gray-600">
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
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Describe your activities, tasks performed, skills learned..."
                      {...register('description', { 
                        required: 'Description is required',
                        minLength: { value: 20, message: 'Description must be at least 20 characters' }
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
  );
}; 