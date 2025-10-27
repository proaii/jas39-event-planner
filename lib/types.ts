export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'Urgent' | 'High' | 'Normal' | 'Low';

export interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  url: string;
  title: string;
  favicon?: string;
}

export interface Task {
  id: string;
  eventId?: string;    
  eventTitle?: string; 
  name: string;
  description?: string;
  assignees?: string[];
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  status: TaskStatus;
  priority: TaskPriority;
  subTasks?: SubTask[];
  attachments?: Attachment[];
  isPersonal?: boolean;
}

export interface Event {
  id: string;
  ownerId: string;
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

export interface EventMember {
  id: string;
  eventId: string;
  memberId: string;
  role: string;
  joinedAt: string; 
}

export interface MembersRes {
  items: EventMember[];
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  item: string;
  time: string;
}