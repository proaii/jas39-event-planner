import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Bell, 
  Calendar,
  CheckSquare,
  MessageSquare,
  AlertCircle,
  Clock,
  Home,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Notification } from './NotificationDropdown';
import { Sidebar } from './Sidebar';

interface NotificationsPageProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onBack: () => void;
  onStyleGuide?: () => void;
  onNavigateToEvents?: () => void;
  onNavigateToTasks?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToSettings?: () => void;
}

export function NotificationsPage({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onBack,
  onStyleGuide,
  onNavigateToEvents,
  onNavigateToTasks,
  onNavigateToCalendar,
  onNavigateToSettings
}: NotificationsPageProps) {
  const [activeTab, setActiveTab] = useState('all');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-5 h-5 text-primary" />;
      case 'task':
        return <CheckSquare className="w-5 h-5 text-green-600" />;
      case 'mention':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInDays === 1) {
      return `Yesterday ${timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })}`;
    } else {
      return timestamp.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    const now = new Date();

    notifications.forEach(notification => {
      const diffInDays = Math.floor((now.getTime() - notification.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      
      let groupKey: string;
      if (diffInDays === 0) {
        groupKey = 'Today';
      } else if (diffInDays === 1) {
        groupKey = 'Yesterday';
      } else if (diffInDays <= 7) {
        groupKey = 'Last 7 days';
      } else if (diffInDays <= 30) {
        groupKey = 'Last 30 days';
      } else {
        groupKey = 'Older';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'mentions':
        return notifications.filter(n => n.type === 'mention');
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    // Here you could handle navigation to the related content
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <div className="flex min-h-full">
      {/* Left Sidebar - use standard Sidebar component */}
      <Sidebar
        currentView="notifications"
        onNavigateToDashboard={onBack}
        onNavigateToEvents={onNavigateToEvents || (() => {})}
        onNavigateToTasks={onNavigateToTasks || (() => {})}
        onNavigateToCalendar={onNavigateToCalendar || (() => {})}
        onNavigateToSettings={onNavigateToSettings || (() => {})}
        onStyleGuide={onStyleGuide}
      />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-muted/20">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-foreground">All Notifications</h1>
                  <p className="text-muted-foreground mt-1">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You\'re all caught up!'}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={onMarkAllAsRead}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Filter Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-sm">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  All
                  {notifications.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
                      {notifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-destructive text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="mentions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Mentions
                  {notifications.filter(n => n.type === 'mention').length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
                      {notifications.filter(n => n.type === 'mention').length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {filteredNotifications.length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
                      <div key={dateGroup} className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          {dateGroup}
                        </h3>
                        <div className="space-y-2">
                          {groupNotifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                                !notification.isRead 
                                  ? 'bg-primary/5 border-primary/20 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/15' 
                                  : 'bg-white dark:bg-card border-border hover:bg-muted/30 dark:hover:bg-muted/20'
                              }`}
                            >
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 mt-1">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className={`${!notification.isRead ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                                        {notification.message}
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {formatTimestamp(notification.timestamp)}
                                      </p>
                                    </div>
                                    {!notification.isRead && (
                                      <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 ml-4"></div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Empty State
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Bell className="w-12 h-12 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {activeTab === 'unread' 
                        ? "You're all caught up!" 
                        : activeTab === 'mentions'
                        ? 'No mentions yet'
                        : 'No notifications yet'
                      }
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {activeTab === 'unread'
                        ? 'All your notifications have been read. Great job staying organized!'
                        : activeTab === 'mentions'
                        ? 'When someone mentions you in a comment or assigns you a task, it will appear here.'
                        : 'When you have new events, tasks, or updates, they will appear here.'
                      }
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
      </main>
    </div>
  );
}