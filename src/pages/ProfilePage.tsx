import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/ThemeProvider';
import { UpdateProfileData } from '@/types';
import { Loader2, User, Phone, Building2, GraduationCap, Calendar, Save, Edit, Camera, Upload, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cleanProfileData, mapProgramToFrontend, mapPTPhaseToFrontend, PROGRAM_MAPPING, PT_PHASE_MAPPING } from '@/utils/profileMapping';
import { CollegeProgramSelector } from '@/components/CollegeProgramSelector';
import { getRegistrationProfile, clearRegistrationProfile } from '@/utils/registrationStorage';
import { useToastContext } from '@/contexts/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile, loading, fetchProfile, user, uploadProfilePicture, removeProfilePicture } = useAppStore();
  const { theme } = useTheme();
  const { showSuccess, showError, showInfo } = useToastContext();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [localNames, setLocalNames] = useState<{firstName: string, lastName: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<UpdateProfileData>();

  useEffect(() => {
    fetchProfile();
  }, []); // Removed fetchProfile from dependencies to prevent infinite loop

  // Profile picture upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Additional validation before upload
      console.log('📸 File selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      
      // Validate file extension
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        showError('Invalid file extension. Please select a JPG, PNG, or GIF file.');
        return;
      }
      
      handleProfilePictureUpload(file);
    }
    
    // Reset the input value so the same file can be selected again if needed
    event.target.value = '';
  };

  const handleProfilePictureUpload = async (file: File) => {
    // Enhanced file validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      showError('Invalid file type. Only JPG, PNG, and GIF files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showError('Image size must be less than 5MB');
      return;
    }

    // Additional validation
    if (file.size === 0) {
      showError('File is empty. Please select a valid image.');
      return;
    }

    console.log('📸 Uploading profile picture:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    setIsUploadingPicture(true);
    try {
      const profilePictureUrl = await uploadProfilePicture(file);
      setProfilePicture(profilePictureUrl);
      showSuccess('Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error);
      
      // Better error handling
      let errorMessage = 'Failed to upload profile picture. Please try again.';
      
      if (error?.response?.status === 400) {
        const backendError = error.response.data?.error || error.response.data?.message;
        if (backendError) {
          errorMessage = `Upload failed: ${backendError}`;
        } else {
          errorMessage = 'Upload failed: Invalid file format or size. Please check your image.';
        }
      } else if (error?.response?.status === 413) {
        errorMessage = 'File too large. Please select an image smaller than 5MB.';
      } else if (error?.response?.status === 415) {
        errorMessage = 'Unsupported file type. Please use JPG, PNG, or GIF.';
      }
      
      showError(errorMessage);
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      await removeProfilePicture();
      setProfilePicture(null);
      showSuccess('Profile picture removed successfully!');
    } catch (error) {
      console.error('Failed to remove profile picture:', error);
      showError('Failed to remove profile picture. Please try again.');
    }
  };

  useEffect(() => {
    if (profile) {
      // Set profile picture if available (check both user and profile objects)
      if (user?.profile_picture) {
        setProfilePicture(user.profile_picture);
      } else if (profile.profile_picture) {
        setProfilePicture(profile.profile_picture);
      }
      
      // Reset form with current data - try multiple sources for names
      const firstName = localNames?.firstName || user?.first_name || profile?.user_details?.full_name?.split(' ')[0] || '';
      const lastName = localNames?.lastName || user?.last_name || profile?.user_details?.full_name?.split(' ').slice(1).join(' ') || '';
      
      const formData = {
        first_name: firstName,
        last_name: lastName,
        program: mapProgramToFrontend(profile.program),
        year_of_study: profile.year_of_study,
        pt_phase: mapPTPhaseToFrontend(profile.pt_phase),
        department: profile.department,
        phone_number: profile.phone_number,
        company_name: profile.company_name,
        company_region: profile.company_region,
      };
      
      console.log('=== PROFILE DEBUG INFO ===');
      console.log('User object:', user);
      console.log('Profile object:', profile);
      console.log('Profile user_details:', profile?.user_details);
      console.log('Extracted firstName:', firstName);
      console.log('Extracted lastName:', lastName);
      console.log('Final form data:', formData);
      console.log('==========================');
      reset(formData);
      
      // Check if profile is incomplete and show notification (only once)
      const isProfileIncomplete = !profile.program || !profile.year_of_study || 
                                !profile.pt_phase || !profile.department ||
                                !user?.first_name || !user?.last_name;
      
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
            // Don't auto-set to editing mode
          });
        } else {
          showInfo('Please complete your profile information.');
          // Don't auto-set to editing mode
        }
      }
    }
  }, [profile, user, localNames, reset]);

  const onSubmit = async (data: UpdateProfileData) => {
    try {
      // Store names locally for immediate display
      if (data.first_name || data.last_name) {
        setLocalNames({
          firstName: data.first_name || '',
          lastName: data.last_name || ''
        });
      }
      
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
      // Clear local names on error
      setLocalNames(null);
      showError('Failed to update profile. Please try again.');
    }
  };

  if (loading.isLoading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <LoadingSpinner size="lg" color="primary" message="Loading your profile..." />
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              Profile{user?.first_name ? ` - ${user.first_name} ${user?.last_name || ''}` : ''}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your personal information and training details</p>
          </div>
          <button 
            className="btn-outline flex items-center gap-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-200 dark:border-orange-700"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-4 border-orange-200 dark:border-orange-700">
                  <span className="text-2xl font-bold text-white">
                    {user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || ''}
                  </span>
                </div>
              )}
              
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                  disabled={isUploadingPicture}
                >
                  {isUploadingPicture ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Profile Picture</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Upload a photo to personalize your profile. JPG, PNG or GIF up to 5MB.
              </p>
              
              {isEditing && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                    disabled={isUploadingPicture}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                  
                  {profilePicture && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Profile Form */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */} 
          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                type="submit" 
                className="btn-primary flex items-center gap-2"
                disabled={isSubmitting || loading.isLoading}
              >
                {(isSubmitting || loading.isLoading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save 
              </button>
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">First Name</label>
                <input 
                  className="input-field" 
                  placeholder="Enter your first name"
                  disabled={!isEditing}
                  {...register('first_name', { required: 'First name is required' })} 
                />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Last Name</label>
                <input 
                  className="input-field" 
                  placeholder="Enter your last name"
                  disabled={!isEditing}
                  {...register('last_name', { required: 'Last name is required' })} 
                />
                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Program</label>
                {isEditing ? (
                  <CollegeProgramSelector
                    value={watch('program') || ''}
                    onChange={(value) => setValue('program', value)}
                    error={errors.program?.message}
                    required={false}
                  />
                ) : (
                  <div className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed">
                    {watch('program') || 'No program selected'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Year of Study</label>
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
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">PT Phase</label>
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
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Department</label>
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
              <Phone className="w-5 h-5" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone Number</label>
                <input 
                  className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed" 
                  placeholder="Phone number cannot be edited"
                  disabled={true}
                  {...register('phone_number')} 
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Phone number cannot be changed after registration</p>
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
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Company Name</label>
                <input 
                  className="input-field" 
                  placeholder="Enter company name"
                  disabled={!isEditing}
                  {...register('company_name')} 
                />
                {errors.company_name && <p className="text-xs text-red-500 mt-1">{errors.company_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Company Region</label>
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

         
        </form>
      </div>

      {/* Profile Completion Status */}
      {profile && (
        <div className="mt-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Profile Completion</h3>
            <div className="space-y-3">
              {[
                { field: 'first_name', label: 'First Name', icon: User, value: watch('first_name') || localNames?.firstName || user?.first_name || profile?.user_details?.full_name?.split(' ')[0] },
                { field: 'last_name', label: 'Last Name', icon: User, value: watch('last_name') || localNames?.lastName || user?.last_name || profile?.user_details?.full_name?.split(' ').slice(1).join(' ') },
                { field: 'program', label: 'Program', icon: GraduationCap },
                { field: 'year_of_study', label: 'Year of Study', icon: Calendar },
                { field: 'pt_phase', label: 'PT Phase', icon: Calendar },
                { field: 'department', label: 'Department', icon: Building2 },
                { field: 'phone_number', label: 'Phone Number', icon: Phone },
                { field: 'company_name', label: 'Company Name', icon: Building2 },
                { field: 'company_region', label: 'Company Region', icon: Building2 },
              ].map(({ field, label, icon: Icon, value: customValue }) => {
                const value = customValue || profile[field as keyof typeof profile];
                const isComplete = value && value.toString().trim() !== '';
                
                return (
                  <div key={field} className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isComplete ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isComplete 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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