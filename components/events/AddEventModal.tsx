"use client";

import React, { useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import NextImage from "next/image";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unsplash_tool } from "@/lib/client/unsplash";
import { Event } from "@/lib/types";

const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  date: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  time: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  isMultiDay: z.boolean(),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  members: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  color: z.string(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface AddEventModalProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void; 
  onClose?: () => void; 
  onCreateEvent: (
    event: Omit<Event, "id" | "progress" | "tasks" | "createdAt" | "ownerId">
  ) => void;
  onInviteMembers?: () => void;
  prefillData?: Omit<Event, "id" | "progress" | "tasks" | "createdAt" | "ownerId">;
}

export function AddEventModal({
  isOpen,
  onOpenChange,
  onClose,
  onCreateEvent,
  onInviteMembers,
  prefillData,
}: AddEventModalProps) {
    const form = useForm<EventFormData>({
      resolver: zodResolver(eventSchema),
      mode: "onChange",
      defaultValues: prefillData || {
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
      },
    });

  const { reset } = form;

  useEffect(() => {
    if (prefillData) {
      reset(prefillData);
    }
  }, [prefillData, reset]);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const formData = watch();
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);

  const generateCoverImage = async () => {
    const title = formData.title.trim();
    if (!title) return toast.error("Please enter a title before generating an image.");
    setIsGeneratingImage(true);
    try {
      const imageUrl = await unsplash_tool(title);
      if (imageUrl) {
        setValue("coverImage", imageUrl);
        toast.success("Cover image generated successfully!");
      } else toast.error("Failed to fetch image.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  const onSubmit = async (data: EventFormData) => {
    if (data.isMultiDay && data.endDate && data.endDate < data.date) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }

    const newEvent: Omit<Event, "id" | "progress" | "tasks" | "createdAt" | "ownerId"> = {
      title: data.title,
      date: data.date,
      endDate: data.endDate,
      time: data.time,
      endTime: data.endTime,
      isMultiDay: data.isMultiDay,
      location: data.location,
      description: data.description || "",
      members: data.members || [],
      coverImage: data.coverImage,
      color: data.color,
    };


    onCreateEvent(newEvent);
    toast.success(`Event "${data.title}" created successfully!`);
    reset(prefillData || undefined); 
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <Button type="button" variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => setValue("coverImage", "")}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex space-x-2">
              <Input placeholder="Enter image URL or generate from title" {...register("coverImage")} />
              <Button type="button" variant="outline" onClick={generateCoverImage} disabled={isGeneratingImage || !formData.title.trim()}>
                {isGeneratingImage ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</> : "Generate"}
              </Button>
            </div>
          </div>

          {/* Event Color */}
          <EventColorSelector selectedColor={formData.color} onColorSelect={(color) => setValue("color", color)} />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Date/Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="isMultiDay" checked={formData.isMultiDay} onCheckedChange={(checked) => setValue("isMultiDay", !!checked)} />
              <Label htmlFor="isMultiDay" className="text-sm">Multi-day event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>Start Date</span></Label>
                <Input type="date" {...register("date")} />
              </div>
              {formData.isMultiDay && (
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>End Date</span></Label>
                  <Input type="date" {...register("endDate")} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>Start Time</span></Label>
                <Input type="time" {...register("time")} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>End Time</span></Label>
                <Input type="time" {...register("endTime")} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2"><MapPin className="w-4 h-4" /><span>Location</span></Label>
            <Input {...register("location")} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register("description")} className="min-h-[100px]" />
          </div>

          {/* Members */}
          <div className="space-y-4">
            <Label className="flex items-center space-x-2"><Users className="w-4 h-4" /><span>Team Members</span></Label>
            <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No team members assigned</p>
              <p className="text-xs text-muted-foreground mt-1">Add members to start collaborating</p>
            </div>
            <Button type="button" variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white" onClick={onInviteMembers}>
              <UserPlus className="w-4 h-4 mr-2" /> Add Team Member
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting || !isValid}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
