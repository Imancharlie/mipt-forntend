import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { GeneralReport } from '@/types';
import { Loader2, Sparkles, Edit, Download, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

export const GeneralReportPage: React.FC = () => {
  const { generalReport, fetchGeneralReport, loading, exportReport } = useAppStore();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showAIEnhance, setShowAIEnhance] = useState(false);
  const [enhancingField, setEnhancingField] = useState<string>('');
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<GeneralReport>();

  useEffect(() => {
    fetchGeneralReport();
  }, [fetchGeneralReport]);

  useEffect(() => {
    if (generalReport) {
      reset(generalReport);
    }
  }, [generalReport, reset]);

  const onSubmit = async (data: GeneralReport) => {
    try {
      // TODO: Implement update general report
      console.log('Update general report:', data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update general report:', error);
    }
  };

  const handleAIEnhance = async (field: string) => {
    setEnhancingField(field);
    setShowAIEnhance(true);
    // TODO: Implement AI enhancement
  };

  const handleExport = async (type: 'pdf' | 'docx') => {
    try {
      await exportReport(type, 'general', 0);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading.isLoading && !generalReport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Loader2 className={`w-8 h-8 animate-spin text-${theme}-500 mb-4`} />
        <p className="text-gray-600">Loading general report...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold text-${theme}-600`}>General Report</h1>
          <p className="text-gray-600">Your comprehensive training report</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="btn-outline flex items-center gap-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4" />
            {isEditing ? 'Cancel Edit' : 'Edit Report'}
          </button>
          <button 
            className="btn-primary flex items-center gap-2"
            onClick={() => handleExport('pdf')}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button 
            className="btn-secondary flex items-center gap-2"
            onClick={() => handleExport('docx')}
          >
            <Download className="w-4 h-4" />
            Export DOCX
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {/* Title Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Report Title</h2>
            <button
              onClick={() => handleAIEnhance('title')}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <input 
              className="input-field text-xl font-semibold" 
              {...register('title')} 
            />
          ) : (
            <h3 className="text-xl font-semibold text-gray-900">
              {generalReport?.title || 'Industrial Practical Training Report'}
            </h3>
          )}
        </div>

        {/* Introduction */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Introduction</h2>
            <button
              onClick={() => handleAIEnhance('introduction')}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="input-field" 
              rows={6}
              placeholder="Provide an overview of your training program, objectives, and what you hope to achieve..."
              {...register('introduction')} 
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {generalReport?.introduction || 'Introduction content will appear here...'}
            </p>
          )}
        </div>

        {/* Company Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Company Overview</h2>
            <button
              onClick={() => handleAIEnhance('company_overview')}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="input-field" 
              rows={4}
              placeholder="Describe the company, its industry, size, and your role within the organization..."
              {...register('company_overview')} 
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {generalReport?.company_overview || 'Company overview content will appear here...'}
            </p>
          )}
        </div>

        {/* Training Objectives */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Training Objectives</h2>
            <button
              onClick={() => handleAIEnhance('training_objectives')}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="input-field" 
              rows={4}
              placeholder="List the specific objectives and goals of your training program..."
              {...register('training_objectives')} 
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {generalReport?.training_objectives || 'Training objectives content will appear here...'}
            </p>
          )}
        </div>

        {/* Methodology */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Methodology</h2>
            <button
              onClick={() => handleAIEnhance('methodology')}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="input-field" 
              rows={4}
              placeholder="Describe the methods, approaches, and techniques used during your training..."
              {...register('methodology')} 
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {generalReport?.methodology || 'Methodology content will appear here...'}
            </p>
          )}
        </div>

        {/* Achievements */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Achievements</h2>
            <button
              onClick={() => handleAIEnhance('achievements')}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="input-field" 
              rows={4}
              placeholder="Highlight your key achievements, completed projects, and significant contributions..."
              {...register('achievements')} 
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {generalReport?.achievements || 'Achievements content will appear here...'}
            </p>
          )}
        </div>

        {/* Challenges Faced */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Challenges Faced</h2>
            <button
              onClick={() => handleAIEnhance('challenges_faced')}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="input-field" 
              rows={4}
              placeholder="Discuss the challenges you encountered and how you overcame them..."
              {...register('challenges_faced')} 
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {generalReport?.challenges_faced || 'Challenges content will appear here...'}
            </p>
          )}
        </div>

        {/* Skills Acquired */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Skills Acquired</h2>
            <button
              onClick={() => handleAIEnhance('skills_acquired')}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="input-field" 
              rows={4}
              placeholder="List the technical and soft skills you developed during your training..."
              {...register('skills_acquired')} 
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {generalReport?.skills_acquired || 'Skills acquired content will appear here...'}
            </p>
          )}
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recommendations</h2>
            <button
              onClick={() => handleAIEnhance('recommendations')}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="input-field" 
              rows={4}
              placeholder="Provide recommendations for future improvements or suggestions..."
              {...register('recommendations')} 
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {generalReport?.recommendations || 'Recommendations content will appear here...'}
            </p>
          )}
        </div>

        {/* Conclusion */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conclusion</h2>
            <button
              onClick={() => handleAIEnhance('conclusion')}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="input-field" 
              rows={4}
              placeholder="Summarize your training experience and its impact on your professional development..."
              {...register('conclusion')} 
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {generalReport?.conclusion || 'Conclusion content will appear here...'}
            </p>
          )}
        </div>

        {/* Acknowledgments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Acknowledgments</h2>
            <button
              onClick={() => handleAIEnhance('acknowledgments')}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="AI Enhance"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="input-field" 
              rows={3}
              placeholder="Thank the people who supported you during your training..."
              {...register('acknowledgments')} 
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {generalReport?.acknowledgments || 'Acknowledgments content will appear here...'}
            </p>
          )}
        </div>
      </div>

      {/* Save Button for Edit Mode */}
      {isEditing && (
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSubmit(onSubmit)}
            className="btn-primary flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      )}

      {/* AI Enhancement Modal */}
      {showAIEnhance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">AI Enhancement</h3>
            <p className="text-gray-600 mb-4">
              Enhance your {enhancingField} with AI assistance
            </p>
            <div className="flex gap-3">
              <button 
                className="btn-primary flex-1"
                onClick={() => setShowAIEnhance(false)}
              >
                Enhance
              </button>
              <button 
                className="btn-secondary flex-1"
                onClick={() => setShowAIEnhance(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 