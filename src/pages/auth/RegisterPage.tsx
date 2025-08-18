import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useAppStore } from '@/store';
import { RegisterData, RegistrationSteps } from '@/types';
import { Loader2, ArrowRight, ArrowLeft, User, GraduationCap, Building2, Phone, Mail, Lock } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api/services';
import { useToastContext } from '@/contexts/ToastContext';

import { storeRegistrationProfile } from '@/utils/registrationStorage';

const stepTitles = ['Personal Info', 'Account Details', 'Academic Info'];

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationSteps>({
    step1: {
      first_name: '',
      last_name: '',
      phone_number: '',
    },
    step2: {
      email: '',
      password: '',
      password_confirm: '',
    },
    step3: {
      student_id: '',
      program: '',
      pt_phase: 'PT1',
      academic_year: 1,
      supervisor_name: '',
      supervisor_email: '',
      area_of_field: '',
      region: '',
    },
  });
  const [phoneChecking, setPhoneChecking] = useState(false);
  const { registerAndLogin, loading } = useAppStore();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  
  // Function to auto-determine department based on program
  const getDepartmentByProgram = (program: string): string => {
    const departmentMap: { [key: string]: string } = {
      'MECHANICAL': 'Mechanical Engineering Department',
      'ELECTRICAL': 'Electrical Engineering Department',
      'CIVIL': 'Civil Engineering Department',
      'COMPUTER': 'Computer Science Department',
      'CHEMICAL': 'Chemical Engineering Department',
      'TEXTILE_DESIGN': 'Textile Design Department',
      'TEXTILE_ENGINEERING': 'Textile Engineering Department',
      'INDUSTRIAL': 'Industrial Engineering Department',
      'GEOMATIC': 'Geomatic Engineering Department',
      'ARCHITECTURE': 'Architecture Department',
      'QUANTITY_SURVEYING': 'Quantity Surveying Department'
    };
    return departmentMap[program] || 'General Engineering Department';
  };

  // Create separate form methods for each step
  const step1Methods = useForm<RegistrationSteps["step1"]>({ 
    defaultValues: formData.step1 
  });
  const step2Methods = useForm<RegistrationSteps["step2"]>({ 
    defaultValues: formData.step2 
  });
  const step3Methods = useForm<RegistrationSteps["step3"]>({ 
    defaultValues: formData.step3 
  });

  // Check phone number availability
  const checkPhoneNumber = async (phoneNumber: string): Promise<boolean> => {
    if (!phoneNumber || phoneNumber.length < 10) return false;
    
    setPhoneChecking(true);
    try {
      const result = await authService.checkPhoneNumberAvailability(phoneNumber);
      if (!result.available) {
        showError(`Phone number ${phoneNumber} is already registered. Please use a different number.`);
        return false;
      }
      showSuccess('Phone number is available!');
      return true;
    } catch (error) {
      console.error('Phone number check failed:', error);
      showError('Failed to verify phone number. Please try again.');
      return false;
    } finally {
      setPhoneChecking(false);
    }
  };

  const handleNext = async (data: any) => {
    if (step === 0) {
      // Step 1: Validate names and check phone number
      setFormData((prev) => ({ ...prev, step1: data }));
      
      // Check phone number availability before proceeding
      const isPhoneAvailable = await checkPhoneNumber(data.phone_number);
      if (!isPhoneAvailable) {
        return; // Don't proceed if phone number is not available
      }
      
      setStep(1);
    } else if (step === 1) {
      // Step 2: Store email and password
      setFormData((prev) => ({ ...prev, step2: data }));
      setStep(2);
    } else if (step === 2) {
      // Step 3: Complete registration
      setFormData((prev) => ({ ...prev, step3: data }));
      
      try {
        // Submit registration with all data
        const registrationData: RegisterData = {
          username: formData.step2.email, // Use email as username
          email: formData.step2.email,
          first_name: formData.step1.first_name,
          last_name: formData.step1.last_name,
          password: formData.step2.password,
          password_confirm: formData.step2.password_confirm,
          phone_number: formData.step1.phone_number,
          student_id: data.student_id || '',
          program: data.program,
          year_of_study: data.academic_year,
          pt_phase: data.pt_phase,
          department: getDepartmentByProgram(data.program),
          supervisor_name: data.supervisor_name || '',
          supervisor_email: data.supervisor_email || '',
          company_name: data.area_of_field,
          company_region: data.region,
        };
        
        await registerAndLogin(registrationData);
        
        // Store profile data for later use
        const profileData = {
          program: data.program,
          year_of_study: data.academic_year,
          pt_phase: 'PT1', // Default to PT1
          company_name: data.area_of_field,
          region: data.region,
          phone_number: formData.step1.phone_number,
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
      case 2: return step3Methods;
      default: return step1Methods;
    }
  };

  const currentMethods = getCurrentMethods();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-400 text-center">Register</h2>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-2">
            {stepTitles.map((title, idx) => (
              <div key={title} className={`flex-1 h-2 rounded-full ${idx <= step ? `bg-${theme}-500` : 'bg-gray-200'}`}></div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {step + 1} of 3: {stepTitles[step]}
          </p>
        </div>

        <FormProvider {...(currentMethods as any)}>
          <form onSubmit={currentMethods.handleSubmit(handleNext)} className="space-y-5">
            
            {/* Step 1: Personal Information (Names + Phone) */}
            {step === 0 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <User className={`w-5 h-5 text-${theme}-500`} />
                  <h3 className="font-semibold">Personal Information</h3>
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
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      className="input-field pl-10" 
                      type="tel"
                      placeholder="0712345678"
                      {...(currentMethods as any).register('phone_number', { 
                        required: 'Phone number is required',
                        pattern: {
                          value: /^(\+255|0)[1-9]\d{8}$/,
                          message: 'Please enter a valid Tanzanian phone number'
                        }
                      })} 
                    />
                  </div>
                  {(currentMethods as any).formState.errors.phone_number && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.phone_number.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    We'll verify this number isn't already registered
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Account Details (Email + Password) */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className={`w-5 h-5 text-${theme}-500`} />
                  <h3 className="font-semibold">Account Details</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      className="input-field pl-10" 
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
                  </div>
                  {(currentMethods as any).formState.errors.email &&
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.email.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    This email will also be your username for logging in
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      className="input-field pl-10" 
                      type="password" 
                      placeholder="Enter your password"
                      {...(currentMethods as any).register('password', { 
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                      })} 
                    />
                  </div>
                  {(currentMethods as any).formState.errors.password && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.password.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      className="input-field pl-10" 
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
                  </div>
                  {(currentMethods as any).formState.errors.password_confirm && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.password_confirm.message}</p>}
                </div>
              </>
            )}

            {/* Step 3: Academic Information */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className={`w-5 h-5 text-${theme}-500`} />
                  <h3 className="font-semibold">Academic Information</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Student ID</label>
                  <input 
                    className="input-field" 
                    placeholder="Enter your student ID (optional)"
                    {...(currentMethods as any).register('student_id')} 
                  />
                  {(currentMethods as any).formState.errors.student_id && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.student_id.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Program</label>
                  <select 
                    className="input-field" 
                    {...(currentMethods as any).register('program', { required: 'Program is required' })} 
                  >
                    <option value="">Select a program</option>
                    <option value="MECHANICAL">BSc. Mechanical Engineering</option>
                    <option value="ELECTRICAL">BSc. Electrical Engineering</option>
                    <option value="CIVIL">BSc. Civil Engineering</option>
                    <option value="COMPUTER">BSc. Computer Science</option>
                    <option value="ELECTRONIC_SCIENCE">BSc. Electronic Science and Communication</option>
                    <option value="COMPUTER_ENGINEERING">BSc. Computer Engineering and Information Technology</option>
                    <option value="TELECOMMUNICATIONS">BSc. Telecommunications Engineering</option>
                    <option value="BUSINESS_IT">BSc. Business Information Technology</option>
                    <option value="CHEMICAL">BSc. Chemical Engineering</option>
                    <option value="TEXTILE_DESIGN">BSc. Textile Design</option>
                    <option value="TEXTILE_ENGINEERING">BSc. Textile Engineering</option>
                    <option value="INDUSTRIAL">BSc. Industrial Engineering</option>
                    <option value="GEOMATIC">BSc. Geomatic Engineering</option>
                    <option value="ARCHITECTURE">BSc. Architecture</option>
                    <option value="QUANTITY_SURVEYING">BSc. Quantity Surveying</option>
                  </select>
                  {(currentMethods as any).formState.errors.program && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.program.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">PT Phase</label>
                  <select 
                    className="input-field" 
                    {...(currentMethods as any).register('pt_phase', { required: 'PT Phase is required' })} 
                  >
                    <option value="">Select PT Phase</option>
                    <option value="PT1">PT1</option>
                    <option value="PT2">PT2</option>
                    <option value="PT3">PT3</option>
                  </select>
                  {(currentMethods as any).formState.errors.pt_phase && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.pt_phase.message}</p>}
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
                  <label className="block text-sm font-medium mb-1">Supervisor Name</label>
                  <input 
                    className="input-field" 
                    placeholder="Enter your supervisor's name (optional)"
                    {...(currentMethods as any).register('supervisor_name')} 
                  />
                  {(currentMethods as any).formState.errors.supervisor_name && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.supervisor_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Supervisor Email</label>
                  <input 
                    className="input-field" 
                    placeholder="Enter your supervisor's email (optional)"
                    {...(currentMethods as any).register('supervisor_email')} 
                  />
                  {(currentMethods as any).formState.errors.supervisor_email && 
                    <p className="text-xs text-red-500 mt-1">{(currentMethods as any).formState.errors.supervisor_email.message}</p>}
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
                disabled={loading.isLoading || phoneChecking}
              >
                {loading.isLoading || phoneChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {step < 2 ? 'Next' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
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