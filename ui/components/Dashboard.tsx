import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { EventCard } from './EventCard';
import { SearchAndFilter } from './SearchAndFilter';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  Settings, 
  Bell,
  Plus,
  ChevronRight,
  Palette,
  Eye,
  Edit3,
  CheckCircle2,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  Target,
  Activity,
  Zap,
  User,
  Layout,
  ChevronDown,
  FileText
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TaskCard } from './TaskCard';
import { filterTasks, getAllAssignees } from '../utils/searchAndFilter';
import { getEffectiveDueDate } from '../utils/timeUtils';

interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  url: string;
  title: string;
  favicon?: string;
}

interface Task {
  id: string;
  name: string;
  description?: string;
  assignees: string[];
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  subTasks?: SubTask[];
  attachments?: Attachment[];
  isPersonal?: boolean;
}

interface Event {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  endTime?: string;
  isMultiDay?: boolean;
  location: string;
  description: string;
  progress: number;
  tasks: Task[];
  members: string[];
  coverImage?: string;
  color?: string;
}

interface DashboardProps {
  events: Event[];
  personalTasks: Task[];
  currentUser: string;
  onCreateEvent: () => void;
  onCreateFromTemplate?: () => void;
  onEventClick: (eventId: string) => void;
  onStyleGuide?: () => void;
  onNotifications?: () => void;
  onEditEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onAddTask?: (eventId: string) => void;
  onTaskAction?: (taskId: string, action: 'view' | 'complete' | 'edit' | 'delete') => void;
  onCreatePersonalTask?: () => void;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onSubTaskToggle?: (taskId: string, subTaskId: string) => void;
  // Navigation handlers
  onNavigateToAllEvents?: () => void;
  onNavigateToAllTasks?: (filterContext?: 'my' | 'all') => void;
  onNavigateToCalendar?: () => void;
  onNavigateToSettings?: () => void;
}

