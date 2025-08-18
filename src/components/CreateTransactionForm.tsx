import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { User } from 'lucide-react';

interface CreateTransactionFormProps {
  onSubmit: (data: {
    user_id: number;
    user_phone_number: string;
    sender_name: string;
    payment_method: 'DIRECT' | 'WAKALA';
    wakala_name?: string;
    amount: number;
  }) => void;
  onCancel: () => void;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

const CreateTransactionForm: React.FC<CreateTransactionFormProps> = ({ onSubmit, onCancel }) => {
  const { user } = useAppStore();
  const [formData, setFormData] = useState({
    user_id: '',
    user_phone_number: '',
    sender_name: '',
    payment_method: 'DIRECT' as 'DIRECT' | 'WAKALA',
    wakala_name: '',
    amount: ''
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load users for the dropdown
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // This would typically come from an API call
      // For now, we'll use a mock list
      setUsers([
        { id: 1, username: 'john_doe', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
        { id: 2, username: 'jane_smith', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' },
        { id: 3, username: 'mike_johnson', first_name: 'Mike', last_name: 'Johnson', email: 'mike@example.com' },
      ]);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_id) {
      newErrors.user_id = 'User is required';
    }
    if (!formData.user_phone_number) {
      newErrors.user_phone_number = 'Phone number is required';
    }
    if (!formData.sender_name) {
      newErrors.sender_name = 'Sender name is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (formData.payment_method === 'WAKALA' && !formData.wakala_name) {
      newErrors.wakala_name = 'Wakala name is required for money agent payments';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        user_id: parseInt(formData.user_id),
        user_phone_number: formData.user_phone_number,
        sender_name: formData.sender_name,
        payment_method: formData.payment_method,
        wakala_name: formData.payment_method === 'WAKALA' ? formData.wakala_name : undefined,
        amount: parseFloat(formData.amount)
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(u => u.id === parseInt(formData.user_id));

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {/* User Selection */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select User *
        </label>
        <select
          value={formData.user_id}
          onChange={(e) => handleInputChange('user_id', e.target.value)}
          className={`w-full p-2 sm:p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
            errors.user_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <option value="">Select a user...</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.last_name} ({user.username})
            </option>
          ))}
        </select>
        {errors.user_id && (
          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.user_id}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          value={formData.user_phone_number}
          onChange={(e) => handleInputChange('user_phone_number', e.target.value)}
          placeholder="0712345678"
          className={`w-full p-2 sm:p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
            errors.user_phone_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.user_phone_number && (
          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.user_phone_number}</p>
        )}
      </div>

      {/* Sender Name */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sender Name *
        </label>
        <input
          type="text"
          value={formData.sender_name}
          onChange={(e) => handleInputChange('sender_name', e.target.value)}
          placeholder="Name of person who sent the money"
          className={`w-full p-2 sm:p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
            errors.sender_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.sender_name && (
          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.sender_name}</p>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Payment Method *
        </label>
        <select
          value={formData.payment_method}
          onChange={(e) => handleInputChange('payment_method', e.target.value as 'DIRECT' | 'WAKALA')}
                            className="input-field input-field-sm"
        >
          <option value="DIRECT">Direct Payment</option>
          <option value="WAKALA">Money Agent (Wakala)</option>
        </select>
      </div>

      {/* Wakala Name (conditional) */}
      {formData.payment_method === 'WAKALA' && (
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Wakala Agent Name *
          </label>
          <input
            type="text"
            value={formData.wakala_name}
            onChange={(e) => handleInputChange('wakala_name', e.target.value)}
            placeholder="Name of money agent/MPesa agent"
            className={`w-full p-2 sm:p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
              errors.wakala_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.wakala_name && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.wakala_name}</p>
          )}
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Amount (TZS) *
        </label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          placeholder="2000"
          min="2000"
          step="1000"
          className={`w-full p-2 sm:p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
            errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.amount && (
          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.amount}</p>
        )}
        {formData.amount && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Tokens to be generated: {Math.floor(parseFloat(formData.amount) * 0.3)} tokens
          </p>
        )}
      </div>

      {/* User Info Display */}
      {selectedUser && (
        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Creating transaction for: <strong>{selectedUser.first_name} {selectedUser.last_name}</strong> ({selectedUser.email})
            </span>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Creating...' : 'Create Transaction'}
        </button>
      </div>
    </form>
  );
};

export default CreateTransactionForm;
