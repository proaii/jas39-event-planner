// lib/client/features/events/utils.ts
import { Event } from '@/lib/types';

interface ProgressFilters {
  notStarted: boolean;
  inProgress: boolean;
  completed: boolean;
}

interface DateFilters {
  past: boolean;
  thisWeek: boolean;
  thisMonth: boolean;
  upcoming: boolean;
}

export const filterEvents = (
  events: Event[],
  searchQuery: string,
  progressFilters: ProgressFilters,
  dateFilters: DateFilters
): Event[] => {
  let filtered: Event[] = events;

  // --- Search ---
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query)) ||
        (event.location && event.location.toLowerCase().includes(query))
    );
  }

  // TODO: Implement progress filters for events
  // Events currently don't have a 'progress' field directly, only tasks do.
  // This might require calculating progress based on associated tasks,
  // or removing progress filter from events page. For now, it's a passthrough.

  // --- Date Filters ---
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const filterByDate = (event: Event): boolean => {
    const eventStartDate = event.startAt ? new Date(event.startAt) : null;
    const eventEndDate = event.endAt ? new Date(event.endAt) : null;

    let match = false;

    // Past Events
    if (dateFilters.past && eventEndDate && eventEndDate < now) {
      match = true;
    }
    // Upcoming Events (excluding past)
    if (dateFilters.upcoming && eventStartDate && eventStartDate > now) {
      match = true;
    }
    // This Week
    if (dateFilters.thisWeek && eventStartDate && eventStartDate >= oneWeekAgo && eventStartDate <= now) {
      match = true;
    }
    // This Month
    if (dateFilters.thisMonth && eventStartDate && eventStartDate >= oneMonthAgo && eventStartDate <= now) {
      match = true;
    }
    
    // If no date filters are active, or if all are active, show all.
    const allDateFiltersInactive = !dateFilters.past && !dateFilters.thisWeek && !dateFilters.thisMonth && !dateFilters.upcoming;
    const allDateFiltersActive = dateFilters.past && dateFilters.thisWeek && dateFilters.thisMonth && dateFilters.upcoming;
    
    if (allDateFiltersInactive || allDateFiltersActive) return true;

    return match;
  };

  filtered = filtered.filter(filterByDate);

  return filtered;
};

export const sortEvents = (
  events: Event[],
  sortBy: "date" | "name" | "progress"
): Event[] => {
  const sorted = [...events]; // Create a shallow copy to avoid mutating the original array

  if (sortBy === "name") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "date") {
    sorted.sort((a, b) => {
      const dateA = a.startAt ? new Date(a.startAt).getTime() : Infinity;
      const dateB = b.startAt ? new Date(b.startAt).getTime() : Infinity;
      return dateA - dateB;
    });
  }
  // TODO: Implement progress sorting for events
  // As with filtering, events don't have a direct 'progress' field.

  return sorted;
};
