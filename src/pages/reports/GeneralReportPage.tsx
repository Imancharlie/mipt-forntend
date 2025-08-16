import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { FileSpreadsheet, Clock, CheckCircle, Users, BarChart3 } from 'lucide-react';

export const GeneralReportPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="p-4 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className={`relative overflow-hidden bg-gradient-to-r from-${theme}-50 via-white to-${theme}-50/50 backdrop-blur-xl border border-${theme}-200/30 rounded-xl p-6 mb-6 shadow-lg shadow-${theme}-500/20`}>
          <div className={`absolute inset-0 bg-gradient-to-r from-${theme}-600/5 via-${theme}-600/5 to-${theme}-600/5`}></div>
          <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-gradient-to-br from-${theme}-400/20 to-${theme}-400/20 rounded-full blur-3xl`}></div>
          
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-3 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-xl shadow-lg`}>
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className={`text-2xl lg:text-3xl font-bold text-${theme}-700 mb-3`}>General Report</h1>
            <p className="text-sm lg:text-base text-gray-600 max-w-2xl mx-auto">
              Comprehensive documentation of your practical training experience, showcasing company analysis and technical process understanding
            </p>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-amber-800">Coming Very Soon!</h2>
          </div>
          <p className="text-amber-700 text-center text-sm">
            The full General Report functionality will be available shortly. You'll be able to create, edit, and submit your comprehensive PT reports with ease.
          </p>
        </div>

        {/* What is General Report */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 shadow-lg mb-4">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            What is a General Report?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3 text-sm">
            A General Report is the comprehensive documentation of your practical training experience that demonstrates your understanding of both the company organization and technical processes you've learned.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Section */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2 text-sm flex items-center gap-2">
                <Users className="w-3 h-3" />
                The Company
              </h3>
              <ul className="space-y-1.5 text-xs text-blue-700">
                <li>• Organization chart of your training department</li>
                <li>• Job descriptions for key positions</li>
                <li>• Safety regulations and welfare policies</li>
                <li>• Recruitment and training procedures</li>
                <li>• Company structure and operations</li>
              </ul>
            </div>

            {/* Process Section */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2 text-sm flex items-center gap-2">
                <BarChart3 className="w-3 h-3" />
                The Process
              </h3>
              <ul className="space-y-1.5 text-xs text-green-700">
                <li>• Technical procedures you've learned</li>
                <li>• Flow charts and diagrams</li>
                <li>• Problem analysis and solutions</li>
                <li>• Alternative approaches considered</li>
                <li>• Recommendations and improvements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Features Coming */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 shadow-lg mb-4">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-3">Key Features Coming Soon</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center p-3">
              <div className={`w-10 h-10 bg-${theme}-100 rounded-full flex items-center justify-center mx-auto mb-2`}>
                <FileSpreadsheet className={`w-5 h-5 text-${theme}-600`} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">Smart Templates</h3>
              <p className="text-xs text-gray-600">Pre-built templates for different PT levels and departments</p>
            </div>

            <div className="text-center p-3">
              <div className={`w-10 h-10 bg-${theme}-100 rounded-full flex items-center justify-center mx-auto mb-2`}>
                <CheckCircle className={`w-5 h-5 text-${theme}-600`} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">Guided Writing</h3>
              <p className="text-xs text-gray-600">Step-by-step guidance for each section of your report</p>
            </div>
          </div>
        </div>

        {/* Stay Tuned */}
        <div className="text-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-lg">
          <div className={`w-12 h-12 bg-${theme}-100 rounded-full flex items-center justify-center mx-auto mb-3`}>
            <Clock className={`w-6 h-6 text-${theme}-600`} />
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">Stay Tuned!</h2>
          <p className="text-gray-600 max-w-md mx-auto text-sm">
            We're working hard to bring you a powerful and user-friendly General Report system. 
            Check back soon for the full experience!
          </p>
        </div>

      </div>
    </div>
  );
};

export default GeneralReportPage;
