/**
 * Utility functions for handling time periods and date/time formatting
 */

// Format a single date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Format a compact date (no year if current year)
export const formatCompactDate = (dateString: string): string => {
  const date = new Date(dateString);
  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();
  
  if (dateYear === currentYear) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Format a compact time (shorter format)
export const formatCompactTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).toLowerCase();
};

// Format a time for display
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Format a date range for events
export const formatEventDateRange = (event: {
  date: string;
  endDate?: string;
  time: string;
  endTime?: string;
  isMultiDay?: boolean;
}): string => {
  const startDate = formatDate(event.date);
  const startTime = formatTime(event.time);
  
  if (!event.endDate || !event.isMultiDay) {
    // Single day event
    if (event.endTime) {
      const endTime = formatTime(event.endTime);
      return `${startDate}, ${startTime} - ${endTime}`;
    }
    return `${startDate} at ${startTime}`;
  }
  
  // Multi-day event
  const endDate = formatDate(event.endDate);
  if (event.endTime) {
    const endTime = formatTime(event.endTime);
    return `${startDate} ${startTime} - ${endDate} ${endTime}`;
  }
  return `${startDate} - ${endDate}`;
};

// Format a date range for tasks
export const formatTaskDateRange = (task: {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  dueDate?: string;
}): string => {
  // If task has start and end dates/times, show the range
  if (task.startDate && task.endDate) {
    const startDate = formatDate(task.startDate);
    const endDate = formatDate(task.endDate);
    
    // Same day task with time range
    if (task.startDate === task.endDate && task.startTime && task.endTime) {
      const startTime = formatTime(task.startTime);
      const endTime = formatTime(task.endTime);
      return `${startDate}, ${startTime} - ${endTime}`;
    }
    
    // Multi-day task
    if (task.startDate !== task.endDate) {
      let result = `${startDate} - ${endDate}`;
      if (task.startTime && task.endTime) {
        const startTime = formatTime(task.startTime);
        const endTime = formatTime(task.endTime);
        result += ` (${startTime} - ${endTime})`;
      }
      return result;
    }
    
    // Single day with start time
    if (task.startTime) {
      const startTime = formatTime(task.startTime);
      return `${startDate} at ${startTime}`;
    }
    
    return startDate;
  }
  
  // If only start date
  if (task.startDate) {
    const startDate = formatDate(task.startDate);
    if (task.startTime) {
      const startTime = formatTime(task.startTime);
      return `${startDate} at ${startTime}`;
    }
    return `From ${startDate}`;
  }
  
  // Fallback to due date
  if (task.dueDate) {
    const dueDate = formatDate(task.dueDate);
    return `Due ${dueDate}`;
  }
  
  return '';
};

// Format a compact date range for tasks (optimized for cards)
export const formatTaskDateRangeCompact = (task: {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  dueDate?: string;
}): string => {
  // If task has start and end dates/times, show the range
  if (task.startDate && task.endDate) {
    const startDate = formatCompactDate(task.startDate);
    const endDate = formatCompactDate(task.endDate);
    
    // Same day task with time range
    if (task.startDate === task.endDate && task.startTime && task.endTime) {
      const startTime = formatCompactTime(task.startTime);
      const endTime = formatCompactTime(task.endTime);
      return `${startDate} • ${startTime}-${endTime}`;
    }
    
    // Multi-day task
    if (task.startDate !== task.endDate) {
      if (task.startTime && task.endTime) {
        const startTime = formatCompactTime(task.startTime);
        const endTime = formatCompactTime(task.endTime);
        return `${startDate} ${startTime} - ${endDate} ${endTime}`;
      }
      return `${startDate} - ${endDate}`;
    }
    
    // Single day with start time
    if (task.startTime) {
      const startTime = formatCompactTime(task.startTime);
      return `${startDate} • ${startTime}`;
    }
    
    return startDate;
  }
  
  // If only start date
  if (task.startDate) {
    const startDate = formatCompactDate(task.startDate);
    if (task.startTime) {
      const startTime = formatCompactTime(task.startTime);
      return `${startDate} • ${startTime}`;
    }
    return startDate;
  }
  
  // Fallback to due date
  if (task.dueDate) {
    const dueDate = formatCompactDate(task.dueDate);
    return dueDate;
  }
  
  return '';
};

