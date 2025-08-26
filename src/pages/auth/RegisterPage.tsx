import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useAppStore } from '@/store';
import { RegisterData, RegistrationSteps } from '@/types';
import { Loader2, ArrowRight, ArrowLeft, User, GraduationCap, Phone, Mail, Lock } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/api/services';
import { useToastContext } from '@/contexts/ToastContext';
import { CollegeProgramSelector } from '@/components/CollegeProgramSelector';

import { storeRegistrationProfile } from '@/utils/registrationStorage';

const stepTitles = ['Personal Info', 'Account Details', 'Academic Info'];

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [searchParams] = useSearchParams();
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
  const [showTerms, setShowTerms] = useState(false);
  const [wrongEmailMessage, setWrongEmailMessage] = useState(false);
  const { registerAndLogin, loading, error } = useAppStore();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  
  // Check for wrong email parameter and show message
  useEffect(() => {
    const wrongEmail = searchParams.get('wrongEmail');
    if (wrongEmail === '1') {
      setWrongEmailMessage(true);
      showSuccess('You can now register with a different email address.');
      
      // Reset form data to start fresh
      setFormData({
        step1: { first_name: '', last_name: '', phone_number: '' },
        step2: { email: '', password: '', password_confirm: '' },
        step3: { 
          student_id: '', 
          program: '', 
          pt_phase: 'PT1', 
          academic_year: 1, 
          supervisor_name: '', 
          supervisor_email: '', 
          area_of_field: '', 
          region: '' 
        },
      });
      
      // Reset form steps
      setStep(0);
      
      // Clear the URL parameter
      navigate('/register', { replace: true });
    }
  }, [searchParams, navigate, showSuccess]);

  // Show validation errors (e.g., email already exists)
  React.useEffect(() => {
    if (error?.message) {
      showError(error.message);
    }
  }, [error]);
  
  // Function to auto-determine department based on program
  const getDepartmentByProgram = (program: string): string => {
    const departmentMap: { [key: string]: string } = {
      // CoET Departments
      'MECHANICAL': 'Mechanical and Industrial Engineering Department',
      'ELECTRICAL': 'Electrical Engineering Department',
      'CIVIL': 'Civil Engineering Department',
      'CHEMICAL': 'Chemical Engineering Department',
      'TEXTILE_DESIGN': 'Mechanical and Industrial Engineering Department',
      'TEXTILE_ENGINEERING': 'Mechanical and Industrial Engineering Department',
      'INDUSTRIAL': 'Mechanical and Industrial Engineering Department',
      'GEOMATIC': 'Transportation and Geotechnical Engineering Department',
      'ARCHITECTURE': 'Departments of Structural and Construction Engineering',
      'QUANTITY_SURVEYING': 'Departments of Structural and Construction Engineering',
      
      // CoICT Departments
      'COMPUTER': 'Computer Science Department',
      'ELECTRONIC_SCIENCE': 'Electronic Science and Communication Department',
      'COMPUTER_ENGINEERING': 'Computer Engineering and Information Technology Department',
      'TELECOMMUNICATIONS': 'Telecommunications Engineering Department',
      'BUSINESS_IT': 'Business Information Technology Department',
      'ELECTRONIC_ENGINEERING': 'Electronic Engineering Department',
      
      // SoMG Departments
      'GEOPHYSICS': 'Geophysics Department',
      'GEOLOGY_GEOTHERMAL': 'Geology and Mining Department',
      'PETROLEUM_GEOLOGY': 'Geology and Mining Department',
      'GEOLOGY': 'Geology and Mining Department',
      'GEOLOGY_WITH': 'Geology and Mining Department',
      'ENGINEERING_GEOLOGY': 'Geology and Mining Department',
      'METALLURGY_MINERAL': 'Metallurgy and Mineral Processing Department',
      'MINING': 'Geology and Mining Department',
      'PETROLEUM': 'Geology and Mining Department'
    };
    return departmentMap[program] || 'General Engineering Department';
  };

  // Create separate form methods for each step
  const step1Methods = useForm<RegistrationSteps["step1"]>({ 
    defaultValues: formData.step1 
  });
  const step2Methods = useForm<RegistrationSteps["step2"]>({ 
    defaultValues: { ...formData.step2, accepted_terms: false } as any
  });
  const step3Methods = useForm<RegistrationSteps["step3"]>({ 
    defaultValues: formData.step3 
  });

  // Reset form methods when wrong email is detected
  useEffect(() => {
    const wrongEmail = searchParams.get('wrongEmail');
    if (wrongEmail === '1') {
      // Reset form methods to clear validation states
      step1Methods.reset();
      step2Methods.reset();
      step3Methods.reset();
    }
  }, [searchParams, step1Methods, step2Methods, step3Methods]);

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

        // Navigate smoothly to activation page immediately after successful registration
        navigate(`/account-activation?email=${encodeURIComponent(formData.step2.email)}`);

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
        
        // No redirect to dashboard; activation first
        
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
        
        {/* Wrong Email Message */}
        {wrongEmailMessage && (
          <div className="mb-4 p-4 rounded-lg border border-orange-300 bg-orange-50 text-orange-700 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="font-medium">Email Reset</span>
            </div>
            <p className="mt-1">You can now register with a different email address. All previous data has been cleared.</p>
            <button 
              onClick={() => setWrongEmailMessage(false)}
              className="mt-2 text-orange-600 hover:text-orange-800 underline text-xs"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {error?.message && (
          <div className="mb-4 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm">
            {error.message}
          </div>
        )}
        
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

            {/* Step 2: Account Details (Email + Password + Terms) */}
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

                {/* Terms & Conditions */}
                <div className="mt-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-current focus:ring-2"
                      {...(step2Methods as any).register('accepted_terms', {
                        validate: (v: any) => v === true || 'You must accept the terms and conditions to continue'
                      })}
                    />
                    <span>
                      I agree to the <button type="button" onClick={() => setShowTerms(true)} className={`underline text-${theme}-600 hover:text-${theme}-700`}>Terms & Conditions</button>
                    </span>
                  </label>
                  {(step2Methods as any).formState.errors.accepted_terms && (
                    <p className="text-xs text-red-500 mt-1">{(step2Methods as any).formState.errors.accepted_terms.message as any}</p>
                  )}
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
                
                

                <CollegeProgramSelector
                  value={(currentMethods as any).watch('program')}
                  onChange={(value) => (currentMethods as any).setValue('program', value)}
                  error={(currentMethods as any).formState.errors.program?.message}
                  required={true}
                />

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

                {/* Supervisor Name field removed - keeping data structure intact */}

                {/* Supervisor Email field removed - keeping data structure intact */}
                
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
                
                {/* Region field removed - keeping data structure intact */}
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
        
        {/* Terms Modal */}
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl mx-4 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h4 className={`text-lg font-semibold text-${theme}-600 dark:text-${theme}-400`}>Terms & Conditions</h4>
                <button onClick={() => setShowTerms(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="px-6 py-4 max-h-[60vh] overflow-y-auto text-xs text-gray-700 dark:text-gray-200 space-y-3 leading-relaxed">
                <div className="text-center mb-4">
                  <h5 className="font-semibold text-base mb-2">Terms of Service & Academic Use Agreement</h5>
                  <p className="text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
                
                <div className="space-y-4">
                  <section>
                    <h6 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">1. Academic Tool & Purpose</h6>
                    <p className="mb-2">MiPT is designed as an <strong>academic assistance tool</strong> to enhance your Industrial Practical Training (PT) experience. This platform aims to help students improve their understanding and amplify their PT experience through structured reporting and AI-enhanced content generation.</p>
                  </section>

                  <section>
                    <h6 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">2. User Responsibilities & Academic Integrity</h6>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>You acknowledge that this is a <strong>helping tool</strong>, not a replacement for your own academic work</li>
                      <li>You promise to use generated reports as guidance and will make necessary adjustments to meet your department's specific requirements</li>
                      <li>You understand that <strong>over-reliance</strong> on this tool may impact your academic performance</li>
                      <li>You accept full responsibility for your academic outcomes and any potential disqualification</li>
                      <li>MiPT bears no responsibility for academic consequences resulting from misuse or over-reliance</li>
                    </ul>
                  </section>

                  <section>
                    <h6 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">3. Account Security & Usage</h6>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Your account details must be accurate and belong exclusively to you</li>
                      <li>You will maintain the security of your credentials and not share them with others</li>
                      <li><strong>Creating multiple accounts is strictly prohibited</strong> and may result in account termination</li>
                      <li>You agree not to attempt to circumvent any security measures or access controls</li>
                    </ul>
                  </section>

                  <section>
                    <h6 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">4. Content & Data Usage</h6>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>All content you submit must comply with academic integrity standards and applicable laws</li>
                      <li>You retain ownership of your submitted content</li>
                      <li>By using our services, you grant MiPT permission to use your data to improve our AI models and enhance service quality</li>
                      <li>We may send service-related notifications to your registered email/phone</li>
                    </ul>
                  </section>

                  <section>
                    <h6 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">5. Security & Monitoring</h6>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Your usage may be monitored to improve service quality and ensure compliance</li>
                      <li>For security reasons, we may analyze usage patterns to identify and prevent potential threats</li>
                      <li>We are committed to handling security concerns peacefully and professionally</li>
                      <li>Any suspicious activity will be investigated with appropriate measures</li>
                    </ul>
                  </section>

                  <section>
                    <h6 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">6. Service Limitations & Disclaimers</h6>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Generated reports are templates that require customization for your specific needs</li>
                      <li>AI-generated content should be reviewed and modified to match your department's requirements</li>
                      <li>We do not guarantee the accuracy or completeness of generated content</li>
                      <li>Service availability may vary and is subject to maintenance and updates</li>
                    </ul>
                  </section>

                  <section>
                    <h6 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">7. Termination & Consequences</h6>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Violation of these terms may result in account suspension or termination</li>
                      <li>We reserve the right to modify these terms with appropriate notice</li>
                      <li>Continued use of the service constitutes acceptance of any updated terms</li>
                    </ul>
                  </section>
                </div>

                <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
                    <strong>By clicking "I Agree", you acknowledge that you have read, understood, and agree to these terms.</strong>
                  </p>
                </div>

                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  <p>For questions or concerns about these terms, contact us at:</p>
                  <p className="font-medium">miptsoftware@gmail.com</p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
                <button onClick={() => setShowTerms(false)} className="btn-secondary">Close</button>
                <button
                  onClick={() => { (step2Methods as any).setValue('accepted_terms', true, { shouldValidate: true }); setShowTerms(false); }}
                  className={`btn-primary bg-${theme}-600 hover:bg-${theme}-700`}
                >
                  I Agree
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center text-sm">
          <span>Already have an account?</span>{' '}
          <a href="/login" className={`text-${theme}-600 hover:underline font-medium`}>Sign In</a>
        </div>
      </div>
    </div>
  );
}; 