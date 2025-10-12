import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { NotificationDropdown, Notification } from './NotificationDropdown';
import { Search, Calendar, User, LogOut, CheckSquare, Users } from 'lucide-react';

interface TopNavigationProps {
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
  events?: any[];
  personalTasks?: any[];
  allMembers?: string[];
  onEventClick?: (eventId: string) => void;
  onTaskClick?: (taskId: string) => void;
}

interface UserProfileDropdownProps {
  currentUser: string;
  onViewProfile: () => void;
  onLogOut: () => void;
}

function UserProfileDropdown({ currentUser, onViewProfile, onLogOut }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        className="flex items-center space-x-3 hover:bg-muted/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-white text-sm">
            {getInitials(currentUser)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-foreground">{currentUser}</span>
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg border shadow-lg z-[100] overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => {
                onViewProfile();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 flex items-center transition-colors"
            >
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </button>
            <hr className="border-border my-1" />
            <button
              onClick={() => {
                onLogOut();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 flex items-center transition-colors text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TopNavigation({ 
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
  events = [],
  personalTasks = [],
  allMembers = [],
  onEventClick = () => {},
  onTaskClick = () => {}
}: TopNavigationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  // Search functionality
  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return { events: [], tasks: [], people: [] };
    
    const term = searchTerm.toLowerCase();
    
    const matchingEvents = events.filter(event => 
      event.title.toLowerCase().includes(term) ||
      event.description.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term)
    ).slice(0, 5);
    
    const allTasks = [
      ...events.flatMap(event => event.tasks.map(task => ({ ...task, eventTitle: event.title, eventId: event.id }))),
      ...personalTasks.map(task => ({ ...task, eventTitle: 'Personal', eventId: null }))
    ];
    
    const matchingTasks = allTasks.filter(task => 
      task.name.toLowerCase().includes(term) ||
      (task.description && task.description.toLowerCase().includes(term))
    ).slice(0, 5);
    
    const matchingPeople = allMembers.filter(member => 
      member.toLowerCase().includes(term)
    ).slice(0, 5);
    
    return { events: matchingEvents, tasks: matchingTasks, people: matchingPeople };
  }, [searchTerm, events, personalTasks, allMembers]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-border px-6 py-4 relative z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* App Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-foreground">JAS39 Planner</span>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-96" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search events, tasks, or people..."
              className={`pl-10 bg-muted/50 border-0 transition-all ${showSearchResults ? 'ring-2 ring-primary/20 border-primary/20' : ''}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-3">Search Results</h3>
                  
                  {searchTerm.trim() === '' ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Start typing to search events, tasks, or people...</p>
                  ) : (
                    <>
                      {searchResults.events.length === 0 && searchResults.tasks.length === 0 && searchResults.people.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center">No results found for '{searchTerm}'</p>
                      ) : (
                        <div className="space-y-4">
                          {/* Events Section */}
                          {searchResults.events.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Events
                              </h4>
                              <div className="space-y-1">
                                {searchResults.events.map((event) => (
                                  <button
                                    key={event.id}
                                    onClick={() => {
                                      onEventClick(event.id);
                                      setShowSearchResults(false);
                                      setSearchTerm('');
                                    }}
                                    className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors"
                                  >
                                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                                    <p className="text-xs text-muted-foreground">{event.location} • {new Date(event.date).toLocaleDateString()}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Tasks Section */}
                          {searchResults.tasks.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                                <CheckSquare className="w-4 h-4 mr-2" />
                                Tasks
                              </h4>
                              <div className="space-y-1">
                                {searchResults.tasks.map((task) => (
                                  <button
                                    key={task.id}
                                    onClick={() => {
                                      if (task.eventId) {
                                        onEventClick(task.eventId);
                                      }
                                      onTaskClick(task.id);
                                      setShowSearchResults(false);
                                      setSearchTerm('');
                                    }}
                                    className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors"
                                  >
                                    <p className="text-sm font-medium text-foreground">{task.name}</p>
                                    <p className="text-xs text-muted-foreground">{task.eventTitle}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* People Section */}
                          {searchResults.people.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                People
                              </h4>
                              <div className="space-y-1">
                                {searchResults.people.map((person) => (
                                  <button
                                    key={person}
                                    onClick={() => {
                                      // In a real app, this would navigate to the person's profile
                                      console.log('Navigate to profile:', person);
                                      setShowSearchResults(false);
                                      setSearchTerm('');
                                    }}
                                    className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(person)}</AvatarFallback>
                                      </Avatar>
                                      <p className="text-sm font-medium text-foreground">{person}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 relative">
          {isLoggedIn && currentUser ? (
            <>
              {/* Notification Bell */}
              <NotificationDropdown 
                notifications={notifications}
                onMarkAsRead={onNotificationMarkAsRead}
                onMarkAllAsRead={onNotificationMarkAllAsRead}
                onViewAllNotifications={onViewAllNotifications}
              />

              {/* User Profile Avatar Dropdown */}
              <UserProfileDropdown 
                currentUser={currentUser}
                onViewProfile={onViewProfile}
                onLogOut={onLogOut}
              />
            </>
          ) : (
            <>
              {/* Logged Out State - Login and Sign Up buttons */}
              <Button variant="outline" onClick={onLogin} className="border-primary text-primary hover:bg-primary hover:text-white">
                Log In
              </Button>
              <Button onClick={onRegister} className="bg-primary hover:bg-primary/90">
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}