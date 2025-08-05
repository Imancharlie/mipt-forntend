import React, { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useToastContext } from '@/contexts/ToastContext';
import { 
  Users, 
  Download, 
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Clock,
  Loader2,
  ChevronDown,
  ChevronRight,
  Building2,
  GraduationCap,
  FileText
} from 'lucide-react';

interface DepartmentDocument {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  category: string;
}

interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  coordinator: {
    name: string;
  email: string;
  phone: string;
  office_location: string;
  };
  documents: DepartmentDocument[];
  whatsapp_group: {
  name: string;
  invite_link: string;
  };
}

interface ResourcesData {
  departments: Department[];
  general_documents: DepartmentDocument[];
  office_hours: {
    weekdays: string;
    location: string;
  };
}

export const ResourcesPage: React.FC = () => {
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToastContext();
  const [resourcesData, setResourcesData] = useState<ResourcesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDepartment, setExpandedDepartment] = useState<number | null>(null);

  useEffect(() => {
    const fetchResourcesData = async () => {
      try {
        // Simulate API call - replace with actual backend endpoint
        const response = await fetch('/api/resources/');
        if (response.ok) {
          const data = await response.json();
          setResourcesData(data);
        } else {
          // Fallback to mock data if API fails
          setResourcesData({
            departments: [
              {
                id: 1,
                name: 'Mechanical  and Indistrial department',
                code: 'MECH',
                description: 'Department of Mechanical Engineering and Indistrial department and guidelines',
                coordinator: {
                  name: 'Dr. John Mwambene',
                  email: 'mech.coordinator@udsm.ac.tz',
                  phone: '+255 123 456 789',
                  office_location: 'CoET Building, Room 201'
                },
                documents: [
                  {
                    id: 1,
                    title: 'MEI Guidelines',
                    description: 'Complete guidelines for practical training',
                    file_url: '/api/resources/download/mech-guidelines.pdf',
                file_type: 'pdf',
                category: 'guidelines'
              },
              {
                id: 2,
                    title: 'Weekly Report sample',
                    description: 'Example report of logbook',
                    file_url: '/api/resources/download/mech-sample.pdf',
                file_type: 'pdf',
                category: 'samples'
              },
              {
                    id: 3,
                    title: 'Mechanical Assessment Criteria',
                    description: 'Assessment criteria and evaluation guidelines',
                    file_url: '/api/resources/download/mech-assessment.pdf',
                file_type: 'pdf',
                    category: 'assessment'
                  }
                ],
                whatsapp_group: {
                  name: 'CoET PT Updates',
                  invite_link: 'https://chat.whatsapp.com/G4M4shTxh1IHIL3tAf6oNn'
                }
              },
              {
                id: 2,
                name: 'Electrical Engineering',
                code: 'ELEC',
                description: 'Department of Electrical Engineering resources and guidelines',
                coordinator: {
                name: 'Dr. Sarah Kimaro',
                email: 'elec.coordinator@udsm.ac.tz',
                phone: '+255 123 456 790',
                office_location: 'CoET Building, Room 202'
                },
                documents: [
                  {
                    id: 4,
                    title: 'Electrical Engineering Guidelines',
                    description: 'Complete guidelines for electrical engineering practical training',
                    file_url: '/api/resources/download/elec-guidelines.pdf',
                    file_type: 'pdf',
                    category: 'guidelines'
                  },
                  {
                    id: 5,
                    title: 'Sample Electrical Report',
                    description: 'Example report for electrical engineering projects',
                    file_url: '/api/resources/download/elec-sample.pdf',
                    file_type: 'pdf',
                    category: 'samples'
                  },
                  {
                    id: 6,
                    title: 'Electrical Safety Guidelines',
                    description: 'Safety protocols for electrical engineering practical training',
                    file_url: '/api/resources/download/elec-safety.pdf',
                    file_type: 'pdf',
                    category: 'safety'
                  }
                ],
                whatsapp_group: {
                  name: 'ELEC PT Students',
                  invite_link: 'https://chat.whatsapp.com/G4M4shTxh1IHIL3tAf6oNn'
                }
              },
              {
                id: 3,
                name: 'Computer Science',
                code: 'CS',
                description: 'Department of Computer Science resources and guidelines',
                coordinator: {
                name: 'Dr. Michael Kilewo',
                email: 'cs.coordinator@udsm.ac.tz',
                phone: '+255 123 456 791',
                office_location: 'CoET Building, Room 203'
                },
                documents: [
                  {
                    id: 7,
                    title: 'Computer Science Guidelines',
                    description: 'Complete guidelines for computer science practical training',
                    file_url: '/api/resources/download/cs-guidelines.pdf',
                    file_type: 'pdf',
                    category: 'guidelines'
                  },
                  {
                    id: 8,
                    title: 'Sample Software Project Report',
                    description: 'Example report for software development projects',
                    file_url: '/api/resources/download/cs-sample.pdf',
                    file_type: 'pdf',
                    category: 'samples'
                  },
                  {
                    id: 9,
                    title: 'CS Project Templates',
                    description: 'Templates for different types of CS projects',
                    file_url: '/api/resources/download/cs-templates.zip',
                    file_type: 'zip',
                    category: 'templates'
                  }
                ],
                whatsapp_group: {
                  name: 'CS PT Students',
                  invite_link: 'https://chat.whatsapp.com/cs-pt'
                }
              },
              {
                id: 4,
                name: 'Civil Engineering',
                code: 'CIVIL',
                description: 'Department of Civil Engineering resources and guidelines',
                coordinator: {
                name: 'Dr. Anna Mwakasege',
                email: 'civil.coordinator@udsm.ac.tz',
                phone: '+255 123 456 792',
                office_location: 'CoET Building, Room 204'
                },
                documents: [
                  {
                    id: 10,
                    title: 'Civil Engineering Guidelines',
                    description: 'Complete guidelines for civil engineering practical training',
                    file_url: '/api/resources/download/civil-guidelines.pdf',
                    file_type: 'pdf',
                    category: 'guidelines'
                  },
                  {
                    id: 11,
                    title: 'Sample Civil Report',
                    description: 'Example report for civil engineering projects',
                    file_url: '/api/resources/download/civil-sample.pdf',
                    file_type: 'pdf',
                    category: 'samples'
                  },
                  {
                    id: 12,
                    title: 'Civil Safety Protocols',
                    description: 'Safety protocols for civil engineering site visits',
                    file_url: '/api/resources/download/civil-safety.pdf',
                    file_type: 'pdf',
                    category: 'safety'
                  }
                ],
                whatsapp_group: {
                  name: 'CIVIL PT Students',
                  invite_link: 'https://chat.whatsapp.com/G4M4shTxh1IHIL3tAf6oNn'
                }
              }
            ],
            general_documents: [
              {
                id: 13,
                title: 'General PT Guidelines',
                description: 'Complete guide for industrial practical training requirements and procedures.',
                file_url: '/api/resources/download/general-guidelines.pdf',
                file_type: 'pdf',
                category: 'guidelines'
              },
              {
                id: 14,
                title: 'Report Format Template',
                description: 'Standard format and structure for weekly and final reports.',
                file_url: '/api/resources/download/report-format.docx',
                file_type: 'docx',
                category: 'templates'
              },
              {
                id: 15,
                title: 'Assessment Criteria',
                description: 'General assessment criteria for all departments.',
                file_url: '/api/resources/download/assessment-criteria.pdf',
                file_type: 'pdf',
                category: 'assessment'
              }
            ],
            office_hours: {
              weekdays: 'Monday - Friday, 8:00 AM - 4:00 PM',
              location: 'CoET Building, Room 201'
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch resources data:', error);
        // Use the same fallback data as above
        setResourcesData({
          departments: [
            {
              id: 1,
              name: 'Mechanical Engineering',
              code: 'MECH',
              description: 'Department of Mechanical Engineering resources and guidelines',
              coordinator: {
                name: 'Dr. John Mwambene',
                email: 'mech.coordinator@udsm.ac.tz',
                phone: '+255 123 456 789',
                office_location: 'CoET Building, Room 201'
              },
              documents: [
                {
                  id: 1,
                  title: 'Mechanical Engineering Guidelines',
                  description: 'Complete guidelines for mechanical engineering practical training',
                  file_url: '/api/resources/download/mech-guidelines.pdf',
              file_type: 'pdf',
              category: 'guidelines'
            },
            {
              id: 2,
                  title: 'Sample Mechanical Report',
                  description: 'Example report for mechanical engineering projects',
                  file_url: '/api/resources/download/mech-sample.pdf',
              file_type: 'pdf',
              category: 'samples'
            },
            {
                  id: 3,
                  title: 'Mechanical Assessment Criteria',
                  description: 'Assessment criteria and evaluation guidelines',
                  file_url: '/api/resources/download/mech-assessment.pdf',
              file_type: 'pdf',
                  category: 'assessment'
                }
              ],
              whatsapp_group: {
                name: 'CoET PT Updates',
                invite_link: 'https://chat.whatsapp.com/G4M4shTxh1IHIL3tAf6oNn'
              }
            },
            {
              id: 2,
              name: 'Electrical Engineering',
              code: 'ELEC',
              description: 'Department of Electrical Engineering resources and guidelines',
              coordinator: {
              name: 'Dr. Sarah Kimaro',
              email: 'elec.coordinator@udsm.ac.tz',
              phone: '+255 123 456 790',
              office_location: 'CoET Building, Room 202'
              },
              documents: [
                {
                  id: 4,
                  title: 'Electrical Engineering Guidelines',
                  description: 'Complete guidelines for electrical engineering practical training',
                  file_url: '/api/resources/download/elec-guidelines.pdf',
                  file_type: 'pdf',
                  category: 'guidelines'
                },
                {
                  id: 5,
                  title: 'Sample Electrical Report',
                  description: 'Example report for electrical engineering projects',
                  file_url: '/api/resources/download/elec-sample.pdf',
                  file_type: 'pdf',
                  category: 'samples'
                },
                {
                  id: 6,
                  title: 'Electrical Safety Guidelines',
                  description: 'Safety protocols for electrical engineering practical training',
                  file_url: '/api/resources/download/elec-safety.pdf',
                  file_type: 'pdf',
                  category: 'safety'
                }
              ],
              whatsapp_group: {
                name: 'ELEC PT Students',
                invite_link: 'https://chat.whatsapp.com/G4M4shTxh1IHIL3tAf6oNn'
              }
            },
            {
              id: 3,
              name: 'Computer Science',
              code: 'CS',
              description: 'Department of Computer Science resources and guidelines',
              coordinator: {
              name: 'Dr. Michael Kilewo',
              email: 'cs.coordinator@udsm.ac.tz',
              phone: '+255 123 456 791',
              office_location: 'CoET Building, Room 203'
              },
              documents: [
                {
                  id: 7,
                  title: 'Computer Science Guidelines',
                  description: 'Complete guidelines for computer science practical training',
                  file_url: '/api/resources/download/cs-guidelines.pdf',
                  file_type: 'pdf',
                  category: 'guidelines'
                },
                {
                  id: 8,
                  title: 'Sample Software Project Report',
                  description: 'Example report for software development projects',
                  file_url: '/api/resources/download/cs-sample.pdf',
                  file_type: 'pdf',
                  category: 'samples'
                },
                {
                  id: 9,
                  title: 'CS Project Templates',
                  description: 'Templates for different types of CS projects',
                  file_url: '/api/resources/download/cs-templates.zip',
                  file_type: 'zip',
                  category: 'templates'
                }
              ],
              whatsapp_group: {
                name: 'CS PT Students',
                invite_link: 'https://chat.whatsapp.com/cs-pt'
              }
            },
            {
              id: 4,
              name: 'Civil Engineering',
              code: 'CIVIL',
              description: 'Department of Civil Engineering resources and guidelines',
              coordinator: {
              name: 'Dr. Anna Mwakasege',
              email: 'civil.coordinator@udsm.ac.tz',
              phone: '+255 123 456 792',
              office_location: 'CoET Building, Room 204'
              },
              documents: [
                {
                  id: 10,
                  title: 'Civil Engineering Guidelines',
                  description: 'Complete guidelines for civil engineering practical training',
                  file_url: '/api/resources/download/civil-guidelines.pdf',
                  file_type: 'pdf',
                  category: 'guidelines'
                },
                {
                  id: 11,
                  title: 'Sample Civil Report',
                  description: 'Example report for civil engineering projects',
                  file_url: '/api/resources/download/civil-sample.pdf',
                  file_type: 'pdf',
                  category: 'samples'
                },
                {
                  id: 12,
                  title: 'Civil Safety Protocols',
                  description: 'Safety protocols for civil engineering site visits',
                  file_url: '/api/resources/download/civil-safety.pdf',
                  file_type: 'pdf',
                  category: 'safety'
                }
              ],
              whatsapp_group: {
                name: 'CIVIL PT Students',
                invite_link: 'https://chat.whatsapp.com/G4M4shTxh1IHIL3tAf6oNn'
              }
            }
          ],
          general_documents: [
            {
              id: 13,
              title: 'General PT Guidelines',
              description: 'Complete guide for industrial practical training requirements and procedures.',
              file_url: '/api/resources/download/general-guidelines.pdf',
              file_type: 'pdf',
              category: 'guidelines'
            },
            {
              id: 14,
              title: 'Report Format Template',
              description: 'Standard format and structure for weekly and final reports.',
              file_url: '/api/resources/download/report-format.docx',
              file_type: 'docx',
              category: 'templates'
            },
            {
              id: 15,
              title: 'Assessment Criteria',
              description: 'General assessment criteria for all departments.',
              file_url: '/api/resources/download/assessment-criteria.pdf',
              file_type: 'pdf',
              category: 'assessment'
            }
          ],
          office_hours: {
            weekdays: 'Monday - Friday, 8:00 AM - 3:00 PM',
            location: 'CoET Block A, Room A113'
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResourcesData();
  }, []);

  const handleDownload = async (doc: DepartmentDocument) => {
    try {
      const response = await fetch(doc.file_url);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.title}.${doc.file_type}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        showInfo(`Downloading ${doc.title}... This feature will be available soon.`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      showInfo(`Downloading ${doc.title}... This feature will be available soon.`);
    }
  };

  const handleJoinWhatsApp = (inviteLink: string) => {
    window.open(inviteLink, '_blank');
  };

  const handleContact = (type: string, value: string) => {
    if (type === 'phone') {
      window.open(`tel:${value}`, '_blank');
    } else if (type === 'email') {
      window.open(`mailto:${value}`, '_blank');
    }
  };

  const toggleDepartment = (departmentId: number) => {
    setExpandedDepartment(expandedDepartment === departmentId ? null : departmentId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Loader2 className={`w-6 h-6 animate-spin text-${theme}-500 mb-2`} />
        <p className="text-sm text-gray-600">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="p-3 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold text-${theme}-600 mb-1`}>Resources</h1>
        <p className="text-sm text-gray-600">Access department-specific documents and contact information</p>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* General Documents Section */}
      

        {/* Department Documents Section */}
        <div className={`card p-4 bg-${theme}-50 border border-${theme}-200`}>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className={`w-5 h-5 text-${theme}-500`} />
            <h2 className="text-lg font-semibold text-gray-900">Department Resources</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Click on your department to access department-specific documents and contact information.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resourcesData?.departments.map((department) => {
                const isExpanded = expandedDepartment === department.id;
                
                return (
                  <div key={department.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Department Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleDepartment(department.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-gradient-to-r from-${theme}-500 to-${theme}-600 rounded-lg`}>
                            <GraduationCap className="w-4 h-4 text-white" />
                </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{department.name}</h3>
                            <p className="text-xs text-gray-600">{department.code}</p>
            </div>
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
          </div>
        </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 space-y-4">
                        {/* Documents */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2 text-sm">Documents</h4>
                          <div className="space-y-2">
                            {department.documents.map((document) => (
                              <div key={document.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">{document.title}</h5>
                                  <p className="text-xs text-gray-600">{document.description}</p>
                  </div>
                  <button
                                  onClick={() => handleDownload(document)}
                                  className={`px-3 py-1 bg-${theme}-600 text-white rounded text-xs font-medium hover:bg-${theme}-700 transition-colors flex items-center gap-1`}
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              ))}
          </div>
        </div>

                        {/* Coordinator Contact */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2 text-sm">Coordinator</h4>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-gray-500" />
                                <span className="font-medium">{department.coordinator.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <button 
                                  onClick={() => handleContact('phone', department.coordinator.phone)}
                        className="text-blue-600 hover:underline"
                      >
                                  {department.coordinator.phone}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-500" />
                      <button 
                                  onClick={() => handleContact('email', department.coordinator.email)}
                        className="text-blue-600 hover:underline"
                      >
                                  {department.coordinator.email}
                      </button>
                    </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-700">{department.coordinator.office_location}</span>
            </div>
          </div>
        </div>
          </div>

                        {/* WhatsApp Group */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2 text-sm">WhatsApp Group</h4>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-sm">{department.whatsapp_group.name}</h5>
                                <p className="text-xs text-gray-600">Join for updates and support</p>
                  </div>
                  <button
                                onClick={() => handleJoinWhatsApp(department.whatsapp_group.invite_link)}
                                className={`px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1`}
                  >
                    <ExternalLink className="w-3 h-3" />
                                Join
                  </button>
                </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Office Hours Section */}
        <div className={`card p-4 bg-${theme}-50 border border-${theme}-200`}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className={`w-5 h-5 text-${theme}-500`} />
            <h2 className="text-lg font-semibold text-gray-900">Office Hours</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Visit coordinators during office hours for in-person assistance.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Weekdays</h3>
                  <p className="text-gray-700">{resourcesData?.office_hours.weekdays}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-700">{resourcesData?.office_hours.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 