// Get the effective due date for a task
// For time period tasks, this is the endDate; otherwise it's the dueDate
export const getEffectiveDueDate = (task: {
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

// Calculate the duration of a time period
export const calculateDuration = (startDate: string, endDate?: string, startTime?: string, endTime?: string): string => {
  if (!endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Add time to dates if provided
  if (startTime) {
    const [hours, minutes] = startTime.split(':');
    start.setHours(parseInt(hours), parseInt(minutes));
  }
  
  if (endTime) {
    const [hours, minutes] = endTime.split(':');
    end.setHours(parseInt(hours), parseInt(minutes));
  }
  
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  
  if (diffDays > 1) {
    return `${diffDays} days`;
  } else if (diffHours > 1) {
    return `${diffHours} hours`;
  } else {
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    return `${diffMinutes} minutes`;
  }
};

// Check if a task or event is currently active (ongoing)
export const isCurrentlyActive = (item: {
  date?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
}): boolean => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
  
  // For events
  if (item.date) {
    const startDate = item.date;
    const endDate = item.endDate || item.date;
    
    // Check if today falls within the date range
    if (today >= startDate && today <= endDate) {
      // If it's a single day, check time
      if (startDate === endDate && item.time && item.endTime) {
        return currentTime >= item.time && currentTime <= item.endTime;
      }
      // Multi-day event is active if we're within the date range
      return true;
    }
  }
  
  // For tasks
  if (item.startDate) {
    const startDate = item.startDate;
    const endDate = item.endDate || item.startDate;
    
    // Check if today falls within the date range
    if (today >= startDate && today <= endDate) {
      // If it's a single day, check time
      if (startDate === endDate && item.startTime && item.endTime) {
        return currentTime >= item.startTime && currentTime <= item.endTime;
      }
      // Multi-day task is active if we're within the date range
      return true;
    }
  }
  
  return false;
};

// Get a relative time description (e.g., "2 days ago", "in 3 hours")
export const getRelativeTime = (dateString: string, timeString?: string): string => {
  const now = new Date();
  const target = new Date(dateString);
  
  if (timeString) {
    const [hours, minutes] = timeString.split(':');
    target.setHours(parseInt(hours), parseInt(minutes));
  }
  
  const diffMs = target.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (Math.abs(diffMinutes) < 60) {
    if (diffMinutes > 0) return `in ${diffMinutes} min`;
    return `${Math.abs(diffMinutes)} min ago`;
  }
  
  if (Math.abs(diffHours) < 24) {
    if (diffHours > 0) return `in ${diffHours}h`;
    return `${Math.abs(diffHours)}h ago`;
  }
  
  if (diffDays > 0) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

// Sort events by start date/time
export const sortEventsByDateTime = <T extends { date: string; time: string; endDate?: string }>(events: T[]): T[] => {
  return events.sort((a, b) => {
    const aDateTime = new Date(`${a.date}T${a.time}`);
    const bDateTime = new Date(`${b.date}T${b.time}`);
    return aDateTime.getTime() - bDateTime.getTime();
  });
};

// Sort tasks by start date/time or due date
export const sortTasksByDateTime = <T extends { 
  startDate?: string; 
  startTime?: string; 
  dueDate?: string 
}>(tasks: T[]): T[] => {
  return tasks.sort((a, b) => {
    // Use start date/time if available, otherwise use due date
    const aDate = a.startDate || a.dueDate || '9999-12-31';
    const aTime = a.startTime || '00:00';
    const bDate = b.startDate || b.dueDate || '9999-12-31';
    const bTime = b.startTime || '00:00';
    
    const aDateTime = new Date(`${aDate}T${aTime}`);
    const bDateTime = new Date(`${bDate}T${bTime}`);
    return aDateTime.getTime() - bDateTime.getTime();
  });
};

export const extractDateAndTime = (isoString: string | null | undefined) => {
  if (!isoString) return { date: undefined, time: undefined };
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
};