"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";

export const TemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
});

export type TemplateData = z.infer<typeof TemplateSchema>;

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  templateDesc: string;
  onNameChange: (name: string) => void;
  onDescChange: (desc: string) => void;
  onSave: (data: { name: string; description: string }) => void;
}

export function SaveTemplateModal({
  isOpen,
  onClose,
  templateName,
  templateDesc,
  onNameChange,
  onDescChange,
  onSave
}: SaveTemplateModalProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: templateName,
      description: templateDesc,
    });
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
              value={templateName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Weekly Study Session Template"
              required
            />
          </div>

          <div>
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={templateDesc}
              onChange={(e) => onDescChange(e.target.value)}
              placeholder="Brief description of when to use this template..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!templateName.trim()}>
              Save Template
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
