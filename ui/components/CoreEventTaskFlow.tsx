import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Calendar,
  Clock,
  MapPin,
  Home,
  CheckSquare,
  Settings,
  Search,
  Bell,
  Plus,
  ChevronRight,
  X,
  Users,
  UserPlus
} from 'lucide-react';

interface Task {
  id: string;
  name: string;
  assignee: string;
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  progress: number;
  tasks: Task[];
  members: string[];
  coverImage?: string;
  color?: string;
}

interface CoreEventTaskFlowProps {
  onBack?: () => void;
}

export function CoreEventTaskFlow({ onBack }: CoreEventTaskFlowProps) {
  // Import utility function
  const getEffectiveDueDate = (task: {
    startDate?: string;
    endDate?: string;
    dueDate?: string;
  }): string | null => {
    // If task has a time period (start and end dates), the due date is the end date
    if (task.startDate && task.endDate) {
      return task.endDate;
    }
    
    // Otherwise, use the regular due date
    return task.dueDate || null;
  };

  // Mock data for demonstration
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Software Engineering Final Project',
      date: '2025-10-15',
      time: '09:00',
      location: 'Computer Lab A',
      description: 'Final project presentation and demo for the Software Engineering course. Teams will present their completed applications and demonstrate key features.',
      progress: 75,
      tasks: [
        { id: '1', name: 'Design UI Mockups', assignee: 'Alex Johnson', status: 'Done', dueDate: '2025-09-20' },
        { id: '2', name: 'Implement Backend API', assignee: 'Sarah Chen', status: 'Done', dueDate: '2025-09-25' },
        { id: '3', name: 'Frontend Development', assignee: 'Michael Brown', status: 'In Progress', dueDate: '2025-10-01' },
        { id: '4', name: 'Testing & Bug Fixes', assignee: 'Emily Davis', status: 'To Do', dueDate: '2025-10-10' },
        { id: '5', name: 'Prepare Presentation', assignee: 'Alex Johnson', status: 'To Do', dueDate: '2025-10-14' }
      ],
      members: ['Alex Johnson', 'Sarah Chen', 'Michael Brown', 'Emily Davis']
    },
    {
      id: '2',
      title: 'Study Group Session',
      date: '2025-09-29',
      time: '14:00',
      location: 'Library Room 203',
      description: 'Weekly study group for Advanced Algorithms course preparation.',
      progress: 60,
      tasks: [
        { id: '6', name: 'Review Chapter 12', assignee: 'David Wilson', status: 'Done', dueDate: '2025-09-27' },
        { id: '7', name: 'Solve Practice Problems', assignee: 'Lisa Garcia', status: 'In Progress', dueDate: '2025-09-28' },
        { id: '8', name: 'Prepare Discussion Questions', assignee: 'Tom Miller', status: 'To Do', dueDate: '2025-09-29' }
      ],
      members: ['David Wilson', 'Lisa Garcia', 'Tom Miller']
    },
    {
      id: '3',
      title: 'Campus Hackathon 2025',
      date: '2025-10-28',
      time: '10:00',
      location: 'Engineering Building',
      description: '48-hour coding competition with prizes and internship opportunities.',
      progress: 30,
      tasks: [
        { id: '9', name: 'Team Registration', assignee: 'Alex Johnson', status: 'Done', dueDate: '2025-10-10' },
        { id: '10', name: 'Idea Brainstorming', assignee: 'Sarah Chen', status: 'In Progress', dueDate: '2025-10-20' },
        { id: '11', name: 'Tech Stack Research', assignee: 'Michael Brown', status: 'To Do', dueDate: '2025-10-25' }
      ],
      members: ['Alex Johnson', 'Sarah Chen', 'Michael Brown']
    }
  ];

  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'create-modal' | 'event-detail'>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<Event>(mockEvents[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  // Create Event Modal State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'To Do':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Done':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCreateEvent = () => {
    setShowCreateModal(false);
    setCurrentScreen('event-detail');
    // In a real app, this would create the event and navigate
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setCurrentScreen('event-detail');
  };

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      // In a real app, this would add the task to the event
      setNewTaskName('');
      setShowAddTask(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-muted/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Core Event & Task Management Flow</h1>
          <p className="text-muted-foreground">Three interconnected screens demonstrating the complete event management workflow</p>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="mt-4">
              Back to App
            </Button>
          )}
        </div>

        {/* Navigation Pills */}
        <div className="flex justify-center space-x-2">
          <Button 
            variant={currentScreen === 'dashboard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentScreen('dashboard')}
            className={currentScreen === 'dashboard' ? 'bg-primary text-white' : ''}
          >
            1. Dashboard
          </Button>
          <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
          <Button 
            variant={currentScreen === 'create-modal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {setCurrentScreen('create-modal'); setShowCreateModal(true);}}
            className={currentScreen === 'create-modal' ? 'bg-primary text-white' : ''}
          >
            2. Create Event
          </Button>
          <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
          <Button 
            variant={currentScreen === 'event-detail' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentScreen('event-detail')}
            className={currentScreen === 'event-detail' ? 'bg-primary text-white' : ''}
          >
            3. Event Detail
          </Button>
        </div>

        {/* Screen Content */}
        <div className="relative">
          {/* 1. Dashboard Screen */}
          {currentScreen === 'dashboard' && (
            <div className="bg-white rounded-lg border shadow-sm min-h-[700px]">
              {/* Top Navigation */}
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
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="w-5 h-5" />
                    </Button>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-white text-sm">AJ</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </header>

              <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-border h-[calc(700px-73px)]">
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

                {/* Main Content */}
                <main className="flex-1 p-8 bg-muted/20">
                  <div className="space-y-6">
                    {/* Header with Create Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground">My Events</h1>
                        <p className="text-muted-foreground mt-1">Manage your events and track progress</p>
                      </div>
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-white"
                        onClick={() => {setCurrentScreen('create-modal'); setShowCreateModal(true);}}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </div>

                    {/* Event Cards Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockEvents.map((event) => (
                        <Card 
                          key={event.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm"
                          onClick={() => handleEventClick(event)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                                <div className="flex items-center text-sm text-muted-foreground mt-2 space-x-4">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formatDate(event.date)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{event.progress}%</span>
                                </div>
                                <Progress value={event.progress} className="h-2" />
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{event.tasks.length} tasks</span>
                                <div className="flex space-x-1">
                                  {event.members.slice(0, 3).map((member, index) => (
                                    <Avatar key={index} className="w-6 h-6">
                                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {getInitials(member)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {event.members.length > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                      +{event.members.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </main>
              </div>
            </div>
          )}

          {/* 2. Create Event Modal Overlay */}
          {currentScreen === 'create-modal' && showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-xl font-semibold text-foreground">Create New Event</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {setShowCreateModal(false); setCurrentScreen('dashboard');}}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-title">Event Title *</Label>
                      <Input
                        id="event-title"
                        placeholder="Enter event title"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        className="bg-white border-border"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-date">Date & Time</Label>
                        <Input
                          id="event-date"
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="bg-white border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-time">Time</Label>
                        <Input
                          id="event-time"
                          type="time"
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          className="bg-white border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-location">Location</Label>
                      <Input
                        id="event-location"
                        placeholder="Event location (optional)"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        className="bg-white border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea
                        id="event-description"
                        placeholder="Describe your event..."
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        className="bg-white border-border min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Invite Team Members</Label>
                      <Select>
                        <SelectTrigger className="bg-white border-border">
                          <SelectValue placeholder="Search and add participants" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alex">Alex Johnson</SelectItem>
                          <SelectItem value="sarah">Sarah Chen</SelectItem>
                          <SelectItem value="michael">Michael Brown</SelectItem>
                          <SelectItem value="emily">Emily Davis</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Example avatars */}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-muted-foreground">Selected:</span>
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">AJ</AvatarFallback>
                        </Avatar>
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">SC</AvatarFallback>
                        </Avatar>
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">MB</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
                  <Button 
                    variant="outline" 
                    onClick={() => {setShowCreateModal(false); setCurrentScreen('dashboard');}}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={handleCreateEvent}
                  >
                    Create Event
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Event Detail Page */}
          {currentScreen === 'event-detail' && (
            <div className="bg-white rounded-lg border shadow-sm min-h-[700px]">
              {/* Header Section */}
              <div className="border-b border-border p-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-foreground leading-tight">
                    {selectedEvent.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-8 text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">{new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">{selectedEvent.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">{selectedEvent.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid lg:grid-cols-3 gap-8 p-8">
                {/* Left Column - Task Management */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-foreground">Tasks</h2>
                      <Button 
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white"
                        onClick={() => setShowAddTask(!showAddTask)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>

                    {/* Add Task Input */}
                    {showAddTask && (
                      <div className="flex space-x-2 p-4 bg-muted/50 rounded-lg">
                        <Input
                          placeholder="Enter task name..."
                          value={newTaskName}
                          onChange={(e) => setNewTaskName(e.target.value)}
                          className="flex-1 bg-white border-border"
                        />
                        <Button onClick={handleAddTask} size="sm" className="bg-primary hover:bg-primary/90 text-white">
                          Add
                        </Button>
                        <Button onClick={() => setShowAddTask(false)} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* Task List */}
                    <div className="space-y-3">
                      {selectedEvent.tasks.map((task, index) => (
                        <div 
                          key={task.id} 
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                          } hover:bg-muted/50`}
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <Checkbox 
                              checked={task.status === 'Done'}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <div className="flex-1">
                              <p className={`font-medium ${task.status === 'Done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {task.name}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(task.assignee)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-foreground font-medium min-w-0">
                                {task.assignee}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <span className="text-sm text-muted-foreground">
                              {(() => {
                                const effectiveDueDate = getEffectiveDueDate(task);
                                return effectiveDueDate ? formatDate(effectiveDueDate) : 'No due date';
                              })()}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`${getStatusColor(task.status)} cursor-pointer hover:opacity-80`}
                            >
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Event Overview & Details */}
                <div className="space-y-6">
                  {/* Overall Progress Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Overall Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-center">
                        <div className="text-4xl font-bold text-foreground">
                          {selectedEvent.progress}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedEvent.tasks.filter(t => t.status === 'Done').length} of {selectedEvent.tasks.length} tasks completed
                        </p>
                        <Progress value={selectedEvent.progress} className="h-4 bg-muted" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Members Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Team Members</CardTitle>
                        <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary hover:text-white">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedEvent.members.map((member, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {getInitials(member)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{member}</p>
                              <p className="text-sm text-muted-foreground">Team Member</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed">
                        {selectedEvent.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}