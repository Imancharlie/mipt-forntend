import React, { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { 
  UserCheck, 
  FileText, 
  Award,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator,
  BarChart3,
  FileSpreadsheet,
  Users,
  ChevronDown,
  ChevronRight,
  Download
} from 'lucide-react';

interface AssessmentComponent {
  name: string;
  description: string;
  marks: number;
  icon: React.ComponentType<any>;
  details: string[];
  penalties?: string[];
}

interface PTLevel {
  name: string;
  companyMarks: number;
  processMarks: number;
  totalMarks: number;
}

export const PTAssessmentPage: React.FC = () => {
  const { theme } = useTheme();
  const [selectedPT, setSelectedPT] = useState<number>(1);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showMarks, setShowMarks] = useState<{[key: string]: boolean}>({});

  const assessmentComponents: AssessmentComponent[] = [
    {
      name: 'Training Assessment',
      description: 'Assessment conducted by the training officer of the company',
      marks: 15,
      icon: UserCheck,
      details: [
        'Training officer evaluates student performance',
        'Based on daily activities and learning progress',
        'Assesses technical skills and professional conduct',
        'Evaluates adherence to company policies and procedures',
        'Considers punctuality and attendance'
      ]
    },
    {
      name: 'Supervisor Assessment',
      description: 'Assessment from university supervisor during visits',
      marks: 5,
      icon: Users,
      details: [
        'University supervisor conducts a visit atleast once, which might start arround week 5 to the end',
        'Evaluates student progress and might check the weekly reports',
        'Assesses learning outcomes and objectives',
        'Reviews training plan implementation',
        'Provides feedback and recommendations'
      ]
    },
    {
      name: 'Logbook',
      description: 'Weekly reports documenting daily activities and main job details',
      marks: 20,
      icon: FileText,
      details: [
        'It is the combination of all weekly reports',
        'Documents daily activities of the weeks',
        'Explains main job in detail with step-by-step process',
        'Includes diagrams related to main job',
        'Shows learning progression and skill development',
        'Demonstrates understanding and report writing skills'
      ]
    },
    {
      name: 'General Report',
      description: 'Comprehensive report demonstrating practical training experience, company analysis, and technical process documentation',
      marks: 60,
      icon: FileSpreadsheet,
      details: [
        'Two main chapters: The Company and The Process',
        'Must be signed by student and countersigned by training officer',
        'Different mark distribution for PT1, PT2, and PT3 levels',
        'Company section: organization chart, job descriptions, safety policies',
        'Process section: technical procedures, flow charts, analysis and recommendations'
      ],
      penalties: [
        'Late arrival note submission: -5 marks',
        'Late general report submission: -5 marks',
        'Late logbook submission: -5 marks',
        'Submission after university opening (2nd week Friday): -5 marks'
      ]
    }
  ];

  const ptLevels: PTLevel[] = [
    {
      name: 'PT1',
      companyMarks: 40,
      processMarks: 20,
      totalMarks: 60
    },
    {
      name: 'PT2',
      companyMarks: 30,
      processMarks: 30,
      totalMarks: 60
    },
    {
      name: 'PT3',
      companyMarks: 20,
      processMarks: 40,
      totalMarks: 60
    }
  ];

  const totalMarks = assessmentComponents.reduce((sum, component) => sum + component.marks, 0);

  const toggleSection = (sectionName: string) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  const toggleMarks = (componentName: string) => {
    setShowMarks(prev => ({
      ...prev,
      [componentName]: !prev[componentName]
    }));
  };

  const getMarksDisplay = (componentName: string, marks: number) => {
    if (componentName === 'Training Assessment' || componentName === 'Supervisor Assessment') {
      if (showMarks[componentName]) {
        return (
          <div className="text-center">
            <div className={`px-2 py-1 bg-${theme}-100 text-${theme}-700 rounded-full text-xs font-semibold`}>
              {marks} marks
            </div>
            <button
              onClick={() => toggleMarks(componentName)}
              className="text-xs text-gray-500 hover:text-gray-700 mt-1"
            >
              Hide marks
            </button>
          </div>
        );
      } else {
        return (
          <div className="text-center">
            <div className={`px-2 py-1 bg-${theme}-100 text-${theme}-700 rounded-full text-xs font-semibold`}>
              5-15 marks
            </div>
            <p className="text-xs text-gray-500 mt-1">Range depends on department</p>
            <button
              onClick={() => toggleMarks(componentName)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              Click to see marks
            </button>
          </div>
        );
      }
    } else {
      return (
        <div className={`px-2 py-1 bg-${theme}-100 text-${theme}-700 rounded-full text-xs font-semibold`}>
          {marks} marks
        </div>
      );
    }
  };

  return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
       <div className="p-4 max-w-7xl mx-auto">
                 {/* Header */}
        <div className={`relative overflow-hidden bg-gradient-to-r from-${theme}-50 via-white to-${theme}-50/50 backdrop-blur-xl border border-${theme}-200/30 rounded-2xl p-6 mb-8 shadow-xl shadow-${theme}-500/20`}>
          <div className={`absolute inset-0 bg-gradient-to-r from-${theme}-600/5 via-${theme}-600/5 to-${theme}-600/5`}></div>
          <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-gradient-to-br from-${theme}-400/20 to-${theme}-400/20 rounded-full blur-3xl`}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-xl shadow-lg`}>
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold text-${theme}-700 mb-2`}>PT Assessment Guide</h1>
                <p className="text-base text-gray-600">Master your PT assessment structure and requirements</p>
              </div>
            </div>
            
            {/* Key Information - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Submission Deadline</h3>
                    <p className="text-lg font-bold text-gray-800">2nd Week Friday</p>
                    <p className="text-xs text-gray-500">After university opening</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Late Penalties</h3>
                    <p className="text-lg font-bold text-gray-800">-5 marks</p>
                    <p className="text-xs text-gray-500">Per late submission</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {assessmentComponents.map((component) => {
            const Icon = component.icon;
            const isExpanded = expandedSection === component.name;
            
            return (
              <div key={component.name} className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-xl shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{component.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{component.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getMarksDisplay(component.name, component.marks)}
                    <button
                      onClick={() => toggleSection(component.name)}
                      className={`p-2 hover:bg-${theme}-50 rounded-lg transition-colors duration-200`}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                    </button>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Key Requirements
                      </h4>
                      <ul className="space-y-2">
                        {component.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="leading-relaxed">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {component.penalties && (
                      <div>
                        <h4 className="font-semibold text-red-800 mb-2 text-sm flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          Penalties
                        </h4>
                        <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-100">
                          <p><strong>Arrival note:</strong> -5 marks</p>
                          <p><strong>Logbook & General report submission:</strong> -5 marks</p>
                        </div>
                      </div>
                    )}

                    {/* PT Guidelines for General Report */}
                    {component.name === 'General Report' && (
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-3 text-sm flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-blue-500" />
                          Assessment Criteria by PT Level
                        </h4>

                        {/* Detailed Assessment Areas */}
                        <div className="space-y-3">
                          {/* Company Section */}
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-blue-800 mb-2 text-sm">The Company Section:</h5>
                            <div className="space-y-2 text-xs text-blue-700">
                              <p><strong>PT1:</strong> Full company analysis including organization chart, safety regulations, job descriptions, and recruitment policies</p>
                              <p><strong>PT2:</strong> Enhanced company analysis with detailed organizational structure and policy evaluation</p>
                              <p><strong>PT3:</strong> Company section contains very few or no marks at all, but it is still important to have it</p>
                            </div>
                          </div>

                          {/* Process Section */}
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <h5 className="font-semibold text-green-800 mb-2 text-sm">The Process Section:</h5>
                            <div className="space-y-2 text-xs text-green-700">
                              <p><strong>PT1:</strong> Basic technical procedures with fundamental analysis and basic conclusions,you are taken considarations as a skilled worker</p>
                              <p><strong>PT2:</strong> Intermediate technical analysis with some alternative solutions and basic recommendations,you are taken considarations as Technician</p>
                              <p><strong>PT3:</strong> Advanced technical analysis with comprehensive alternative solutions, detailed comparisons, and extensive recommendations as an Engineer</p>
                            </div>
                          </div>

                          {/* Quality Expectations */}
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <h5 className="font-semibold text-amber-800 mb-2 text-sm">Quality Expectations by Level:</h5>
                            <div className="space-y-2 text-xs text-amber-700">
                              <p><strong>PT1:</strong> Good technical writing, basic diagrams, fundamental analysis</p>
                              <p><strong>PT2:</strong> Enhanced technical writing, improved diagrams, intermediate analysis with some alternatives</p>
                              <p><strong>PT3:</strong> Excellent technical writing, professional diagrams, advanced analysis with comprehensive alternatives and detailed recommendations</p>
                            </div>
                          </div>
                        </div>

                        {/* General Guidelines */}
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <h5 className="font-semibold text-gray-800 mb-2 text-sm">General Guidelines:</h5>
                          <div className="space-y-1 text-xs text-gray-700">
                            <p>• Reports must be signed by student and countersigned by training officer</p>
                            <p>• Submit to Department PT coordinator by 2nd week of subsequent semester</p>
                            <p>• Use proper engineering language and scale drawings</p>
                            <p>• Presentation quality significantly contributes to final marks</p>
                            <p>• Higher PT levels require more sophisticated analysis and recommendations</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(component.name === 'Logbook' || component.name === 'General Report') && (
                      <div className="pt-2">
                        <button className={`px-4 py-2 bg-gradient-to-r from-${theme}-500 to-${theme}-600 text-white rounded-lg text-sm font-medium hover:from-${theme}-600 hover:to-${theme}-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg`}>
                          <Download className="w-4 h-4" />
                          Download Example {component.name}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

         
                 {/* Important Notes */}
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Info className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-amber-800">Important Notes</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-green-100 rounded-full mt-0.5">
                  <Clock className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Submission Deadline</p>
                  <p className="text-sm text-gray-700">All reports must be submitted by the second week Friday after university opening.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-red-100 rounded-full mt-0.5">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Late Penalties</p>
                  <p className="text-sm text-gray-700">Each late submission (arrival note, general report and logbook are submited  together) incurs a -5 mark penalty.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 rounded-full mt-0.5">
                  <FileText className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Logbook Requirements</p>
                  <p className="text-sm text-gray-700">Must include detailed daily activities, main job explanation with steps, and related diagrams of the main jobs.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-purple-100 rounded-full mt-0.5">
                  <BarChart3 className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">PT Level Distribution</p>
                  <p className="text-sm text-gray-700">As you progress from PT1 to PT3,the distribution of marks in the general report between the two chapter changes, The company marks decrease while The process marks increases.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 