import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PlusCircle, Calendar, BookOpen, Star, MapPin, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWeekDates, getCurrentWeek, TOTAL_WEEKS } from '@/utils/dateUtils';

interface WeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  hasReport: boolean;
  totalHours: number;
  dailyReportsCount: number;
  isCurrentWeek: boolean;
  isFutureWeek: boolean;
}

export const DashboardPage: React.FC = () => {
  const { 
    dashboardStats, 
    fetchDashboard, 
    loading, 
    profile, 

    dailyReports,
    weeklyReports,
    fetchDailyReports,
    fetchWeeklyReports
  } = useAppStore();
  
  // Ensure arrays are always defined to prevent runtime errors
  const safeDailyReports = dailyReports || [];
  const safeWeeklyReports = weeklyReports || [];
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [weeksData, setWeeksData] = useState<WeekData[]>([]);

  // Using date utilities for consistent calculations

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          fetchDashboard(),
          fetchDailyReports(),
          fetchWeeklyReports()
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };
    
    loadDashboardData();
  }, []); // Empty dependency array - these functions are stable from the store

  useEffect(() => {
    // Generate weeks data
    const generateWeeksData = () => {
      const currentDate = new Date();
      const weeks: WeekData[] = [];
      
      for (let week = 1; week <= TOTAL_WEEKS; week++) {
        const weekDates = getWeekDates(week);
        
        const isCurrentWeek = currentDate >= weekDates.startDate && currentDate <= weekDates.endDate;
        const isFutureWeek = currentDate < weekDates.startDate;
        const isCompleted = currentDate > weekDates.endDate;
        
        // Find weekly report for this week
        const weeklyReport = safeWeeklyReports.find(report => report.week_number === week);
        const weekDailyReports = safeDailyReports.filter(report => report.week_number === week);
        
        weeks.push({
          weekNumber: week,
          startDate: weekDates.startDateStr,
          endDate: weekDates.endDateStr,
          isCompleted: isCompleted,
          hasReport: !!weeklyReport,
          totalHours: weeklyReport?.total_hours || weekDailyReports.reduce((sum, report) => sum + report.hours_spent, 0),
          dailyReportsCount: weekDailyReports.length,
          isCurrentWeek,
          isFutureWeek
        });
      }
      
      setWeeksData(weeks);
    };
    
    generateWeeksData();
  }, [safeWeeklyReports, safeDailyReports]);

  // Show loading when data is being fetched
  if (loading.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-3">
        <LoadingSpinner size="lg" color="primary" message="Loading your dashboard..." />
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Using imported getCurrentWeek function from dateUtils

  const handleWeekClick = (weekData: WeekData) => {
    navigate(`/weekly-report/${weekData.weekNumber}`);
  };

  // Complex road coordinates for all 8 weeks
  const getWeekCoordinates = () => {
    // Mobile coordinates (portrait layout)
    const mobileCoords = [
      { x: 50, y: 85, label: 'START' }, // Week 1 - Bottom center
      { x: 25, y: 72, label: 'Week 2' }, // Week 2 - Left curve
      { x: 75, y: 65, label: 'Week 3' }, // Week 3 - Right swing
      { x: 20, y: 52, label: 'Week 4' }, // Week 4 - Sharp left
      { x: 80, y: 45, label: 'Week 5' }, // Week 5 - Far right
      { x: 35, y: 32, label: 'Week 6' }, // Week 6 - Left center
      { x: 70, y: 20, label: 'Week 7' }, // Week 7 - Right upper
      { x: 50, y: 8, label: 'FINISH' }   // Week 8 - Top center finish
    ];

    // Desktop coordinates (landscape layout)
    const desktopCoords = [
      { x: 8, y: 50, label: 'START' },   // Week 1 - Far left
      { x: 20, y: 30, label: 'Week 2' }, // Week 2 - Upper curve
      { x: 28, y: 70, label: 'Week 3' }, // Week 3 - Lower dip
      { x: 42, y: 25, label: 'Week 4' }, // Week 4 - Upper middle
      { x: 58, y: 75, label: 'Week 5' }, // Week 5 - Lower right
      { x: 72, y: 35, label: 'Week 6' }, // Week 6 - Upper right
      { x: 85, y: 65, label: 'Week 7' }, // Week 7 - Lower far right
      { x: 92, y: 45, label: 'FINISH' }  // Week 8 - Far right center
    ];

    return { mobileCoords, desktopCoords };
  };

  // Complex road path generator
  const generateRoadPath = (coords: Array<{x: number, y: number}>) => {
    if (coords.length < 2) return '';
    
    let path = `M ${coords[0].x * 4} ${coords[0].y * 2.5}`;
    
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const next = coords[i + 1];
      
      if (next) {
        // Create smooth curves between points
        const cp1x = prev.x * 4 + (curr.x - prev.x) * 1.2;
        const cp1y = prev.y * 2.5 + (curr.y - prev.y) * 0.8;
        const cp2x = curr.x * 4 - (next.x - curr.x) * 0.8;
        const cp2y = curr.y * 2.5 - (next.y - curr.y) * 0.6;
        
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x * 4} ${curr.y * 2.5}`;
      } else {
        // Last point - simple curve
        const cp1x = prev.x * 4 + (curr.x - prev.x) * 0.7;
        const cp1y = prev.y * 2.5 + (curr.y - prev.y) * 0.7;
        path += ` Q ${cp1x} ${cp1y}, ${curr.x * 4} ${curr.y * 2.5}`;
      }
    }
    
    return path;
  };

  // Week Bus Stop Component
  const WeekBusStop = ({ weekData, currentWeek, coords }: { 
    weekData: WeekData, 
    currentWeek: number,
    coords: {x: number, y: number, label: string}
  }) => (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
      style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
      onClick={() => handleWeekClick(weekData)}
    >
      {/* Bus Stop Base */}
      <div className="relative">
        {/* Glow effect for current week */}
        {weekData.weekNumber === currentWeek && (
          <div className="absolute inset-0 w-16 h-16 lg:w-18 lg:h-18 bg-blue-400/30 rounded-full animate-ping -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>
        )}
        
        {/* Bus Stop Pole */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="w-1 h-8 lg:h-10 bg-gray-600 mx-auto"></div>
          <div className="w-6 h-4 lg:w-8 lg:h-5 bg-blue-600 rounded-t-lg flex items-center justify-center -mt-1">
            <MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
          </div>
        </div>

        {/* Week Circle (Bus Stop) */}
        <div
          className={`
            relative w-12 h-12 lg:w-14 lg:h-14 rounded-full border-4 flex items-center justify-center text-sm lg:text-base font-bold 
            transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110
            ${weekData.weekNumber < currentWeek 
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-700 text-white shadow-emerald-200' 
              : weekData.weekNumber === currentWeek 
                ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-700 text-white animate-pulse shadow-blue-200' 
                : 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 text-gray-500 opacity-60'
            }
            ${weekData.weekNumber <= currentWeek ? 'cursor-pointer' : 'cursor-not-allowed'}
          `}
        >
          {weekData.weekNumber}
          
          {/* Status indicators */}
          <div className="absolute -top-2 -right-2">
            {weekData.weekNumber < currentWeek && (
              <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                <Star className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-yellow-800 fill-current" />
              </div>
            )}
            
            {weekData.weekNumber > currentWeek && (
              <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white">🔒</div>
              </div>
            )}
            
            {weekData.weekNumber === currentWeek && (
              <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full animate-bounce border-2 border-white">
                <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-white rounded-full m-auto animate-ping"></div>
              </div>
            )}
          </div>

          {/* Progress ring for completed weeks */}
          {weekData.weekNumber < currentWeek && (
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="rgb(16, 185, 129)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="125.6"
                strokeDashoffset="0"
                className="animate-pulse"
              />
            </svg>
          )}
        </div>

        {/* Week Info Card */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 whitespace-nowrap">
            <div className="text-center">
              <div className="font-bold text-gray-900">{coords.label}</div>
              <div className="text-xs text-gray-600 mt-1">
                {weekData.weekNumber < currentWeek && '✅ Completed'}
                {weekData.weekNumber === currentWeek && '🔄 In Progress'}
                {weekData.weekNumber > currentWeek && '⏳ Upcoming'}
              </div>
              {weekData.totalHours > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  {weekData.totalHours}h logged
                </div>
              )}
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const { mobileCoords, desktopCoords } = getWeekCoordinates();

  return (
    <div className="p-3 lg:p-6 max-w-md lg:max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className={`text-lg lg:text-2xl font-bold text-${theme}-600 mb-1`}>
          {getGreeting()}{profile ? `, ${profile.user_details.full_name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-600 text-xs lg:text-sm">
          {profile ? 
            `${profile.company_name || 'No Company'}${profile.company_region ? ` - ${profile.company_region}` : ''}` 
            : ''
          }
        </p>
      </div>

      {/* Current Week Display */}
      <div className={`mb-4 lg:mb-6 p-3 lg:p-4 rounded-lg bg-${theme}-50 border border-${theme}-200`}>
        <div className="text-center">
          <h2 className={`text-lg lg:text-2xl font-bold text-${theme}-700`}>Week {getCurrentWeek()} of {TOTAL_WEEKS}</h2>
          <p className="text-xs lg:text-sm text-gray-600 mt-1">
            {weeksData.find(w => w.weekNumber === getCurrentWeek())?.startDate} to {weeksData.find(w => w.weekNumber === getCurrentWeek())?.endDate}
          </p>
        </div>
      </div>

      {/* Enhanced Training Roadmap */}
      <div className="mb-6">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 text-center">Training Journey Roadmap</h2>

        {/* Complex Road Layout */}
        <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-4 lg:p-6 h-80 lg:h-64 overflow-hidden shadow-lg border border-emerald-100">
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0">
            {/* Animated clouds */}
            <div className="absolute top-4 left-12 w-16 h-10 bg-white/60 rounded-full animate-pulse"></div>
            <div className="absolute top-8 right-16 w-12 h-8 bg-white/50 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-16 left-20 w-14 h-9 bg-white/40 rounded-full animate-pulse delay-2000"></div>
            
            {/* Trees and scenery */}
            <div className="absolute bottom-8 left-12">
              <div className="w-2 h-12 bg-amber-800 rounded-sm"></div>
              <div className="w-8 h-8 bg-green-500 rounded-full -mt-6 -ml-3 shadow-sm"></div>
            </div>
            <div className="absolute top-20 right-12">
              <div className="w-2 h-10 bg-amber-700 rounded-sm"></div>
              <div className="w-7 h-7 bg-green-600 rounded-full -mt-5 -ml-2.5 shadow-sm"></div>
            </div>
            <div className="absolute bottom-20 right-32">
              <div className="w-1.5 h-8 bg-amber-900 rounded-sm"></div>
              <div className="w-6 h-6 bg-green-400 rounded-full -mt-4 -ml-2 shadow-sm"></div>
            </div>
            
            {/* Mountains */}
            <div className="absolute bottom-0 left-0 w-32 h-20 bg-gray-300/40 rounded-t-full"></div>
            <div className="absolute bottom-0 right-0 w-28 h-16 bg-gray-400/30 rounded-t-full"></div>
            <div className="absolute bottom-0 left-1/3 w-24 h-18 bg-gray-350/35 rounded-t-full"></div>
            
            {/* Buildings */}
            <div className="absolute top-12 left-1/4">
              <div className="w-6 h-16 bg-gray-400/60 rounded-t-sm"></div>
              <div className="w-1 h-1 bg-yellow-300 rounded-full absolute top-2 left-1"></div>
              <div className="w-1 h-1 bg-yellow-300 rounded-full absolute top-6 left-4"></div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-16 left-1/3 w-3 h-3 bg-yellow-300/70 rotate-45 animate-spin" style={{animationDuration: '10s'}}></div>
            <div className="absolute bottom-32 right-1/4 w-2 h-2 bg-pink-300/60 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-16 w-2 h-2 bg-blue-300/80 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
          </div>

          {/* Complex Road SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor:'#dc2626', stopOpacity:1}} />
                <stop offset="20%" style={{stopColor:'#ea580c', stopOpacity:1}} />
                <stop offset="40%" style={{stopColor:'#f59e0b', stopOpacity:1}} />
                <stop offset="60%" style={{stopColor:'#10b981', stopOpacity:1}} />
                <stop offset="80%" style={{stopColor:'#3b82f6', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#8b5cf6', stopOpacity:1}} />
              </linearGradient>
              <linearGradient id="roadShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor:'#991b1b', stopOpacity:0.8}} />
                <stop offset="100%" style={{stopColor:'#4c1d95', stopOpacity:0.8}} />
              </linearGradient>
            </defs>
            
            {/* Mobile Path */}
            <g className="lg:hidden">
              {/* Road shadow */}
              <path
                d={generateRoadPath(mobileCoords)}
                stroke="url(#roadShadow)"
                strokeWidth="24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="translate(2, 2)"
              />
              
              {/* Main road */}
              <path
                d={generateRoadPath(mobileCoords)}
                stroke="url(#roadGradient)"
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Road center line */}
              <path
                d={generateRoadPath(mobileCoords)}
                stroke="#ffffff"
                strokeWidth="2"
                fill="none"
                strokeDasharray="8,6"
                strokeLinecap="round"
                opacity="0.9"
              />
            </g>

            {/* Desktop Path */}
            <g className="hidden lg:block">
              {/* Road shadow */}
              <path
                d={generateRoadPath(desktopCoords)}
                stroke="url(#roadShadow)"
                strokeWidth="24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="translate(2, 2)"
              />
              
              {/* Main road */}
              <path
                d={generateRoadPath(desktopCoords)}
                stroke="url(#roadGradient)"
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Road center line */}
              <path
                d={generateRoadPath(desktopCoords)}
                stroke="#ffffff"
                strokeWidth="2"
                fill="none"
                strokeDasharray="8,6"
                strokeLinecap="round"
                opacity="0.9"
              />
            </g>
          </svg>

          {/* Week Bus Stops */}
          <div className="relative z-10 h-full">
            {weeksData.map((weekData, index) => {
              const currentWeek = getCurrentWeek();
              
              return (
                <React.Fragment key={weekData.weekNumber}>
                  {/* Mobile Layout */}
                  <div className="lg:hidden">
                    <WeekBusStop 
                      weekData={weekData} 
                      currentWeek={currentWeek}
                      coords={mobileCoords[index]}
                    />
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:block">
                    <WeekBusStop 
                      weekData={weekData} 
                      currentWeek={currentWeek}
                      coords={desktopCoords[index]}
                    />
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-2 right-2 bg-white/90 rounded-lg p-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="text-gray-600">Progress:</div>
              <div className="flex gap-1">
                {Array.from({length: TOTAL_WEEKS}, (_, i) => (
                  <div 
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i + 1 < getCurrentWeek() ? 'bg-green-500' :
                      i + 1 === getCurrentWeek() ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-gray-800 font-semibold">
                {getCurrentWeek()}/{TOTAL_WEEKS}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-base lg:text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <button
            className={`w-full card p-3 lg:p-4 text-left hover:shadow-md transition-all duration-200 border border-transparent hover:border-${theme}-200`}
            onClick={() => navigate('/daily-report')}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 lg:w-8 lg:h-8 bg-${theme}-100 rounded-full flex items-center justify-center`}>
                <PlusCircle className={`w-4 h-4 lg:w-5 lg:h-5 text-${theme}-600`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Add Today's Work</h3>
                <p className="text-xs lg:text-sm text-gray-600">Record daily activities</p>
              </div>
            </div>
          </button>
          
          <button
            className={`w-full card p-3 lg:p-4 text-left hover:shadow-md transition-all duration-200 border border-transparent hover:border-${theme}-200`}
            onClick={() => navigate('/billing')}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 lg:w-8 lg:h-8 bg-${theme}-100 rounded-full flex items-center justify-center`}>
                <Coins className={`w-4 h-4 lg:w-5 lg:h-5 text-${theme}-600`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Get Tokens</h3>
                <p className="text-xs lg:text-sm text-gray-600">Access premium features</p>
              </div>
            </div>
          </button>

          <button
            className={`w-full card p-3 lg:p-4 text-left hover:shadow-md transition-all duration-200 border border-transparent hover:border-${theme}-200`}
            onClick={() => window.open('https://ptmis.udsm.ac.tz/', '_blank')}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 lg:w-8 lg:h-8 bg-${theme}-100 rounded-full flex items-center justify-center`}>
                <BookOpen className={`w-4 h-4 lg:w-5 lg:h-5 text-${theme}-600`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm lg:text-base">PTMIS</h3>
                <p className="text-xs lg:text-sm text-gray-600">Visit your Account</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Daily Reports */}
        <div className="card p-3 lg:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm lg:text-base font-semibold">Recent Daily Reports</h3>
            <button 
              onClick={() => navigate('/daily-report')}
              className={`text-${theme}-600 hover:text-${theme}-700 text-xs lg:text-sm font-medium`}
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {safeDailyReports.slice(0, 3).map((report) => {
              const isCompleted = report.hours_spent > 0 && report.description && report.description.length > 20;
              return (
                <button
                  key={report.id}
                  onClick={() => navigate(`/daily-report?week=${report.week_number}&date=${report.date}`)}
                  className={`w-full text-left flex items-center gap-2 p-2 rounded transition-all duration-200 hover:shadow-sm ${
                    isCompleted 
                      ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
                      : 'bg-gray-50 border border-gray-200 opacity-75 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-1 h-1 rounded-full ${
                    isCompleted ? `bg-${theme}-500` : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs lg:text-sm font-medium truncate ${
                      isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>{report.date}</p>
                    <p className={`text-xs truncate ${
                      isCompleted ? 'text-gray-600' : 'text-gray-400'
                    }`}>{report.description?.substring(0, 40) || 'No description'}...</p>
                  </div>
                  <span className={`text-xs lg:text-sm flex-shrink-0 ${
                    isCompleted ? 'text-gray-500' : 'text-gray-400'
                  }`}>{report.hours_spent}h</span>
                </button>
              );
            })}
            {safeDailyReports.length === 0 && (
              <div className="text-center py-3">
                <p className="text-gray-400 text-xs lg:text-sm">No daily reports yet</p>
                <p className="text-gray-300 text-xs mt-1">Start logging your daily activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Weekly Reports */}
        <div className="card p-3 lg:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm lg:text-base font-semibold">Recent Weekly Reports</h3>
            <button 
              onClick={() => navigate('/weekly-report')}
              className={`text-${theme}-600 hover:text-${theme}-700 text-xs lg:text-sm font-medium`}
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {safeWeeklyReports.slice(0, 3).map((report) => (
              <button
                key={report.id}
                onClick={() => navigate(`/weekly-report/${report.week_number}`)}
                className="w-full text-left flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 hover:shadow-sm transition-all duration-200"
              >
                <div className={`w-1 h-1 bg-${theme}-500 rounded-full`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">Week {report.week_number}</p>
                  <p className="text-xs text-gray-600 truncate">{report.summary?.substring(0, 40) || 'No summary'}...</p>
                </div>
                <span className={`text-xs px-1 py-0.5 lg:px-2 lg:py-1 rounded text-center flex-shrink-0 ${
                  report.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' :
                  report.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {report.status || 'DRAFT'}
                </span>
              </button>
            ))}
            {safeWeeklyReports.length === 0 && (
              <p className="text-gray-500 text-center py-3 text-xs lg:text-sm">No weekly reports yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};