// Date utilities for consistent week calculations
export const TRAINING_START_DATE = new Date('2025-07-21'); // Monday
export const TOTAL_WEEKS = 8;

export interface WeekDates {
  startDate: Date;
  endDate: Date;
  startDateStr: string;
  endDateStr: string;
}

export const getWeekDates = (weekNumber: number): WeekDates => {
  const weekStartDate = new Date(TRAINING_START_DATE);
  weekStartDate.setDate(TRAINING_START_DATE.getDate() + (weekNumber - 1) * 7);
  
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 4); // Friday (5 days total)
  
  return {
    startDate: weekStartDate,
    endDate: weekEndDate,
    startDateStr: weekStartDate.toISOString().split('T')[0],
    endDateStr: weekEndDate.toISOString().split('T')[0]
  };
};

export const getCurrentWeek = (): number => {
  const currentDate = new Date();
  const timeDiff = currentDate.getTime() - TRAINING_START_DATE.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const weekNumber = Math.floor(daysDiff / 7) + 1;
  
  // Ensure week number is within valid range
  if (weekNumber < 1) return 1;
  if (weekNumber > TOTAL_WEEKS) return TOTAL_WEEKS;
  return weekNumber;
};

export const isWeekInFuture = (weekNumber: number): boolean => {
  const currentDate = new Date();
  const weekDates = getWeekDates(weekNumber);
  return currentDate < weekDates.startDate;
};

export const isWeekCompleted = (weekNumber: number): boolean => {
  const currentDate = new Date();
  const weekDates = getWeekDates(weekNumber);
  return currentDate > weekDates.endDate;
};

export const isCurrentWeek = (weekNumber: number): boolean => {
  const currentDate = new Date();
  const weekDates = getWeekDates(weekNumber);
  return currentDate >= weekDates.startDate && currentDate <= weekDates.endDate;
}; 