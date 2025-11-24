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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Event } from "@/lib/types";
import { TemplateData } from "@/schemas/template";
import { useSaveTemplate } from "@/stores/useEventStore"; 

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string; 
  templateData?: Partial<Event>;
  onSave?: () => void; 
}

export function SaveTemplateModal({
  isOpen,
  onClose,
  eventId,
  templateData = {},
  onSave,
}: SaveTemplateModalProps) {
  const [name, setName] = useState(templateData.title || "");
  const [description, setDescription] = useState(templateData.description || "");

  const { mutate: saveTemplate, isPending } = useSaveTemplate();

  useEffect(() => {
    if (isOpen) {
      setName(templateData.title || "");
      setDescription(templateData.description || "");
    }
  }, [isOpen, templateData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isPending) return;

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

    saveTemplate(
      { eventId, data },
      {
        onSuccess: () => {
          toast.success("Template saved successfully!");
          
          // Reset form
          setName("");
          setDescription("");
          
          onSave?.();
          onClose();
        },
        onError: (err: any) => {
          console.error('Failed to save template:', err);
          toast.error(err?.message || "Failed to save template. Please try again.");
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending) {
      setName("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => { if (!open) handleClose(); }}
    >
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
              disabled={isPending}
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
              disabled={isPending}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Template"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}