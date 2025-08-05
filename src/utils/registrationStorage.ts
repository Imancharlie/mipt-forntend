// Utility to store registration profile data temporarily
const REGISTRATION_PROFILE_KEY = 'registration_profile_data';

export interface RegistrationProfileData {
  program: string;
  year_of_study: number;
  pt_phase: string;
  company_name: string;
  region: string;
  phone_number?: string;
}

export const storeRegistrationProfile = (data: RegistrationProfileData) => {
  try {
    localStorage.setItem(REGISTRATION_PROFILE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to store registration profile data:', error);
  }
};

export const getRegistrationProfile = (): RegistrationProfileData | null => {
  try {
    const data = localStorage.getItem(REGISTRATION_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get registration profile data:', error);
    return null;
  }
};

export const clearRegistrationProfile = () => {
  try {
    localStorage.removeItem(REGISTRATION_PROFILE_KEY);
  } catch (error) {
    console.error('Failed to clear registration profile data:', error);
  }
}; 