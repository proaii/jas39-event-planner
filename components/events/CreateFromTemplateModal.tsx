"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { TemplateData } from "@/schemas/template";

interface CreateFromTemplateModalProps {
  isOpen: boolean;
  templates: TemplateData[];
  onClose: () => void;
  onUseTemplate: (eventData: TemplateData) => void;
}

export function CreateFromTemplateModal({
  isOpen,
  templates,
  onClose,
  onUseTemplate,
}: CreateFromTemplateModalProps) {
  const handleSelectTemplate = (template: TemplateData) => {
    onUseTemplate(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Select a saved template to quickly create a new event with pre-configured tasks and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-sm">No templates available yet.</div>
              <div className="text-xs mt-1">
                Create an event and save it as a template to get started.
              </div>
            </div>
          ) : (
            templates.map((template) => (
              <Card
                key={template.name + (template.startAt || "")}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => handleSelectTemplate(template)}>
                      Use Template
                    </Button>
                  </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {template.location}
                    </div>
                                      </div>



                  <div className="flex justify-end text-xs text-muted-foreground pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(template.startAt || "").toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
