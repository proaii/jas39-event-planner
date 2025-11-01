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

// ----- Tasks -----
export interface Attachment {
  attachmentId: string;
  taskId: string;
  attachmentUrl: string;
}

export interface Subtask {
  subtaskId: string;
  taskId: string;
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

// ----- User -----
export interface UserLite {
  userId: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

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