"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Event, EventMember } from "@/lib/types";
import { toast } from "react-hot-toast";
import { useUiStore } from "@/stores/ui-store";
import { editEventSchema } from "@/schemas/editEventSchema";
import { z } from "zod";
import type { TemplateData } from "@/components/events/SaveTemplateModal";

export type CreateEventInput = Omit<
  Event,
  "eventId" | "ownerId" | "createdAt" | "members"
>;

export type UpdateEventInput = z.infer<typeof editEventSchema>;

interface EventStoreState {
  searchQuery: string;
  sortBy: "date" | "name" | "progress";
  page: number;
  pageSize: number;
  selectedEventId: string | null;

  events: Event[];
  setEvents: (events: Event[]) => void;
  updateEvent: (eventId: string, updatedData: UpdateEventInput) => void;

  // New actions
  deleteEvent: (eventId: string) => void;
  saveTemplate: (eventId: string, templateData: TemplateData) => void;

  setSearchQuery: (q: string) => void;
  setSortBy: (s: "date" | "name" | "progress") => void;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
  setSelectedEventId: (id: string | null) => void;
}

export const useEventStore = create<EventStoreState>()(
  devtools((set, get) => ({
    searchQuery: "",
    sortBy: "date",
    page: 1,
    pageSize: 10,
    selectedEventId: null,
    events: [],
    setEvents: (events) => set({ events }),

    updateEvent: (eventId, updatedData) => {
      set({
        events: get().events.map((e) => {
          if (e.eventId !== eventId) return e;

          const membersIds: string[] = (updatedData.members ?? []).map(
            (m) => m.userId
          );

          return {
            ...e,
            title: updatedData.title ?? e.title,
            location: updatedData.location ?? e.location,
            description: updatedData.description ?? e.description,
            coverImageUri: updatedData.coverImageUri ?? e.coverImageUri,
            color: updatedData.color ?? e.color,
            startAt: updatedData.startAt ?? e.startAt,
            endAt: updatedData.endAt ?? e.endAt,
            members: membersIds,
          };
        }),
      });
    },

    deleteEvent: (eventId) => {
      set({
        events: get().events.filter((e) => e.eventId !== eventId),
      });
      toast.success("Event deleted");
    },

    saveTemplate: (eventId, templateData) => {
      console.log("Template saved in store:", eventId, templateData);
      toast.success("Template saved");
    },

    setSearchQuery: (q) => set({ searchQuery: q }),
    setSortBy: (s) => set({ sortBy: s }),
    setPage: (p) => set({ page: p }),
    setPageSize: (s) => set({ pageSize: s }),
    setSelectedEventId: (id) => set({ selectedEventId: id }),
  }))
);

// --- React Query helpers remain unchanged ---
const API_BASE = "/api/events";

async function fetchEventsAPI(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.page) query.set("page", params.page.toString());
  if (params.pageSize) query.set("pageSize", params.pageSize.toString());

  const res = await fetch(`${API_BASE}?${query.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

async function createEventAPI(data: CreateEventInput) {
  const res = await fetch(API_BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

async function updateEventAPI(eventId: string, data: UpdateEventInput) {
  const res = await fetch(`${API_BASE}/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

async function deleteEventAPI(eventId: string) {
  const res = await fetch(`${API_BASE}/${eventId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
  return { eventId };
}

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

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const closeModal = useUiStore.getState().closeEditEventModal;
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: UpdateEventInput }) =>
      updateEventAPI(eventId, data),
    onSuccess: () => {
      toast.success("Event updated");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      closeModal();
    },
    onError: () => toast.error("Failed to update event"),
  });
}

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

export function useEventById(eventId: string | null) {
  const { data } = useFetchEvents();
  if (!data || !eventId) return null;
  return data.items?.find((e: Event) => e.eventId === eventId) || null;
}
