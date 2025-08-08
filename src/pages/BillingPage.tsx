import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { useToastContext } from '@/contexts/ToastContext';
import { 
  Coins, 
  CreditCard, 
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
  const { aiUsageStats } = useAppStore();
  const { showSuccess, showError } = useToastContext();
  
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'own' | 'different' | 'wakala' | ''>('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentConfirmation>({
    method: '',
    amount: 0,
    name: '',
    confirmationType: 'own'
  });
  const [calculatorAmount, setCalculatorAmount] = useState<number>(2000);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay using M-Pesa mobile money',
      icon: <Phone className="w-6 h-6" />,
      number: '4556432',
      accountName: 'MIPT Training'
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      description: 'Pay using Airtel Money',
      icon: <Phone className="w-6 h-6" />,
      number: '4556432',
      accountName: 'MIPT Training'
    }
  ];

  // Calculate tokens based on amount (2000 TSH = 600 tokens)
  const calculateTokens = (amount: number) => {
    return Math.floor((amount / 2000) * 600);
  };

  const handleProceedToPayment = () => {
    if (calculatorAmount < 2000) {
      showError('Minimum payment amount is 2000 TSH');
      return;
    }
    if (calculatorAmount % 1000 !== 0) {
      showError('Payment amount must be in multiples of 1000 TSH');
      return;
    }
    setShowPaymentMethods(true);
  };

  const handleSubmitConfirmation = () => {
    if (!paymentDetails.amount || paymentDetails.amount <= 0) {
      showError('Please enter a valid amount');
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

    showSuccess('Payment confirmation submitted! Staff will verify and add tokens to your account.');
    setShowConfirmationModal(false);
    setConfirmationType('');
    setPaymentDetails({ method: '', amount: 0, name: '', confirmationType: 'own' });
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-2xl p-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            Billing & Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Manage your tokens and make payments</p>
        </div>
      </div>

      {/* Current Tokens */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Current Tokens</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
                  <Coins className="w-5 h-5" />
                  <span className="text-xl font-bold">{aiUsageStats?.total_tokens || 0}</span>
                  <span className="text-sm">tokens</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Last updated</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">Just now</p>
            </div>
          </div>
        </div>
      </div>

      {!showPaymentMethods ? (
        <>
          {/* Minimum Amount Info */}
          <div className="mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Payment Information
                  </h3>
                  <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>• <strong>Minimum payment:</strong> 2000 TSH</p>
                    <p>• <strong>Token rate:</strong> 2000 TSH = 600 tokens</p>
                    <p>• <strong>Payment increments:</strong> Multiples of 1000 TSH</p>
                    <p>• <strong>Enhancement costs:</strong> 300 tokens (complete report) or 500 tokens (blank report)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Token Calculator */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calculator className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Token Calculator</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (TSH)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={calculatorAmount}
                      onChange={(e) => setCalculatorAmount(parseInt(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-300"
                      placeholder="Enter amount in TSH"
                      min="2000"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-700 dark:text-orange-300">Tokens you'll receive:</span>
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {calculateTokens(calculatorAmount)} tokens
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>What you can do with {calculateTokens(calculatorAmount)} tokens:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Enhance {Math.floor(calculateTokens(calculatorAmount) / 300)} complete week reports</li>
                    <li>Or enhance {Math.floor(calculateTokens(calculatorAmount) / 500)} blank reports with AI</li>
                    <li>Generate main job operations and steps</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <button
                  onClick={handleProceedToPayment}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink className="w-5 h-5" />
                  Proceed to Payment
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  You'll be redirected to payment methods
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Payment Methods */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Payment Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{method.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{method.number}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account Name</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{method.accountName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation Link */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  After making your payment, click below to submit for confirmation
                </h3>
                <button
                  onClick={() => setShowConfirmationModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink className="w-5 h-5" />
                  Click here to submit for confirmation
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Payment Confirmation</h3>
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

            <div className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  How did you send the money?
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setConfirmationType('own')}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-300 ${
                      confirmationType === 'own' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 ${confirmationType === 'own' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">From my registered number</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Using the number you registered with</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setConfirmationType('different')}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-300 ${
                      confirmationType === 'different' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Phone className={`w-5 h-5 ${confirmationType === 'different' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">Different phone number</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Used a different number to pay</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setConfirmationType('wakala')}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-300 ${
                      confirmationType === 'wakala' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className={`w-5 h-5 ${confirmationType === 'wakala' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">By Wakala/Agent</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Paid through an agent</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Conditional Input Fields */}
              {confirmationType && (
                <div className="space-y-4">
                  {confirmationType === 'different' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number Used
                      </label>
                      <input
                        type="tel"
                        value={paymentDetails.phoneNumber || ''}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-300"
                        placeholder="Enter phone number used for payment"
                      />
                    </div>
                  )}

                  {confirmationType === 'wakala' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Wakala/Agent Name
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.wakalaName || ''}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, wakalaName: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-300"
                        placeholder="Enter wakala/agent name"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount Sent (TSH)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={paymentDetails.amount}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-300"
                        placeholder="Enter amount sent"
                      />
                    </div>
                  </div>

                  {confirmationType !== 'wakala' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name on Phone Number
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.name}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-300"
                        placeholder="Enter name on the phone number"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSubmitConfirmation}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit for Confirmation
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



