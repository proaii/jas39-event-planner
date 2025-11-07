"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Event } from "@/lib/types";
import { toast } from "react-hot-toast";
import { useUiStore } from "@/stores/ui-store";
import { editEventSchema } from "@/schemas/editEventSchema";
import { z } from "zod";

// ------------------------------------------------------
// Input Types for API
// ------------------------------------------------------

// CreateEventInput excludes backend-owned fields
export type CreateEventInput = Omit<
  Event,
  "eventId" | "ownerId" | "createdAt" | "members"
>;

// UpdateEventInput is exactly what the backend expects for PATCH
// Members is required because editEventSchema includes it
export type UpdateEventInput = z.infer<typeof editEventSchema>;

// ------------------------------------------------------
// Zustand Local UI State
// ------------------------------------------------------
interface EventStoreState {
  searchQuery: string;
  sortBy: "date" | "name" | "progress";
  page: number;
  pageSize: number;

  selectedEventId: string | null;

  // Local actions
  setSearchQuery: (q: string) => void;
  setSortBy: (s: "date" | "name" | "progress") => void;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
  setSelectedEventId: (id: string | null) => void;
}

export const useEventStore = create<EventStoreState>()(
  devtools((set) => ({
    searchQuery: "",
    sortBy: "date",
    page: 1,
    pageSize: 10,

    selectedEventId: null,

    setSearchQuery: (q) => set({ searchQuery: q }),
    setSortBy: (s) => set({ sortBy: s }),
    setPage: (p) => set({ page: p }),
    setPageSize: (s) => set({ pageSize: s }),
    setSelectedEventId: (id) => set({ selectedEventId: id }),
  }))
);

// ------------------------------------------------------
// API Configuration
// ------------------------------------------------------
const API_BASE = "/api/events";

// ------------------------------------------------------
// Server API Calls
// ------------------------------------------------------

// Fetch list of events with search + pagination
async function fetchEventsAPI(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.page) query.set("page", params.page.toString());
  if (params.pageSize) query.set("pageSize", params.pageSize.toString());

  const res = await fetch(`${API_BASE}?${query.toString()}`, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json(); // expected: { items, total }
}

// Create new event
async function createEventAPI(data: CreateEventInput) {
  const res = await fetch(API_BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

// Update existing event
async function updateEventAPI(eventId: string, data: UpdateEventInput) {
  const res = await fetch(`${API_BASE}/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

// Delete event
async function deleteEventAPI(eventId: string) {
  const res = await fetch(`${API_BASE}/${eventId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete event");
  return { eventId };
}

// ------------------------------------------------------
// React Query Hooks
// ------------------------------------------------------

// Fetch events (list)
export function useFetchEvents() {
  const { searchQuery, sortBy, page, pageSize } = useEventStore();

  return useQuery({
    queryKey: ["events", { searchQuery, sortBy, page, pageSize }],
    queryFn: () =>
      fetchEventsAPI({
        q: searchQuery,
        page,
        pageSize,
      }),
  });
}

// Create event (POST)
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const closeModal = useUiStore.getState().closeAddEventModal;

  return useMutation({
    mutationFn: (data: CreateEventInput) => createEventAPI(data),
    onSuccess: () => {
      toast.success("Event created successfully");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      closeModal();
    },
    onError: () => toast.error("Failed to create event"),
  });
}

// Update event (PATCH)
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const closeModal = useUiStore.getState().closeEditEventModal;

  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: UpdateEventInput;
    }) => updateEventAPI(eventId, data),

    onSuccess: () => {
      toast.success("Event updated");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      closeModal();
    },

    onError: () => toast.error("Failed to update event"),
  });
}

// Delete event (DELETE)
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteEventAPI(eventId),
    onSuccess: () => {
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Failed to delete event"),
  });
}

// ------------------------------------------------------
// Convenience Hook: Find event by ID (from cached list)
// ------------------------------------------------------
export function useEventById(eventId: string | null) {
  const { data } = useFetchEvents();

  if (!data || !eventId) return null;
  return data.items?.find((e: Event) => e.eventId === eventId) || null;
}
