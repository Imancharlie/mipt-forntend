import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useAppStore } from '@/store';
import { RegisterData, RegistrationSteps } from '@/types';
import { Loader2, ArrowRight, ArrowLeft, User, GraduationCap, Building2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';

import { storeRegistrationProfile } from '@/utils/registrationStorage';

const stepTitles = ['Account Creation', 'User Profile'];

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationSteps>({
    step1: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirm: '',
    },
    step2: {
      program: '',
      academic_year: 1,
      area_of_field: '',
      region: '',
      phone_number: '',
    },
  });
  const { registerAndLogin, loading } = useAppStore();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Create separate form methods for each step
  const step1Methods = useForm<RegistrationSteps["step1"]>({ 
    defaultValues: formData.step1 
  });
  const step2Methods = useForm<RegistrationSteps["step2"]>({ 
    defaultValues: formData.step2 
  });

  const handleNext = async (data: any) => {
    if (step === 0) {
      setFormData((prev) => ({ ...prev, step1: data }));
      setStep(1);
    } else if (step === 1) {
      setFormData((prev) => ({ ...prev, step2: data }));
      // Submit registration with all data
      try {
        // First, register and login the user with basic account data
        const registrationData: RegisterData = {
          username: formData.step1.email, // Use email as username
          email: formData.step1.email,
          first_name: formData.step1.first_name,
          last_name: formData.step1.last_name,
          password: formData.step1.password,
          password_confirm: formData.step1.password_confirm,
        };
        
        await registerAndLogin(registrationData);
        
        // Store profile data for later use
        const profileData = {
          program: data.program,
          year_of_study: data.academic_year,
          pt_phase: 'PT1', // Default to PT1
          company_name: data.area_of_field,
          region: data.region,
          phone_number: data.phone_number,
        };
        
        storeRegistrationProfile(profileData);
        
        // After successful registration and login, redirect to dashboard
        navigate('/dashboard');
        
      } catch (error) {
        console.error('Registration failed:', error);
        // Error is already handled by the store
      }
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const getCurrentMethods = () => {
    switch (step) {
      case 0: return step1Methods;
      case 1: return step2Methods;
      default: return step1Methods;
    }
  };

  const currentMethods = getCurrentMethods();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className={`text-2xl font-bold mb-6 text-${theme}-600 text-center`}>Register</h2>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-2">
            {stepTitles.map((title, idx) => (
              <div key={title} className={`flex-1 h-2 rounded-full ${idx <= step ? `bg-${theme}-500` : 'bg-gray-200'}`}></div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {step + 1} of 2: {stepTitles[step]}
          </p>
        </div>

        <FormProvider {...(currentMethods as any)}>
          <form onSubmit={currentMethods.handleSubmit(handleNext)} className="space-y-5">
            
                        {/* Step 1: Account Creation */}
            {step === 0 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <User className={`w-5 h-5 text-${theme}-500`} />
                  <h3 className="font-semibold">Account Creation</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    className="input-field" 
                    type="email" 
                    placeholder="your.email@example.com"
                    {...(currentMethods as any).register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })} 
                  />
                                    {(currentMethods as any).formState.errors.email &&
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.email.message}</p>}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input 
                      className="input-field" 
                      placeholder="First name"
                      {...(currentMethods as any).register('first_name', { required: 'First name is required' })} 
                    />
                    {(currentMethods as any).formState.errors.first_name && 
                      <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.first_name.message}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input 
                      className="input-field" 
                      placeholder="Last name"
                      {...(currentMethods as any).register('last_name', { required: 'Last name is required' })} 
                    />
                    {(currentMethods as any).formState.errors.last_name && 
                      <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.last_name.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input 
                    className="input-field" 
                    type="password" 
                    placeholder="Enter your password"
                    {...(currentMethods as any).register('password', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    })} 
                  />
                  {(currentMethods as any).formState.errors.password && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input 
                    className="input-field" 
                    type="password" 
                    placeholder="Confirm your password"
                    {...(currentMethods as any).register('password_confirm', { 
                      required: 'Please confirm your password',
                      validate: (value: any) => {
                        const password = (currentMethods as any).getValues('password');
                        return value === password || 'Passwords do not match';
                      }
                    })} 
                  />
                  {(currentMethods as any).formState.errors.password_confirm && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.password_confirm.message}</p>}
                </div>
              </>
            )}

            {/* Step 2: User Profile */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className={`w-5 h-5 text-${theme}-500`} />
                  <h3 className="font-semibold">User Profile</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Program</label>
                  <select 
                    className="input-field" 
                    {...(currentMethods as any).register('program', { required: 'Program is required' })} 
                  >
                    <option value="">Select a program</option>
                    <option value="BSc. Mechanical Engineering">BSc. Mechanical Engineering</option>
                    <option value="BSc. Electrical Engineering">BSc. Electrical Engineering</option>
                    <option value="BSc. Civil Engineering">BSc. Civil Engineering</option>
                    <option value="BSc. Computer Science">BSc. Computer Science</option>
                    <option value="BSc. Chemical Engineering">BSc. Chemical Engineering</option>
                    <option value="BSc. Textile Design">BSc. Textile Design</option>
                    <option value="BSc. Textile Engineering">BSc. Textile Engineering</option>
                    <option value="BSc. Industrial Engineering">BSc. Industrial Engineering</option>
                    <option value="BSc. Geomatic Engineering">BSc. Geomatic Engineering</option>
                  </select>
                  {(currentMethods as any).formState.errors.program && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.program.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Academic Year</label>
                                      <select 
                      className="input-field" 
                      {...(currentMethods as any).register('academic_year', { 
                        required: 'Academic year is required',
                        valueAsNumber: true
                      })} 
                    >
                      <option value="">Select academic year</option>
                      {[1, 2, 3, 4].map(year => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>
                  {(currentMethods as any).formState.errors.academic_year && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.academic_year.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Area of Field (Company)</label>
                  <input 
                    className="input-field" 
                    placeholder="Enter your area of field or company"
                    {...(currentMethods as any).register('area_of_field', { required: 'Area of field is required' })} 
                  />
                  {(currentMethods as any).formState.errors.area_of_field && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.area_of_field.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Region</label>
                  <input 
                    className="input-field" 
                    placeholder="Enter your region"
                    {...(currentMethods as any).register('region', { required: 'Region is required' })} 
                  />
                  {(currentMethods as any).formState.errors.region && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.region.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input 
                    className="input-field" 
                    placeholder="Enter your phone number"
                    {...(currentMethods as any).register('phone_number', { required: 'Phone number is required' })} 
                  />
                  {(currentMethods as any).formState.errors.phone_number && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.phone_number.message}</p>}
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 mt-6">
              {step > 0 && (
                <button 
                  type="button" 
                  onClick={handleBack} 
                  className="btn-secondary flex-1 flex items-center gap-2 justify-center"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button 
                type="submit" 
                className="btn-primary flex-1 flex items-center gap-2 justify-center" 
                disabled={loading.isLoading}
              >
                {loading.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {step < 1 ? 'Next' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </FormProvider>
        
        <div className="mt-6 text-center text-sm">
          <span>Already have an account?</span>{' '}
          <a href="/login" className={`text-${theme}-600 hover:underline font-medium`}>Sign In</a>
        </div>
      </div>
    </div>
  );
}; 