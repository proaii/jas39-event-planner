import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, CheckSquare2, User } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { formatEventDateRange, formatTaskDateRange, isCurrentlyActive, getEffectiveDueDate } from '../utils/timeUtils';

interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

interface Task {
  id: string;
  name: string;
  description?: string;
  assignees: string[];
  dueDate?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  subTasks?: SubTask[];
  isPersonal?: boolean;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  description: string;
  progress: number;
  tasks: Task[];
  members: string[];
  coverImage?: string;
  color?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
  tasks: (Task & { eventTitle?: string })[];
}

interface CalendarPageProps {
  events: Event[];
  personalTasks?: Task[];
  currentUser?: string;
  onEventClick: (eventId: string) => void;
  onTaskClick?: (taskId: string) => void;
  // Navigation handlers
  onNavigateToDashboard: () => void;
  onNavigateToEvents: () => void;
  onNavigateToTasks: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToSettings: () => void;
  onStyleGuide?: () => void;
}

export function CalendarPage({ 
  events, 
  personalTasks = [],
  currentUser = '',
  onEventClick,
  onTaskClick,
  onNavigateToDashboard,
  onNavigateToEvents,
  onNavigateToTasks,
  onNavigateToCalendar,
  onNavigateToSettings,
  onStyleGuide 
}: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // September 2025 (month is 0-indexed)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Helper function to format time
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper function to get event color
  const getEventColor = (event: Event) => {
    if (event.coverImage) return '#4A90E2'; // Default blue for events with images
    return event.color || '#4A90E2';
  };

  // Navigation functions
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific date (including multi-day events)
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const startDate = event.date;
      const endDate = event.endDate || event.date;
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  // Get tasks for a specific date (including multi-day tasks and time periods)
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Get tasks from events assigned to current user
    const eventTasks = events.flatMap(event => 
      event.tasks
        .filter(task => {
          if (!task.assignees.includes(currentUser)) return false;
          
          // Check if task falls on this date
          if (task.startDate && task.endDate) {
            // Multi-day or time period task
            return dateStr >= task.startDate && dateStr <= task.endDate;
          } else if (task.startDate) {
            // Single start date
            return task.startDate === dateStr;
          } else {
            // Use effective due date (endDate for time periods, or dueDate for traditional tasks)
            const effectiveDueDate = getEffectiveDueDate(task);
            return effectiveDueDate === dateStr;
          }
          return false;
        })
        .map(task => ({ ...task, eventTitle: event.title }))
    );
    
    // Get personal tasks
    const userPersonalTasks = personalTasks
      .filter(task => {
        if (!task.assignees.includes(currentUser)) return false;
        
        // Check if task falls on this date
        if (task.startDate && task.endDate) {
          // Multi-day or time period task
          return dateStr >= task.startDate && dateStr <= task.endDate;
        } else if (task.startDate) {
          // Single start date
          return task.startDate === dateStr;
        } else {
          // Use effective due date
          const effectiveDueDate = getEffectiveDueDate(task);
          return effectiveDueDate === dateStr;
        }
        return false;
      })
      .map(task => ({ ...task, eventTitle: undefined }));
    
    return [...eventTasks, ...userPersonalTasks];
  };

  // Generate calendar days for month view
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: getEventsForDate(prevDate),
        tasks: getTasksForDate(prevDate)
      });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date),
        tasks: getTasksForDate(date)
      });
    }

    // Add empty cells for days after the last day of the month
    const remainingCells = 42 - days.length; // 6 rows × 7 days = 42 cells
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: getEventsForDate(nextDate),
        tasks: getTasksForDate(nextDate)
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex min-h-full">
      {/* Left Sidebar */}
      <Sidebar
        currentView="calendar"
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToEvents={onNavigateToEvents}
        onNavigateToTasks={onNavigateToTasks}
        onNavigateToCalendar={() => {}} // No-op since we're already on calendar
        onNavigateToSettings={onNavigateToSettings}
        onStyleGuide={onStyleGuide}
      />
      
      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-foreground">Calendar</h1>
        
        {/* View Mode Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="rounded-none"
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="rounded-none"
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="rounded-none"
            >
              Day
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold text-foreground">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        <Button variant="outline" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Calendar Grid (Month View) */}
      {viewMode === 'month' && (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-7">
              {/* Day Headers */}
              {dayNames.map((day) => (
                <div key={day} className="p-3 border-b border-border text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {calendarDays.map((day, index) => {
                const isToday = day.date.getTime() === today.getTime();
                const hasEvents = day.events.length > 0;
                const hasTasks = day.tasks && day.tasks.length > 0;
                const totalItems = day.events.length + (day.tasks?.length || 0);
                
                return (
                  <div
                    key={index}
                    className={`min-h-[140px] p-2 border-b border-r border-border ${
                      !day.isCurrentMonth ? 'bg-muted/20' : 'bg-background'
                    } ${isToday ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`text-sm mb-2 ${
                      !day.isCurrentMonth ? 'text-muted-foreground' : 'text-foreground'
                    } ${isToday ? 'font-semibold text-primary' : ''}`}>
                      {day.date.getDate()}
                    </div>
                    
                    {/* Events and Tasks for this day */}
                    <div className="space-y-1">
                      {/* Events */}
                      {day.events.slice(0, 2).map((event) => (
                        <Popover key={event.id}>
                          <PopoverTrigger asChild>
                            <div
                              className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate"
                              style={{ 
                                backgroundColor: getEventColor(event), 
                                color: 'white' 
                              }}
                            >
                              📅 {event.title}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" align="start">
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
                                <div className={`flex items-center text-sm mb-1 ${
                                  isCurrentlyActive(event) 
                                    ? 'text-primary font-medium' 
                                    : 'text-muted-foreground'
                                }`}>
                                  <Clock className="w-4 h-4 mr-1" />
                                  {formatEventDateRange(event)}
                                  {isCurrentlyActive(event) && (
                                    <Badge variant="outline" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                                      Active
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {event.location}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {event.description.length > 100 
                                    ? `${event.description.substring(0, 100)}...` 
                                    : event.description
                                  }
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">
                                  {event.progress}% Complete
                                </Badge>
                                <Button 
                                  size="sm" 
                                  onClick={() => onEventClick(event.id)}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ))}
                      
                      {/* Tasks */}
                      {day.tasks && day.tasks.slice(0, Math.max(1, 3 - day.events.length)).map((task) => (
                        <Popover key={`task-${task.id}`}>
                          <PopoverTrigger asChild>
                            <div
                              className="text-xs p-1 rounded cursor-pointer hover:bg-muted/70 transition-colors truncate bg-muted/50 text-foreground border border-border"
                              onClick={() => onTaskClick?.(task.id)}
                            >
                              <div className="flex items-center space-x-1">
                                <CheckSquare2 className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{task.name}</span>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" align="start">
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-foreground mb-1">{task.name}</h3>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {task.description.length > 100 
                                      ? `${task.description.substring(0, 100)}...` 
                                      : task.description
                                    }
                                  </p>
                                )}
                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                  <User className="w-4 h-4 mr-1" />
                                  {task.eventTitle || 'Personal Task'}
                                </div>
                                {task.subTasks && task.subTasks.length > 0 && (
                                  <div className="text-sm text-muted-foreground mb-2">
                                    {task.subTasks.filter(st => st.completed).length} of {task.subTasks.length} sub-tasks completed
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Badge 
                                  variant="secondary"
                                  className={`
                                    ${task.status === 'To Do' ? 'bg-gray-100 text-gray-800' : ''}
                                    ${task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''}
                                    ${task.status === 'Done' ? 'bg-green-100 text-green-800' : ''}
                                  `}
                                >
                                  {task.status}
                                </Badge>
                                <Button 
                                  size="sm" 
                                  onClick={() => onTaskClick?.(task.id)}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  Edit Task
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ))}
                      
                      {/* Show "+X more" if there are more items than can be displayed */}
                      {totalItems > 3 && (
                        <div className="text-xs text-muted-foreground p-1">
                          +{totalItems - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-muted-foreground">
              Week view is coming soon! For now, please use Month view to see all events.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-muted-foreground">
              Day view is coming soon! For now, please use Month view to see all events.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Summary */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-foreground">Events This Month</h3>
        </CardHeader>
        <CardContent>
          {events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === currentDate.getMonth() && 
                   eventDate.getFullYear() === currentDate.getFullYear();
          }).length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No events scheduled for this month</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events
                .filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate.getMonth() === currentDate.getMonth() && 
                         eventDate.getFullYear() === currentDate.getFullYear();
                })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onEventClick(event.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getEventColor(event) }}
                      />
                      <div>
                        <div className="font-medium text-foreground">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })} at {formatTime(event.time)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {event.progress}% Complete
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
      </main>
    </div>
  );
}