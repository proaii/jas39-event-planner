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
  name: string;
  description?: string;
  assignees: string[];
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
  eventTitle?: string;
}

export interface Event {
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