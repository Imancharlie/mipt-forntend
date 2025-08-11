import React, { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useToastContext } from '@/contexts/ToastContext';
import { useAppStore } from '@/store';
import { 
  Download, 
  ExternalLink,
  Clock,
  Loader2,
  Building2,
  GraduationCap,
  FileText,
  Search,
  Filter,
  Upload,
  File,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle,
  X,
  Users,
  Plus,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Department options for filters
const departments = [
  { value: "", label: "All Departments" },
  { value: "Electrical", label: "Electrical Engineering" },
  { value: "Mechanical", label: "Mechanical Engineering" },
  { value: "Civil", label: "Civil Engineering" },
  { value: "Computer", label: "Computer Engineering" },
  { value: "Chemical", label: "Chemical Engineering" },
  { value: "Textile_Design", label: "Textile Design" },
  { value: "Textile_Engineering", label: "Textile Engineering" },
  { value: "Industrial", label: "Industrial Engineering" },
  { value: "Geomatic", label: "Geomatic Engineering" },
  { value: "Architecture", label: "Architecture" },
  { value: "Quantity_Surveying", label: "Quantity Surveying" }
];

const reportTypes = [
  { value: "", label: "All Types" },
  { value: "daily", label: "Daily Reports" },
  { value: "weekly", label: "Weekly Reports" },
  { value: "monthly", label: "Monthly Reports" },
  { value: "final", label: "Final Reports" },
  { value: "general", label: "General Reports" }
];

// Upload Modal Component
const UploadReportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: FormData) => Promise<void>;
}> = ({ isOpen, onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    department: '',
    report_type: '',
    title: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { showError, showSuccess } = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      showError('Please select a file to upload');
      return;
    }

    if (!formData.department || !formData.report_type) {
      showError('Please select department and report type');
      return;
    }

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('document', selectedFile);
      data.append('department', formData.department);
      data.append('report_type', formData.report_type);
      if (formData.title) data.append('title', formData.title);
      if (formData.description) data.append('description', formData.description);

      await onUpload(data);
      showSuccess('Report uploaded successfully!');
      onClose();
      setFormData({ department: '', report_type: '', title: '', description: '' });
      setSelectedFile(null);
    } catch (error: any) {
      showError(error.message || 'Failed to upload report');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upload New Report
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Department</option>
                {departments.slice(1).map(dept => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type *
              </label>
              <select
                required
                value={formData.report_type}
                onChange={(e) => setFormData(prev => ({ ...prev, report_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Report Type</option>
                {reportTypes.slice(1).map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter report title"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter report description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document File *
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="text-green-600 dark:text-green-400">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Click to select file</p>
                      <p className="text-sm">PDF, DOC, DOCX, or TXT</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Upload Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const ResourcesPage: React.FC = () => {
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToastContext();
  const { 
    resources, 
    fetchResources, 
    uploadReport, 
    updateResourcesFilters,
    profile 
  } = useAppStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is admin
  const isAdmin = profile?.user_details?.username === 'admin' || profile?.is_staff;

  // Apply filters and search
  const filteredReports = resources.reports.filter(report => {
    const matchesDepartment = !resources.filters.department || 
      report.department.toLowerCase() === resources.filters.department.toLowerCase();
    
    const matchesType = !resources.filters.report_type || 
      report.report_type === resources.filters.report_type;
    
    const matchesSearch = !searchTerm || 
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.department.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDepartment && matchesType && matchesSearch;
  });

  // Handle download
  const handleDownload = async (report: any) => {
    try {
      showInfo('Downloading report...');
      // Use the download service from the store
      const filename = report.title || `${report.department}_${report.report_type}_${report.id}`;
      // For now, open in new tab since download service needs the full URL
      window.open(report.document, '_blank');
      showSuccess('Report opened successfully!');
    } catch (error) {
      showError('Download failed. Please try again.');
    }
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    updateResourcesFilters({ [key]: value });
  };

  // Clear all filters
  const clearFilters = () => {
    updateResourcesFilters({ department: '', report_type: '' });
    setSearchTerm('');
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get file icon based on type
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-5 h-5 text-gray-500" />;
    
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'txt':
        return <FileText className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get report type badge color
  const getReportTypeBadge = (type: string) => {
    const colors = {
      daily: 'bg-blue-100 text-blue-800 border-blue-200',
      weekly: 'bg-green-100 text-green-800 border-green-200',
      monthly: 'bg-purple-100 text-purple-800 border-purple-200',
      final: 'bg-red-100 text-red-800 border-red-200',
      general: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get file type from URL
  const getFileTypeFromUrl = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  };

  // Effects
  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      updateResourcesFilters({ search: searchTerm });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold text-${theme}-600 mb-2`}>
                Resources & Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Access department documents, reports, and practical training resources
              </p>
            </div>
            
            {/* Upload Button - Admin Only */}
            {isAdmin && (
              <button
                className={`inline-flex items-center gap-2 px-6 py-3 bg-${theme}-600 hover:bg-${theme}-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl`}
                onClick={() => setShowUploadModal(true)}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Upload Report</span>
                <span className="sm:hidden">Upload</span>
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports by title, description, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {(resources.filters.department || resources.filters.report_type || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <select
                    value={resources.filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  >
                    {departments.map(dept => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Report Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Type
                  </label>
                  <select
                    value={resources.filters.report_type}
                    onChange={(e) => handleFilterChange('report_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  >
                    {reportTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-end">
                  <div className="w-full p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredReports.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{resources.reports.length}</span> reports
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Available Reports
            </h2>
            <button
              onClick={() => fetchResources()}
              disabled={resources.loading}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-${theme}-600 hover:text-${theme}-700 bg-${theme}-50 hover:bg-${theme}-100 rounded-lg transition-colors disabled:opacity-50`}
            >
              {resources.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {resources.loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {resources.loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Loading reports...
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Please wait while we fetch the latest resources
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No reports found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {resources.filters.department || resources.filters.report_type || searchTerm 
                  ? 'Try adjusting your filters or search terms.'
                  : 'No reports are currently available.'
                }
              </p>
              {(resources.filters.department || resources.filters.report_type || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-${theme}-600 text-white font-medium rounded-lg hover:bg-${theme}-700 transition-colors`}
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Report Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      {getFileIcon(getFileTypeFromUrl(report.document))}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getReportTypeBadge(report.report_type)}`}>
                        {report.report_type}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                      {report.title || `${report.department} ${report.report_type} Report`}
                    </h3>
                    
                    {report.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {report.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {report.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <File className="w-3 h-3" />
                        {getFileTypeFromUrl(report.document).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Report Footer */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(report.uploaded_at)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(report)}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-${theme}-600 hover:bg-${theme}-700 text-white text-sm font-medium rounded-lg transition-colors`}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      
                      <button
                        onClick={() => window.open(report.document, '_blank')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm font-medium rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department Resources Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className={`w-6 h-6 text-${theme}-500`} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Department Resources
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Documents */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Department Guidelines & Templates
                </h3>
                <div className="space-y-3">
                  {departments.slice(1, 4).map((dept) => (
                    <div
                      key={dept.value}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${theme}-100 dark:bg-${theme}-900 rounded-lg`}>
                          <GraduationCap className={`w-4 h-4 text-${theme}-600 dark:text-${theme}-400`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{dept.label}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Guidelines & templates</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Hours & Contact */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Office Hours & Contact
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Office Hours</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monday - Friday, 8:00 AM - 3:00 PM
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Location</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      CoET Building, Room A113
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">WhatsApp Group</h4>
                    </div>
                    <button
                      onClick={() => window.open('https://chat.whatsapp.com/G4M4shTxh1IHIL3tAf6oNn', '_blank')}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Join PT Updates Group
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadReportModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={uploadReport}
      />
    </div>
  );
};
