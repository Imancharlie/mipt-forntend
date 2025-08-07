import React, { useEffect, useState } from 'react';

import { useTheme } from '@/components/ThemeProvider';
import { useToastContext } from '@/contexts/ToastContext';
import { Company } from '@/types';
import { 
  Loader2, 
  PlusCircle, 
  Search, 
  Building2, 
  MapPin, 
  Edit, 
 
  Phone,
  Globe,
  Mail,
  Save,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface UserCompany {
  id?: number;
  name: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry_type?: string;
  description?: string;
}

export const CompanyPage: React.FC = () => {
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToastContext();
  const [userCompany, setUserCompany] = useState<UserCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm<UserCompany>();

  // Fetch user's company
  useEffect(() => {
    const fetchUserCompany = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/companies/my_company/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.message === "No company assigned") {
            setUserCompany(null);
          } else {
            setUserCompany(data);
            // Pre-fill form with existing data
            setValue('name', data.name || '');
            setValue('address', data.address || '');
            setValue('phone', data.phone || '');
            setValue('email', data.email || '');
            setValue('website', data.website || '');
            setValue('industry_type', data.industry_type || '');
            setValue('description', data.description || '');
          }
        } else {
          console.error('Failed to fetch user company');
          setUserCompany(null);
        }
      } catch (error) {
        console.error('Error fetching user company:', error);
        setUserCompany(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCompany();
  }, [setValue]);

  // Search companies
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/companies/search_companies/?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      setSearchResults([]);
    }
  };

  // Assign company to user
  const handleAssignCompany = async (companyId: number) => {
    try {
      const response = await fetch(`/api/companies/${companyId}/assign_to_user/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showSuccess('Company assigned successfully!');
        // Refresh user company data
        window.location.reload();
      } else {
        showError('Failed to assign company. Please try again.');
      }
    } catch (error) {
      console.error('Error assigning company:', error);
      showError('Failed to assign company. Please try again.');
    }
  };

  const onSubmit = async (data: UserCompany) => {
    try {
      const endpoint = isEditing ? '/api/companies/my_company/' : '/api/companies/my_company/';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setUserCompany(result);
        setShowForm(false);
        setIsEditing(false);
        reset();
        showSuccess(isEditing ? 'Company updated successfully!' : 'Company created successfully!');
      } else {
        const errorData = await response.json();
        showError(`Failed to ${isEditing ? 'update' : 'create'} company: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} company:`, error);
      showError(`Failed to ${isEditing ? 'update' : 'create'} company. Please try again.`);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCreate = () => {
    setIsEditing(false);
    setShowForm(true);
    reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <LoadingSpinner size="lg" color="primary" message="Loading company data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className={`relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8 shadow-2xl shadow-${theme}-500/10`}>
          <div className={`absolute inset-0 bg-gradient-to-r from-${theme}-600/5 via-${theme}-600/5 to-${theme}-600/5`}></div>
          <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-gradient-to-br from-${theme}-400/20 to-${theme}-400/20 rounded-full blur-3xl`}></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-xl shadow-lg`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h1 className={`text-2xl font-bold text-${theme}-600`}>My Company</h1>
                </div>
                <p className="text-sm text-gray-600">Manage your practical training company information</p>
              </div>
              
              <div className="flex gap-3">
                {!userCompany ? (
                  <button 
                    onClick={handleCreate}
                    className={`px-4 py-2 bg-gradient-to-r from-${theme}-600 to-${theme}-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm flex items-center gap-2`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Company
                  </button>
                ) : (
                  <button 
                    onClick={handleEdit}
                    className={`px-4 py-2 bg-white/60 backdrop-blur-sm border border-${theme}-200 text-${theme}-600 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 text-sm flex items-center gap-2`}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Company
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User's Company Display */}
        {userCompany ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">{userCompany.name}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userCompany.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{userCompany.address}</span>
                </div>
              )}
              
              {userCompany.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{userCompany.phone}</span>
                </div>
              )}
              
              {userCompany.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{userCompany.email}</span>
                </div>
              )}
              
              {userCompany.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{userCompany.website}</span>
                </div>
              )}
              
              {userCompany.industry_type && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{userCompany.industry_type}</span>
                </div>
              )}
            </div>
            
            {userCompany.description && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{userCompany.description}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Company Assigned</h3>
            <p className="text-gray-600 mb-4">You haven't been assigned to a company yet. Add your company information below.</p>
            <button 
              onClick={handleCreate}
              className={`px-4 py-2 bg-gradient-to-r from-${theme}-600 to-${theme}-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm flex items-center gap-2 mx-auto`}
            >
              <PlusCircle className="w-4 h-4" />
              Add Your Company
            </button>
          </div>
        )}

        {/* Search Other Companies */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Search Other Companies</h3>
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                showSearch ? `bg-${theme}-100 text-${theme}-700` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showSearch ? 'Hide Search' : 'Show Search'}
            </button>
          </div>
          
          {showSearch && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search companies by name..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">{company.name}</h4>
                        <p className="text-sm text-gray-600">{company.address}</p>
                      </div>
                      <button
                        onClick={() => handleAssignCompany(company.id)}
                        className={`px-3 py-1 bg-gradient-to-r from-${theme}-600 to-${theme}-700 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all duration-300`}
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {isEditing ? 'Edit Company' : 'Add Company'}
                </h2>
                <button 
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    reset();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name *</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900"
                    placeholder="Enter company name"
                    {...register('name', { required: 'Company name is required' })} 
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Address/Location</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900"
                    placeholder="Enter company address"
                    {...register('address')} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input 
                    type="tel"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900"
                    placeholder="Enter phone number"
                    {...register('phone')} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900"
                    placeholder="Enter email address"
                    {...register('email')} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input 
                    type="url"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 text-gray-900"
                    placeholder="Enter website URL"
                    {...register('website')} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Industry Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register('industry_type')}
                  >
                    <option value="">Select industry type</option>
                    <option value="TECHNOLOGY">Technology</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="HEALTHCARE">Healthcare</option>
                    <option value="FINANCE">Finance</option>
                    <option value="EDUCATION">Education</option>
                    <option value="CONSTRUCTION">Construction</option>
                    <option value="ENERGY">Energy</option>
                    <option value="TRANSPORTATION">Transportation</option>
                    <option value="RETAIL">Retail</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company description"
                    {...register('description')} 
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 bg-gradient-to-r from-${theme}-600 to-${theme}-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isEditing ? 'Update Company' : 'Create Company'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 