import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { useToastContext } from '@/contexts/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Sparkles, X, CheckCircle, Coins, Brain, FileText, Clock, AlertCircle, Info } from 'lucide-react';

interface AIEnhancementButtonProps {
  weeklyReportId: number;
  onEnhancementComplete?: (enhancedData: any) => void;
  className?: string;
  reportData?: any; // Weekly report data for token estimation
}

export const AIEnhancementButton: React.FC<AIEnhancementButtonProps> = ({
  weeklyReportId,
  onEnhancementComplete,
  className = '',
  reportData
}) => {
  const { enhanceWeeklyReportWithAI, loading, userBalance, paymentInfo } = useAppStore();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToastContext();
  
  const [showModal, setShowModal] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementProgress, setEnhancementProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [canReset, setCanReset] = useState(false);

  // Fixed cost: 300 tokens regardless of report completeness
  const FIXED_COST = 300;
  
  // Check if report can be enhanced (not currently being enhanced and has sufficient tokens)
  const canEnhance = userBalance && 
                    userBalance.available_tokens >= FIXED_COST && 
                    !isEnhancing && 
                    !isResetting;

  // Determine report quality and provide appropriate messaging
  const getReportQualityInfo = (report: any) => {
    if (!report) return { quality: 'unknown', message: '', daysCount: 0 };
    
    const daysCount = report.daily_reports?.length || 0;
    
    if (daysCount === 0) {
      return {
        quality: 'empty',
        message: 'Your report is completely empty. AI will generate comprehensive content based on your additional description.',
        daysCount: 0
      };
    } else if (daysCount < 3) {
      return {
        quality: 'minimal',
        message: `Your report only has ${daysCount} day${daysCount === 1 ? '' : 's'} filled. AI will enhance what you have and generate additional content based on your description.`,
        daysCount: daysCount
      };
    } else {
      return {
        quality: 'good',
        message: `Your report has ${daysCount} days filled. AI will enhance your existing content and improve the overall quality.`,
        daysCount: daysCount
      };
    }
  };

  const handleEnhance = async () => {
    console.log('Enhance button clicked');
    console.log('Current instructions:', instructions);
    console.log('Is processing:', isProcessing);
    
    // Always open the modal first
    setShowModal(true);
  };

  const handleReset = async () => {
    if (!canReset) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      '⚠️ WARNING: This action will permanently reset your enhanced report to the original state.\n\n' +
      '• All AI enhancements will be lost\n' +
      '• The report will return to your original input\n' +
      '• This action cannot be undone\n\n' +
      'Are you sure you want to continue?'
    );
    
    if (!confirmed) return;
    
    setIsResetting(true);
    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }
      
      // Make the reset API call
      const response = await fetch(`${import.meta.env.VITE_API_URL}/weekly-reports/${weeklyReportId}/reset_to_original/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        showSuccess('✅ Weekly report successfully reset to original state!');
        
        // Call the callback if provided
        if (onEnhancementComplete) {
          onEnhancementComplete({ success: true, action: 'reset' });
        }
        
        // Don't close modal or hide reset button - keep it available for future use
        // The button should remain visible as long as the report was ever enhanced
      } else {
        throw new Error(result.message || 'Reset failed');
      }
    } catch (error: any) {
      console.error('Reset failed:', error);
      showError(`Failed to reset report: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  // Check if reset is available when component mounts or reportData changes
  useEffect(() => {
    if (reportData) {
      // Check if the report has been enhanced (has AI-generated content)
      // This logic depends on how your backend tracks enhanced vs original reports
      const hasEnhancedContent = reportData.is_enhanced || 
                                reportData.enhancement_date || 
                                reportData.enhanced_at ||
                                reportData.ai_enhanced ||
                                reportData.enhancement_count > 0 ||
                                reportData.enhanced_with_ai ||
                                reportData.ai_enhancement_date ||
                                // Check if there's a difference between original and current content
                                (reportData.original_content && reportData.original_content !== reportData.content) ||
                                (reportData.original_daily_reports && reportData.original_daily_reports.length !== reportData.daily_reports.length);
      
      setCanReset(!!hasEnhancedContent);
      
      // Log for debugging
      console.log('Report enhancement status:', {
        reportData,
        hasEnhancedContent,
        canReset: !!hasEnhancedContent
      });
    }
  }, [reportData]);

  const performEnhancement = async (customInstructions?: string) => {
    setIsEnhancing(true);
    setEnhancementProgress(0);
    setCurrentStep('Checking token balance...');

    // Check if user has sufficient tokens
    if (!userBalance || !userBalance.can_use_ai) {
      showError('Insufficient tokens or not subscribed. Please top up your account.');
      setIsEnhancing(false);
      return;
    }

    setCurrentStep('Initializing AI enhancement...');
      
      // Simulate progress steps
      const progressSteps = [
        { progress: 10, step: 'Analyzing report structure...' },
        { progress: 25, step: 'Processing content sections...' },
        { progress: 40, step: 'Generating enhanced content...' },
        { progress: 60, step: 'Applying AI improvements...' },
        { progress: 80, step: 'Finalizing enhancements...' },
        { progress: 95, step: 'Saving enhanced report...' },
        { progress: 100, step: 'Enhancement complete!' }
      ];
      
      let currentStepIndex = 0;
      
      const updateProgress = () => {
        if (currentStepIndex < progressSteps.length) {
          const step = progressSteps[currentStepIndex];
          setEnhancementProgress(step.progress);
          setCurrentStep(step.step);
          currentStepIndex++;
        }
      };
      
      // Start progress updates
      const progressInterval = setInterval(updateProgress, 800);
      
    try {
      console.log('Starting AI enhancement for weekly report:', weeklyReportId);
      console.log('Custom instructions:', customInstructions || instructions);
      
      await enhanceWeeklyReportWithAI(weeklyReportId, customInstructions || instructions);
      
      console.log('AI enhancement completed successfully');
      showSuccess('Weekly report enhanced successfully!');
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
      clearInterval(progressInterval);
      setIsEnhancing(false);
      setEnhancementProgress(0);
    }
  };

  const handleQuickEnhance = () => {
    performEnhancement();
  };

  const handleCustomEnhance = () => {
    performEnhancement(instructions);
  };

  const isProcessing = isEnhancing || isResetting || loading.isLoading;

  // Get report quality information
  const reportQuality = getReportQualityInfo(reportData);

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

      {/* Enhanced AI Enhancement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-md lg:max-w-lg xl:max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-full flex items-center justify-center`}>
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">AI Enhancement</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Professional report enhancement</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Report Quality Information */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    {reportQuality.quality === 'empty' ? 'Empty Report Detected' : 
                     reportQuality.quality === 'minimal' ? 'Minimal Content Detected' : 
                     'Good Content Detected'}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                    {reportQuality.message}
                  </p>
                  {reportQuality.quality !== 'good' && (
                    <p className="text-blue-600 dark:text-blue-400 font-medium mt-2">
                      💡 <strong>Tip:</strong> Provide detailed additional instructions to help AI generate exactly what you need!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Token Balance and Cost */}
            <div className="mb-4 sm:mb-6 space-y-3">
              {/* Current Balance */}
              {userBalance && (
                <div className={`p-3 sm:p-4 rounded-lg border ${
                  userBalance.available_tokens >= FIXED_COST 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700'
                    : 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        userBalance.available_tokens >= FIXED_COST 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-orange-600 dark:text-orange-400'
                      }`} />
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Your Balance:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg sm:text-xl font-bold ${
                        userBalance.available_tokens >= FIXED_COST 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>{userBalance.available_tokens}</span>
                      <span className="text-xs text-gray-500">tokens</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Fixed Cost - Always 300 tokens */}
              <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Fixed Cost:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">{FIXED_COST}</span>
                    <span className="text-xs text-gray-500">tokens</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                  Professional AI enhancement with grammar, style, and content improvements
                </div>
                </div>
                
              {/* Insufficient balance warning with billing link */}
              {userBalance && userBalance.available_tokens < FIXED_COST && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                        Insufficient tokens. You need {FIXED_COST - userBalance.available_tokens} more tokens.
                      </p>
                      <a 
                        href="/billing" 
                        className="inline-flex items-center gap-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium underline"
                      >
                        <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                        Go to Billing Page
                      </a>
                    </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Enhancement Progress (when active) */}
            {isEnhancing && (
              <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 animate-spin" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Enhancing Report...</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-green-600">{enhancementProgress}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${enhancementProgress}%` }}
                  ></div>
                </div>
                
                {/* Current Step */}
                <div className="text-xs text-gray-600 animate-pulse">
                  {currentStep}
                </div>
              </div>
            )}

            {/* Additional Instructions */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Instructions 
                {reportQuality.quality === 'empty' && <span className="text-red-600 font-semibold">(Required)</span>}
                {reportQuality.quality === 'minimal' && <span className="text-orange-600 font-semibold">(Highly Recommended)</span>}
                {reportQuality.quality === 'good' && <span className="text-green-600">(Optional)</span>}
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                placeholder={reportQuality.quality === 'empty' 
                  ? "⚠️ REQUIRED: Describe your work week, achievements, challenges, and what you'd like the report to focus on..."
                  : reportQuality.quality === 'minimal'
                  ? "💡 RECOMMENDED: Provide additional context about your work, goals, and specific areas you'd like enhanced..."
                  : "✨ OPTIONAL: E.g., 'Make it more technical', 'Focus on achievements', 'Use formal language'"
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-xs sm:text-sm ${
                  reportQuality.quality === 'empty' && !instructions.trim()
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300'
                }`}
                rows={4}
                disabled={isEnhancing}
                required={reportQuality.quality === 'empty'}
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {reportQuality.quality === 'empty' 
                  ? "⚠️ Detailed instructions are required for empty reports to help AI generate comprehensive content!"
                  : reportQuality.quality === 'minimal'
                  ? "💡 Detailed instructions help AI generate exactly what you need!"
                  : "✨ Custom instructions help tailor the enhancement to your preferences"
                }
              </div>
              </div>

            {/* Reset Button - Only visible when reset is available */}
            {canReset && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                      ⚠️ Reset to Original Available
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                      This report has been enhanced with AI. You can reset it to your original input at any time.
                    </p>
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700">
                      <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                        ⚠️ <strong>Warning:</strong> Resetting will permanently remove all AI enhancements and cannot be undone.
                      </p>
                </div>
                    <button
                      onClick={handleReset}
                      disabled={isResetting || isEnhancing}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                        isResetting || isEnhancing
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
                    >
                      {isResetting ? (
                        <>
                          <LoadingSpinner size="sm" inline color="white" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                          Reset to Original
                        </>
                      )}
                    </button>
                </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
               <button
                 onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                disabled={isEnhancing}
               >
                 Cancel
               </button>
              
              <button
                onClick={handleQuickEnhance}
                disabled={!canEnhance || (reportQuality.quality === 'empty' && !instructions.trim())}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                  !canEnhance || (reportQuality.quality === 'empty' && !instructions.trim())
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : `bg-gradient-to-r from-${theme}-500 to-${theme}-600 text-white hover:from-${theme}-600 hover:to-${theme}-700`
                }`}
              >
                                 {isEnhancing ? (
                   <>
                     <LoadingSpinner size="sm" inline color="white" />
                     Enhancing...
                   </>
                ) : !userBalance || userBalance.available_tokens < FIXED_COST ? (
                   <>
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                     Insufficient Tokens
                   </>
                ) : (reportQuality.quality === 'empty' && !instructions.trim()) ? (
                  <>
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    Instructions Required
                   </>
                 ) : (
                   <>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    Enhance Report
                   </>
                 )}
              </button>
              
              {instructions.trim() && (
                <button
                  onClick={handleCustomEnhance}
                  disabled={!canEnhance}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                    !canEnhance
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                                   {isEnhancing ? (
                   <LoadingSpinner size="sm" inline color="white" />
                 ) : (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                 )}
                  Custom
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 