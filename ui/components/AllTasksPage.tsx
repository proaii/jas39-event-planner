import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Sidebar } from './Sidebar';
import { AttachmentList } from './AttachmentList';
import { AttachmentViewModal } from './AttachmentViewModal';
import { SearchAndFilter } from './SearchAndFilter';
import { SearchResultHighlight } from './SearchResultHighlight';
import { Search, Filter, CheckSquare, ArrowUpDown, MoreVertical, Eye, CheckCircle2, Edit3, Plus, X, Calendar as CalendarIcon, User, Clock, Flag, ChevronDown, ChevronRight, Paperclip, Settings2 } from 'lucide-react';
import { filterTasks, getAllAssignees, getTasksFromEvents, getSearchStats } from '../utils/searchAndFilter';
import { getEffectiveDueDate } from '../utils/timeUtils';
import { ViewSwitcher } from './ViewSwitcher';
import { KanbanBoard } from './KanbanBoard';
import { Switch } from './ui/switch';

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
  eventTitle?: string;
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

interface AllTasksPageProps {
  events: Event[];
  personalTasks: Task[];
  currentUser: string;
  filterContext?: 'all' | 'my';
  onTaskAction?: (taskId: string, action: 'view' | 'complete' | 'edit' | 'delete') => void;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onSubTaskToggle?: (taskId: string, subTaskId: string) => void;
  onCreateTask?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToEvents?: () => void;
  onNavigateToTasks?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToSettings?: () => void;
  onStyleGuide?: () => void;
}

