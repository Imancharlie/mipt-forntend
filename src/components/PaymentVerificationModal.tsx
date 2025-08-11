import React, { useState } from 'react';
import { useToastContext } from '@/contexts/ToastContext';
import { billingService } from '@/api/services';
import { Transaction } from '@/types';
import { 
  X,
  Phone,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader
} from 'lucide-react';

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onVerificationComplete: () => void;
}

interface VerificationData {
  user_phone_number: string;
  sender_name: string;
  amount: number;
}

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onVerificationComplete
}) => {
  const { showSuccess, showError } = useToastContext();
  const [verificationData, setVerificationData] = useState<VerificationData>({
    user_phone_number: '',
    sender_name: '',
    amount: 0
  });
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');

  const handleVerify = async () => {
    if (!transaction) return;

    try {
      setLoading(true);
      setVerificationStatus('verifying');
      
      const response = await billingService.verifyPayment(transaction.id, verificationData);
      
      if (response.success) {
        setVerificationStatus('success');
        showSuccess('Payment verified successfully');
        onVerificationComplete();
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setVerificationStatus('failed');
        showError('Payment verification failed');
      }
    } catch (error) {
      setVerificationStatus('failed');
      showError('Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVerificationData({
      user_phone_number: '',
      sender_name: '',
      amount: 0
    });
    setVerificationStatus('idle');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = () => {
    return verificationData.user_phone_number.trim() !== '' &&
           verificationData.sender_name.trim() !== '' &&
           verificationData.amount > 0;
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment Verification
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Transaction Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">User:</span>
              <span className="text-gray-900 dark:text-white">{transaction.user_full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="text-gray-900 dark:text-white">{parseFloat(transaction.amount).toLocaleString()} TZS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Method:</span>
              <span className="text-gray-900 dark:text-white">{transaction.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="text-yellow-600">{transaction.transaction_status}</span>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        {verificationStatus === 'idle' || verificationStatus === 'verifying' ? (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-400">
                  <p className="font-medium mb-1">Verification Instructions</p>
                  <p>Please enter the exact payment details that the user provided to verify the payment matches our records.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={verificationData.user_phone_number}
                onChange={(e) => setVerificationData(prev => ({ ...prev, user_phone_number: e.target.value }))}
                placeholder="e.g., 0712345678"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Sender Name
              </label>
              <input
                type="text"
                value={verificationData.sender_name}
                onChange={(e) => setVerificationData(prev => ({ ...prev, sender_name: e.target.value }))}
                placeholder="Full name of person who sent payment"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Amount (TZS)
              </label>
              <input
                type="number"
                value={verificationData.amount || ''}
                onChange={(e) => setVerificationData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter exact amount sent"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={loading || !isFormValid()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Verify Payment
                  </>
                )}
              </button>
            </div>
          </div>
        ) : verificationStatus === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Payment Verified Successfully
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              The payment details have been verified and the transaction will be processed automatically.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Verification Failed
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The payment details don't match our records. Please check and try again.
            </p>
            <button
              onClick={() => setVerificationStatus('idle')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


