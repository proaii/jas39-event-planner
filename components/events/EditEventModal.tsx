'use client';

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EventColorSelector } from "./EventColorSelector";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Image,
  X,
  UserPlus,
} from "lucide-react";
import { unsplash_tool } from "@/lib/client/unsplash";
import { useUiStore } from "@/stores/ui-store";
import { editEventSchema } from "@/schemas/editEventSchema";
import type { Event } from "@/lib/types";
import { z } from "zod";
import NextImage from "next/image";

interface EditEventModalProps {
  events: Event[];
  onUpdateEvent: (eventId: string, updatedData: z.infer<typeof editEventSchema>) => void;
  onInviteMembers: () => void;
}

export function EditEventModal({
  events,
  onUpdateEvent,
  onInviteMembers,
}: EditEventModalProps) {
  const { isEditEventModalOpen, currentEventId, closeEditEventModal } =
    useUiStore();
  const event = events.find((e) => e.eventId === currentEventId) || null;

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    coverImageUri: "",
    color: 0,
    startAt: null as string | null,
    endAt: null as string | null,
    members: [] as string[],
  });

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (event) {
      const valid = editEventSchema.safeParse({
        title: event.title || "",
        location: event.location || "",
        description: event.description || "",
        coverImageUri: event.coverImageUri || "",
        color: event.color || 0,
        startAt: event.startAt || null,
        endAt: event.endAt || null,
        members: event.members || [],
      });

      if (valid.success) {
        setFormData({
          ...valid.data,
          location: valid.data.location || "",
          description: valid.data.description || "",
          coverImageUri: valid.data.coverImageUri || "",
          startAt: valid.data.startAt || null,
          endAt: valid.data.endAt || null,
        });
      }
      else console.warn("Invalid event data:", valid.error.format());
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const parsed = editEventSchema.safeParse(formData);
    if (!parsed.success) {
      console.error(parsed.error.format());
      alert("Please fill in all required fields correctly.");
      return;
    }

    onUpdateEvent(event.eventId, parsed.data);
    closeEditEventModal();
  };

  const generateCoverImage = async () => {
    if (!formData.title.trim()) return;
    setIsGeneratingImage(true);
    try {
      const imageUrl = await unsplash_tool(formData.title);
      setFormData((prev) => ({ ...prev, coverImageUri: imageUrl }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const removeMember = (memberToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members?.filter((m) => m !== memberToRemove) || [],
    }));
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  if (!event) return null;

  return (
    <Dialog open={isEditEventModalOpen} onOpenChange={closeEditEventModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Edit Event</span>
          </DialogTitle>
          <DialogDescription>
            Update event details, cover image, and team members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Cover Image</span>
            </Label>
            {formData.coverImageUri && (
              <div className="relative">
                <NextImage
                  src={formData.coverImageUri}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-lg"
                  width={1080}
                  height={1080}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, coverImageUri: "" }))
                  }
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex space-x-2">
              <Input
                placeholder="Enter image URL or generate from title"
                value={formData.coverImageUri}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    coverImageUri: e.target.value,
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateCoverImage}
                disabled={isGeneratingImage || !formData.title.trim()}
              >
                {isGeneratingImage ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>

          {/* Event Color */}
          <EventColorSelector
            selectedColor={`bg-chart-${formData.color + 1}`}
            onColorSelect={(color) =>
              setFormData((prev) => ({ ...prev, color: parseInt(color.split('-')[2]) - 1 }))
            }
          />

          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="startAt"
                  className="flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Start Date</span>
                </Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={formData.startAt?.substring(0, 16) || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startAt: new Date(e.target.value).toISOString() }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="endAt"
                  className="flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>End Date</span>
                </Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={formData.endAt?.substring(0, 16) || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endAt: new Date(e.target.value).toISOString() }))
                  }
                  min={formData.startAt?.substring(0, 16) || ""}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="min-h-[100px]"
            />
          </div>

          {/* Members */}
          <div className="space-y-4">
            <Label className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Team Members</span>
            </Label>
            <div className="space-y-3">
              {formData.members.length > 0 ? (
                formData.members.map((member) => (
                  <div
                    key={member}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {member}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Team Member
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No team members assigned
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add members to start collaborating
                  </p>
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => onInviteMembers?.()}
            >
              <UserPlus className="w-4 h-4 mr-2" /> Add Team Member
            </Button>
            <p className="text-xs text-muted-foreground">
              Click &quot;Add Team Member&quot; to search and select from available users.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={closeEditEventModal}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Update Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}