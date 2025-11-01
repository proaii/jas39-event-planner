'use client';

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
import { Event } from "@/lib/types";

export const TemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  title: z.string(),
  location: z.string().optional(),
  eventDescription: z.string().optional(),
  coverImageUri: z.string().optional(),
  color: z.number(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
  members: z.array(z.string()),
});

export type TemplateData = z.infer<typeof TemplateSchema>;

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateData?: Partial<Event>;
  onSave: (data: TemplateData) => void;
}

export function SaveTemplateModal({
  isOpen,
  onClose,
  templateData = {},
  onSave,
}: SaveTemplateModalProps) {
  const [name, setName] = useState(templateData.title || "");
  const [description, setDescription] = useState(templateData.description || "");

  useEffect(() => {
    if (isOpen) {
      setName(templateData.title || "");
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
      location: templateData.location,
      eventDescription: templateData.description,
      coverImageUri: templateData.coverImageUri,
      color: templateData.color || 0,
      startAt: templateData.startAt,
      endAt: templateData.endAt,
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