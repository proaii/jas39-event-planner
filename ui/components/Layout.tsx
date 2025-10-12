import React from 'react';
import { TopNavigation } from './TopNavigation';
import { Notification } from './NotificationDropdown';

interface LayoutProps {
  children: React.ReactNode;
  currentUser?: string;
  isLoggedIn?: boolean;
  notifications?: Notification[];
  onNotificationMarkAsRead?: (notificationId: string) => void;
  onNotificationMarkAllAsRead?: () => void;
  onViewAllNotifications?: () => void;
  onViewProfile?: () => void;
  onLogOut?: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  showTopNavigation?: boolean;
  events?: any[];
  personalTasks?: any[];
  allMembers?: string[];
  onEventClick?: (eventId: string) => void;
  onTaskClick?: (taskId: string) => void;
}

export function Layout({ 
  children, 
  currentUser,
  isLoggedIn = false,
  notifications = [],
  onNotificationMarkAsRead = () => {},
  onNotificationMarkAllAsRead = () => {},
  onViewAllNotifications = () => {},
  onViewProfile = () => {},
  onLogOut = () => {},
  onLogin = () => {},
  onRegister = () => {},
  showTopNavigation = true,
  events = [],
  personalTasks = [],
  allMembers = [],
  onEventClick = () => {},
  onTaskClick = () => {}
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-visible">
      {showTopNavigation && (
        <TopNavigation
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          notifications={notifications}
          onNotificationMarkAsRead={onNotificationMarkAsRead}
          onNotificationMarkAllAsRead={onNotificationMarkAllAsRead}
          onViewAllNotifications={onViewAllNotifications}
          onViewProfile={onViewProfile}
          onLogOut={onLogOut}
          onLogin={onLogin}
          onRegister={onRegister}
          events={events}
          personalTasks={personalTasks}
          allMembers={allMembers}
          onEventClick={onEventClick}
          onTaskClick={onTaskClick}
        />
      )}
      <div className={showTopNavigation ? "h-[calc(100vh-73px)]" : "min-h-screen"}>
        {children}
      </div>
    </div>
  );
}