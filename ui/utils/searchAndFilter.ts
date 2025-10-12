import { getEffectiveDueDate } from './timeUtils';

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

interface FilterOptions {
  status?: ('To Do' | 'In Progress' | 'Done')[];
  priority?: ('Urgent' | 'High' | 'Normal' | 'Low')[];
  assignees?: string[];
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  eventTypes?: string[];
  showCompleted?: boolean;
  showPersonalTasks?: boolean;
}

export const filterTasks = (
  tasks: Task[],
  searchTerm: string,
  filters: FilterOptions
): Task[] => {
  return tasks.filter(task => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        task.name.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.assignees.some(assignee => assignee.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false;
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) return false;
    }

    // Assignee filter
    if (filters.assignees && filters.assignees.length > 0) {
      const hasMatchingAssignee = task.assignees.some(assignee => 
        filters.assignees!.includes(assignee)
      );
      if (!hasMatchingAssignee) return false;
    }

    // Enhanced date range filter for time periods
    if (filters.dateRange?.from) {
      const fromDate = new Date(filters.dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = filters.dateRange.to 
        ? new Date(filters.dateRange.to) 
        : new Date(fromDate);
      toDate.setHours(23, 59, 59, 999);
      
      let taskOverlapsRange = false;
      
      // Check if task has time period (startDate/endDate)
      if (task.startDate) {
        const taskStartDate = new Date(task.startDate);
        const taskEndDate = task.endDate ? new Date(task.endDate) : taskStartDate;
        
        // Task overlaps if: task starts before range ends AND task ends after range starts
        taskOverlapsRange = taskStartDate <= toDate && taskEndDate >= fromDate;
      } 
      // Check effective due date (endDate for time periods, or dueDate for traditional tasks)
      else {
        const effectiveDueDate = getEffectiveDueDate(task);
        if (effectiveDueDate) {
          const taskDate = new Date(effectiveDueDate);
          taskOverlapsRange = taskDate >= fromDate && taskDate <= toDate;
        }
      }
      
      if (!taskOverlapsRange) return false;
    }

    // Show completed filter
    if (filters.showCompleted === false && task.status === 'Done') {
      return false;
    }

    // Show personal tasks filter
    if (filters.showPersonalTasks === false && task.isPersonal) {
      return false;
    }

    return true;
  });
};

export const filterEvents = (
  events: Event[],
  searchTerm: string,
  filters: FilterOptions
): Event[] => {
  return events.filter(event => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        event.members.some(member => member.toLowerCase().includes(searchLower)) ||
        event.tasks.some(task => 
          task.name.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
        );
      
      if (!matchesSearch) return false;
    }

    // Assignee filter (check event members)
    if (filters.assignees && filters.assignees.length > 0) {
      const hasMatchingMember = event.members.some(member => 
        filters.assignees!.includes(member)
      );
      if (!hasMatchingMember) return false;
    }

    // Enhanced date range filter for multi-day events
    if (filters.dateRange?.from) {
      const fromDate = new Date(filters.dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = filters.dateRange.to 
        ? new Date(filters.dateRange.to) 
        : new Date(fromDate);
      toDate.setHours(23, 59, 59, 999);
      
      const eventStartDate = new Date(event.date);
      const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;
      
      // Event overlaps if: event starts before range ends AND event ends after range starts
      const eventOverlapsRange = eventStartDate <= toDate && eventEndDate >= fromDate;
      
      if (!eventOverlapsRange) return false;
    }

    return true;
  });
};

export const getAllAssignees = (tasks: Task[], events: Event[]): string[] => {
  const assigneesSet = new Set<string>();
  
  // Add task assignees
  tasks.forEach(task => {
    task.assignees.forEach(assignee => assigneesSet.add(assignee));
  });
  
  // Add event members
  events.forEach(event => {
    event.members.forEach(member => assigneesSet.add(member));
  });
  
  return Array.from(assigneesSet).sort();
};

export const getTasksFromEvents = (events: Event[]): Task[] => {
  return events.flatMap(event => event.tasks);
};

export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>');
};

export const getSearchStats = (
  totalTasks: number,
  filteredTasks: number,
  totalEvents: number,
  filteredEvents: number
) => {
  return {
    tasks: {
      showing: filteredTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? Math.round((filteredTasks / totalTasks) * 100) : 0
    },
    events: {
      showing: filteredEvents,
      total: totalEvents,
      percentage: totalEvents > 0 ? Math.round((filteredEvents / totalEvents) * 100) : 0
    }
  };
};