export function AllTasksPage({
  events,
  personalTasks = [],
  currentUser,
  filterContext = 'all',
  onTaskAction,
  onStatusChange,
  onSubTaskToggle,
  onCreateTask,
  onNavigateToDashboard,
  onNavigateToEvents,
  onNavigateToTasks,
  onNavigateToCalendar,
  onNavigateToSettings,
  onStyleGuide
}: AllTasksPageProps) {
  // Enhanced search and filtering state
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
  
  // Sorting and UI state
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'name' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [selectedTaskAttachments, setSelectedTaskAttachments] = useState<Attachment[]>([]);
  const [selectedTaskName, setSelectedTaskName] = useState('');

  // View switching state
  const [currentView, setCurrentView] = useState<'list' | 'board'>('list');

  // Board view customization state
  const [boardCustomization, setBoardCustomization] = useState({
    showAssignees: true,
    showDueDates: true,
    showPriority: true,
    showSubTaskProgress: true,
    showAttachments: true
  });

  // Effect to set initial filter when filterContext changes
  React.useEffect(() => {
    if (filterContext === 'my') {
      setFilters(prev => ({
        ...prev,
        assignees: [currentUser]
      }));
    } else {
      // Clear assignee filter when switching to 'all'
      setFilters(prev => ({
        ...prev,
        assignees: []
      }));
    }
  }, [filterContext, currentUser]);

  // Combine all tasks from events and personal tasks
  const allTasks = useMemo(() => {
    // Get all event tasks
    const eventTasks = events.flatMap(event =>
      event.tasks.map(task => ({
        ...task,
        eventTitle: event.title
      }))
    );

    // Get personal tasks
    const personalUserTasks = personalTasks.map(task => ({
      ...task,
      eventTitle: undefined
    }));

    return [...eventTasks, ...personalUserTasks];
  }, [events, personalTasks]);

  // Get all available assignees for filter dropdown
  const availableAssignees = useMemo(() => {
    return getAllAssignees(allTasks, events);
  }, [allTasks, events]);

  // Enhanced filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // First apply context filter if needed
    let contextFiltered = allTasks;
    if (filterContext === 'my') {
      contextFiltered = allTasks.filter(task => 
        task.assignees.includes(currentUser) || task.isPersonal
      );
    }
    
    // Then apply the new filtering system
    let filtered = filterTasks(contextFiltered, searchTerm, filters);

    // Then apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'dueDate':
          const aEffectiveDue = getEffectiveDueDate(a);
          const bEffectiveDue = getEffectiveDueDate(b);
          if (!aEffectiveDue && !bEffectiveDue) comparison = 0;
          else if (!aEffectiveDue) comparison = 1;
          else if (!bEffectiveDue) comparison = -1;
          else comparison = new Date(aEffectiveDue).getTime() - new Date(bEffectiveDue).getTime();
          break;
        case 'priority':
          const priorityOrder = { 'Urgent': 0, 'High': 1, 'Normal': 2, 'Low': 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          const statusOrder = { 'To Do': 0, 'In Progress': 1, 'Done': 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allTasks, searchTerm, filters, sortBy, sortOrder, filterContext, currentUser]);

  // Get search and filter statistics
  const searchStats = useMemo(() => {
    return getSearchStats(
      allTasks.length,
      filteredAndSortedTasks.length,
      events.length,
      events.length
    );
  }, [allTasks.length, filteredAndSortedTasks.length, events.length]);

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    // In a real app, this would update the task's sub-task completion status
    console.log(`Toggle sub-task ${subTaskId} for task ${taskId}`);
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    const colors = {
      'Urgent': 'text-red-500',
      'High': 'text-orange-500', 
      'Normal': 'text-blue-500',
      'Low': 'text-gray-400'
    };
    return colors[priority as keyof typeof colors] || colors.Normal;
  };

  const handleViewAttachments = (attachments: Attachment[], taskName: string) => {
    setSelectedTaskAttachments(attachments);
    setSelectedTaskName(taskName);
    setShowAttachmentsModal(true);
  };

  return (
    <div className="flex min-h-full">
      {/* Left Sidebar */}
      <Sidebar
        currentView="allTasks"
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToEvents={onNavigateToEvents}
        onNavigateToTasks={onNavigateToTasks}
        onNavigateToCalendar={onNavigateToCalendar}
        onNavigateToSettings={onNavigateToSettings}
        onStyleGuide={onStyleGuide}
      />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-muted/20 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground">All Tasks</h1>
              <p className="text-muted-foreground mt-2">
                Manage all your tasks across events and personal projects
              </p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={onCreateTask}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>

          {/* Enhanced Search and Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <SearchAndFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableAssignees={availableAssignees}
                  showTaskFilters={true}
                  placeholder="Search all tasks and events..."
                />
                
                {/* Sort Options and View Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>Showing {searchStats.tasks.showing} of {searchStats.tasks.total} tasks</span>
                    {searchStats.tasks.percentage < 100 && (
                      <span>({searchStats.tasks.percentage}% match)</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* View Switcher */}
                    <ViewSwitcher 
                      currentView={currentView} 
                      onViewChange={setCurrentView}
                    />
                    
                    {/* Customize View Button - Show for both list and board views */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings2 className="w-4 h-4 mr-2" />
                          Customize View
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 z-50" align="end" sideOffset={8}>
                        <div className="space-y-4">
                          {currentView === 'list' ? (
                            // List View Options (future implementation)
                            <div className="space-y-3">
                              <h4 className="font-medium">Customize Table</h4>
                              <p className="text-sm text-muted-foreground">
                                Table customization options will be available in a future update.
                              </p>
                            </div>
                          ) : (
                            // Board View Options
                            <div className="space-y-3">
                              <h4 className="font-medium">Board Customization</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium text-foreground">Show Assignees</label>
                                  <Switch 
                                    checked={boardCustomization.showAssignees}
                                    onCheckedChange={(checked) => setBoardCustomization(prev => ({
                                      ...prev,
                                      showAssignees: checked
                                    }))}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium text-foreground">Show Due Dates</label>
                                  <Switch 
                                    checked={boardCustomization.showDueDates}
                                    onCheckedChange={(checked) => setBoardCustomization(prev => ({
                                      ...prev,
                                      showDueDates: checked
                                    }))}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium text-foreground">Show Priority</label>
                                  <Switch 
                                    checked={boardCustomization.showPriority}
                                    onCheckedChange={(checked) => setBoardCustomization(prev => ({
                                      ...prev,
                                      showPriority: checked
                                    }))}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium text-foreground">Show Sub-task Progress</label>
                                  <Switch 
                                    checked={boardCustomization.showSubTaskProgress}
                                    onCheckedChange={(checked) => setBoardCustomization(prev => ({
                                      ...prev,
                                      showSubTaskProgress: checked
                                    }))}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium text-foreground">Show Attachments</label>
                                  <Switch 
                                    checked={boardCustomization.showAttachments}
                                    onCheckedChange={(checked) => setBoardCustomization(prev => ({
                                      ...prev,
                                      showAttachments: checked
                                    }))}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value: any) => {
                      const [by, order] = value.split('-');
                      setSortBy(by);
                      setSortOrder(order);
                    }}>
                      <SelectTrigger className="w-[180px]">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dueDate-asc">Due Date (Earliest)</SelectItem>
                        <SelectItem value="dueDate-desc">Due Date (Latest)</SelectItem>
                        <SelectItem value="priority-asc">Priority (High to Low)</SelectItem>
                        <SelectItem value="priority-desc">Priority (Low to High)</SelectItem>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                        <SelectItem value="status-asc">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Content - Conditional Rendering for List/Board View */}
          <Card className="min-h-[500px] flex flex-col">
            <CardContent className={`${currentView === 'board' ? "p-6" : "p-0"} flex-1 flex flex-col`}>
              {filteredAndSortedTasks.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <CheckSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No tasks assigned</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchTerm || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f && f !== true) ? (
                      'Event tasks and personal tasks will appear here when they match your current filters.'
                    ) : (
                      'Event tasks and personal tasks will appear here.'
                    )}
                  </p>
                  {!searchTerm && !Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f && f !== true) && (
                    <Button onClick={onCreateTask} className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Personal Task
                    </Button>
                  )}
                </div>
              ) : currentView === 'board' ? (
                <KanbanBoard 
                  tasks={filteredAndSortedTasks}
                  onTaskStatusChange={(taskId, newStatus) => onStatusChange?.(taskId, newStatus)}
                  onTaskAction={onTaskAction}
                  customization={boardCustomization}
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assignees</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedTasks.map((task) => (
                      <React.Fragment key={task.id}>
                        <TableRow className="group hover:bg-muted/50">
                          <TableCell>
                            {task.subTasks && task.subTasks.length > 0 ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTaskExpansion(task.id)}
                                className="h-6 w-6 p-0"
                              >
                                {expandedTasks.has(task.id) ? 
                                  <ChevronDown className="w-4 h-4" /> : 
                                  <ChevronRight className="w-4 h-4" />
                                }
                              </Button>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <SearchResultHighlight
                                  text={task.name}
                                  searchTerm={searchTerm}
                                  className={`font-medium ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}
                                />
                                {/* Attachments indicator */}
                                {task.attachments && task.attachments.length > 0 && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto w-auto p-0.5 hover:bg-muted/50 rounded"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Paperclip className="w-3 h-3 text-muted-foreground hover:text-primary transition-colors" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80" align="start">
                                      <AttachmentList attachments={task.attachments} compact={true} />
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                              {task.description && (
                                <SearchResultHighlight
                                  text={task.description}
                                  searchTerm={searchTerm}
                                  className="text-sm text-muted-foreground"
                                />
                              )}
                              {task.subTasks && task.subTasks.length > 0 && (
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <CheckSquare className="w-3 h-3" />
                                  <span>
                                    {task.subTasks.filter(st => st.completed).length} of {task.subTasks.length} completed
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityBadgeColor(task.priority)}>
                              <Flag className={`w-3 h-3 mr-1 ${getPriorityIcon(task.priority)}`} />
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge 
                                  variant="secondary"
                                  className={`cursor-pointer hover:opacity-80 transition-opacity ${
                                    task.status === 'To Do' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : ''
                                  }${task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}${
                                    task.status === 'Done' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''
                                  }`}
                                >
                                  {task.status}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem 
                                  onClick={() => onStatusChange?.(task.id, 'To Do')}
                                  className={`cursor-pointer ${task.status === 'To Do' ? 'bg-muted' : ''}`}
                                >
                                  To Do
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => onStatusChange?.(task.id, 'In Progress')}
                                  className={`cursor-pointer ${task.status === 'In Progress' ? 'bg-muted' : ''}`}
                                >
                                  In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => onStatusChange?.(task.id, 'Done')}
                                  className={`cursor-pointer ${task.status === 'Done' ? 'bg-muted' : ''}`}
                                >
                                  Done
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {task.assignees.slice(0, 3).map((assignee, index) => (
                                <Avatar key={assignee} className="w-6 h-6">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {assignee.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {task.assignees.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                  +{task.assignees.length - 3}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {task.eventTitle || (
                              <span className="text-muted-foreground italic">Personal</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const effectiveDueDate = getEffectiveDueDate(task);
                              return effectiveDueDate ? (
                                <div className="text-sm">
                                  {new Date(effectiveDueDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => onTaskAction?.(task.id, 'view')}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {task.isPersonal ? 'View Task' : 'View Task in Event'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onTaskAction?.(task.id, 'edit')}>
                                  <Edit3 className="mr-2 h-4 w-4" />
                                  Edit Task
                                </DropdownMenuItem>
                                {task.attachments && task.attachments.length > 0 && (
                                  <DropdownMenuItem onClick={() => handleViewAttachments(task.attachments!, task.name)}>
                                    <Paperclip className="mr-2 h-4 w-4" />
                                    View Attachments
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'Done')}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark as Complete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded sub-tasks */}
                        {expandedTasks.has(task.id) && task.subTasks && task.subTasks.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/30 p-4">
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">Sub-tasks:</h4>
                                <div className="space-y-2">
                                  {task.subTasks.map((subTask) => (
                                    <div key={subTask.id} className="flex items-center space-x-3 pl-4">
                                      <Checkbox
                                        checked={subTask.completed}
                                        onCheckedChange={() => onSubTaskToggle?.(task.id, subTask.id)}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                      />
                                      <span className={`text-sm ${subTask.completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {subTask.name}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              )}

              {filteredAndSortedTasks.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-12">
                    <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No tasks found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || filters.status.length > 0 || filters.priority.length > 0 || filters.assignees.length > 0 || filters.dateRange?.from
                        ? 'Try adjusting your filters to see more tasks.'
                        : 'Create your first task to get started.'}
                    </p>
                    {(searchTerm || filters.status.length > 0 || filters.priority.length > 0 || filters.assignees.length > 0 || filters.dateRange?.from) && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm('');
                          setFilters({
                            status: [],
                            priority: [],
                            assignees: [],
                            dateRange: { from: null, to: null }
                          });
                        }}
                        className="text-sm"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Attachments View Modal */}
      <AttachmentViewModal
        isOpen={showAttachmentsModal}
        attachments={selectedTaskAttachments}
        taskName={selectedTaskName}
        onClose={() => {
          setShowAttachmentsModal(false);
          setSelectedTaskAttachments([]);
          setSelectedTaskName('');
        }}
      />
    </div>
  );
}