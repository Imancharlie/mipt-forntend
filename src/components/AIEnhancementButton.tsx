import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { useToastContext } from '@/contexts/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Sparkles, X, CheckCircle, Bug, Coins, Brain, FileText, Clock } from 'lucide-react';
import { testAIEnhancementEndpoint } from '@/utils/debug';

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
  const { enhanceWeeklyReportWithAI, loading } = useAppStore();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToastContext();
  
  const [showModal, setShowModal] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementProgress, setEnhancementProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [estimatedTokens, setEstimatedTokens] = useState(0);

  // Calculate token estimation based on report completeness
  const calculateTokenEstimation = (report: any) => {
    if (!report) return { tokens: 1500, complexity: 'high' };
    
    let baseTokens = 500;
    let complexity = 'low';
    
    // Check if report is empty
    const isEmpty = !report.summary && !report.achievements && !report.challenges && !report.lessons_learned;
    
    if (isEmpty) {
      baseTokens = 2000; // More tokens for empty reports
      complexity = 'high';
    } else {
      // Check content completeness
      const hasSummary = report.summary && report.summary.length > 50;
      const hasAchievements = report.achievements && report.achievements.length > 30;
      const hasChallenges = report.challenges && report.challenges.length > 30;
      const hasLessons = report.lessons_learned && report.lessons_learned.length > 30;
      
      const completedSections = [hasSummary, hasAchievements, hasChallenges, hasLessons].filter(Boolean).length;
      
      if (completedSections === 0) {
        baseTokens = 2000;
        complexity = 'high';
      } else if (completedSections <= 2) {
        baseTokens = 1200;
        complexity = 'medium';
      } else {
        baseTokens = 800;
        complexity = 'low';
      }
    }
    
    // Add tokens for custom instructions
    if (instructions.trim()) {
      baseTokens += Math.ceil(instructions.length / 10) * 50;
    }
    
    return { tokens: baseTokens, complexity };
  };

  const handleEnhance = async () => {
    console.log('Enhance button clicked');
    console.log('Current instructions:', instructions);
    console.log('Is processing:', isProcessing);
    
    // Calculate token estimation
    const estimation = calculateTokenEstimation(reportData);
    setEstimatedTokens(estimation.tokens);
    
    // Always open the modal first
    setShowModal(true);
  };

  const performEnhancement = async (customInstructions?: string) => {
    setIsEnhancing(true);
    setEnhancementProgress(0);
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
      clearInterval(progressInterval);
      setIsEnhancing(false);
      setEnhancementProgress(0);
      setCurrentStep('');
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

  // Calculate token estimation when modal opens
  useEffect(() => {
    if (showModal) {
      const estimation = calculateTokenEstimation(reportData);
      setEstimatedTokens(estimation.tokens);
    }
  }, [showModal, reportData, instructions]);

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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-full flex items-center justify-center`}>
                  <Brain className="w-5 h-5 text-white" />
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

            {/* Token Estimation */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Estimated Tokens:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600">{estimatedTokens}</span>
                  <span className="text-xs text-gray-500">tokens</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {reportData && !reportData.summary && !reportData.achievements ? 
                  'Empty report detected - higher token usage for comprehensive enhancement' :
                  'Partial content detected - moderate token usage for targeted improvements'
                }
              </div>
            </div>

            {/* Enhancement Progress (when active) */}
            {isEnhancing && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600 animate-spin" />
                    <span className="text-sm font-medium text-gray-700">Enhancing Report...</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{enhancementProgress}%</span>
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
                
                {/* Animated Processing Indicators */}
                <div className="flex justify-center mt-3 space-x-1">
                  {Array.from({length: 3}, (_, i) => (
                    <div 
                      key={i}
                      className={`w-2 h-2 rounded-full animate-bounce ${
                        i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Instructions (Optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="E.g., 'Make it more technical', 'Focus on achievements', 'Use formal language'"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={isEnhancing}
              />
              <div className="mt-1 text-xs text-gray-500">
                Custom instructions may increase token usage
              </div>
            </div>

            {/* Token Usage Explanation */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Token Usage Guide:</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-red-500" />
                  <span>Empty report: ~2000 tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-yellow-500" />
                  <span>Partial content: ~1200 tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-green-500" />
                  <span>Complete content: ~800 tokens</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={isEnhancing}
              >
                Cancel
              </button>
              
              {/* Debug button - only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={handleDebugTest}
                  className="px-3 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center gap-1"
                  title="Debug AI Enhancement"
                  disabled={isEnhancing}
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