import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { AspectRatio } from './ui/aspect-ratio';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatEventDateRange, isCurrentlyActive, calculateDuration } from '../utils/timeUtils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  ArrowLeft, 
  Edit, 
  Share,
  Clock, 
  Calendar,
  MapPin,
  Plus,
  UserPlus,
  MoreVertical,
  Edit3,
  Trash2,
  Send,
  MessageCircle,
  AtSign,
  Flag,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Settings,
  Save,
  Users,
  TrendingUp,
  ListTodo
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowUpDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { AddTaskModal } from './AddTaskModal';
import { ViewSwitcher } from './ViewSwitcher';
import { KanbanBoard } from './KanbanBoard';
import { SaveTemplateModal } from './SaveTemplateModal';
import { AttachmentList } from './AttachmentList';
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

interface EventDetailProps {
  event: Event;
  currentUser: string;
  onBack: () => void;
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onTaskAction?: (taskId: string, action: 'edit' | 'reassign' | 'setDueDate' | 'delete') => void;
  onEditEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onInviteMembers?: () => void;
  onSaveTemplate?: (eventId: string, templateData: { name: string; description: string }) => void;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  mentions?: string[];
}

interface EventDiscussionProps {
  eventId: string;
  members: string[];
  currentUser: string;
}

// Mock messages data
const mockMessages: { [eventId: string]: Message[] } = {
  '1': [
    {
      id: 'm1',
      sender: 'Sarah Chen',
      content: 'Great work on securing the venue everyone! 🎉',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      id: 'm2',
      sender: 'Michael Brown',
      content: 'Thanks @Sarah Chen! Should we start working on the speaker list now?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      mentions: ['Sarah Chen']
    },
    {
      id: 'm3',
      sender: 'Alex Johnson',
      content: 'I can reach out to my contacts at Google and Microsoft for speakers.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: 'm4',
      sender: 'Emily Davis',
      content: 'Perfect! I\'ll handle the registration system setup. ETA by Friday.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    }
  ],
  '2': [
    {
      id: 'm5',
      sender: 'David Wilson',
      content: 'Hey team! I\'ve prepared the study materials for tomorrow\'s session.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    },
    {
      id: 'm6',
      sender: 'Lisa Garcia',
      content: 'Awesome @David Wilson! I got us Room 203 reserved. See everyone at 2 PM tomorrow!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
      mentions: ['David Wilson']
    }
  ]
};

function EventDiscussion({ eventId, members, currentUser }: EventDiscussionProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages[eventId] || []);
  const [newMessage, setNewMessage] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours < 1) {
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return timestamp.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Handle @ mentions
  const handleInputChange = (value: string) => {
    setNewMessage(value);
    
    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      // Just typed @, show all members
      setMentionSuggestions(members.filter(member => member !== currentUser));
      setShowMentions(true);
    } else if (lastAtIndex !== -1) {
      // Find the text after the last @
      const searchTerm = value.substring(lastAtIndex + 1).toLowerCase();
      if (searchTerm && !searchTerm.includes(' ')) {
        const filtered = members.filter(member => 
          member !== currentUser && 
          member.toLowerCase().includes(searchTerm)
        );
        setMentionSuggestions(filtered);
        setShowMentions(filtered.length > 0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Insert mention
  const insertMention = (memberName: string) => {
    const lastAtIndex = newMessage.lastIndexOf('@');
    const beforeAt = newMessage.substring(0, lastAtIndex);
    const newValue = beforeAt + `@${memberName} `;
    setNewMessage(newValue);
    setShowMentions(false);
  };

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Extract mentions
    const mentionMatches = newMessage.match(/@(\w+(?:\s+\w+)*)/g);
    const mentions = mentionMatches 
      ? mentionMatches.map(match => match.substring(1)).filter(name => members.includes(name))
      : undefined;

    const message: Message = {
      id: `m_${Date.now()}`,
      sender: currentUser,
      content: newMessage,
      timestamp: new Date(),
      mentions
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-1 min-h-full flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm mb-2">No messages yet</p>
                  <p className="text-xs">Start the conversation with your team!</p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(message.sender)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline space-x-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {message.sender}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed break-words word-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Spacer to push content up when there are few messages */}
                {messages.length < 4 && (
                  <div className="flex-1 flex items-center justify-center py-4">
                    <div className="text-center text-muted-foreground/60">
                      <div className="flex items-center justify-center space-x-2 text-xs">
                        <div className="w-8 h-px bg-border"></div>
                        <span>Keep the conversation going</span>
                        <div className="w-8 h-px bg-border"></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="flex-shrink-0 mt-3 space-y-2">
        {showMentions && mentionSuggestions.length > 0 && (
          <Card className="p-2">
            <div className="space-y-1">
              {mentionSuggestions.map((member) => (
                <button
                  key={member}
                  onClick={() => insertMention(member)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center space-x-2"
                >
                  <AtSign className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{member}</span>
                </button>
              ))}
            </div>
          </Card>
        )}
        
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Type a message... (use @ to mention)"
              value={newMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="resize-none"
            />
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EventDetail({
  event,
  currentUser,
  onBack,
  onTaskStatusChange,
  onAddTask,
  onTaskAction,
  onEditEvent,
  onDeleteEvent,
  onInviteMembers,
  onSaveTemplate
}: EventDetailProps) {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'board'>('list');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'name'>('dueDate');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [showCoverImage, setShowCoverImage] = useState(true);
  
  const [boardCustomization, setBoardCustomization] = useState({
    showAssignees: true,
    showDueDates: true,
    showPriority: true,
    showSubTaskProgress: true,
    showAttachments: true
  });

  // Calculate task statistics
  const totalTasks = event.tasks.length;
  const completedTasks = event.tasks.filter(task => task.status === 'Done').length;
  const inProgressTasks = event.tasks.filter(task => task.status === 'In Progress').length;
  const todoTasks = event.tasks.filter(task => task.status === 'To Do').length;

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
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

  // Helper function to format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Get priority color
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'High':
        return 'bg-warning text-warning-foreground';
      case 'Normal':
        return 'bg-primary/20 text-primary';
      case 'Low':
        return 'bg-muted text-muted-foreground';
    }
  };

  // Get status color
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Done':
        return 'bg-secondary/20 text-secondary hover:bg-secondary/30';
      case 'In Progress':
        return 'bg-warning/20 text-warning hover:bg-warning/30';
      case 'To Do':
        return 'bg-muted text-muted-foreground hover:bg-muted/70';
    }
  };

  // Sort tasks
  const sortedTasks = [...event.tasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { 'Urgent': 0, 'High': 1, 'Normal': 2, 'Low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'status':
        const statusOrder = { 'To Do': 0, 'In Progress': 1, 'Done': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    onTaskStatusChange(taskId, newStatus);
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top Bar */}
      <div className="bg-white border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onBack}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">
                {event.title}
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditEvent?.(event.id)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Event
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowSaveTemplateModal(true)}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Template
              </Button>
              <Button 
                variant="outline"
                size="sm"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              {onDeleteEvent && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column - Event Picture & Widgets */}
            <div className="lg:col-span-4 space-y-6">
              {/* Event Picture */}
              {showCoverImage && (
                <Card className="border-0 shadow-sm overflow-hidden">
                  <div className="relative">
                    <AspectRatio ratio={16 / 9}>
                      {event.coverImage ? (
                        <ImageWithFallback
                          src={event.coverImage}
                          alt={event.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: event.color || '#E8F4FD' }}
                        >
                          <Calendar className="w-16 h-16 text-primary/40" />
                        </div>
                      )}
                    </AspectRatio>
                    
                    {/* Image Controls */}
                    <div className="absolute top-3 right-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCoverImage(false)}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white"
                      >
                        Hide Photo
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Show Photo Button when hidden */}
              {!showCoverImage && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="py-4">
                      <Calendar className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <Button
                        variant="outline"
                        onClick={() => setShowCoverImage(true)}
                        className="border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        Show Photo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Event Details Card */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  {/* Enhanced Time Period Display */}
                  <div className={`flex items-center space-x-3 ${
                    isCurrentlyActive(event) 
                      ? 'text-primary font-medium' 
                      : 'text-muted-foreground'
                  }`}>
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm">{formatEventDateRange(event)}</span>
                      {isCurrentlyActive(event) && (
                        <Badge variant="outline" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                          Active Now
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Duration for multi-day events */}
                  {event.endDate && event.endDate !== event.date && (
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <Calendar className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">
                        Duration: {calculateDuration(event.date, event.endDate, event.time, event.endTime)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                  {event.description && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-foreground leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Widgets - 3 Cards */}
              <div className="grid grid-cols-3 gap-3">
                {/* Progress Widget */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Progress
                    </div>
                  </CardContent>
                </Card>

                {/* Members Widget */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-secondary" />
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {event.members.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Members
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks Widget */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <ListTodo className="w-6 h-6 mx-auto mb-2 text-warning" />
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {todoTasks + inProgressTasks}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pending
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Team Members Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Team Members</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onInviteMembers}
                      className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Invite
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {event.members.map((member) => (
                    <div key={member} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground flex-1">{member}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Event Discussion Card */}
              <Card className="border-0 shadow-sm flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-base flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Discussion
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 min-h-0">
                  <div className="h-[300px] flex flex-col">
                    <EventDiscussion 
                      eventId={event.id}
                      members={event.members}
                      currentUser={currentUser}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tasks (Full Height) */}
            <div className="lg:col-span-8">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Tasks</CardTitle>
                    <div className="flex items-center space-x-2">
                      {/* View Switcher */}
                      <ViewSwitcher 
                        currentView={currentView} 
                        onViewChange={setCurrentView}
                      />
                      
                      {/* Sort By Dropdown */}
                      {currentView === 'list' && (
                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                          <SelectTrigger className="w-48">
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dueDate">Due Date (Soonest)</SelectItem>
                            <SelectItem value="priority">Priority (Highest)</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                            <SelectItem value="name">Task Name (A-Z)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      
                      {/* Add Task Button */}
                      <Button 
                        onClick={() => setShowAddTaskModal(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentView === 'list' ? (
                    // List View
                    <div className="space-y-2">
                      {sortedTasks.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="mb-4">No tasks yet. Create your first task to get started!</p>
                          <Button 
                            onClick={() => setShowAddTaskModal(true)}
                            variant="outline"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Task
                          </Button>
                        </div>
                      ) : (
                        sortedTasks.map((task) => (
                          <Card key={task.id} className="border border-border hover:border-primary/50 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                {/* Checkbox */}
                                <Checkbox
                                  checked={task.status === 'Done'}
                                  onCheckedChange={(checked) => {
                                    handleStatusChange(task.id, checked ? 'Done' : 'To Do');
                                  }}
                                  className="mt-1"
                                />

                                {/* Task Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className={`font-medium text-foreground mb-1 ${task.status === 'Done' ? 'line-through opacity-60' : ''}`}>
                                        {task.name}
                                      </h4>
                                      {task.description && (
                                        <p className="text-sm text-muted-foreground">
                                          {task.description}
                                        </p>
                                      )}
                                    </div>
                                    
                                    {/* Task Actions Dropdown */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem 
                                          onClick={() => onTaskAction?.(task.id, 'edit')}
                                          className="cursor-pointer"
                                        >
                                          <Edit3 className="mr-2 h-4 w-4" />
                                          Edit Task
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => onTaskAction?.(task.id, 'delete')}
                                          className="cursor-pointer text-destructive focus:text-destructive"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete Task
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  {/* Task Metadata */}
                                  <div className="flex flex-wrap items-center gap-3">
                                    {/* Status Badge with Dropdown */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${getStatusColor(task.status)}`}>
                                          {task.status}
                                          <ChevronDown className="w-3 h-3 ml-1" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="start">
                                        <DropdownMenuItem 
                                          onClick={() => handleStatusChange(task.id, 'To Do')}
                                          className="cursor-pointer"
                                        >
                                          <span className="w-2 h-2 rounded-full bg-muted mr-2" />
                                          To Do
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleStatusChange(task.id, 'In Progress')}
                                          className="cursor-pointer"
                                        >
                                          <span className="w-2 h-2 rounded-full bg-warning mr-2" />
                                          In Progress
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleStatusChange(task.id, 'Done')}
                                          className="cursor-pointer"
                                        >
                                          <span className="w-2 h-2 rounded-full bg-secondary mr-2" />
                                          Done
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Priority Badge */}
                                    <Badge variant="secondary" className={`${getPriorityColor(task.priority)} border-0`}>
                                      <Flag className="w-3 h-3 mr-1" />
                                      {task.priority}
                                    </Badge>

                                    {/* Due Date */}
                                    {(() => {
                                      const effectiveDueDate = getEffectiveDueDate(task);
                                      return effectiveDueDate && (
                                        <div className="flex items-center text-xs text-muted-foreground">
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {formatDueDate(effectiveDueDate)}
                                        </div>
                                      );
                                    })()}

                                    {/* Assignees */}
                                    {task.assignees.length > 0 && (
                                      <div className="flex space-x-1">
                                        {task.assignees.slice(0, 3).map((assignee, index) => (
                                          <Avatar key={index} className="w-6 h-6">
                                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                              {getInitials(assignee)}
                                            </AvatarFallback>
                                          </Avatar>
                                        ))}
                                        {task.assignees.length > 3 && (
                                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                            <span className="text-[10px] text-muted-foreground">
                                              +{task.assignees.length - 3}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Sub-tasks indicator */}
                                    {task.subTasks && task.subTasks.length > 0 && (
                                      <button
                                        onClick={() => toggleTaskExpansion(task.id)}
                                        className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        {expandedTaskId === task.id ? (
                                          <ChevronDown className="w-3 h-3 mr-1" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3 mr-1" />
                                        )}
                                        {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length} subtasks
                                      </button>
                                    )}

                                    {/* Attachments indicator */}
                                    {task.attachments && task.attachments.length > 0 && (
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        📎 {task.attachments.length}
                                      </div>
                                    )}
                                  </div>

                                  {/* Expanded Sub-tasks */}
                                  {expandedTaskId === task.id && task.subTasks && task.subTasks.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                                      {task.subTasks.map((subTask) => (
                                        <div key={subTask.id} className="flex items-center space-x-2 pl-4">
                                          <Checkbox
                                            checked={subTask.completed}
                                            onCheckedChange={() => {
                                              // Handle subtask toggle - would need parent handler
                                            }}
                                            className="h-4 w-4"
                                          />
                                          <span className={`text-sm ${subTask.completed ? 'line-through opacity-60' : ''}`}>
                                            {subTask.name}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Expanded Attachments */}
                                  {expandedTaskId === task.id && task.attachments && task.attachments.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border">
                                      <AttachmentList attachments={task.attachments} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  ) : (
                    // Kanban Board View
                    <KanbanBoard
                      tasks={event.tasks}
                      onTaskStatusChange={onTaskStatusChange}
                      onTaskClick={(taskId) => onTaskAction?.(taskId, 'edit')}
                      customization={boardCustomization}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        eventMembers={event.members}
        onClose={() => setShowAddTaskModal(false)}
        onAddTask={(taskData) => {
          onAddTask(taskData);
          setShowAddTaskModal(false);
        }}
      />

      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSaveTemplate={(templateData) => {
          onSaveTemplate?.(event.id, templateData);
          setShowSaveTemplateModal(false);
        }}
      />

      {/* Delete Event Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone and will permanently remove the event and all its associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDeleteEvent?.(event.id);
                setShowDeleteDialog(false);
                onBack(); // Navigate back after deletion
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}