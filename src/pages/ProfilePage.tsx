import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { UpdateProfileData } from '@/types';
import { Loader2, User, Mail, Phone, Building2, GraduationCap, Calendar, Save, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cleanProfileData, mapProgramToFrontend, mapPTPhaseToFrontend, PROGRAM_MAPPING, PT_PHASE_MAPPING } from '@/utils/profileMapping';
import { getRegistrationProfile, clearRegistrationProfile } from '@/utils/registrationStorage';
import { useToastContext } from '@/contexts/ToastContext';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile, loading, fetchProfile } = useAppStore();
  const { theme } = useTheme();
  const { showSuccess, showError, showInfo } = useToastContext();
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateProfileData>();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      reset({
        program: mapProgramToFrontend(profile.program),
        year_of_study: profile.year_of_study,
        pt_phase: mapPTPhaseToFrontend(profile.pt_phase),
        department: profile.department,
        supervisor_name: profile.supervisor_name,
        supervisor_email: profile.supervisor_email,
        phone_number: profile.phone_number,
        company_name: profile.company_name,
        company_region: profile.company_region,
      });
      
      // Check if profile is incomplete and show notification (only once)
      const isProfileIncomplete = !profile.program || !profile.year_of_study || 
                                !profile.pt_phase || !profile.department || !profile.supervisor_name;
      
      if (isProfileIncomplete) {
        // Check if we have stored registration profile data
        const storedProfileData = getRegistrationProfile();
        if (storedProfileData) {
          // Auto-fill the form with stored registration data
          const cleanedData = cleanProfileData(storedProfileData);
          updateProfile(cleanedData).then(() => {
            clearRegistrationProfile(); // Clear stored data after successful update
            fetchProfile(); // Refresh profile data
            showSuccess('Your profile has been automatically completed with your registration information!');
          }).catch((error) => {
            console.error('Failed to auto-complete profile:', error);
            showInfo('Please complete your profile information.');
            setIsEditing(true);
          });
        } else {
          showInfo('Please complete your profile information.');
          setIsEditing(true);
        }
      }
    }
  }, [profile, reset, updateProfile, fetchProfile]);

  const onSubmit = async (data: UpdateProfileData) => {
    try {
      // Clean and map the data to backend format
      const cleanedData = cleanProfileData(data);
      
      console.log('Sending profile data:', cleanedData);
      await updateProfile(cleanedData);
      setIsEditing(false);
      // Show success message
      showSuccess('Profile updated successfully!');
      // Refresh profile data to show updated information
      await fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      showError('Failed to update profile. Please try again.');
    }
  };

  if (loading.isLoading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Loader2 className={`w-8 h-8 animate-spin text-${theme}-500 mb-4`} />
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <User className={`w-12 h-12 text-${theme}-500 mb-4`} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
        <p className="text-gray-600 text-center">Unable to load your profile. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold text-${theme}-600`}>
            Profile{profile.user_details?.full_name ? ` - ${profile.user_details.full_name}` : ''}
          </h1>
          <p className="text-gray-600">Manage your personal information and training details</p>
        </div>
        <button 
          className="btn-outline flex items-center gap-2"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="w-4 h-4" />
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Form */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                  <label className="block text-sm font-medium mb-1">Program</label>
                  <select 
                    className="input-field" 
                    disabled={!isEditing}
                    {...register('program')} 
                  >
                    <option value="">Select a program</option>
                    {Object.entries(PROGRAM_MAPPING).filter(([key]) => key.includes('BSc.')).map(([displayName, value]) => (
                      <option key={value} value={displayName}>
                        {displayName}
                      </option>
                    ))}
                  </select>
                  {errors.program && <p className="text-xs text-red-500 mt-1">{errors.program.message}</p>}
                </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year of Study</label>
                <select 
                  className="input-field" 
                  disabled={!isEditing}
                  {...register('year_of_study')} 
                >
                  <option value="">Select year</option>
                  {[1, 2, 3, 4].map(year => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
                {errors.year_of_study && <p className="text-xs text-red-500 mt-1">{errors.year_of_study.message}</p>}
              </div>
                              <div>
                  <label className="block text-sm font-medium mb-1">PT Phase</label>
                  <select 
                    className="input-field" 
                    disabled={!isEditing}
                    {...register('pt_phase')} 
                  >
                    <option value="">Select PT phase</option>
                    {Object.entries(PT_PHASE_MAPPING).filter(([key]) => key.includes('Practical Training')).map(([displayName, value]) => (
                      <option key={value} value={displayName}>
                        {displayName}
                      </option>
                    ))}
                  </select>
                  {errors.pt_phase && <p className="text-xs text-red-500 mt-1">{errors.pt_phase.message}</p>}
                </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input 
                  className="input-field" 
                  placeholder="e.g., Computer Science Department"
                  disabled={!isEditing}
                  {...register('department')} 
                />
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input 
                  className="input-field" 
                  placeholder="Enter your phone number"
                  disabled={!isEditing}
                  {...register('phone_number')} 
                />
                {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number.message}</p>}
              </div>
            </div>
          </div>

          {/* Supervisor Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Supervisor Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supervisor Name</label>
                <input 
                  className="input-field" 
                  placeholder="Enter supervisor's full name"
                  disabled={!isEditing}
                  {...register('supervisor_name')} 
                />
                {errors.supervisor_name && <p className="text-xs text-red-500 mt-1">{errors.supervisor_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supervisor Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="supervisor@company.com"
                  disabled={!isEditing}
                  {...register('supervisor_email', { 
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })} 
                />
                {errors.supervisor_email && <p className="text-xs text-red-500 mt-1">{errors.supervisor_email.message}</p>}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input 
                  className="input-field" 
                  placeholder="Enter company name"
                  disabled={!isEditing}
                  {...register('company_name')} 
                />
                {errors.company_name && <p className="text-xs text-red-500 mt-1">{errors.company_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company Region</label>
                <input 
                  className="input-field" 
                  placeholder="e.g., Dar es Salaam"
                  disabled={!isEditing}
                  {...register('company_region')} 
                />
                {errors.company_region && <p className="text-xs text-red-500 mt-1">{errors.company_region.message}</p>}
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button 
                type="submit" 
                className="btn-primary flex items-center gap-2"
                disabled={isSubmitting || loading.isLoading}
              >
                {(isSubmitting || loading.isLoading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Profile Completion Status */}
      {profile && (
        <div className="mt-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Profile Completion</h3>
            <div className="space-y-3">
              {[
                { field: 'program', label: 'Program', icon: GraduationCap },
                { field: 'year_of_study', label: 'Year of Study', icon: Calendar },
                { field: 'pt_phase', label: 'PT Phase', icon: Calendar },
                { field: 'department', label: 'Department', icon: Building2 },
                { field: 'phone_number', label: 'Phone Number', icon: Phone },
                { field: 'supervisor_name', label: 'Supervisor Name', icon: User },
                { field: 'supervisor_email', label: 'Supervisor Email', icon: Mail },
                { field: 'company_name', label: 'Company Name', icon: Building2 },
                { field: 'company_region', label: 'Company Region', icon: Building2 },
              ].map(({ field, label, icon: Icon }) => {
                const value = profile[field as keyof typeof profile];
                const isComplete = value && value.toString().trim() !== '';
                
                return (
                  <div key={field} className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isComplete ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="flex-1 text-sm">{label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isComplete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isComplete ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 