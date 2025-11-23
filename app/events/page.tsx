"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { EventCard } from "@/components/events/EventCard";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  ArrowUpDown,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Event, Task } from "@/lib/types";
import { useUiStore } from "@/stores/ui-store";
import { useEventStore, useFetchEvents, useCreateEvent } from "@/stores/useEventStore";
import { toast } from "react-hot-toast";
import { AddEventModal } from "@/components/events/AddEventModal";
import { CreateFromTemplateModal } from "@/components/events/CreateFromTemplateModal";
import { TemplateData } from "@/schemas/template";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EditEventModal } from "@/components/events/EditEventModal";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { useDeleteEvent } from "@/lib/client/features/events/hooks";
import { useTaskStore } from "@/stores/task-store";


export default function AllEventsPage() {
  const router = useRouter();
  const { mutate: createEvent } = useCreateEvent();
  const { mutate: deleteEventMutate } = useDeleteEvent();
  const { addTask } = useTaskStore();

  // ------------------- UI STORE -------------------
  const {
    isAddEventModalOpen,
    openAddEventModal,
    closeAddEventModal,
    isTemplateModalOpen,
    openTemplateModal,
    closeTemplateModal,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    isFilterOpen,
    setIsFilterOpen,
    progressFilters,
    setProgressFilters,
    dateFilters,
    setDateFilters,
    openEditEventModal,
  } = useUiStore();

  // ------------------- EVENT STORE -------------------
  const { events, setEvents } = useEventStore();
  const { data: fetchedEvents } = useFetchEvents();

  React.useEffect(() => {
    if (fetchedEvents && fetchedEvents.items) {
      setEvents(fetchedEvents.items);
    }
  }, [fetchedEvents, setEvents]);


  const [prefillData, setPrefillData] = useState<Partial<Event> | null>(null);
  const [selectedEventIdForEdit, setSelectedEventIdForEdit] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedEventIdForAddTask, setSelectedEventIdForAddTask] = useState<string | null>(null);

  // ------------------- FILTER STATE -------------------
  const [tempProgressFilters, setTempProgressFilters] = useState(progressFilters);
  const [tempDateFilters, setTempDateFilters] = useState(dateFilters);

  React.useEffect(() => {
    if (isFilterOpen) {
      setTempProgressFilters(progressFilters);
      setTempDateFilters(dateFilters);
    }
  }, [isFilterOpen, progressFilters, dateFilters]);

  // ------------------- HANDLERS -------------------
  const handleCreateEvent = async (
    eventData: Omit<Event, "eventId" | "ownerId" | "createdAt" | "tasks" | "members">
  ) => {
    return new Promise<void>((resolve, reject) => {
      createEvent(eventData, {
        onSuccess: () => {
          toast.success("Event created successfully!");
          closeAddEventModal();
          resolve();
        },
        onError: (error) => {
          toast.error(`Failed to create event: ${error.message}`);
          reject(error);
        },
      });
    });
  };

  const handleUseTemplate = (data: TemplateData) => {
    setPrefillData({
      title: data.title,
      location: data.location || "",
      description: data.eventDescription || "",
      coverImageUri: data.coverImageUri ?? undefined,
      color: 0,
      startAt: data.startAt,
      endAt: data.endAt,
    });
    openAddEventModal();
  };

  const applyTempFilters = () => {
    setProgressFilters(tempProgressFilters);
    setDateFilters(tempDateFilters);
    setIsFilterOpen(false);
  };

  const clearTempFilters = () => {
    setTempProgressFilters({ notStarted: true, inProgress: true, completed: true });
    setTempDateFilters({ past: true, thisWeek: true, thisMonth: true, upcoming: true });
  };

  // ------------------- FILTER & SORT -------------------
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          (event.description && event.description.toLowerCase().includes(query)) ||
          (event.location && event.location.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [events, searchQuery]);

  // ------------------- RENDER -------------------
  return (
    <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">All Events</h1>
          <p className="text-muted-foreground">View and manage all your events</p>
        </div>

        <div className="flex items-center shadow-lg rounded-lg overflow-hidden">
          <Button
            onClick={openAddEventModal}
            className="bg-primary hover:bg-primary/90 rounded-r-none border-r border-primary-foreground/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-primary hover:bg-primary/90 rounded-l-none px-2"
                aria-label="More options"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={openTemplateModal} className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2" />
                Create from Template...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search / Filter / Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Popover */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-initial">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-6">
                <div className="pb-2 border-b border-border">
                  <h3 className="font-semibold text-foreground">Filter Events</h3>
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Filter by Progress</label>
                  <div className="space-y-2">
                    {(["notStarted", "inProgress", "completed"] as const).map((key) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`progress-${key}`}
                          checked={tempProgressFilters[key]}
                          onCheckedChange={(checked) =>
                            setTempProgressFilters((prev) => ({
                              ...prev,
                              [key]: checked as boolean,
                            }))
                          }
                        />
                        <label htmlFor={`progress-${key}`} className="text-sm text-foreground">
                          {key === "notStarted"
                            ? "Not Started (0%)"
                            : key === "inProgress"
                            ? "In Progress (1-99%)"
                            : "Completed (100%)"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Filter by Date</label>
                  <div className="space-y-2">
                    {(["past", "thisWeek", "thisMonth", "upcoming"] as const).map((key) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`date-${key}`}
                          checked={tempDateFilters[key]}
                          onCheckedChange={(checked) =>
                            setTempDateFilters((prev) => ({
                              ...prev,
                              [key]: checked as boolean,
                            }))
                          }
                        />
                        <label htmlFor={`date-${key}`} className="text-sm text-foreground">
                          {key === "past"
                            ? "Past Events"
                            : key === "thisWeek"
                            ? "This Week"
                            : key === "thisMonth"
                            ? "This Month"
                            : "Future Events"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTempFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                  <Button size="sm" onClick={applyTempFilters} className="bg-primary hover:bg-primary/90">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "name" | "progress")}>
            <SelectTrigger className="w-full sm:w-52 flex-1 sm:flex-initial">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Start Date (Soonest)</SelectItem>
              <SelectItem value="name">Event Name (A-Z)</SelectItem>
              <SelectItem value="progress">Progress (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredAndSortedEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                {events.length === 0 ? "No events yet" : "No events match your filters"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {events.length === 0
                  ? "Get started by creating your first event"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {events.length === 0 && (
                <Button onClick={openAddEventModal} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
          {filteredAndSortedEvents.map((event) => (
            <EventCard
              key={event.eventId}
              event={event}
              onClick={() => router.push(`/events/${event.eventId}`)}
              onEdit={() => {}}
              onDelete={() => {}}
              onAddTask={() => {}}
            />
          ))}
        </div>
      )}

      {/* Results Counter */}
      {filteredAndSortedEvents.length > 0 && (
        <div className="text-center text-muted-foreground text-sm pt-4">
          Showing {filteredAndSortedEvents.length} of {events.length} event
          {events.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Modals */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={closeAddEventModal}
        onCreateEvent={handleCreateEvent}
        prefillData={prefillData ?? undefined}
      />

      <CreateFromTemplateModal
        isOpen={isTemplateModalOpen}
        templates={events.map((e) => ({
          name: e.title,
          description: e.description,
          title: e.title,
          location: e.location,
          eventDescription: e.description,
          coverImageUri: e.coverImageUri,
          color: e.color,
          startAt: e.startAt,
          endAt: e.endAt,
          members: e.members,
        }))}
        onClose={closeTemplateModal}
        onUseTemplate={handleUseTemplate}
      />
    </main>
  );
}
