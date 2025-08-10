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
        'University supervisor conducts periodic visits',
        'Evaluates student progress and integration',
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
        'Contains detailed weekly reports',
        'Documents daily activities for each week',
        'Explains main job in detail with step-by-step process',
        'Includes diagrams related to main job',
        'Shows learning progression and skill development',
        'Demonstrates understanding of company processes'
      ]
    },
    {
      name: 'General Report',
      description: 'Comprehensive report with company and process sections',
      marks: 60,
      icon: FileSpreadsheet,
      details: [
        'Two main sections: Company and Process',
        'Different mark distribution for PT1, PT2, and PT3',
        'Company section covers organizational understanding',
        'Process section details technical procedures',
        'Demonstrates comprehensive learning outcomes'
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
         <div className={`relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-4 mb-6 shadow-2xl shadow-${theme}-500/10`}>
          <div className={`absolute inset-0 bg-gradient-to-r from-${theme}-600/5 via-${theme}-600/5 to-${theme}-600/5`}></div>
          <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-gradient-to-br from-${theme}-400/20 to-${theme}-400/20 rounded-full blur-3xl`}></div>
          
          <div className="relative z-10">
                         <div className="flex items-center gap-3 mb-3">
               <div className={`p-2 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-lg shadow-lg`}>
                 <Award className="w-5 h-5 text-white" />
               </div>
               <div>
                 <h1 className={`text-2xl font-bold text-${theme}-600`}>PT Assessment Guide</h1>
                 <p className="text-sm text-gray-600">Understanding the assessment structure and requirements</p>
               </div>
             </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
               <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                 <div className="flex items-center gap-2 mb-1">
                   <Calculator className="w-4 h-4 text-blue-500" />
                   <span className="text-xs font-medium text-gray-700">Total Marks</span>
                 </div>
                 <p className="text-lg font-bold text-gray-800">{totalMarks}</p>
               </div>
               
               <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                 <div className="flex items-center gap-2 mb-1">
                   <Clock className="w-4 h-4 text-green-500" />
                   <span className="text-xs font-medium text-gray-700">Deadline</span>
                 </div>
                 <p className="text-xs font-bold text-gray-800">2nd Week Friday</p>
               </div>
               
               <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                 <div className="flex items-center gap-2 mb-1">
                   <AlertTriangle className="w-4 h-4 text-orange-500" />
                   <span className="text-xs font-medium text-gray-700">Penalties</span>
                 </div>
                 <p className="text-xs font-bold text-gray-800">-5 marks each</p>
               </div>
               
               <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                 <div className="flex items-center gap-2 mb-1">
                   <BarChart3 className="w-4 h-4 text-purple-500" />
                   <span className="text-xs font-medium text-gray-700">PT Levels</span>
                 </div>
                 <p className="text-xs font-bold text-gray-800">PT1, PT2, PT3</p>
               </div>
             </div>
          </div>
        </div>

                 {/* Assessment Components */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
           {assessmentComponents.map((component) => {
             const Icon = component.icon;
             const isExpanded = expandedSection === component.name;
             
             return (
               <div key={component.name} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg">
                 <div className="flex items-start justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <div className={`p-1.5 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-lg`}>
                       <Icon className="w-4 h-4 text-white" />
                     </div>
                     <div>
                       <h3 className="text-base font-semibold text-gray-800">{component.name}</h3>
                       <p className="text-xs text-gray-600">{component.description}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     {getMarksDisplay(component.name, component.marks)}
                     <button
                       onClick={() => toggleSection(component.name)}
                       className="p-1 hover:bg-gray-100 rounded"
                     >
                       {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                     </button>
                   </div>
                 </div>
                 
                 {isExpanded && (
                   <div className="space-y-3">
                     <div>
                       <h4 className="font-medium text-gray-800 mb-2 text-sm">Key Requirements:</h4>
                       <ul className="space-y-1">
                         {component.details.map((detail, idx) => (
                           <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                             <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                             <span>{detail}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                     
                     {component.penalties && (
                       <div>
                         <h4 className="font-medium text-red-800 mb-1 text-sm">Penalties:</h4>
                         <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                           <p><strong>Arrival note:</strong> -5 marks</p>
                           <p><strong>Logbook & General report submission:</strong> -5 marks</p>
                         </div>
                       </div>
                     )}
                     
                     {(component.name === 'Logbook' || component.name === 'General Report') && (
                       <div className="pt-2">
                         <button className={`px-3 py-1.5 bg-${theme}-600 text-white rounded text-xs font-medium hover:bg-${theme}-700 transition-colors flex items-center gap-1`}>
                           <Download className="w-3 h-3" />
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
         <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
           <div className="flex items-center gap-2 mb-3">
             <Info className="w-5 h-5 text-yellow-600" />
             <h3 className="text-base font-semibold text-yellow-800">Important Notes</h3>
           </div>
           
           <div className="space-y-2 text-xs text-yellow-800">
             <div className="flex items-start gap-2">
               <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
               <span><strong>Submission Deadline:</strong> All reports must be submitted by the second week Friday after university opening.</span>
             </div>
             
             <div className="flex items-start gap-2">
               <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
               <span><strong>Late Penalties:</strong> Each late submission (arrival note, general report, logbook) incurs a -5 mark penalty.</span>
             </div>
             
             <div className="flex items-start gap-2">
               <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
               <span><strong>Logbook Requirements:</strong> Must include detailed daily activities, main job explanation with steps, and related diagrams.</span>
             </div>
             
             <div className="flex items-start gap-2">
               <BarChart3 className="w-3 h-3 mt-0.5 flex-shrink-0" />
               <span><strong>PT Level Distribution:</strong> As you progress from PT1 to PT3, company marks decrease while process marks increase.</span>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}; 