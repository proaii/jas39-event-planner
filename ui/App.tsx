import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { EventDetail } from './components/EventDetail';
import { CreateEventModal } from './components/CreateEventModal';
import { CreateFromTemplateModal } from './components/CreateFromTemplateModal';
import { EditEventModal } from './components/EditEventModal';
import { EditTaskModal } from './components/EditTaskModal';
import { AddTaskModal } from './components/AddTaskModal';
import { PersonalTaskViewModal } from './components/PersonalTaskViewModal';
import { StyleGuide } from './components/StyleGuide';
import { StyleGuidePage } from './components/StyleGuidePage';
import { InviteTeamMembersModal } from './components/InviteTeamMembersModal';
import { UserManagementFlow } from './components/UserManagementFlow';
import { CoreEventTaskFlow } from './components/CoreEventTaskFlow';
import { NotificationSystemFlow } from './components/NotificationSystemFlow';
import { NotificationsPage } from './components/NotificationsPage';
import { UserProfile } from './components/UserProfile';
import { AllEventsPage } from './components/AllEventsPage';
import { AllTasksPage } from './components/AllTasksPage';
import { CalendarPage } from './components/CalendarPage';
import { SettingsPage } from './components/SettingsPage';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { TopNavigation } from './components/TopNavigation';
import { Notification } from './components/NotificationDropdown';

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
  assignees: string[]; // Changed from single assignee to multiple assignees
  dueDate?: string;
  startDate?: string; // Start date for tasks that span multiple days
  endDate?: string; // End date for tasks that span multiple days
  startTime?: string; // Start time for scheduled tasks
  endTime?: string; // End time for scheduled tasks
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  subTasks?: SubTask[];
  attachments?: Attachment[];
  isPersonal?: boolean; // Flag to distinguish personal tasks from event tasks
}

interface Event {
  id: string;
  title: string;
  date: string; // Start date
  endDate?: string; // End date for multi-day events
  time: string;
  endTime?: string; // End time - can be same day or specify days offset (e.g., "17:00" or "10:00+2")
  isMultiDay?: boolean; // Helper flag to indicate if event spans multiple days
  location: string;
  description: string;
  progress: number;
  tasks: Task[];
  members: string[];
  coverImage?: string;
  color?: string; // User-selectable color for events without cover images
}

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  eventData: {
    title: string;
    location: string;
    description: string;
    tasks: Omit<Task, 'id'>[];
    coverImage?: string;
    color?: string;
  };
  createdBy: string;
  createdAt: string;
}

