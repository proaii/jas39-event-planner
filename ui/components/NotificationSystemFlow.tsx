import React, { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Calendar,
  Search,
  Bell,
  Home,
  CheckSquare,
  Settings,
  ChevronRight
} from 'lucide-react';
import { NotificationDropdown, Notification } from './NotificationDropdown';
import { NotificationsPage } from './NotificationsPage';

interface NotificationSystemFlowProps {
  onBack?: () => void;
}

export function NotificationSystemFlow({ onBack }: NotificationSystemFlowProps) {
  const [currentView, setCurrentView] = useState<'dropdown-demo' | 'full-page'>('dropdown-demo');
  
  // Mock notification data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'task',
      title: 'New Task Assignment',
      message: 'Sarah Chen assigned you a new task: "Create UI Mockups" for Annual Tech Conference',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isRead: false,
      relatedId: '1'
    },
    {
      id: '2',
      type: 'event',
      title: 'Event Reminder',
      message: 'Study Group Meetup starts in 2 hours at Library Room 203',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false,
      relatedId: '2'
    },
    {
      id: '3',
      type: 'mention',
      title: 'You were mentioned',
      message: 'Michael Brown mentioned you in a comment: "@Alex what do you think about the new design?"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      relatedId: '1'
    },
    {
      id: '4',
      type: 'task',
      title: 'Task Completed',
      message: 'Emily Davis completed the task "Book venue" for Annual Tech Conference',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      isRead: true,
      relatedId: '1'
    },
    {
      id: '5',
      type: 'reminder',
      title: 'Deadline Reminder',
      message: 'Task "Prepare presentation" is due tomorrow for Hackathon 2025',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      relatedId: '3'
    },
    {
      id: '6',
      type: 'system',
      title: 'System Update',
      message: 'EventPlanner has been updated with new features and improvements',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isRead: true
    },
    {
      id: '7',
      type: 'event',
      title: 'New Event Created',
      message: 'Lisa Garcia created a new event: "Weekly Study Session"',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isRead: true,
      relatedId: '2'
    },
    {
      id: '8',
      type: 'task',
      title: 'Task Assignment',
      message: 'You assigned a new task "Setup registration" to Michael Brown',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      isRead: true,
      relatedId: '1'
    }
  ]);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleViewAllNotifications = () => {
    setCurrentView('full-page');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-muted/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Basic Notification System</h1>
          <p className="text-muted-foreground">Complete notification system with dropdown and full page views</p>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="mt-4">
              Back to App
            </Button>
          )}
        </div>

        {/* Navigation Pills */}
        <div className="flex justify-center space-x-2">
          <Button 
            variant={currentView === 'dropdown-demo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('dropdown-demo')}
            className={currentView === 'dropdown-demo' ? 'bg-primary text-white' : ''}
          >
            1. Notification Dropdown
          </Button>
          <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
          <Button 
            variant={currentView === 'full-page' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('full-page')}
            className={currentView === 'full-page' ? 'bg-primary text-white' : ''}
          >
            2. Full Notification Page
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {currentView === 'dropdown-demo' && (
            <div className="space-y-6">
              {/* Demo Description */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold text-foreground mb-3">Notification Dropdown Component</h2>
                <p className="text-muted-foreground mb-4">
                  This component integrates into the top navigation bar and provides quick access to recent notifications. 
                  Click the bell icon to see the dropdown panel with {unreadCount} unread notifications.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-green-200 text-green-800">
                    ✓ Unread indicator with count
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-800">
                    ✓ Recent notifications (5 most recent)
                  </Badge>
                  <Badge variant="outline" className="border-purple-200 text-purple-800">
                    ✓ Mark all as read functionality
                  </Badge>
                  <Badge variant="outline" className="border-orange-200 text-orange-800">
                    ✓ Quick access to full page
                  </Badge>
                </div>
              </div>

              {/* Mock Top Navigation Bar Demo */}
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <p className="text-sm text-muted-foreground">Top Navigation Bar Integration</p>
                </div>
                
                {/* Mock Navigation Bar */}
                <header className="bg-white border-b border-border px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg text-foreground">EventPlanner</span>
                      </div>
                      
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search events..."
                          className="pl-10 bg-muted/50 border-0 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Notification Dropdown Component */}
                      <NotificationDropdown
                        notifications={notifications}
                        onMarkAsRead={handleMarkAsRead}
                        onMarkAllAsRead={handleMarkAllAsRead}
                        onViewAllNotifications={handleViewAllNotifications}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-white text-sm">AJ</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </header>

                {/* Mock Sidebar and Content */}
                <div className="flex min-h-[300px]">
                  <aside className="w-64 bg-white border-r border-border">
                    <nav className="p-6 space-y-2">
                      <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10">
                        <Home className="w-5 h-5 mr-3" />
                        Dashboard
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                        <CheckSquare className="w-5 h-5 mr-3" />
                        Tasks
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                        <Calendar className="w-5 h-5 mr-3" />
                        Calendar
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                      </Button>
                    </nav>
                  </aside>
                  <main className="flex-1 p-8 bg-muted/20">
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Click the bell icon above!</h3>
                      <p className="text-muted-foreground">
                        Try clicking the notification bell in the top navigation to see the dropdown in action.
                      </p>
                    </div>
                  </main>
                </div>
              </div>

              {/* Feature Overview */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="font-semibold text-foreground mb-3">Default State</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">• Bell icon in outline style</p>
                    <p className="text-sm text-muted-foreground">• No visual indicators when no unread notifications</p>
                    <p className="text-sm text-muted-foreground">• Clean, minimal appearance</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="font-semibold text-foreground mb-3">Active State</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">• Red notification dot with count</p>
                    <p className="text-sm text-muted-foreground">• Dropdown with recent notifications</p>
                    <p className="text-sm text-muted-foreground">• Quick action buttons</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'full-page' && (
            <div className="space-y-6">
              {/* Demo Description */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold text-foreground mb-3">Full Notification Page</h2>
                <p className="text-muted-foreground mb-4">
                  Complete notification management page with filtering, grouping by date, and comprehensive notification history. 
                  Currently showing {notifications.length} total notifications with {unreadCount} unread.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-green-200 text-green-800">
                    ✓ Filter tabs (All, Unread, Mentions)
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-800">
                    ✓ Date grouping (Today, Yesterday, etc.)
                  </Badge>
                  <Badge variant="outline" className="border-purple-200 text-purple-800">
                    ✓ Clickable notifications
                  </Badge>
                  <Badge variant="outline" className="border-orange-200 text-orange-800">
                    ✓ Empty state handling
                  </Badge>
                </div>
              </div>

              {/* Full Notification Page */}
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <NotificationsPage
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onBack={() => setCurrentView('dropdown-demo')}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}