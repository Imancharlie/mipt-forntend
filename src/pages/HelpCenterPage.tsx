import React, { useState } from 'react';
import { feedbackService } from '@/api/services';
import { useToastContext } from '@/contexts/ToastContext';

export const HelpCenterPage: React.FC = () => {
  const [feedback, setFeedback] = useState({
    type: 'bug',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showSuccess, showError } = useToastContext();

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Send to backend: api/auth/feedback/
      await feedbackService.submitFeedback({
        type: feedback.type,
        subject: feedback.subject,
        message: feedback.message,
      });
      setSubmitted(true);
      showSuccess('Thanks! Your feedback has been submitted.');
      // Reset form after success
      setFeedback({ type: 'bug', subject: '', message: '' });
    } catch (err) {
      showError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickHelp = () => {
    const whatsappMessage = "Hi! I need quick help with the app.";
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/255614021404?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Help Center</h1>
      
      {/* Feedback Form */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Send Feedback Report</h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Help us improve by reporting issues or sharing suggestions.</p>
        
        {submitted ? (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 text-center">
            <div className="text-orange-600 dark:text-orange-400 font-medium">Thank you for your feedback!</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">We'll review your report and get back to you if needed.</div>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <select
                value={feedback.type}
                onChange={(e) => setFeedback({...feedback, type: e.target.value})}
                className="input-field"
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement Suggestion</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={feedback.subject}
                onChange={(e) => setFeedback({...feedback, subject: e.target.value})}
                placeholder="Brief description of the issue or suggestion"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Details
              </label>
              <textarea
                value={feedback.message}
                onChange={(e) => setFeedback({...feedback, message: e.target.value})}
                placeholder="Please provide detailed information about the issue or your suggestion..."
                rows={4}
                className="input-field textarea"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !feedback.subject || !feedback.message}
              className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>

      {/* Quick Help Button */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Need Immediate Help?</h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Get instant support via WhatsApp</p>
        <button
          onClick={handleQuickHelp}
          className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          <span>Chat with Support</span>
        </button>
      </div>

      {/* FAQ Section */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Frequently Asked Questions</h2>
        <p className="text-gray-700 dark:text-gray-300">Common questions and quick solutions.</p>
        <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li>How to install the app: Use your browser's install option (Add to Home Screen).</li>
          <li>Reports offline: You can create daily/weekly reports while offline; they'll sync when online.</li>
          <li>Billing support: Submit receipt on the Billing page and contact us via WhatsApp.</li>
          <li>Data not syncing: Check your internet connection and try refreshing the page.</li>
        </ul>
      </div>

      {/* Contact Section */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Other Contact Methods</h2>
        <div className="space-y-3">
        <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Email Support</span>
            <a 
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline transition-colors" 
              href="mailto:support@mipt.app"
            >
              support@mipt.app
            </a>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">WhatsApp</span>
            <a 
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline transition-colors" 
              href="https://wa.me/255614021404" 
              target="_blank" 
              rel="noreferrer"
            >
              +255 614 021 404
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;