// Mock data for demonstration
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Annual Tech Conference',
    date: '2025-10-15',
    time: '09:00',
    endTime: '17:00',
    location: 'University Auditorium',
    description: 'A comprehensive technology conference featuring industry leaders, workshops, and networking opportunities for students and professionals.',
    progress: 75,
    coverImage: 'https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NTg5MDQ2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tasks: [
      { 
        id: '1', 
        name: 'Book venue', 
        description: 'Reserve the university auditorium for the conference',
        assignees: ['Alex Johnson'], 
        dueDate: '2025-09-30', 
        status: 'Done',
        priority: 'High',
        subTasks: [
          { id: 'st1', name: 'Contact venue coordinator', completed: true },
          { id: 'st2', name: 'Submit booking form', completed: true },
          { id: 'st3', name: 'Confirm booking details', completed: true }
        ]
      },
      { 
        id: '2', 
        name: 'Invite speakers', 
        description: 'Send invitations to industry leaders and keynote speakers',
        assignees: ['Sarah Chen'], 
        dueDate: '2025-10-05', 
        status: 'Done',
        priority: 'Urgent',
        attachments: [
          { id: 'att1', url: 'https://docs.google.com/spreadsheets/d/speaker-list', title: 'Speaker Contact List', favicon: '📊' },
          { id: 'att2', url: 'https://drive.google.com/file/d/invitation-template', title: 'Email Invitation Template', favicon: '📧' }
        ],
        subTasks: [
          { id: 'st4', name: 'Create speaker list', completed: true },
          { id: 'st5', name: 'Draft invitation emails', completed: true },
          { id: 'st6', name: 'Send invitations', completed: true },
          { id: 'st7', name: 'Follow up with responses', completed: true }
        ]
      },
      { 
        id: '3', 
        name: 'Setup registration', 
        description: 'Create online registration system for attendees',
        assignees: ['Michael Brown', 'Emily Davis'], 
        dueDate: '2025-10-12', 
        status: 'In Progress',
        priority: 'High',
        attachments: [
          { id: 'att3', url: 'https://figma.com/design/registration-wireframes', title: 'Registration Form Wireframes', favicon: '🎨' },
          { id: 'att4', url: 'https://stripe.com/docs/payments', title: 'Stripe Payment Documentation', favicon: '💳' }
        ],
        subTasks: [
          { id: 'st8', name: 'Design registration form', completed: true },
          { id: 'st9', name: 'Setup payment processing', completed: false },
          { id: 'st10', name: 'Test registration flow', completed: false }
        ]
      },
      { 
        id: '4', 
        name: 'Prepare marketing materials', 
        description: 'Design posters, flyers, and digital marketing content',
        assignees: ['Emily Davis'], 
        dueDate: '2025-10-10', 
        status: 'To Do',
        priority: 'Normal'
      }
    ],
    members: ['Alex Johnson', 'Sarah Chen', 'Michael Brown', 'Emily Davis']
  },
  {
    id: '2',
    title: 'Study Group Meetup',
    date: '2025-09-29',
    time: '14:00',
    location: 'Library Room 203',
    description: 'Weekly study group session focusing on advanced algorithms and data structures preparation for upcoming exams.',
    progress: 40,
    coverImage: 'https://images.unsplash.com/photo-1758270704840-0ac001215b55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGdyb3VwJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU4ODgxOTQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tasks: [
      { 
        id: '5', 
        name: 'Prepare study materials', 
        description: 'Gather resources and practice problems for the session',
        assignees: ['David Wilson'], 
        dueDate: '2025-09-28', 
        status: 'Done',
        priority: 'High'
      },
      { 
        id: '6', 
        name: 'Book study room', 
        description: 'Reserve Library Room 203 for the meetup',
        assignees: ['Lisa Garcia'], 
        dueDate: '2025-09-29', 
        status: 'In Progress',
        priority: 'Urgent'
      },
      { 
        id: '7', 
        name: 'Send reminders', 
        description: 'Notify all group members about the upcoming session',
        assignees: ['Tom Miller', 'Anna Rodriguez'], 
        dueDate: '2025-09-28', 
        status: 'To Do',
        priority: 'Normal'
      },
      { 
        id: '8', 
        name: 'Setup whiteboard', 
        description: 'Prepare whiteboard and markers for problem solving',
        assignees: ['Anna Rodriguez'], 
        dueDate: '2025-09-29', 
        status: 'To Do',
        priority: 'Low'
      },
      { 
        id: '9', 
        name: 'Bring snacks', 
        description: 'Get refreshments for the study group',
        assignees: ['David Wilson', 'Lisa Garcia'], 
        dueDate: '2025-09-29', 
        status: 'To Do',
        priority: 'Low'
      }
    ],
    members: ['David Wilson', 'Lisa Garcia', 'Tom Miller', 'Anna Rodriguez']
  },
  {
    id: '3',
    title: 'Hackathon 2025',
    date: '2025-10-28',
    endDate: '2025-10-30', // Multi-day event
    time: '10:00',
    endTime: '10:00', // End time on the last day
    isMultiDay: true,
    location: 'Engineering Building',
    description: '48-hour coding competition where teams build innovative solutions to real-world problems. Prizes and internship opportunities available.',
    progress: 20,
    color: '#E8F4FD', // Light blue color for this event
    // Note: No coverImage for this event to demonstrate the color feature
    tasks: [
      { 
        id: '10', 
        name: 'Register team', 
        description: 'Submit team registration for the hackathon',
        assignees: ['Alex Johnson'], 
        dueDate: '2025-10-10', 
        status: 'Done',
        priority: 'High'
      },
      { 
        id: '11', 
        name: 'Brainstorm project ideas', 
        description: 'Generate innovative project concepts for the competition',
        assignees: ['Sarah Chen', 'Michael Brown'], 
        startDate: '2025-10-15',
        endDate: '2025-10-20',
        startTime: '09:00',
        endTime: '17:00',
        dueDate: '2025-10-20', 
        status: 'To Do',
        priority: 'High',
        subTasks: [
          { id: 'st11', name: 'Research problem domains', completed: false },
          { id: 'st12', name: 'Create concept sketches', completed: false },
          { id: 'st13', name: 'Evaluate feasibility', completed: false }
        ]
      },
      { 
        id: '12', 
        name: 'Setup development environment', 
        description: 'Configure development tools and frameworks',
        assignees: ['Michael Brown', 'Emily Davis'], 
        dueDate: '2025-10-22', 
        status: 'To Do',
        priority: 'Normal'
      },
      { 
        id: '13', 
        name: 'Research APIs', 
        description: 'Find and test relevant APIs for the project',
        assignees: ['Emily Davis'], 
        dueDate: '2025-10-24', 
        status: 'To Do',
        priority: 'Normal'
      },
      { 
        id: '14', 
        name: 'Plan presentation', 
        description: 'Create presentation structure and demo flow',
        assignees: ['Alex Johnson', 'Sarah Chen'], 
        dueDate: '2025-10-25', 
        status: 'To Do',
        priority: 'Low'
      }
    ],
    members: ['Alex Johnson', 'Sarah Chen', 'Michael Brown', 'Emily Davis']
  },
  {
    id: '4',
    title: 'Book Club Meeting',
    date: '2025-10-03',
    time: '16:00',
    location: 'Student Lounge',
    description: 'Monthly book club discussion focusing on contemporary literature and academic texts.',
    progress: 60,
    color: '#FEF9E8', // Light yellow color for this event
    tasks: [
      { 
        id: '15', 
        name: 'Select book for discussion', 
        description: 'Choose a book for this month\'s book club meeting',
        assignees: ['Lisa Garcia'], 
        dueDate: '2025-09-20', 
        status: 'Done',
        priority: 'High'
      },
      { 
        id: '16', 
        name: 'Prepare discussion questions', 
        description: 'Create thought-provoking questions for the book discussion',
        assignees: ['Anna Rodriguez', 'Tom Miller'], 
        dueDate: '2025-10-02', 
        status: 'In Progress',
        priority: 'Normal',
        subTasks: [
          { id: 'st14', name: 'Read selected chapters', completed: true },
          { id: 'st15', name: 'Draft initial questions', completed: true },
          { id: 'st16', name: 'Review and refine questions', completed: false }
        ]
      },
      { 
        id: '17', 
        name: 'Reserve meeting space', 
        description: 'Book the Student Lounge for the book club meeting',
        assignees: ['David Wilson'], 
        dueDate: '2025-09-30', 
        status: 'Done',
        priority: 'Normal'
      },
      { 
        id: '18', 
        name: 'Send reading reminders', 
        description: 'Remind members about the reading assignment',
        assignees: ['Lisa Garcia'], 
        dueDate: '2025-10-01', 
        status: 'To Do',
        priority: 'Low'
      }
    ],
    members: ['Lisa Garcia', 'Anna Rodriguez', 'Tom Miller', 'David Wilson']
  },
  {
    id: '5',
    title: 'Photography Workshop',
    date: '2025-10-22',
    time: '13:00',
    location: 'Art Studio 101',
    description: 'Learn the basics of digital photography including composition, lighting, and post-processing techniques.',
    progress: 30,
    color: '#F3ECFF', // Light purple color for this event
    tasks: [
      { 
        id: '19', 
        name: 'Book photography equipment', 
        description: 'Reserve cameras, lenses, and other photography gear',
        assignees: ['Michael Brown'], 
        dueDate: '2025-10-18', 
        status: 'To Do',
        priority: 'High'
      },
      { 
        id: '20', 
        name: 'Create workshop materials', 
        description: 'Develop handouts and presentation slides for the workshop',
        assignees: ['Emily Davis', 'Sarah Chen'], 
        dueDate: '2025-10-20', 
        status: 'In Progress',
        priority: 'Normal'
      },
      { 
        id: '21', 
        name: 'Setup lighting equipment', 
        description: 'Arrange professional lighting setup for the workshop',
        assignees: ['Tom Miller'], 
        dueDate: '2025-10-22', 
        status: 'To Do',
        priority: 'Normal'
      }
    ],
    members: ['Michael Brown', 'Emily Davis', 'Sarah Chen', 'Tom Miller']
  },
  {
    id: '6',
    title: 'University Science Fair',
    date: '2025-11-14',
    endDate: '2025-11-16',
    time: '09:00',
    endTime: '17:00',
    isMultiDay: true,
    location: 'University Campus',
    description: 'Three-day science fair featuring student research projects, guest speakers, and interactive exhibits.',
    progress: 10,
    color: '#E6F7FF', // Light blue color for this event
    tasks: [
      { 
        id: '22', 
        name: 'Submit project proposal', 
        description: 'Complete and submit the research project proposal',
        assignees: ['Alex Johnson'], 
        startDate: '2025-10-15',
        endDate: '2025-10-20',
        startTime: '10:00',
        endTime: '16:00',
        dueDate: '2025-10-20', 
        status: 'To Do',
        priority: 'High'
      },
      { 
        id: '23', 
        name: 'Design exhibition booth', 
        description: 'Create layout and design for the project exhibition booth',
        assignees: ['Sarah Chen', 'Tom Miller'], 
        dueDate: '2025-11-01', 
        status: 'To Do',
        priority: 'Normal'
      },
      { 
        id: '24', 
        name: 'Prepare presentation materials', 
        description: 'Create posters, slides, and demo materials',
        assignees: ['Emily Davis'], 
        dueDate: '2025-11-10', 
        status: 'To Do',
        priority: 'High'
      }
    ],
    members: ['Alex Johnson', 'Sarah Chen', 'Tom Miller', 'Emily Davis']
  }
];

