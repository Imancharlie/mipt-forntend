import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { 
  Bell, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Calendar,
  ExternalLink,
  Pin,
  Loader2
} from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  date: string;
  isPinned?: boolean;
  link?: string;
}

export const AnnouncementsPage: React.FC = () => {
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Simulate API call - replace with actual backend endpoint
        const response = await fetch('/api/announcements/');
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
        } else {
          // Fallback to mock data if API fails
          setAnnouncements([
            {
              id: 1,
              title: "PTMS Registration Deadline Extended",
              content: "The deadline for PTMS registration has been extended to March 15, 2025. All students must complete their registration on the official PTMS platform.",
              type: 'urgent',
              date: '2025-01-15',
              isPinned: true,
              link: 'https://ptmis.udsm.ac.tz/'
            },
            {
              id: 2,
              title: "Weekly Report Submission Guidelines Updated",
              content: "New guidelines for weekly report submission have been published. Please review the updated format requirements.",
              type: 'info',
              date: '2025-01-12',
              isPinned: true
            },
            {
              id: 3,
              title: "Department Coordinator Office Hours",
              content: "All department coordinators will be available for consultation during extended office hours from 8:00 AM to 6:00 PM, Monday to Friday.",
              type: 'info',
              date: '2025-01-10'
            },
            {
              id: 4,
              title: "WhatsApp Group Created for Updates",
              content: "A new WhatsApp group has been created for real-time updates and announcements. Contact your coordinator to join the group.",
              type: 'success',
              date: '2025-01-08'
            },
            {
              id: 5,
              title: "Sample Reports Available for Download",
              content: "Sample weekly and final reports are now available. These examples will help you understand the expected format and quality.",
              type: 'info',
              date: '2025-01-05'
            },
            {
              id: 6,
              title: "PT Training Schedule Released",
              content: "The official practical training schedule for 2025 has been released. Check your department notice board or contact your coordinator for details.",
              type: 'info',
              date: '2025-01-03'
            },
            {
              id: 7,
              title: "Important: Report Submission Reminder",
              content: "All students are reminded to submit their weekly reports on time. Late submissions may affect your final grade.",
              type: 'warning',
              date: '2025-01-01'
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
        // Use fallback data
        setAnnouncements([
          {
            id: 1,
            title: "PTMS Registration Deadline Extended",
            content: "The deadline for PTMS registration has been extended to March 15, 2025. All students must complete their registration on the official PTMS platform.",
            type: 'urgent',
            date: '2025-01-15',
            isPinned: true,
            link: 'https://ptmis.udsm.ac.tz/'
          },
          {
            id: 2,
            title: "Weekly Report Submission Guidelines Updated",
            content: "New guidelines for weekly report submission have been published. Please review the updated format requirements.",
            type: 'info',
            date: '2025-01-12',
            isPinned: true
          },
          {
            id: 3,
            title: "Department Coordinator Office Hours",
            content: "All department coordinators will be available for consultation during extended office hours from 8:00 AM to 6:00 PM, Monday to Friday.",
            type: 'info',
            date: '2025-01-10'
          },
          {
            id: 4,
            title: "WhatsApp Group Created for Updates",
            content: "A new WhatsApp group has been created for real-time updates and announcements. Contact your coordinator to join the group.",
            type: 'success',
            date: '2025-01-08'
          },
          {
            id: 5,
            title: "Sample Reports Available for Download",
            content: "Sample weekly and final reports are now available. These examples will help you understand the expected format and quality.",
            type: 'info',
            date: '2025-01-05'
          },
          {
            id: 6,
            title: "PT Training Schedule Released",
            content: "The official practical training schedule for 2025 has been released. Check your department notice board or contact your coordinator for details.",
            type: 'info',
            date: '2025-01-03'
          },
          {
            id: 7,
            title: "Important: Report Submission Reminder",
            content: "All students are reminded to submit their weekly reports on time. Late submissions may affect your final grade.",
            type: 'warning',
            date: '2025-01-01'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'Urgent';
      case 'warning':
        return 'Warning';
      case 'success':
        return 'Success';
      case 'info':
      default:
        return 'Info';
    }
  };

  const filteredAnnouncements = selectedType === 'all' 
    ? announcements 
    : announcements.filter(announcement => announcement.type === selectedType);

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.isPinned);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Loader2 className={`w-6 h-6 animate-spin text-${theme}-500 mb-2`} />
        <p className="text-sm text-gray-600">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Bell className={`w-6 h-6 text-${theme}-500`} />
          <div>
            <h1 className={`text-2xl font-bold text-${theme}-600`}>Announcements</h1>
            <p className="text-sm text-gray-600">Stay updated with important information and announcements</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'all'
                ? `bg-${theme}-100 text-${theme}-700`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType('urgent')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'urgent'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Urgent
          </button>
          <button
            onClick={() => setSelectedType('warning')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'warning'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setSelectedType('info')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'info'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Information
          </button>
          <button
            onClick={() => setSelectedType('success')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Success
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Pin className="w-4 h-4 text-gray-500" />
              Pinned Announcements
            </h2>
            <div className="space-y-3">
              {pinnedAnnouncements.map((announcement) => (
                <div key={announcement.id} className={`card border-l-4 border-l-yellow-500 bg-${theme}-50 border border-${theme}-200`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(announcement.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{announcement.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(announcement.type)}`}>
                            {getTypeText(announcement.type)}
                          </span>
                          <Pin className="w-3 h-3 text-yellow-500" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(announcement.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{announcement.content}</p>
                      {announcement.link && (
                        <button
                          onClick={() => window.open(announcement.link, '_blank')}
                          className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Learn More
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Announcements */}
        {regularAnnouncements.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Announcements</h2>
            <div className="space-y-3">
              {regularAnnouncements.map((announcement) => (
                <div key={announcement.id} className={`card hover:shadow-md transition-shadow bg-${theme}-50 border border-${theme}-200`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(announcement.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{announcement.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(announcement.type)}`}>
                            {getTypeText(announcement.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(announcement.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{announcement.content}</p>
                      {announcement.link && (
                        <button
                          onClick={() => window.open(announcement.link, '_blank')}
                          className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Learn More
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredAnnouncements.length === 0 && (
          <div className="card text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Announcements</h3>
            <p className="text-sm text-gray-600">
              {selectedType === 'all' 
                ? 'No announcements available at the moment.'
                : `No ${selectedType} announcements available.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 card p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => window.open('https://ptmis.udsm.ac.tz/', '_blank')}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Visit PTMS
          </button>

          <button
            onClick={() => window.location.href = '/ptms'}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Bell className="w-4 h-4" />
            About PTMS
          </button>
        </div>
      </div>
    </div>
  );
}; 