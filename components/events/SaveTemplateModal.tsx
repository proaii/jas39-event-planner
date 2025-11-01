"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";

export const TemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  title: z.string(),
  date: z.string(),
  time: z.string(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  eventDescription: z.string().optional(),
  coverImage: z.string().optional(), 
  color: z.string().optional(),     
  tasks: z.array(
    z.object({
      title: z.string(),
      status: z.enum(["To Do", "In Progress", "Done"]),
      priority: z.enum(["Urgent", "High", "Normal", "Low"]),
      dueDate: z.string().optional(),
    })
  ),
  members: z.array(z.string()),
});

export type TemplateData = z.infer<typeof TemplateSchema>;

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateData?: Partial<TemplateData>;
  onSave: (data: TemplateData) => void;
}

export function SaveTemplateModal({
  isOpen,
  onClose,
  templateData = {},
  onSave,
}: SaveTemplateModalProps) {
  const [name, setName] = useState(templateData.name || "");
  const [description, setDescription] = useState(templateData.description || "");

  useEffect(() => {
    if (isOpen) {
      setName(templateData.name || "");
      setDescription(templateData.description || "");
    }
  }, [isOpen, templateData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: TemplateData = {
      name: name.trim(),
      description: description.trim() || undefined,
      title: templateData.title || "",
      date: templateData.date || "",
      time: templateData.time || "",
      endDate: templateData.endDate,
      endTime: templateData.endTime,
      location: templateData.location,
      eventDescription: templateData.eventDescription,
      coverImage: templateData.coverImage, 
      color: templateData.color,           
      tasks: templateData.tasks || [],
      members: templateData.members || [],
    };

    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save this event structure as a reusable template for future events.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Study Session Template"
              required
            />
          </div>

          <div>
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of when to use this template..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Save Template
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
