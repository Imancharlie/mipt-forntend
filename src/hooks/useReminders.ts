import { useState, useEffect, useCallback } from 'react';
import { ReminderSettings, ReminderNotification } from '@/types';
import { reminderService } from '@/api/services';
import { useToastContext } from '@/contexts/ToastContext';

export const useReminders = () => {
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: false,
    time: '18:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    notification_type: 'browser',
    message: 'Time to log your daily activities!'
  });
  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToastContext();

  // Load settings from backend
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await reminderService.getReminderSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load reminder settings:', error);
      // Use default settings if backend is not available
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to backend
  const saveSettings = useCallback(async (newSettings: ReminderSettings) => {
    try {
      setIsLoading(true);
      await reminderService.updateReminderSettings(newSettings);
      setSettings(newSettings);
      showSuccess('Reminder settings saved successfully!');
      
      // Schedule notifications if enabled
      if (newSettings.enabled) {
        await scheduleNotifications(newSettings);
      }
    } catch (error) {
      console.error('Failed to save reminder settings:', error);
      showError('Failed to save reminder settings');
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      showError('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      showError('Please enable notifications in your browser settings');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, [showError]);

  // Schedule notifications for the week
  const scheduleNotifications = useCallback(async (reminderSettings: ReminderSettings) => {
    if (!reminderSettings.enabled) return;

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    // Clear existing notifications
    setNotifications([]);

    const dayMap: { [key: string]: number } = {
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5
    };

    const [hours, minutes] = reminderSettings.time.split(':').map(Number);
    
    // Schedule notifications for the next 4 weeks
    for (let week = 0; week < 4; week++) {
      reminderSettings.days.forEach(day => {
        const dayNumber = dayMap[day];
        if (dayNumber) {
          const notificationDate = new Date();
          notificationDate.setDate(notificationDate.getDate() + (dayNumber - notificationDate.getDay() + 7 * week));
          notificationDate.setHours(hours, minutes, 0, 0);

          // Only schedule if the date is in the future
          if (notificationDate > new Date()) {
            const notification: ReminderNotification = {
              id: `reminder-${week}-${day}`,
              user_id: 1, // Will be replaced with actual user ID
              title: 'Daily Report Reminder',
              message: reminderSettings.message || 'Time to log your daily activities!',
              scheduled_time: notificationDate.toISOString(),
              is_sent: false,
              created_at: new Date().toISOString()
            };

            setNotifications(prev => [...prev, notification]);
          }
        }
      });
    }
  }, [requestNotificationPermission]);

  // Send browser notification
  const sendBrowserNotification = useCallback((title: string, message: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'daily-reminder',
        requireInteraction: true
      });
    }
  }, []);

  // Check and send notifications
  const checkNotifications = useCallback(() => {
    const now = new Date();
    notifications.forEach(notification => {
      if (!notification.is_sent) {
        const scheduledTime = new Date(notification.scheduled_time);
        if (now >= scheduledTime) {
          // Send notification
          if (settings.notification_type === 'browser' || settings.notification_type === 'both') {
            sendBrowserNotification(notification.title, notification.message);
          }
          
          // Mark as sent
          setNotifications(prev => 
            prev.map(n => 
              n.id === notification.id ? { ...n, is_sent: true } : n
            )
          );
        }
      }
    });
  }, [notifications, settings.notification_type, sendBrowserNotification]);

  // Test notification
  const testNotification = useCallback(async () => {
    try {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        sendBrowserNotification(
          'Daily Report Reminder',
          'This is a test notification for your daily report reminder!'
        );
        showSuccess('Test notification sent!');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      showError('Failed to send test notification');
    }
  }, [requestNotificationPermission, sendBrowserNotification, showSuccess, showError]);

  // Initialize
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Check notifications every minute
  useEffect(() => {
    if (settings.enabled) {
      const interval = setInterval(checkNotifications, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [settings.enabled, checkNotifications]);

  return {
    settings,
    notifications,
    isLoading,
    saveSettings,
    testNotification,
    requestNotificationPermission
  };
}; 