// ----- Enums -----
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'Urgent' | 'High' | 'Normal' | 'Low';
export type SubtaskStatus = 'To Do' | 'In Progress' | 'Done';

// ----- Shared -----
export interface UserLite {
  userId: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

// ----- Events -----
export interface Event {
  eventId: string;
  ownerId: string;
  title: string;
  location?: string;
  description?: string;
  coverImageUri?: string;
  color: number;
  createdAt: string;
  startAt?: string | null;
  endAt?: string | null;   
  members: string[];       
}

export interface EventMember {
  eventMemberId: string;
  eventId: string;
  userId: string;
  joinedAt: string;
}

// ----- Event Templates -----
export interface EventTemplateData {
  title: string;
  location?: string | null;
  eventDescription?: string | null;
  coverImageUri?: string | null;
  color: number;
  startAt?: string | null;
  endAt?: string | null;
  members: string[];
}

export interface EventTemplate {
  templateId: string;
  ownerId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  eventData: EventTemplateData;
}

// ----- Tasks -----
export interface Attachment {
  attachmentId: string;
  taskId: string;
  attachmentUrl: string;
}

export interface Subtask {
  subtaskId: string;
  taskId?: string;
  title: string;
  subtaskStatus: SubtaskStatus;
}

export interface Task {
  taskId: string;
  eventId: string | null;
  eventTitle?: string;
  title: string;
  description?: string;
  taskStatus: TaskStatus;
  taskPriority: TaskPriority;
  startAt?: string | null; 
  endAt?: string | null;  
  createdAt: string;
  assignees?: UserLite[]; 
  subtasks?: Subtask[];
  attachments?: Attachment[];
}

export type UpdateEventInput = {
  title: string;
  location?: string;       
  description?: string;    
  coverImageUri?: string;  
  color: number;
  startAt?: string | null; 
  endAt?: string | null;   
  members: EventMember[];
};

// ----- User -----
export interface UserLite {
  userId: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

// ----- Members -----
export interface EventMember {
  eventMemberId: string;   
  eventId: string;     
  userId: string;       
  joinedAt: string;  
  role?: string;           // optional 
}

export interface MembersRes {
  items: EventMember[];
}

// ----- Activity Logs -----
export interface ActivityItem {
  id: string;
  user: string;           
  userAvatar?: string | null;
  action: string;         // action performed (created task, joined event, etc.)
  item: string;           // related task or event title
  time: string;           // ISO timestamp
}

export interface FilterOptions {
  status?: ("To Do" | "In Progress" | "Done")[];
  priority?: ("Urgent" | "High" | "Normal" | "Low")[];
  assignees?: string[]; // Matches username/email/userId
  dateRange?: { from: Date | null; to: Date | null };
  eventTypes?: string[]; // (Unused in mock data for now)
  showCompleted?: boolean;
  showPersonalTasks?: boolean; // true = show tasks with eventId === null
}
