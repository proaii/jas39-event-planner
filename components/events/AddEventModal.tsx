"use client";

import React, { useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EventColorSelector } from "./EventColorSelector";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Image as ImageIcon,
  X,
  UserPlus,
  Loader2,
} from "lucide-react";
import { unsplash_tool } from "@/lib/client/unsplash";
import { toast } from "react-hot-toast";
import NextImage from "next/image";
import type { Event } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { getInitials } from "@/lib/utils";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (
    event: Omit<Event, "eventId" | "ownerId" | "createdAt" | "members">
  ) => void;
  onInviteMembers?: () => void;
}

export function AddEventModal({
  isOpen,
  onClose,
  onCreateEvent,
  onInviteMembers,
}: AddEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    endDate: "",
    time: "",
    endTime: "",
    isMultiDay: false,
    location: "",
    description: "",
    members: [] as string[], // ไม่ถูกส่งออก (parent จะตั้งเป็น [])
    coverImage: "",
    color: "bg-chart-1", // จะ map -> number
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  /** map tailwind color token -> numeric index for Event.color */
  function colorTokenToIndex(token: string): number {
    // รองรับรูปแบบ "bg-chart-1", "bg-chart-2", ...
    const m = token.match(/bg-chart-(\d+)/);
    if (m && m[1]) {
      const idx = parseInt(m[1], 10);
      // แปลงเป็น 0-based หรือใช้ตามเลขก็ได้—ในที่นี้ใช้ idx-1 เพื่อให้เริ่มที่ 0
      return Math.max(0, idx - 1);
    }
    return 0;
  }

  /** สร้าง ISO datetime จาก date(yyyy-mm-dd) + time(HH:mm) */
  function toIso(date: string, time: string): string | undefined {
    if (!date) return undefined;
    // ถ้าไม่มี time ให้ใช้ 00:00
    const t = time && time.trim().length > 0 ? time : "00:00";
    const iso = new Date(`${date}T${t}:00`).toISOString();
    return iso;
  }

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
    if (
      formData.isMultiDay &&
      formData.endDate &&
      formData.endDate < formData.date
    ) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }

    setIsSubmitting(true);
    try {
      // แปลงจาก formData -> โครง Event (ยกเว้นฟิลด์ที่ parent จะเติมเอง)
      const startAt = toIso(formData.date, formData.time);
      const endAt = formData.isMultiDay
        ? toIso(formData.endDate, formData.endTime)
        : toIso(formData.date, formData.endTime || formData.time);

      const payload: Omit<Event, "eventId" | "ownerId" | "createdAt" | "members"> = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        coverImageUri: formData.coverImage || undefined,
        color: colorTokenToIndex(formData.color),
        startAt: startAt ?? null,
        endAt: endAt ?? null,
        // Event ต้องไม่มี members ที่นี่ (parent จะตั้งเป็น [])
      };

      onCreateEvent(payload);
      onClose();

      // reset form
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
        color: "bg-chart-1",
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
        setFormData((prev) => ({ ...prev, coverImage: imageUrl }));
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
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m !== member),
    }));
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Create Event</span>
          </DialogTitle>
          <DialogDescription>
            Fill out the form to add a new event and optionally invite members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span>Cover Image</span>
            </Label>
            {formData.coverImage && (
              <div className="relative">
                <NextImage
                  src={formData.coverImage}
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
                    setFormData((prev) => ({ ...prev, coverImage: "" }))
                  }
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex space-x-2">
              <Input
                placeholder="Enter image URL or generate from title"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    coverImage: e.target.value,
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateCoverImage}
                disabled={isGeneratingImage || !formData.title.trim()}
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
          </div>

          {/* Event Color */}
          <EventColorSelector
            selectedColor={formData.color}
            onColorSelect={(color) => setFormData((prev) => ({ ...prev, color }))}
          />

          {/* Title */}
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

          {/* Date/Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isMultiDay"
                checked={formData.isMultiDay}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isMultiDay: !!checked,
                    endDate: checked ? prev.endDate : "",
                    endTime: checked ? prev.endTime : "",
                  }))
                }
              />
              <Label htmlFor="isMultiDay" className="text-sm">
                Multi-day event
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Start Date</span>
                </Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>
              {formData.isMultiDay && (
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>End Date</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    min={formData.date}
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Start Time</span>
                </Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    End Time {formData.isMultiDay ? "(on last day)" : ""}
                  </span>
                </Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                  required={!formData.isMultiDay}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </Label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Members (UI เท่านั้น ตอนนี้ไม่ส่งค่าออก) */}
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
              onClick={onInviteMembers}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