// Personal tasks data for Alex Johnson
const initialPersonalTasks: Task[] = [
  {
    id: 'p1',
    name: 'Complete assignment for CS101',
    description: 'Finish the data structures assignment due this week',
    assignees: ['Alex Johnson'],
    startDate: '2025-10-05',
    endDate: '2025-10-06',
    startTime: '14:00',
    endTime: '18:00',
    dueDate: '2025-10-06',
    status: 'In Progress',
    priority: 'Urgent',
    isPersonal: true,
    attachments: [
      { id: 'att5', url: 'https://github.com/alexjohnson/cs101-assignment', title: 'Assignment Repository', favicon: '💻' },
      { id: 'att6', url: 'https://docs.google.com/document/d/assignment-spec', title: 'Assignment Specification', favicon: '📄' }
    ],
    subTasks: [
      { id: 'pst1', name: 'Implement binary tree', completed: true },
      { id: 'pst2', name: 'Write test cases', completed: false },
      { id: 'pst3', name: 'Document code', completed: false }
    ]
  },
  {
    id: 'p2',
    name: 'Buy groceries',
    description: 'Weekly grocery shopping',
    assignees: ['Alex Johnson'],
    dueDate: '2025-10-01',
    status: 'To Do',
    priority: 'Normal',
    isPersonal: true
  },
  {
    id: 'p3',
    name: 'Gym workout',
    description: 'Cardio and strength training session',
    assignees: ['Alex Johnson'],
    dueDate: '2025-09-30',
    status: 'Done',
    priority: 'Low',
    isPersonal: true
  },
  {
    id: 'p4',
    name: 'Call Mom',
    description: 'Weekly catch-up call with family',
    assignees: ['Alex Johnson'],
    dueDate: '2025-10-03',
    status: 'To Do',
    priority: 'Normal',
    isPersonal: true
  },
  {
    id: 'p5',
    name: 'Review job applications',
    description: 'Go through internship applications for summer 2025',
    assignees: ['Alex Johnson'],
    dueDate: '2025-10-05',
    status: 'To Do',
    priority: 'High',
    isPersonal: true,
    subTasks: [
      { id: 'pst4', name: 'Update resume', completed: true },
      { id: 'pst5', name: 'Research companies', completed: false },
      { id: 'pst6', name: 'Submit applications', completed: false }
    ]
  },
  {
    id: 'p6',
    name: 'Prepare for finals week',
    description: 'Comprehensive study plan for all courses during finals week',
    assignees: ['Alex Johnson'],
    startDate: '2025-12-10',
    endDate: '2025-12-17',
    startTime: '08:00',
    endTime: '22:00',
    status: 'To Do',
    priority: 'Urgent',
    isPersonal: true,
    subTasks: [
      { id: 'pst7', name: 'Create study schedule', completed: false },
      { id: 'pst8', name: 'Review CS101 materials', completed: false },
      { id: 'pst9', name: 'Study for Math exam', completed: false },
      { id: 'pst10', name: 'Prepare Physics lab report', completed: false }
    ]
  },
  {
    id: 'p7',
    name: 'Work on project documentation',
    description: 'Complete documentation for current project',
    assignees: ['Alex Johnson'],
    startDate: '2025-10-05',
    endDate: '2025-10-05',
    startTime: '10:00',
    endTime: '16:00',
    status: 'To Do',
    priority: 'High',
    isPersonal: true
  },
  {
    id: 'p8',
    name: 'Team meeting preparation',
    description: 'Prepare slides and agenda for tomorrow\'s team meeting',
    assignees: ['Alex Johnson'],
    startDate: '2025-10-05',
    endDate: '2025-10-07',
    startTime: '09:00',
    endTime: '17:00',
    status: 'To Do',
    priority: 'High',
    isPersonal: true
  }
];

