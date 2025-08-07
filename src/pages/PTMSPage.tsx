import React, { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { ExternalLink, Info, LogIn, BookOpen, Users, Calendar, FileText, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';


interface PTMSData {
  registration_deadline: string;
  current_status: string;
  login_instructions: string;
  features: string[];
  contact_info: {
    support_email: string;
    support_phone: string;
    office_hours: string;
  };
}

export const PTMSPage: React.FC = () => {
  const { theme } = useTheme();

  const [ptmsData, setPtmsData] = useState<PTMSData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPTMSData = async () => {
      try {
        // Simulate API call - replace with actual backend endpoint
        const response = await fetch('/api/ptms/info');
        if (response.ok) {
          const data = await response.json();
          setPtmsData(data);
        } else {
          // Fallback to mock data if API fails
          setPtmsData({
            registration_deadline: 'March 15, 2025',
            current_status: 'Active',
            login_instructions: 'Use your student registration number as both username and password',
            features: [
              'Student registration and profile management',
              'Company and supervisor assignments',
              'Training progress tracking',
              'Report submission and evaluation',
              'Communication between students, supervisors, and coordinators',
              'Final assessment and grading'
            ],
            contact_info: {
              support_email: 'ptms.support@udsm.ac.tz',
              support_phone: '+255 22 241 0500',
              office_hours: 'Monday - Friday, 8:00 AM - 4:00 PM'
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch PTMS data:', error);
        // Use fallback data
        setPtmsData({
          registration_deadline: 'March 15, 2025',
          current_status: 'Active',
          login_instructions: 'Use your student registration number as both username and password',
          features: [
            'Student registration and profile management',
            'Company and supervisor assignments',
            'Training progress tracking',
            'Report submission and evaluation',
            'Communication between students, supervisors, and coordinators',
            'Final assessment and grading'
          ],
          contact_info: {
            support_email: 'ptms.support@udsm.ac.tz',
            support_phone: '+255 22 241 0500',
            office_hours: 'Monday - Friday, 8:00 AM - 4:00 PM'
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPTMSData();
  }, []);

  const handleVisitPTMS = () => {
    window.open('https://ptmis.udsm.ac.tz/', '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <LoadingSpinner size="lg" color="primary" message="Loading PTMS information..." />
      </div>
    );
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold text-${theme}-600 mb-1`}>PTMS - Practical Training Management System</h1>
        <p className="text-sm text-gray-600">Official UDSM Practical Training Management Platform</p>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* What is PTMS */}
        <div className={`card p-4 bg-${theme}-50 border border-${theme}-200`}>
          <div className="flex items-center gap-2 mb-3">
            <Info className={`w-5 h-5 text-${theme}-500`} />
            <h2 className="text-lg font-semibold text-gray-900">What is PTMS?</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              PTMS (Practical Training Management System) is the official platform used by the University of Dar es Salaam 
              to manage industrial practical training programs. It serves as the central hub for:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              {ptmsData?.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Login Information */}
        <div className={`card p-4 bg-${theme}-50 border border-${theme}-200`}>
          <div className="flex items-center gap-2 mb-3">
            <LogIn className={`w-5 h-5 text-${theme}-500`} />
            <h2 className="text-lg font-semibold text-gray-900">How to Access PTMS</h2>
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">Login Credentials</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium text-blue-800">Username:</span>
                  <span className="text-blue-700">Your Student Registration Number</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-blue-800">Password:</span>
                  <span className="text-blue-700">Your Student Registration Number</span>
                </div>
                <div className="mt-2 p-2 bg-blue-100 rounded border border-blue-300">
                  <p className="text-xs text-blue-800">
                    <strong>Example:</strong> 2022-04-091314
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h3 className="font-semibold text-yellow-900 mb-2 text-sm">Important Notes</h3>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• Use your complete student registration number as both username and password</li>
                <li>• If you can't login, contact your department coordinator</li>
                <li>• PTMS is the official system for final report submission</li>
                <li>• This MIPT app is for daily/weekly report management only</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Visit PTMS Button */}
        <div className={`card p-4 text-center bg-${theme}-50 border border-${theme}-200`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <ExternalLink className={`w-5 h-5 text-${theme}-500`} />
            <h2 className="text-lg font-semibold text-gray-900">Access PTMS</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Click the button below to visit the official PTMS platform where you can:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <Users className="w-3 h-3 text-gray-500" />
              <span>Manage Profile</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span>Submit Reports</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <FileText className="w-3 h-3 text-gray-500" />
              <span>View Grades</span>
            </div>
          </div>
          <button
            onClick={handleVisitPTMS}
            className={`btn-primary flex items-center gap-2 mx-auto text-sm`}
          >
            <ExternalLink className="w-4 h-4" />
            Visit PTMS Platform
          </button>
        </div>

        {/* Difference between MIPT and PTMS */}
        <div className={`card p-4 bg-${theme}-50 border border-${theme}-200`}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className={`w-5 h-5 text-${theme}-500`} />
            <h2 className="text-lg font-semibold text-gray-900">MIPT vs PTMS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">MIPT App (This Platform)</h3>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>• Daily report management</li>
                <li>• Weekly report creation</li>
                <li>• Progress tracking</li>
                <li>• Mobile-friendly interface</li>
                <li>• Real-time updates</li>
                <li>• AI-enhanced writing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">PTMS Platform</h3>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>• Official university system</li>
                <li>• Final report submission</li>
                <li>• Grade assessment</li>
                <li>• Supervisor evaluation</li>
                <li>• Academic records</li>
                <li>• Certificate generation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {ptmsData?.contact_info && (
          <div className={`card p-4 bg-${theme}-50 border border-${theme}-200`}>
            <div className="flex items-center gap-2 mb-3">
              <Users className={`w-5 h-5 text-${theme}-500`} />
              <h2 className="text-lg font-semibold text-gray-900">Support Information</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Support Email:</span>
                <span className="text-gray-900">{ptmsData.contact_info.support_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Support Phone:</span>
                <span className="text-gray-900">{ptmsData.contact_info.support_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Office Hours:</span>
                <span className="text-gray-900">{ptmsData.contact_info.office_hours}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 