export function Dashboard({ events, personalTasks, currentUser, onCreateEvent, onCreateFromTemplate, onEventClick, onStyleGuide, onNotifications, onEditEvent, onDeleteEvent, onAddTask, onTaskAction, onCreatePersonalTask, onStatusChange, onSubTaskToggle, onNavigateToAllEvents, onNavigateToAllTasks, onNavigateToCalendar, onNavigateToSettings }: DashboardProps) {
  // Search and filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: [] as ('To Do' | 'In Progress' | 'Done')[],
    priority: [] as ('Urgent' | 'High' | 'Normal' | 'Low')[],
    assignees: [] as string[],
    dateRange: { from: null as Date | null, to: null as Date | null },
    eventTypes: [] as string[],
    showCompleted: true,
    showPersonalTasks: true
  });
  
  // Legacy filtering state (for backward compatibility)
  const [eventSortBy, setEventSortBy] = useState<'date' | 'recent'>('date');
  const [taskSortBy, setTaskSortBy] = useState<'dueDate' | 'priority' | 'recent'>('dueDate');
  
  // Dashboard customization state
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState({
    upcomingEvents: true,
    recentActivity: true,
    upcomingDeadlines: true,
    progressOverview: true,
    miniCalendar: false // Future widget
  });

  // Task list customization state
  const [showTaskCustomizeModal, setShowTaskCustomizeModal] = useState(false);
  const [taskColumnsConfig, setTaskColumnsConfig] = useState({
    status: true,
    dueDate: true,
    priority: true,
    subTaskProgress: true
  });



  // Get user's tasks from all events and personal tasks
  const userTasks = useMemo(() => {
    // Event tasks assigned to current user
    const eventTasks = events.flatMap(event => 
      event.tasks
        .filter(task => task.assignees.includes(currentUser))
        .map(task => ({ ...task, eventTitle: event.title }))
    );
    
    // Personal tasks (no event association)
    const personalUserTasks = personalTasks
      .filter(task => task.assignees.includes(currentUser))
      .map(task => ({ ...task, eventTitle: undefined })); // No event title for personal tasks
    
    // Combine both types
    return [...eventTasks, ...personalUserTasks];
  }, [events, personalTasks, currentUser]);

  // Get all available assignees for filter dropdown
  const availableAssignees = useMemo(() => {
    return getAllAssignees(userTasks, events);
  }, [userTasks, events]);

  // Apply filtering and sorting to tasks
  const filteredAndSortedTasks = useMemo(() => {
    // First apply the new filtering system
    let filtered = filterTasks(userTasks, searchTerm, filters);

    // Then apply sorting
    return [...filtered].sort((a, b) => {
      if (taskSortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (taskSortBy === 'priority') {
        const priorityOrder = { 'Urgent': 0, 'High': 1, 'Normal': 2, 'Low': 3 };
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      } else { // recent
        return b.id.localeCompare(a.id); // Assuming newer IDs are "more recent"
      }
    });
  }, [userTasks, searchTerm, filters, taskSortBy]);

  // Apply sorting to events
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (eventSortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else { // recent
        return b.id.localeCompare(a.id); // Assuming newer IDs are "more recent"
      }
    });
  }, [events, eventSortBy]);

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to format time
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper function to format due date with urgency detection
  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDateTime = new Date(dueDate);
    
    // Reset hours for date comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    dueDateTime.setHours(0, 0, 0, 0);
    
    const isToday = dueDateTime.getTime() === today.getTime();
    const isTomorrow = dueDateTime.getTime() === tomorrow.getTime();
    const isUrgent = isToday || isTomorrow;
    
    const formattedDate = dueDateTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return {
      text: `Due: ${formattedDate}`,
      isUrgent,
      isToday,
      isTomorrow
    };
  };

  return (
    <div className="flex min-h-full">
      {/* Left Sidebar */}
      <Sidebar
        currentView="dashboard"
        onNavigateToDashboard={() => {}} // No-op since we're already on dashboard
        onNavigateToEvents={onNavigateToAllEvents}
        onNavigateToTasks={onNavigateToAllTasks}
        onNavigateToCalendar={onNavigateToCalendar}
        onNavigateToSettings={onNavigateToSettings}
        onStyleGuide={onStyleGuide}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-8 bg-muted/20 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-foreground mb-2">
                Welcome back, {currentUser.split(' ')[0]}! 👋
              </h1>
              <p className="text-muted-foreground">
                You have {userTasks.filter(task => task.status !== 'Done').length} pending tasks across {events.length} events
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCustomizeModal(true)}
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Layout className="w-4 h-4 mr-2" />
                Customize Dashboard
              </Button>
              
              {/* Split Button for Create Event */}
              <div className="flex items-center shadow-lg rounded-lg overflow-hidden">
                <Button 
                  onClick={onCreateEvent} 
                  className="bg-primary hover:bg-primary/90 rounded-r-none border-r border-primary-foreground/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      className="bg-primary hover:bg-primary/90 rounded-l-none px-2"
                      aria-label="More options"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={onCreateFromTemplate} className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      Create from Template...
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Two-Row Master Layout */}
          <div className="space-y-8">
            {/* Top Row - Widgets Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Widget 1: Upcoming Events */}
                {dashboardConfig.upcomingEvents && (
                  <Card className="lg:col-span-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">Upcoming Events</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary"
                          onClick={onNavigateToAllEvents}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {sortedEvents.slice(0, 3).map((event) => (
                          <div 
                            key={event.id} 
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => onEventClick(event.id)}
                          >
                            <div 
                              className="w-8 h-8 rounded-md flex-shrink-0"
                              style={{ 
                                backgroundColor: event.color || '#4A90E2',
                                backgroundImage: event.coverImage ? `url(${event.coverImage})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(event.date)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {sortedEvents.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            No upcoming events
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Widget 2: Recent Activity */}
                {dashboardConfig.recentActivity && (
                  <Card className="lg:col-span-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">Recent Activity</h3>
                        <Activity className="w-4 h-4 text-muted-foreground" />
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { user: 'Sarah Chen', action: 'completed', item: 'Invite speakers', time: '2h ago' },
                          { user: 'Michael Brown', action: 'was assigned to', item: 'Setup registration', time: '4h ago' },
                          { user: 'Emily Davis', action: 'commented on', item: 'Hackathon 2025', time: '1d ago' }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(activity.user)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground">
                                <span className="font-medium">{activity.user.split(' ')[0]}</span> {activity.action}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{activity.item}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Widget 3: Upcoming Deadlines */}
                {dashboardConfig.upcomingDeadlines && (
                  <Card className="lg:col-span-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">Upcoming Deadlines</h3>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      
                      <div className="space-y-3">
                        {userTasks
                          .filter(task => {
                            const effectiveDueDate = getEffectiveDueDate(task);
                            if (!effectiveDueDate || task.status === 'Done') return false;
                            
                            // Normalize dates to avoid time zone issues
                            const dueDate = new Date(effectiveDueDate);
                            const today = new Date();
                            const nextWeek = new Date();
                            nextWeek.setDate(today.getDate() + 7);
                            
                            // Set all times to start of day for proper comparison
                            dueDate.setHours(0, 0, 0, 0);
                            today.setHours(0, 0, 0, 0);
                            nextWeek.setHours(23, 59, 59, 999);
                            
                            return dueDate >= today && dueDate <= nextWeek;
                          })
                          .slice(0, 3)
                          .map(task => {
                            const effectiveDueDate = getEffectiveDueDate(task);
                            const dueInfo = formatDueDate(effectiveDueDate);
                            return (
                              <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                <div className={`w-2 h-2 rounded-full ${
                                  task.priority === 'Urgent' ? 'bg-red-500' :
                                  task.priority === 'High' ? 'bg-orange-500' :
                                  task.priority === 'Normal' ? 'bg-blue-500' : 'bg-gray-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{task.name}</p>
                                  <p className="text-xs text-muted-foreground">{task.eventTitle || 'Personal'}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xs ${dueInfo?.isUrgent ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
                                    {dueInfo?.isToday ? 'Today' : dueInfo?.isTomorrow ? 'Tomorrow' : 
                                     new Date(effectiveDueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        
                        {userTasks.filter(task => {
                          const effectiveDueDate = getEffectiveDueDate(task);
                          if (!effectiveDueDate || task.status === 'Done') return false;
                          
                          // Normalize dates for proper comparison
                          const dueDate = new Date(effectiveDueDate);
                          const today = new Date();
                          const nextWeek = new Date();
                          nextWeek.setDate(today.getDate() + 7);
                          
                          // Set all times to start of day for proper comparison
                          dueDate.setHours(0, 0, 0, 0);
                          today.setHours(0, 0, 0, 0);
                          nextWeek.setHours(23, 59, 59, 999);
                          
                          return dueDate >= today && dueDate <= nextWeek;
                        }).length === 0 && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            No upcoming deadlines
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Widget 4: Progress Overview */}
                {dashboardConfig.progressOverview && (
                  <Card className="lg:col-span-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">Progress Overview</h3>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      </div>
                      
                      <div className="space-y-4">
                        {events.slice(0, 3).map(event => (
                          <div key={event.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground truncate">{event.title}</span>
                              <span className="text-sm text-muted-foreground">{event.progress}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${event.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                        
                        {events.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            No events to track
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Bottom Row - My Tasks Section */}
            <div className="space-y-6">
              <section className="space-y-4">
                {/* Clean Header with Stats and Controls */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">My Tasks</h2>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <span>{userTasks.length} total</span>
                      <span>•</span>
                      <span>{userTasks.filter(task => task.status === 'Done').length} completed</span>
                      <span>•</span>
                      <span className="text-warning">{userTasks.filter(task => {
                        const effectiveDueDate = getEffectiveDueDate(task);
                        if (!effectiveDueDate) return false;
                        const dueDate = new Date(effectiveDueDate);
                        const today = new Date();
                        
                        // Normalize to start of day for proper comparison
                        dueDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);
                        
                        return dueDate < today && task.status !== 'Done';
                      }).length} overdue</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button 
                      size="sm" 
                      onClick={onCreatePersonalTask}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Personal Task
                    </Button>
                  </div>
                </div>

                {/* Clean Search and Filter with Sort */}
                <SearchAndFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableAssignees={availableAssignees}
                  showTaskFilters={true}
                  placeholder="Search your tasks..."
                  currentUser={currentUser}
                  sortBy={taskSortBy}
                  onSortChange={setTaskSortBy}
                  showSort={true}
                />

                {filteredAndSortedTasks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="space-y-4">
                      <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">No tasks found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm || filters.status?.length > 0 || filters.priority?.length > 0 || filters.assignees?.length > 0 || filters.dateRange?.from
                            ? 'Try adjusting your filters to see more tasks.'
                            : 'Event tasks and personal tasks will appear here'}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          {(searchTerm || filters.status?.length > 0 || filters.priority?.length > 0 || filters.assignees?.length > 0 || filters.dateRange?.from) && (
                            <Button 
                              variant="outline"
                              size="sm" 
                              onClick={() => {
                                setSearchTerm('');
                                setFilters({
                                  status: [],
                                  priority: [],
                                  assignees: [],
                                  dateRange: { from: null, to: null },
                                  eventTypes: [],
                                  showCompleted: true,
                                  showPersonalTasks: true
                                });
                              }}
                            >
                              Clear Filters
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            onClick={onCreatePersonalTask}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Personal Task
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        {filteredAndSortedTasks.slice(0, 8).map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onTaskAction={onTaskAction}
                            onStatusChange={onStatusChange}
                            onSubTaskToggle={onSubTaskToggle}
                            formatDueDate={formatDueDate}
                          />
                        ))}
                        
                        {filteredAndSortedTasks.length > 8 && (
                          <div className="pt-4 border-t border-border">
                            <Button variant="ghost" className="w-full text-primary" onClick={() => onNavigateToAllTasks?.('my')}>
                              View {filteredAndSortedTasks.length - 8} more tasks
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Customize Dashboard Modal */}
      <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Dashboard</DialogTitle>
            <DialogDescription>
              Choose which widgets to display on your dashboard
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Widget Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Upcoming Events</label>
                  <p className="text-xs text-muted-foreground">Show your upcoming events overview</p>
                </div>
                <Checkbox 
                  checked={dashboardConfig.upcomingEvents}
                  onCheckedChange={(checked) => 
                    setDashboardConfig(prev => ({ ...prev, upcomingEvents: !!checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Upcoming Deadlines</label>
                  <p className="text-xs text-muted-foreground">Show tasks with upcoming due dates</p>
                </div>
                <Checkbox 
                  checked={dashboardConfig.upcomingDeadlines}
                  onCheckedChange={(checked) => 
                    setDashboardConfig(prev => ({ ...prev, upcomingDeadlines: !!checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Recent Activity</label>
                  <p className="text-xs text-muted-foreground">Show team activity and updates</p>
                </div>
                <Checkbox 
                  checked={dashboardConfig.recentActivity}
                  onCheckedChange={(checked) => 
                    setDashboardConfig(prev => ({ ...prev, recentActivity: !!checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Progress Overview</label>
                  <p className="text-xs text-muted-foreground">Show event progress charts</p>
                </div>
                <Checkbox 
                  checked={dashboardConfig.progressOverview}
                  onCheckedChange={(checked) => 
                    setDashboardConfig(prev => ({ ...prev, progressOverview: !!checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between opacity-50">
                <div>
                  <label className="text-sm font-medium text-foreground">Mini Calendar</label>
                  <p className="text-xs text-muted-foreground">Coming soon - compact calendar view</p>
                </div>
                <Checkbox 
                  checked={dashboardConfig.miniCalendar}
                  disabled
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setDashboardConfig({
                    upcomingEvents: true,
                    recentActivity: true,
                    upcomingDeadlines: true,
                    progressOverview: true,
                    miniCalendar: false
                  });
                }}
              >
                Reset to Default
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowCustomizeModal(false)}
                className="bg-primary hover:bg-primary/90"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customize Task List Modal */}
      <Dialog open={showTaskCustomizeModal} onOpenChange={setShowTaskCustomizeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Task Columns</DialogTitle>
            <DialogDescription>
              Choose which columns to display in your task list
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Column Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Task Name</label>
                  <p className="text-xs text-muted-foreground">Always visible</p>
                </div>
                <Checkbox 
                  checked={true}
                  disabled
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <p className="text-xs text-muted-foreground">Show task completion status</p>
                </div>
                <Checkbox 
                  checked={taskColumnsConfig.status}
                  onCheckedChange={(checked) => 
                    setTaskColumnsConfig(prev => ({ ...prev, status: !!checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Due Date</label>
                  <p className="text-xs text-muted-foreground">Show task due dates</p>
                </div>
                <Checkbox 
                  checked={taskColumnsConfig.dueDate}
                  onCheckedChange={(checked) => 
                    setTaskColumnsConfig(prev => ({ ...prev, dueDate: !!checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <p className="text-xs text-muted-foreground">Show task priority levels</p>
                </div>
                <Checkbox 
                  checked={taskColumnsConfig.priority}
                  onCheckedChange={(checked) => 
                    setTaskColumnsConfig(prev => ({ ...prev, priority: !!checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Sub-task Progress</label>
                  <p className="text-xs text-muted-foreground">Show progress bars for sub-tasks</p>
                </div>
                <Checkbox 
                  checked={taskColumnsConfig.subTaskProgress}
                  onCheckedChange={(checked) => 
                    setTaskColumnsConfig(prev => ({ ...prev, subTaskProgress: !!checked }))
                  }
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setTaskColumnsConfig({
                    status: true,
                    dueDate: true,
                    priority: true,
                    subTaskProgress: true
                  });
                }}
              >
                Reset to Default
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowTaskCustomizeModal(false)}
                className="bg-primary hover:bg-primary/90"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}