// Mock template data
const initialTemplates: EventTemplate[] = [
  {
    id: 't1',
    name: 'Study Group Session Template',
    description: 'Standard template for weekly study group meetings',
    eventData: {
      title: 'Study Group Meetup',
      location: 'Library Room 203',
      description: 'Weekly study group session focusing on course material and exam preparation.',
      tasks: [
        { 
          name: 'Prepare study materials', 
          description: 'Gather resources and practice problems for the session',
          assignees: [], 
          status: 'To Do',
          priority: 'High'
        },
        { 
          name: 'Book study room', 
          description: 'Reserve meeting space',
          assignees: [], 
          status: 'To Do',
          priority: 'Urgent'
        },
        { 
          name: 'Send reminders', 
          description: 'Notify all group members about the upcoming session',
          assignees: [], 
          status: 'To Do',
          priority: 'Normal'
        },
        { 
          name: 'Setup whiteboard', 
          description: 'Prepare whiteboard and markers for problem solving',
          assignees: [], 
          status: 'To Do',
          priority: 'Low'
        }
      ],
      color: '#E8F4FD'
    },
    createdBy: 'Alex Johnson',
    createdAt: '2025-09-15'
  },
  {
    id: 't2',
    name: 'Workshop Event Template',
    description: 'Template for organizing educational workshops',
    eventData: {
      title: 'Workshop',
      location: 'TBD',
      description: 'Educational workshop for students.',
      tasks: [
        { 
          name: 'Book equipment', 
          description: 'Reserve necessary equipment and materials',
          assignees: [], 
          status: 'To Do',
          priority: 'High'
        },
        { 
          name: 'Create workshop materials', 
          description: 'Develop handouts and presentation materials',
          assignees: [], 
          status: 'To Do',
          priority: 'Normal'
        },
        { 
          name: 'Setup workspace', 
          description: 'Arrange room layout and equipment',
          assignees: [], 
          status: 'To Do',
          priority: 'Normal'
        }
      ],
      color: '#F3ECFF'
    },
    createdBy: 'Alex Johnson',
    createdAt: '2025-09-20'
  }
];

// Mock notifications data
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'New Event Created',
    message: 'Annual Tech Conference has been created and you have been added as an organizer.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    isRead: false,
    relatedId: '1'
  },
  {
    id: '2',
    type: 'task',
    title: 'Task Assigned',
    message: 'You have been assigned to "Setup registration" for Annual Tech Conference.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    relatedId: '3'
  },
  {
    id: '3',
    type: 'mention',
    title: 'You were mentioned',
    message: 'Sarah Chen mentioned you in a comment on Hackathon 2025.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    isRead: true,
    relatedId: '3'
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Event Reminder',
    message: 'Study Group Meetup is scheduled for tomorrow at 2:00 PM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    relatedId: '2'
  }
];

