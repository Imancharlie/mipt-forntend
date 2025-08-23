import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { Building2, GraduationCap, ChevronDown, Check } from 'lucide-react';
import { COLLEGE_PROGRAMS } from '@/utils/profileMapping';

interface CollegeProgramSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const CollegeProgramSelector: React.FC<CollegeProgramSelectorProps> = ({
  value,
  onChange,
  error,
  required = false
}) => {
  const { theme } = useTheme();
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [isCollegeOpen, setIsCollegeOpen] = useState(false);
  const [isProgramOpen, setIsProgramOpen] = useState(false);

  // Set initial college based on current value
  useEffect(() => {
    if (value) {
      for (const [collegeKey, college] of Object.entries(COLLEGE_PROGRAMS)) {
        if (Object.keys(college.programs).includes(value)) {
          setSelectedCollege(collegeKey);
          break;
        }
      }
    }
  }, [value]);

  const handleCollegeSelect = (collegeKey: string) => {
    setSelectedCollege(collegeKey);
    setIsCollegeOpen(false);
    // Clear program selection when college changes
    onChange('');
  };

  const handleProgramSelect = (programKey: string) => {
    onChange(programKey);
    setIsProgramOpen(false);
  };

  const getSelectedCollegeName = () => {
    return selectedCollege ? COLLEGE_PROGRAMS[selectedCollege as keyof typeof COLLEGE_PROGRAMS]?.name : '';
  };

  const getSelectedProgramName = () => {
    if (!value || !selectedCollege) return '';
    return COLLEGE_PROGRAMS[selectedCollege as keyof typeof COLLEGE_PROGRAMS]?.programs[value as keyof typeof COLLEGE_PROGRAMS[typeof selectedCollege]['programs']] || '';
  };

  return (
    <div className="space-y-2">
      {/* College Selection */}
      <div className="relative">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          College {required && <span className="text-red-500">*</span>}
        </label>
        
        <button
          type="button"
          onClick={() => setIsCollegeOpen(!isCollegeOpen)}
          className={`w-full flex items-center justify-between p-2 border rounded-lg transition-all duration-200 ${
            error 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
              : selectedCollege
                ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
          } focus:ring-2 focus:ring-opacity-20`}
        >
          <div className="flex items-center gap-2">
            <Building2 className={`w-4 h-4 ${
              selectedCollege ? 'text-green-600' : 'text-gray-400'
            }`} />
            <span className={selectedCollege ? 'text-gray-900' : 'text-gray-500'}>
              {selectedCollege ? getSelectedCollegeName() : 'Select a college'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isCollegeOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {/* College Dropdown */}
        {isCollegeOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {Object.entries(COLLEGE_PROGRAMS).map(([collegeKey, college]) => (
              <button
                key={collegeKey}
                type="button"
                onClick={() => handleCollegeSelect(collegeKey)}
                className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors duration-150 text-left"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{college.name}</div>
                  <div className="text-xs text-gray-500">
                    {Object.keys(college.programs).length} programs available
                  </div>
                </div>
                {selectedCollege === collegeKey && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Program Selection */}
      {selectedCollege && (
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Program {required && <span className="text-red-500">*</span>}
          </label>
          
          <button
            type="button"
            onClick={() => setIsProgramOpen(!isProgramOpen)}
            className={`w-full flex items-center justify-between p-2 border rounded-lg transition-all duration-200 ${
              error 
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                : value
                  ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
            } focus:ring-2 focus:ring-opacity-20`}
          >
            <div className="flex items-center gap-2">
              <GraduationCap className={`w-4 h-4 ${
                value ? 'text-green-600' : 'text-gray-400'
              }`} />
              <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                {value ? getSelectedProgramName() : 'Select a program'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isProgramOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Program Dropdown */}
          {isProgramOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              {Object.entries(COLLEGE_PROGRAMS[selectedCollege as keyof typeof COLLEGE_PROGRAMS].programs).map(([programKey, programName]) => (
                <button
                  key={programKey}
                  type="button"
                  onClick={() => handleProgramSelect(programKey)}
                  className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors duration-150 text-left"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{programName}</div>
                  </div>
                  {value === programKey && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}

      {/* Help Text */}
      {!selectedCollege && (
        <p className="text-xs text-gray-500 mt-1">
          First select a college, then choose your specific program from the available options.
        </p>
      )}
    </div>
  );
};
