"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { EventColorSelector } from './EventColorSelector';
import { Calendar, MapPin, Clock, Users, Image, X, UserPlus, Loader2 } from "lucide-react";
import { unsplash_tool } from '../utils/unsplash';
import { toast } from "react-hot-toast";

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
  tasks: unknown[];
  members: string[];
  coverImage?: string;
  color?: string;
  ownerId: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: Event) => void;
  currentUserId: string;
  onInviteMembers?: () => void;
}

export function AddEventModal({ isOpen, onClose, onCreateEvent, currentUserId, onInviteMembers }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    endDate: "",
    time: "",
    endTime: "",
    isMultiDay: false,
    location: "",
    description: "",
    members: [] as string[],
    coverImage: "",
    color: "#E8F4FD",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter an event title.");
      return;
    }
    if (!formData.date) {
      toast.error("Please select a start date.");
      return;
    }
    if (!formData.time) {
      toast.error("Please select a start time.");
      return;
    }
    if (formData.isMultiDay && formData.endDate && formData.endDate < formData.date) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newEvent: Event = {
        ...formData,
        id: crypto.randomUUID(),
        progress: 0,
        tasks: [],
        ownerId: currentUserId,
      };

      onCreateEvent(newEvent);
      toast.success("Event created successfully!");
      onClose();

      setFormData({
        title: "",
        date: "",
        endDate: "",
        time: "",
        endTime: "",
        isMultiDay: false,
        location: "",
        description: "",
        members: [],
        coverImage: "",
        color: "#E8F4FD",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateCoverImage = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title before generating an image.");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const imageUrl = await unsplash_tool(formData.title);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, coverImage: imageUrl }));
        toast.success("Cover image generated successfully!");
      } else {
        toast.error("Failed to fetch image.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const removeMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m !== member),
    }));
  };

  const getInitials = (name: string) =>
    name.split(" ").map(part => part[0]).join("").toUpperCase();

  return (
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
          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Cover Image</span>
            </Label>
            {formData.coverImage && (
              <div className="relative">
                <img src={formData.coverImage} alt="Cover preview" className="w-full h-32 object-cover rounded-lg" />
                <Button type="button" variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex space-x-2">
              <Input
                placeholder="Enter image URL or generate from title"
                value={formData.coverImage}
                onChange={e => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
              />
              <Button type="button" variant="outline" onClick={generateCoverImage} disabled={isGeneratingImage || !formData.title.trim()}>
                {isGeneratingImage ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</> : "Generate"}
              </Button>
            </div>
          </div>

          {/* Event Color */}
          <EventColorSelector selectedColor={formData.color} onColorSelect={color => setFormData(prev => ({ ...prev, color }))} />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
          </div>

          {/* Date/Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isMultiDay}
                onChange={e => setFormData(prev => ({ ...prev, isMultiDay: e.target.checked, endDate: e.target.checked ? prev.endDate : "", endTime: e.target.checked ? prev.endTime : "" }))}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <Label className="text-sm">Multi-day event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>Start Date</span></Label>
                <Input type="date" value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} required />
              </div>
              {formData.isMultiDay && (
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>End Date</span></Label>
                  <Input type="date" value={formData.endDate} onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))} min={formData.date} required />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>Start Time</span></Label>
                <Input type="time" value={formData.time} onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>End Time {formData.isMultiDay ? "(on last day)" : ""}</span></Label>
                <Input type="time" value={formData.endTime} onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))} required={!formData.isMultiDay} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2"><MapPin className="w-4 h-4" /><span>Location</span></Label>
            <Input value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} required />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className="min-h-[100px]" required />
          </div>

          {/* Members */}
          <div className="space-y-4">
            <Label className="flex items-center space-x-2"><Users className="w-4 h-4" /><span>Team Members</span></Label>
            <div className="space-y-3">
              {formData.members.length > 0 ? formData.members.map(member => (
                <div key={member} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(member)}</AvatarFallback></Avatar>
                    <div><p className="font-medium text-foreground text-sm">{member}</p><p className="text-xs text-muted-foreground">Team Member</p></div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeMember(member)} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></Button>
                </div>
              )) : (
                <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No team members assigned</p>
                  <p className="text-xs text-muted-foreground mt-1">Add members to start collaborating</p>
                </div>
              )}
            </div>

            <Button type="button" variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white" onClick={onInviteMembers}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