export default function App() {
  // Initialize dark mode from localStorage or system preference
  React.useEffect(() => {
    const initializeDarkMode = () => {
      const saved = localStorage.getItem('darkMode');
      let shouldBeDark = false;
      
      if (saved !== null) {
        shouldBeDark = JSON.parse(saved);
      } else {
        // Check system preference
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    initializeDarkMode();
  }, []);

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  // Application state
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [personalTasks, setPersonalTasks] = useState<Task[]>(initialPersonalTasks);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [templates, setTemplates] = useState<EventTemplate[]>(initialTemplates);
  const [currentView, setCurrentView] = useState<'dashboard' | 'event' | 'notifications' | 'styleguide' | 'userflow' | 'coreflow' | 'allEvents' | 'allTasks' | 'calendar' | 'settings'>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskEventId, setAddTaskEventId] = useState<string | null>(null);
  const [showAddPersonalTaskModal, setShowAddPersonalTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEventId, setInviteEventId] = useState<string | null>(null);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [saveTemplateEventId, setSaveTemplateEventId] = useState<string | null>(null);
  const [showCreateFromTemplateModal, setShowCreateFromTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
  const [showPersonalTaskViewModal, setShowPersonalTaskViewModal] = useState(false);
  const [viewingPersonalTaskId, setViewingPersonalTaskId] = useState<string | null>(null);
  const [currentUser] = useState('Alex Johnson');
  const [settingsDefaultTab, setSettingsDefaultTab] = useState('profile');

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;

  // Get all unique members across all events for search functionality
  const allMembers = React.useMemo(() => {
    const membersSet = new Set<string>();
    events.forEach(event => {
      event.members.forEach(member => membersSet.add(member));
    });
    return Array.from(membersSet);
  }, [events]);

  const handleCreateEvent = (eventData: {
    title: string;
    date: string;
    endDate?: string;
    time: string;
    endTime?: string;
    isMultiDay?: boolean;
    location: string;
    description: string;
    members: string[];
    coverImage?: string;
    color?: string;
    tasks?: Omit<Task, 'id'>[];
  }) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      ...eventData,
      progress: 0,
      tasks: eventData.tasks?.map(task => ({
        ...task,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })) || []
    };
    setEvents(prev => [newEvent, ...prev]);
    setShowCreateModal(false);
    setSelectedTemplate(null); // Clear selected template
  };

  const handleSelectTemplate = (template: EventTemplate) => {
    setSelectedTemplate(template);
    setShowCreateFromTemplateModal(false);
    setShowCreateModal(true);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('event');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedEventId(null);
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    if (!selectedEventId) return;

    setEvents(prev => prev.map(event => {
      if (event.id === selectedEventId) {
        const updatedTasks = event.tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        );
        const completedTasks = updatedTasks.filter(task => task.status === 'Done').length;
        const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
        
        return {
          ...event,
          tasks: updatedTasks,
          progress
        };
      }
      return event;
    }));
  };

  // Universal status change handler for both event tasks and personal tasks
  const handleUniversalStatusChange = (taskId: string, newStatus: Task['status']) => {
    // Check if it's a personal task
    const isPersonalTask = personalTasks.some(task => task.id === taskId);
    
    if (isPersonalTask) {
      setPersonalTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } else {
      // It's an event task - find the event and update
      setEvents(prev => prev.map(event => {
        const hasTask = event.tasks.some(task => task.id === taskId);
        if (hasTask) {
          const updatedTasks = event.tasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          );
          const completedTasks = updatedTasks.filter(task => task.status === 'Done').length;
          const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
          
          return {
            ...event,
            tasks: updatedTasks,
            progress
          };
        }
        return event;
      }));
    }
  };

  const handleAddTask = (taskData: Omit<Task, 'id'>) => {
    if (!selectedEventId) return;

    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData
    };

    setEvents(prev => prev.map(event => {
      if (event.id === selectedEventId) {
        const updatedTasks = [...event.tasks, newTask];
        const completedTasks = updatedTasks.filter(task => task.status === 'Done').length;
        const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
        
        return {
          ...event,
          tasks: updatedTasks,
          progress
        };
      }
      return event;
    }));
  };

  // Notification handlers
  const handleNotificationMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleNotificationMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleViewAllNotifications = () => {
    setCurrentView('notifications');
  };

  const handleViewProfile = () => {
    setSettingsDefaultTab('profile');
    setCurrentView('settings');
  };

  // Filter context for All Tasks page
  const [allTasksFilter, setAllTasksFilter] = useState<'all' | 'my'>('all');

  // Navigation handlers for new pages
  const handleNavigateToAllEvents = () => {
    setCurrentView('allEvents');
  };

  const handleNavigateToAllTasks = (filterContext?: 'my' | 'all') => {
    setAllTasksFilter(filterContext || 'all');
    setCurrentView('allTasks');
  };

  const handleNavigateToCalendar = () => {
    setCurrentView('calendar');
  };

  const handleNavigateToSettings = () => {
    setSettingsDefaultTab('profile');
    setCurrentView('settings');
  };

  const handleNavigateToStyleGuide = () => {
    setCurrentView('styleguide');
  };

  const handleInviteMembers = (eventId: string) => {
    setInviteEventId(eventId);
    setShowInviteModal(true);
  };

  const handleInviteMembersToEvent = (newMembers: string[]) => {
    if (!inviteEventId) return;

    setEvents(prev => prev.map(event => {
      if (event.id === inviteEventId) {
        const uniqueMembers = [...new Set([...event.members, ...newMembers])];
        return {
          ...event,
          members: uniqueMembers
        };
      }
      return event;
    }));

    setShowInviteModal(false);
    setInviteEventId(null);
  };

  // Add task handler for EventCard kebab menu
  const handleAddTaskFromCard = (eventId: string) => {
    setAddTaskEventId(eventId);
    setShowAddTaskModal(true);
  };

  // Handler for creating personal tasks
  const handleCreatePersonalTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      id: `p_${Date.now()}`,
      ...taskData,
      isPersonal: true
    };

    console.log('Creating personal task:', newTask);
    setPersonalTasks(prev => [newTask, ...prev]);
  };

  // Handler for updating personal tasks
  const handleUpdatePersonalTask = (taskId: string, taskData: {
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
  }) => {
    setPersonalTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...taskData } : task
    ));
  };

  const handleAddTaskFromModal = (taskData: Omit<Task, 'id'>) => {
    if (!addTaskEventId) return;

    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData
    };

    setEvents(prev => prev.map(event => {
      if (event.id === addTaskEventId) {
        const updatedTasks = [...event.tasks, newTask];
        const completedTasks = updatedTasks.filter(task => task.status === 'Done').length;
        const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
        
        return {
          ...event,
          tasks: updatedTasks,
          progress
        };
      }
      return event;
    }));

    setShowAddTaskModal(false);
    setAddTaskEventId(null);
  };

  // Authentication handlers
  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleLogOut = () => {
    setIsLoggedIn(false);
    setAuthView('login');
    setCurrentView('dashboard');
    setSelectedEventId(null);
    setShowCreateModal(false);
  };

  const handleNavigateToRegister = () => {
    setAuthView('register');
  };

  const handleNavigateToLogin = () => {
    setAuthView('login');
  };

  // Enhanced interactivity handlers
  const handleEditEvent = (eventId: string) => {
    setEditingEventId(eventId);
    setShowEditEventModal(true);
  };

  const handleUpdateEvent = (eventId: string, eventData: {
    title: string;
    date: string;
    endDate?: string;
    time: string;
    endTime?: string;
    isMultiDay?: boolean;
    location: string;
    description: string;
    members: string[];
    coverImage?: string;
    color?: string;
  }) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, ...eventData }
        : event
    ));
    setShowEditEventModal(false);
    setEditingEventId(null);
  };

  const handleSaveTemplate = (eventId: string, templateData: { name: string; description: string }) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const newTemplate: EventTemplate = {
      id: `t_${Date.now()}`,
      name: templateData.name,
      description: templateData.description,
      eventData: {
        title: event.title,
        location: event.location,
        description: event.description,
        tasks: event.tasks.map(task => ({
          name: task.name,
          description: task.description,
          assignees: [],
          status: 'To Do' as const,
          priority: task.priority,
          subTasks: task.subTasks?.map(st => ({ ...st, completed: false })),
          attachments: task.attachments
        })),
        coverImage: event.coverImage,
        color: event.color
      },
      createdBy: currentUser,
      createdAt: new Date().toISOString()
    };

    setTemplates(prev => [newTemplate, ...prev]);
    console.log('Template saved:', newTemplate);
  };

  const handleDeleteEvent = (eventId: string) => {
    console.log('Delete event:', eventId);
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handleTaskAction = (taskId: string, action: 'view' | 'complete' | 'edit' | 'delete') => {
    console.log('Task action:', action, 'for task:', taskId);
    
    if (action === 'view') {
      // Find the event containing this task and navigate to it
      const eventWithTask = events.find(event => 
        event.tasks.some(task => task.id === taskId)
      );
      if (eventWithTask) {
        setSelectedEventId(eventWithTask.id);
        setCurrentView('event');
      } else {
        // If it's a personal task, show personal task view modal
        const isPersonalTask = personalTasks.some(task => task.id === taskId);
        if (isPersonalTask) {
          setViewingPersonalTaskId(taskId);
          setShowPersonalTaskViewModal(true);
        }
      }
    } else if (action === 'complete') {
      // Mark task as complete - check both events and personal tasks
      const isPersonalTask = personalTasks.some(task => task.id === taskId);
      
      if (isPersonalTask) {
        setPersonalTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: 'Done' as const } : task
        ));
      } else {
        setEvents(prev => prev.map(event => ({
          ...event,
          tasks: event.tasks.map(task => 
            task.id === taskId ? { ...task, status: 'Done' as const } : task
          )
        })));
      }
    } else if (action === 'edit') {
      // Open edit task modal for both personal and event tasks
      const isPersonalTask = personalTasks.some(task => task.id === taskId);
      
      if (isPersonalTask) {
        setEditingTaskId(taskId);
        setShowEditTaskModal(true);
      } else {
        // Find the event and open edit modal
        const eventWithTask = events.find(event => 
          event.tasks.some(task => task.id === taskId)
        );
        if (eventWithTask) {
          setSelectedEventId(eventWithTask.id);
          setEditingTaskId(taskId);
          setShowEditTaskModal(true);
        }
      }
    } else if (action === 'delete') {
      // Delete task with confirmation - check both events and personal tasks
      const isPersonalTask = personalTasks.some(task => task.id === taskId);
      const task = isPersonalTask 
        ? personalTasks.find(t => t.id === taskId)
        : events.flatMap(e => e.tasks).find(t => t.id === taskId);
      
      if (task && window.confirm(`Are you sure you want to delete "${task.name}"? This action cannot be undone.`)) {
        if (isPersonalTask) {
          setPersonalTasks(prev => prev.filter(task => task.id !== taskId));
        } else {
          // Find the event and remove the task
          setEvents(prev => prev.map(event => {
            const hasTask = event.tasks.some(task => task.id === taskId);
            if (hasTask) {
              const updatedTasks = event.tasks.filter(task => task.id !== taskId);
              const completedTasks = updatedTasks.filter(task => task.status === 'Done').length;
              const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
              
              return {
                ...event,
                tasks: updatedTasks,
                progress
              };
            }
            return event;
          }));
        }
      }
    }
  };

  const handleEventDetailTaskAction = (taskId: string, action: 'edit' | 'reassign' | 'setDueDate' | 'delete') => {
    console.log('Event detail task action:', action, 'for task:', taskId);
    
    if (action === 'edit') {
      setEditingTaskId(taskId);
      setShowEditTaskModal(true);
    } else if (action === 'delete') {
      if (!selectedEventId) return;
      
      // Find the task to show its name in confirmation
      const event = events.find(e => e.id === selectedEventId);
      const task = event?.tasks.find(t => t.id === taskId);
      
      if (task && window.confirm(`Are you sure you want to delete "${task.name}"? This action cannot be undone.`)) {
        setEvents(prev => prev.map(event => {
          if (event.id === selectedEventId) {
            const updatedTasks = event.tasks.filter(task => task.id !== taskId);
            const completedTasks = updatedTasks.filter(task => task.status === 'Done').length;
            const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
            
            return {
              ...event,
              tasks: updatedTasks,
              progress
            };
          }
          return event;
        }));
      }
    } else {
      // In a real app, other actions would open appropriate modals
      console.log(`${action} functionality would be implemented here`);
    }
  };

  const handleUpdateTask = (taskId: string, taskData: {
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
  }) => {
    if (!selectedEventId) return;

    setEvents(prev => prev.map(event => {
      if (event.id === selectedEventId) {
        const updatedTasks = event.tasks.map(task => 
          task.id === taskId ? { ...task, ...taskData } : task
        );
        const completedTasks = updatedTasks.filter(task => task.status === 'Done').length;
        const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
        
        return {
          ...event,
          tasks: updatedTasks,
          progress
        };
      }
      return event;
    }));
    setShowEditTaskModal(false);
    setEditingTaskId(null);
  };

  // If user is not logged in, show authentication screens
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-muted/20">
        {/* Top Navigation for Logged-Out State */}
        <TopNavigation 
          isLoggedIn={false}
          onLogin={() => setAuthView('login')}
          onRegister={() => setAuthView('register')}
        />
        
        {/* Authentication Views */}
        {authView === 'login' && (
          <Login 
            onLogin={handleLogin}
            onNavigateToRegister={handleNavigateToRegister}
          />
        )}
        
        {authView === 'register' && (
          <Register 
            onRegister={handleRegister}
            onNavigateToLogin={handleNavigateToLogin}
          />
        )}
      </div>
    );
  }

  // If user is logged in, show main application
  return (
    <>
      {/* Main Application Views with Integrated Navigation */}
      {(currentView === 'dashboard' || currentView === 'event' || currentView === 'allEvents' || currentView === 'allTasks' || currentView === 'calendar' || currentView === 'settings' || currentView === 'notifications') && (
        <Layout
          currentUser={currentUser}
          isLoggedIn={true}
          notifications={notifications}
          onNotificationMarkAsRead={handleNotificationMarkAsRead}
          onNotificationMarkAllAsRead={handleNotificationMarkAllAsRead}
          onViewAllNotifications={handleViewAllNotifications}
          onViewProfile={handleViewProfile}
          onLogOut={handleLogOut}
          events={events}
          personalTasks={personalTasks}
          allMembers={allMembers}
          onEventClick={handleEventClick}
          onTaskClick={(taskId) => {
            // Handle task clicks from search - open edit modal
            setEditingTaskId(taskId);
            setShowEditTaskModal(true);
          }}
        >
          {currentView === 'dashboard' && (
            <Dashboard
              events={events}
              personalTasks={personalTasks}
              currentUser={currentUser}
              onCreateEvent={() => {
                setSelectedTemplate(null);
                setShowCreateModal(true);
              }}
              onCreateFromTemplate={() => setShowCreateFromTemplateModal(true)}
              onEventClick={handleEventClick}
              onStyleGuide={handleNavigateToStyleGuide}
              onNotifications={() => setCurrentView('notifications')}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onAddTask={handleAddTaskFromCard}
              onTaskAction={handleTaskAction}
              onCreatePersonalTask={() => setShowAddPersonalTaskModal(true)}
              onStatusChange={handleUniversalStatusChange}
              onSubTaskToggle={(taskId, subTaskId) => {
                // Toggle sub-task completion for both personal and event tasks
                const isPersonalTask = personalTasks.some(task => task.id === taskId);
                
                if (isPersonalTask) {
                  setPersonalTasks(prev => prev.map(task => {
                    if (task.id === taskId && task.subTasks) {
                      return {
                        ...task,
                        subTasks: task.subTasks.map(st => 
                          st.id === subTaskId ? { ...st, completed: !st.completed } : st
                        )
                      };
                    }
                    return task;
                  }));
                } else {
                  setEvents(prev => prev.map(event => ({
                    ...event,
                    tasks: event.tasks.map(task => {
                      if (task.id === taskId && task.subTasks) {
                        return {
                          ...task,
                          subTasks: task.subTasks.map(st => 
                            st.id === subTaskId ? { ...st, completed: !st.completed } : st
                          )
                        };
                      }
                      return task;
                    })
                  })));
                }
              }}
              onNavigateToAllEvents={handleNavigateToAllEvents}
              onNavigateToAllTasks={handleNavigateToAllTasks}
              onNavigateToCalendar={handleNavigateToCalendar}
              onNavigateToSettings={handleNavigateToSettings}
            />
          )}

          {currentView === 'event' && selectedEvent && (
            <EventDetail
              event={selectedEvent}
              currentUser={currentUser}
              onBack={handleBackToDashboard}
              onTaskStatusChange={handleTaskStatusChange}
              onAddTask={handleAddTask}
              onTaskAction={handleEventDetailTaskAction}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onInviteMembers={() => handleInviteMembers(selectedEvent.id)}
              onSaveTemplate={handleSaveTemplate}
            />
          )}

          {currentView === 'allEvents' && (
            <AllEventsPage
              events={events}
              onEventClick={handleEventClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onCreateEvent={() => setShowCreateModal(true)}
              onNavigateToDashboard={handleBackToDashboard}
              onNavigateToTasks={handleNavigateToAllTasks}
              onNavigateToCalendar={handleNavigateToCalendar}
              onNavigateToSettings={handleNavigateToSettings}
              onStyleGuide={handleNavigateToStyleGuide}
            />
          )}

          {currentView === 'allTasks' && (
            <AllTasksPage
              events={events}
              personalTasks={personalTasks}
              currentUser={currentUser}
              filterContext={allTasksFilter}
              onTaskAction={handleTaskAction}
              onStatusChange={handleUniversalStatusChange}
              onCreateTask={() => setShowAddPersonalTaskModal(true)}
              onSubTaskToggle={(taskId, subTaskId) => {
                // Toggle sub-task completion for both personal and event tasks
                const isPersonalTask = personalTasks.some(task => task.id === taskId);
                
                if (isPersonalTask) {
                  setPersonalTasks(prev => prev.map(task => {
                    if (task.id === taskId && task.subTasks) {
                      return {
                        ...task,
                        subTasks: task.subTasks.map(st => 
                          st.id === subTaskId ? { ...st, completed: !st.completed } : st
                        )
                      };
                    }
                    return task;
                  }));
                } else {
                  setEvents(prev => prev.map(event => ({
                    ...event,
                    tasks: event.tasks.map(task => {
                      if (task.id === taskId && task.subTasks) {
                        return {
                          ...task,
                          subTasks: task.subTasks.map(st => 
                            st.id === subTaskId ? { ...st, completed: !st.completed } : st
                          )
                        };
                      }
                      return task;
                    })
                  })));
                }
              }}
              onNavigateToDashboard={handleBackToDashboard}
              onNavigateToEvents={handleNavigateToAllEvents}
              onNavigateToTasks={() => {}} // No-op since we're already on tasks
              onNavigateToCalendar={handleNavigateToCalendar}
              onNavigateToSettings={handleNavigateToSettings}
              onStyleGuide={handleNavigateToStyleGuide}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarPage
              events={events}
              personalTasks={personalTasks}
              currentUser={currentUser}
              onEventClick={handleEventClick}
              onTaskClick={(taskId) => {
                // Handle task clicks from calendar - open edit modal
                setEditingTaskId(taskId);
                setShowEditTaskModal(true);
              }}
              onNavigateToDashboard={handleBackToDashboard}
              onNavigateToEvents={handleNavigateToAllEvents}
              onNavigateToTasks={handleNavigateToAllTasks}
              onNavigateToCalendar={() => {}} // No-op since we're already on calendar
              onNavigateToSettings={handleNavigateToSettings}
              onStyleGuide={handleNavigateToStyleGuide}
            />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              currentUser={currentUser}
              onBack={handleBackToDashboard}
              defaultTab={settingsDefaultTab}
              onNavigateToDashboard={handleBackToDashboard}
              onNavigateToEvents={handleNavigateToAllEvents}
              onNavigateToTasks={handleNavigateToAllTasks}
              onNavigateToCalendar={handleNavigateToCalendar}
              onNavigateToSettings={() => {}} // No-op since we're already on settings
              onStyleGuide={handleNavigateToStyleGuide}
            />
          )}

          {currentView === 'notifications' && (
            <NotificationsPage
              notifications={notifications}
              onMarkAsRead={handleNotificationMarkAsRead}
              onMarkAllAsRead={handleNotificationMarkAllAsRead}
              onBack={handleBackToDashboard}
              onStyleGuide={handleNavigateToStyleGuide}
              onNavigateToEvents={handleNavigateToAllEvents}
              onNavigateToTasks={handleNavigateToAllTasks}
              onNavigateToCalendar={handleNavigateToCalendar}
              onNavigateToSettings={handleNavigateToSettings}
            />
          )}
        </Layout>
      )}



      {/* Style Guide Page with Sidebar */}
      {currentView === 'styleguide' && (
        <Layout
          currentUser={currentUser}
          isLoggedIn={true}
          notifications={notifications}
          onNotificationMarkAsRead={handleNotificationMarkAsRead}
          onNotificationMarkAllAsRead={handleNotificationMarkAllAsRead}
          onViewAllNotifications={handleViewAllNotifications}
          onViewProfile={handleViewProfile}
          onLogOut={handleLogOut}
          events={events}
          personalTasks={personalTasks}
          allMembers={allMembers}
          onEventClick={handleEventClick}
          onTaskClick={(taskId) => {
            // Handle task clicks from search - open edit modal
            setEditingTaskId(taskId);
            setShowEditTaskModal(true);
          }}
        >
          <StyleGuidePage
            onBack={handleBackToDashboard}
            onNavigateToDashboard={handleBackToDashboard}
            onNavigateToEvents={handleNavigateToAllEvents}
            onNavigateToTasks={handleNavigateToAllTasks}
            onNavigateToCalendar={handleNavigateToCalendar}
            onNavigateToSettings={handleNavigateToSettings}
          />
        </Layout>
      )}

      {currentView === 'userflow' && (
        <UserManagementFlow onBack={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'coreflow' && (
        <CoreEventTaskFlow onBack={() => setCurrentView('dashboard')} />
      )}

      <CreateEventModal
        isOpen={showCreateModal && isLoggedIn}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedTemplate(null);
        }}
        onCreateEvent={handleCreateEvent}
        template={selectedTemplate}
      />

      {/* Create From Template Modal */}
      <CreateFromTemplateModal
        isOpen={showCreateFromTemplateModal}
        templates={templates}
        onClose={() => setShowCreateFromTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Edit Event Modal */}
      {editingEventId && (
        <EditEventModal
          isOpen={showEditEventModal}
          event={events.find(e => e.id === editingEventId) || null}
          onClose={() => {
            setShowEditEventModal(false);
            setEditingEventId(null);
          }}
          onUpdateEvent={handleUpdateEvent}
          onInviteMembers={() => {
            // Set up invite modal for the event being edited
            setInviteEventId(editingEventId);
            setShowInviteModal(true);
          }}
        />
      )}

      {/* Edit Task Modal */}
      {editingTaskId && (
        <EditTaskModal
          isOpen={showEditTaskModal}
          task={
            // First check personal tasks
            personalTasks.find(t => t.id === editingTaskId) ||
            // Then check event tasks
            (selectedEvent ? selectedEvent.tasks.find(t => t.id === editingTaskId) : null) ||
            // Fallback: search all events for the task
            events.flatMap(e => e.tasks).find(t => t.id === editingTaskId) || 
            null
          }
          eventMembers={
            // For personal tasks, use current user; for event tasks, use event members
            personalTasks.find(t => t.id === editingTaskId) 
              ? [currentUser] 
              : (selectedEvent?.members || events.find(e => e.tasks.some(t => t.id === editingTaskId))?.members || [])
          }
          onClose={() => {
            setShowEditTaskModal(false);
            setEditingTaskId(null);
          }}
          onUpdateTask={(taskId, taskData) => {
            // Check if it's a personal task
            const isPersonalTask = personalTasks.some(t => t.id === taskId);
            
            if (isPersonalTask) {
              handleUpdatePersonalTask(taskId, taskData);
            } else {
              handleUpdateTask(taskId, taskData);
            }
          }}
        />
      )}

      {/* Add Task Modal */}
      {addTaskEventId && (
        <AddTaskModal
          isOpen={showAddTaskModal}
          eventMembers={events.find(e => e.id === addTaskEventId)?.members || []}
          onClose={() => {
            setShowAddTaskModal(false);
            setAddTaskEventId(null);
          }}
          onAddTask={handleAddTaskFromModal}
        />
      )}

      {/* Add Personal Task Modal */}
      <AddTaskModal
        isOpen={showAddPersonalTaskModal}
        eventMembers={[currentUser]}
        onClose={() => setShowAddPersonalTaskModal(false)}
        onAddTask={(taskData) => {
          handleCreatePersonalTask(taskData);
          setShowAddPersonalTaskModal(false);
        }}
      />

      {/* Invite Team Members Modal */}
      {inviteEventId && (
        <InviteTeamMembersModal
          isOpen={showInviteModal}
          currentMembers={events.find(e => e.id === inviteEventId)?.members || []}
          onClose={() => {
            setShowInviteModal(false);
            setInviteEventId(null);
          }}
          onInviteMembers={handleInviteMembersToEvent}
        />
      )}

      {/* Personal Task View Modal */}
      {viewingPersonalTaskId && (
        <PersonalTaskViewModal
          isOpen={showPersonalTaskViewModal}
          task={personalTasks.find(t => t.id === viewingPersonalTaskId) || null}
          onClose={() => {
            setShowPersonalTaskViewModal(false);
            setViewingPersonalTaskId(null);
          }}
          onStatusChange={handleUniversalStatusChange}
          onEdit={(taskId) => {
            setShowPersonalTaskViewModal(false);
            setViewingPersonalTaskId(null);
            setEditingTaskId(taskId);
            setShowEditTaskModal(true);
          }}
          onDelete={(taskId) => {
            setPersonalTasks(prev => prev.filter(task => task.id !== taskId));
            setShowPersonalTaskViewModal(false);
            setViewingPersonalTaskId(null);
          }}
          onSubTaskToggle={(taskId, subTaskId) => {
            setPersonalTasks(prev => prev.map(task => {
              if (task.id === taskId && task.subTasks) {
                return {
                  ...task,
                  subTasks: task.subTasks.map(st => 
                    st.id === subTaskId ? { ...st, completed: !st.completed } : st
                  )
                };
              }
              return task;
            }));
          }}
        />
      )}
    </>
  );
}