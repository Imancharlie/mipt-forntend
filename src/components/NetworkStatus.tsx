import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useToastContext } from '@/contexts/ToastContext';
import { OfflineQueue, getActionMessage } from '@/utils/offlineQueue';
import { Wifi, WifiOff, Cloud, CloudOff, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'enhance';
  resourceType: 'daily_report' | 'weekly_report' | 'general_report' | 'profile' | 'other';
  description: string;
  userFriendlyMessage: string;
  timestamp: number;
}

export const NetworkStatus: React.FC = () => {
  const { theme } = useTheme();
  const { showSuccess, showWarning, showInfo } = useToastContext();
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showSuccess('🌐 Internet connection restored!');
      checkOfflineActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showWarning('📴 You are currently offline. Your actions will be saved locally and synced when you reconnect.');
    };

    const handleOfflineAction = (event: CustomEvent) => {
      const { actionType, resourceType, description, userFriendlyMessage } = event.detail;
      showInfo(`📱 ${userFriendlyMessage} - Saved offline for later sync`);
    };

    const handleSyncAvailable = (event: CustomEvent) => {
      const { actions } = event.detail;
      setOfflineActions(actions);
      
      // Check if user has chosen not to ask again
      const shouldAsk = localStorage.getItem('offline_sync_dont_ask') !== 'true';
      
      if (shouldAsk && actions.length > 0) {
        setShowSyncModal(true);
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline:action-queued', handleOfflineAction as EventListener);
    window.addEventListener('offline:sync-available', handleSyncAvailable as EventListener);

    // Check for existing offline actions on mount
    checkOfflineActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline:action-queued', handleOfflineAction as EventListener);
      window.removeEventListener('offline:sync-available', handleSyncAvailable as EventListener);
    };
  }, [showSuccess, showWarning, showInfo]);

  const checkOfflineActions = async () => {
    try {
      const hasActions = await OfflineQueue.hasPendingActions();
      if (hasActions) {
        const actions = await OfflineQueue.getOfflineActionsSummary();
        setOfflineActions(actions);
      }
    } catch (error) {
      console.error('Error checking offline actions:', error);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await OfflineQueue.replay();
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      // Show success message
      if (result.success > 0) {
        showSuccess(`✅ Successfully synced ${result.success} offline actions!`);
      }
      
      if (result.failed > 0) {
        showWarning(`⚠️ ${result.failed} actions failed to sync and will be retried later.`);
      }
      
      // Update offline actions list
      await checkOfflineActions();
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowSyncModal(false);
        setIsSyncing(false);
        setSyncProgress(0);
      }, 1500);
      
    } catch (error) {
      console.error('Error syncing offline actions:', error);
      showWarning('⚠️ Failed to sync some offline actions. They will be retried later.');
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleDontAskAgain = () => {
    setDontAskAgain(true);
    localStorage.setItem('offline_sync_dont_ask', 'true');
    setShowSyncModal(false);
  };

  const handleSyncLater = () => {
    setShowSyncModal(false);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActionIcon = (type: OfflineAction['type']) => {
    switch (type) {
      case 'create': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'update': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'delete': return <X className="w-4 h-4 text-red-500" />;
      case 'enhance': return <Cloud className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Offline Mode</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Offline Actions Indicator */}
      {offlineActions.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer hover:bg-orange-600 transition-colors"
               onClick={() => setShowSyncModal(true)}>
            <CloudOff className="w-4 h-4" />
            <span className="text-sm font-medium">{offlineActions.length} offline actions</span>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-full flex items-center justify-center`}>
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sync Offline Actions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sync your offline changes</p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions List */}
            <div className="mb-4 max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {offlineActions.map((action) => (
                  <div key={action.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {getActionIcon(action.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getActionMessage(action.type, action.resourceType)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(action.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sync Progress */}
            {isSyncing && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-green-600 animate-spin" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Syncing...</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{syncProgress}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  isSyncing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : `bg-gradient-to-r from-${theme}-500 to-${theme}-600 text-white hover:from-${theme}-600 hover:to-${theme}-700`
                }`}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    Sync Now
                  </>
                )}
              </button>
              
              <button
                onClick={handleSyncLater}
                disabled={isSyncing}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Sync Later
              </button>
              
              <button
                onClick={handleDontAskAgain}
                disabled={isSyncing}
                className="w-full px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Don't ask again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
