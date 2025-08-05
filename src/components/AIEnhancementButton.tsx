import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { useToastContext } from '@/contexts/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Zap, Sparkles, X, CheckCircle, Bug } from 'lucide-react';
import { testAIEnhancementEndpoint } from '@/utils/debug';

interface AIEnhancementButtonProps {
  weeklyReportId: number;
  onEnhancementComplete?: (enhancedData: any) => void;
  className?: string;
}

export const AIEnhancementButton: React.FC<AIEnhancementButtonProps> = ({
  weeklyReportId,
  onEnhancementComplete,
  className = ''
}) => {
  const { enhanceWeeklyReportWithAI, loading } = useAppStore();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToastContext();
  
  const [showModal, setShowModal] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    console.log('Enhance button clicked');
    console.log('Current instructions:', instructions);
    console.log('Is processing:', isProcessing);
    
    // Always open the modal first
    setShowModal(true);
  };

  const performEnhancement = async (customInstructions?: string) => {
    setIsEnhancing(true);
    try {
      console.log('Starting AI enhancement for weekly report:', weeklyReportId);
      console.log('Custom instructions:', customInstructions || instructions);
      
      await enhanceWeeklyReportWithAI(weeklyReportId, customInstructions || instructions);
      
      console.log('AI enhancement completed successfully');
      showSuccess('Weekly report enhanced successfully! 🚀');
      setShowModal(false);
      setInstructions('');
      
      // Call the callback if provided
      if (onEnhancementComplete) {
        onEnhancementComplete({ success: true });
      }
    } catch (error: any) {
      console.error('AI enhancement failed:', error);
      
      // Provide specific error messages based on the error type
      if (error.message?.includes('Authentication failed')) {
        showError('Authentication failed. Please log in again.');
      } else if (error.message?.includes('Weekly report not found')) {
        showError('Weekly report not found. Please check the report ID.');
      } else if (error.response?.status === 500) {
        showError('Server error (500). Using mock enhancement for development. Check console for details.');
      } else {
        showError('Failed to enhance report. Please try again.');
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleQuickEnhance = () => {
    performEnhancement();
  };

  const handleCustomEnhance = () => {
    performEnhancement(instructions);
  };

  const handleDebugTest = async () => {
    console.log('🔧 Running debug test for weekly report:', weeklyReportId);
    const result = await testAIEnhancementEndpoint(weeklyReportId);
    if (result) {
      showSuccess('Debug test passed! Check console for details.');
    } else {
      showError('Debug test failed! Check console for details.');
    }
  };

  const isProcessing = isEnhancing || loading.isLoading;

  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', { showModal, isProcessing, isEnhancing });
  }, [showModal, isProcessing, isEnhancing]);

  return (
    <>
      {/* Main Enhancement Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Button clicked!');
          handleEnhance();
        }}
        disabled={isProcessing}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
          ${isProcessing 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : `bg-gradient-to-r from-${theme}-500 to-${theme}-600 text-white hover:from-${theme}-600 hover:to-${theme}-700 shadow-lg hover:shadow-xl transform hover:scale-105`
          }
          ${className}
        `}
      >
        {isProcessing ? (
          <>
            <LoadingSpinner size="sm" inline color="white" />
            Enhancing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Enhance with AI
          </>
        )}
      </button>

      {/* Quick Enhancement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-full flex items-center justify-center`}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Enhancement</h3>
                  <p className="text-sm text-gray-600">Make your report more professional</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g., Make it more technical, Focus on electrical engineering, Add more detail about tools used..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Examples */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-2">💡 Examples:</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">• "Make it more technical and professional"</p>
                  <p className="text-xs text-gray-600">• "Focus on electrical engineering concepts"</p>
                  <p className="text-xs text-gray-600">• "Add more detail about tools and equipment used"</p>
                </div>
              </div>
            </div>

                         {/* Actions */}
             <div className="flex gap-3 mt-6">
               <button
                 onClick={() => setShowModal(false)}
                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
               >
                 Cancel
               </button>
               
               {/* Debug button - only show in development */}
               {process.env.NODE_ENV === 'development' && (
                 <button
                   onClick={handleDebugTest}
                   className="px-3 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center gap-1"
                   title="Debug AI Enhancement"
                 >
                   <Bug className="w-4 h-4" />
                   Debug
                 </button>
               )}
              
              <button
                onClick={handleQuickEnhance}
                disabled={isEnhancing}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  isEnhancing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : `bg-gradient-to-r from-${theme}-500 to-${theme}-600 text-white hover:from-${theme}-600 hover:to-${theme}-700`
                }`}
              >
                                 {isEnhancing ? (
                   <>
                     <LoadingSpinner size="sm" inline color="white" />
                     Enhancing...
                   </>
                 ) : (
                   <>
                     <Sparkles className="w-4 h-4" />
                     Quick Enhance
                   </>
                 )}
              </button>
              
              {instructions.trim() && (
                <button
                  onClick={handleCustomEnhance}
                  disabled={isEnhancing}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    isEnhancing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                                   {isEnhancing ? (
                   <LoadingSpinner size="sm" inline color="white" />
                 ) : (
                   <CheckCircle className="w-4 h-4" />
                 )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 