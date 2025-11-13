'use client';

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EventColorSelector } from "./EventColorSelector";
import { Calendar, MapPin, Clock, Users, Image, X, UserPlus, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Event, EventMember } from "@/lib/types";
import { InviteTeamMembersModal } from "./InviteTeamMembersModal";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: Omit<Event, 'eventId' | 'ownerId' | 'createdAt'>) => void;
  eventId?: string;
  prefillData?: Partial<Omit<Event, 'eventId' | 'ownerId' | 'createdAt'>>;
}

const hexToNumber = (hex: string) => parseInt(hex.replace("#", ""), 16);

function formatDateTimeWithTZ(dateStr: string, timeStr: string): string {
  const localDate = new Date(`${dateStr}T${timeStr}`);
  const pad = (n: number) => String(n).padStart(2, "0");

  const yyyy = localDate.getFullYear();
  const MM = pad(localDate.getMonth() + 1);
  const dd = pad(localDate.getDate());
  const hh = pad(localDate.getHours());
  const mm = pad(localDate.getMinutes());
  const ss = pad(localDate.getSeconds());

  const offsetMin = localDate.getTimezoneOffset(); 
  const offsetSign = offsetMin > 0 ? "-" : "+";
  const offsetHr = pad(Math.floor(Math.abs(offsetMin) / 60));
  const offsetM = pad(Math.abs(offsetMin) % 60);

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}${offsetSign}${offsetHr}:${offsetM}`;
}

export function AddEventModal({ isOpen, onClose, onCreateEvent, eventId, prefillData }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    isMultiDay: false,
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    description: "",
    coverImage: "",
    color: "#E8F4FD",
    members: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && prefillData) {
      const isMulti = !!prefillData.endAt && prefillData.startAt?.split("T")[0] !== prefillData.endAt?.split("T")[0];
      setFormData({
        title: prefillData.title || "",
        location: prefillData.location || "",
        isMultiDay: isMulti,
        startDate: prefillData.startAt?.split("T")[0] || "",
        startTime: prefillData.startAt?.split("T")[1]?.substring(0,5) || "",
        endDate: prefillData.endAt?.split("T")[0] || prefillData.startAt?.split("T")[0] || "",
        endTime: prefillData.endAt?.split("T")[1]?.substring(0,5) || "",
        description: prefillData.description || "",
        coverImage: prefillData.coverImageUri || "",
        color: prefillData.color ? `#${prefillData.color.toString(16).padStart(6,"0")}` : "#E8F4FD",
        members: prefillData.members || [],
      });
    }
  }, [isOpen, prefillData]);

  const handleInviteMembers = () => setInviteModalOpen(true);
  const removeMember = (member: string) => setFormData(prev => ({ ...prev, members: prev.members.filter(m => m !== member) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Please enter an event title.");
    if (!formData.startDate || !formData.startTime) return toast.error("Please select a start date and time.");
    if (formData.isMultiDay && (!formData.endDate || !formData.endTime)) return toast.error("Please select an end date and time.");
    if (!formData.isMultiDay && formData.endTime) {
      const [startH, startM] = formData.startTime.split(":").map(Number);
      const [endH, endM] = formData.endTime.split(":").map(Number);
      if (endH < startH || (endH === startH && endM <= startM)) return toast.error("End time must be after start time for single-day event.");
    }

    setIsSubmitting(true);
    try {
      const startISO = formatDateTimeWithTZ(formData.startDate, formData.startTime);
      const endISO = formData.isMultiDay
        ? formatDateTimeWithTZ(formData.endDate, formData.endTime)
        : formData.endTime
          ? formatDateTimeWithTZ(formData.startDate, formData.endTime)
          : null;

      const newEvent: Omit<Event, 'eventId' | 'ownerId' | 'createdAt'> = {
        title: formData.title,
        location: formData.location,
        description: formData.description,
        coverImageUri: formData.coverImage,
        color: hexToNumber(formData.color),
        startAt: startISO,
        endAt: endISO,
        members: formData.members,
      };

      onCreateEvent(newEvent);
      toast.success("Event created successfully!");
      onClose();

      setFormData({
        title: "",
        location: "",
        isMultiDay: false,
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        description: "",
        coverImage: "",
        color: "#E8F4FD",
        members: [],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Create Event</span>
            </DialogTitle>
            <DialogDescription>Fill out the form to add a new event and optionally invite members.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2"><MapPin className="w-4 h-4" /><span>Location</span></Label>
              <Input value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} required />
            </div>

            {/* Multi-day checkbox */}
            <div className="flex items-center space-x-2">
              <input type="checkbox" checked={formData.isMultiDay} onChange={e => setFormData(prev => ({ ...prev, isMultiDay: e.target.checked }))} className="w-4 h-4 text-primary border-border rounded focus:ring-primary" />
              <Label className="text-sm">Multi-day event</Label>
            </div>

            {/* Start date & time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>{formData.isMultiDay ? "Start Date" : "Date"}</span></Label>
                <Input type="date" value={formData.startDate} onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>Start Time</span></Label>
                <Input type="time" value={formData.startTime} onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))} required />
              </div>
            </div>

            {/* End date & time for multi-day */}
            {formData.isMultiDay && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>End Date</span></Label>
                  <Input type="date" value={formData.endDate} onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>End Time (on last day)</span></Label>
                  <Input type="time" value={formData.endTime} onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))} required />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className="min-h-[100px]" required />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2"><Image className="w-4 h-4" /><span>Cover Image</span></Label>
              {formData.coverImage && (
                <div className="relative">
                  <img src={formData.coverImage} alt="Cover preview" className="w-full h-32 object-cover rounded-lg" />
                  <Button type="button" variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Color selector */}
            <EventColorSelector selectedColor={formData.color} onColorSelect={color => setFormData(prev => ({ ...prev, color }))} />

            {/* Team members */}
            <div className="space-y-4">
              <Label className="flex items-center space-x-2"><Users className="w-4 h-4" /><span>Team Members</span></Label>
              <div className="space-y-3">
                {formData.members.length > 0 ? formData.members.map(member => (
                  <div key={member} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{member[0]}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{member}</p>
                        <p className="text-xs text-muted-foreground">Team Member</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMember(member)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )) : (
                  <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
                    <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No team members assigned</p>
                    <p className="text-xs text-muted-foreground mt-1">Add members to start collaborating</p>
                  </div>
                )}
              </div>
              <Button type="button" variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white" onClick={handleInviteMembers}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <InviteTeamMembersModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        eventId={eventId || "new-event"}
        currentMembers={formData.members.map(u => ({
          eventMemberId: `demo-${u}-${Date.now()}`,
          userId: u,
          eventId: eventId || "new-event",
          joinedAt: new Date().toISOString(),
        }))}
        onMembersUpdated={(newMembers: EventMember[]) =>
          setFormData(prev => ({ ...prev, members: newMembers.map(m => m.userId) }))
        }
      />
    </>
  );
}
