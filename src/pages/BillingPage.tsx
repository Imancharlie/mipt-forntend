import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useToastContext } from '@/contexts/ToastContext';
import { useTheme } from '@/components/ThemeProvider';
import { CreateTransactionData } from '@/types';
import { 
  Coins, 
  Phone, 
  User, 
  DollarSign, 
  CheckCircle,
  X,
  Send,
  ExternalLink,
  Calculator,
  Info
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  number: string;
  accountName: string;
}

interface PaymentConfirmation {
  method: string;
  phoneNumber?: string;
  amount: number;
  name: string;
  wakalaName?: string;
  confirmationType: 'own' | 'different' | 'wakala';
}

const BillingPage: React.FC = () => {
  const { 
    userBalance, 
    paymentInfo, 
    profile,
    fetchUserBalance, 
    fetchPaymentInfo, 
    createTransaction
  } = useAppStore();
  const { showSuccess, showError } = useToastContext();
  const { theme } = useTheme();
  
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'own' | 'different' | 'wakala' | ''>('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentConfirmation>({
    method: '',
    amount: 0,
    name: '',
    confirmationType: 'own'
  });
  const [calculatorAmount, setCalculatorAmount] = useState<number>(1000);
  const [transactionSuccess, setTransactionSuccess] = useState<{
    show: boolean;
    transactionId?: number;
    amount?: number;
  }>({ show: false });

  useEffect(() => {
    fetchUserBalance();
    fetchPaymentInfo();
  }, []); // Removed store functions from dependencies to prevent infinite loop

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'LiPA NAMBA',
      icon: <Phone className="w-6 h-6" />,
      number: '68256127', // LiPA NAMBA number
      accountName: 'MIPT Software'
    },
    {
      id: 'mpesa-personal',
      name: 'M-Pesa',
      description: 'Mpesa Number',
      icon: <Phone className="w-6 h-6" />,
      number: '0741233416',
      accountName: 'ABDUL NURDIN'
    }
  ];

  // Calculate tokens based on amount (backend formula: Tokens = Amount × 0.3)
  const calculateTokens = (amount: number) => {
    return Math.floor(amount * 0.3);
  };

  const handleProceedToPayment = () => {
    if (calculatorAmount < 1000) {
      showError('Minimum payment amount is 1000 TSH');
      return;
    }
    if (calculatorAmount % 500 !== 0) {
      showError('Payment amount must be in multiples of 500 TSH');
      return;
    }
    // Clear any previous success state
    setTransactionSuccess({ show: false });
    setShowPaymentMethods(true);
  };

  const handleSubmitConfirmation = async () => {
    if (!paymentDetails.amount || paymentDetails.amount <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    if (confirmationType === 'own' && !profile?.phone_number) {
      showError('Your profile phone number is missing. Please update your profile first.');
      return;
    }

    if (confirmationType === 'different' && !paymentDetails.phoneNumber) {
      showError('Please enter the phone number used for payment');
      return;
    }

    if (confirmationType === 'wakala' && !paymentDetails.wakalaName) {
      showError('Please enter the wakala name');
      return;
    }

    try {
      // Create transaction data based on payment method
      const transactionData: CreateTransactionData = {
        user_phone_number: confirmationType === 'own' 
          ? (profile?.phone_number || '') 
          : (paymentDetails.phoneNumber || ''),
        sender_name: paymentDetails.name,
        payment_method: confirmationType === 'wakala' ? 'WAKALA' : 'DIRECT',
        amount: paymentDetails.amount,
      };

      if (confirmationType === 'wakala' && paymentDetails.wakalaName) {
        transactionData.wakala_name = paymentDetails.wakalaName;
      }

      // Debug logging
      console.log('Transaction data being sent:', transactionData);
      console.log('Profile phone number:', profile?.phone_number);
      console.log('Confirmation type:', confirmationType);
      console.log('About to call createTransaction...');

      const transaction = await createTransaction(transactionData);

      console.log('✅ Transaction created successfully:', transaction);

      // Show success message
      showSuccess('Transaction created successfully! Staff will verify your payment and add tokens to your account. You can view your transaction status in the admin panel.');
      
      // Set success state for visual confirmation
      setTransactionSuccess({
        show: true,
        transactionId: transaction.id,
        amount: parseFloat(transaction.amount) || paymentDetails.amount
      });
      
      // Close modal and reset form
      setShowConfirmationModal(false);
      setConfirmationType('');
      setPaymentDetails({ method: '', amount: 0, name: '', confirmationType: 'own' });
      
      // Show a visual confirmation before refreshing
      setTimeout(() => {
        // Try to refresh user balance, but don't fail if it doesn't work
        try {
          if (userBalance) {
            console.log('🔄 Refreshing page to show updated balance...');
            // Trigger a refresh of the balance
            window.location.reload();
          }
        } catch (refreshError) {
          console.warn('Failed to refresh balance after transaction:', refreshError);
          // Transaction was successful, so this is not critical
        }
      }, 3000); // Wait 3 seconds to ensure success message is visible
    } catch (error) {
      console.error('Transaction creation error:', error);
      showError('Failed to submit transaction. Please try again.');
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-lg lg:text-2xl font-bold text-${theme}-600 mb-2`}>
          Billing & Payment
        </h1>
        <p className="text-gray-600 text-xs lg:text-sm">
          Manage your account balance and purchase tokens for AI features
        </p>
      </div>


      {/* Transaction Success Banner */}
      {transactionSuccess.show && (
        <div className="mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
                  Transaction Submitted Successfully! 🎉
                </h3>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <p><strong>Transaction ID:</strong> #{transactionSuccess.transactionId}</p>
                  <p><strong>Amount:</strong> {transactionSuccess.amount?.toLocaleString()} TSH</p>
                  <p><strong>Status:</strong> Pending staff verification</p>
                  <p className="text-xs mt-2">Your payment will be verified by staff and tokens will be added to your account shortly.</p>
                </div>
              </div>
              <button
                onClick={() => setTransactionSuccess({ show: false })}
                className="flex-shrink-0 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {!showPaymentMethods ? (
        <>
          {/* Token Calculator */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 bg-${theme}-100 dark:bg-${theme}-900 rounded-lg`}>
                <Calculator className={`w-5 h-5 text-${theme}-600 dark:text-${theme}-400`} />
              </div>
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                  Token Calculator
                </h2>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                  Calculate how many tokens you'll get for your payment
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Amount (TSH)
                </label>
                <input
                  type="number"
                  value={calculatorAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Remove leading zeros and convert to number
                    const cleanValue = value.replace(/^0+/, '') || '0';
                    setCalculatorAmount(Number(cleanValue));
                  }}
                  min="1000"
                  step="500"
                  className="input-field input-field-sm"
                  placeholder="Enter amount in multiples of 500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Minimum: 1,000 TSH • Step: 500 TSH
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {calculateTokens(calculatorAmount)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Tokens</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Rate: 0.3 tokens per TSH
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleProceedToPayment}
                className={`w-full px-4 py-2 bg-${theme}-600 hover:bg-${theme}-700 text-white font-medium rounded-lg transition-colors text-sm`}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Payment Methods */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Payment Methods</h2>
            
            {/* M-Pesa Image */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <img 
                src="/mpesa.png" 
                alt="M-Pesa" 
                className="w-full object-contain mb-4"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                        {method.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{method.description || 'M-Pesa Number'}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Payment Number</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-1.5 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Number:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">{method.number}</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Name:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">{method.accountName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confirmation Link */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  After making your payment, click below to submit your transaction
                </h3>
                <button
                  onClick={() => {
                    setTransactionSuccess({ show: false });
                    setShowConfirmationModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink className="w-5 h-5" />
                  Submit Transaction
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  Staff will verify your payment and add tokens to your account
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Submit Transaction</h3>
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setConfirmationType('');
                  setPaymentDetails({ method: '', amount: 0, name: '', confirmationType: 'own' });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  How did you send the money?
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setConfirmationType('own')}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all duration-300 ${
                      confirmationType === 'own' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-4 h-4 ${confirmationType === 'own' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">From my registered number</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Using the number you registered with</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setConfirmationType('different')}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all duration-300 ${
                      confirmationType === 'different' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Phone className={`w-4 h-4 ${confirmationType === 'different' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">Different phone number</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Used a different number to pay</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setConfirmationType('wakala')}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all duration-300 ${
                      confirmationType === 'wakala' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className={`w-4 h-4 ${confirmationType === 'wakala' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">By Wakala/Agent</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Paid through an agent</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Conditional Input Fields */}
              {confirmationType && (
                <div className="space-y-3">
                  {confirmationType === 'different' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number Used <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={paymentDetails.phoneNumber || ''}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        required
                        className="input-field input-field-sm"
                        placeholder="Enter phone number used for payment"
                      />
                    </div>
                  )}

                  {confirmationType === 'wakala' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Wakala/Agent Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.wakalaName || ''}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, wakalaName: e.target.value }))}
                        required
                        className="input-field input-field-sm"
                        placeholder="Enter wakala/agent name"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount Sent (TSH) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={paymentDetails.amount}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        required
                        min="2000"
                        step="1000"
                        className="input-field input-field-sm pl-8"
                        placeholder="Enter amount sent"
                      />
                    </div>
                  </div>

                  {(confirmationType === 'own' || confirmationType === 'different') && (
                    <div>
                      {confirmationType === 'own' && (
                        <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            <strong>Phone Number:</strong> {profile?.phone_number || 'Not set in profile'}
                          </p>
                        </div>
                      )}
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name on Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.name}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="input-field input-field-sm"
                        placeholder="Enter name on the phone number"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSubmitConfirmation}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Submit Transaction
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;



