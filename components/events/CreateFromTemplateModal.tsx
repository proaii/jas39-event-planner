'use client';

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
import type { TemplateData } from "@/schemas/template";
import type { EventTemplate } from "@/lib/types";
import { useFetchTemplates } from "@/lib/client/features/templates/hooks";

interface CreateFromTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (eventData: TemplateData) => void;
}

export function CreateFromTemplateModal({
  isOpen,
  onClose,
  onUseTemplate,
}: CreateFromTemplateModalProps) {

  const { data: templates, isLoading, error } = useFetchTemplates();

  // --- map EventTemplateData -> TemplateData ---
  const mapEventTemplateToTemplateData = (template: EventTemplate): TemplateData => {
    const e = template.eventData.event;
    return {
      name: template.name,
      title: e.title,
      description: template.description ?? e.description ?? "",
      eventDescription: e.description ?? undefined,
      location: e.location ?? undefined,
      coverImageUri: e.cover_image_uri ?? undefined,
      color: Number(e.color),        // <-- แปลงเป็น number
      startAt: e.start_at ?? undefined,
      endAt: e.end_at ?? undefined,
      members: e.members ?? [],
      tasks: template.eventData.tasks.map(task => ({
        title: task.title,
        description: task.description ?? undefined,
        taskStatus: task.task_status,
        taskPriority: task.task_priority,
        startAt: task.start_at ?? undefined,
        endAt: task.end_at ?? undefined,
        assignees: task.assignees ?? [],
      }))
    };
  };

  const handleSelectTemplate = (template: EventTemplate) => {
    const merged = mapEventTemplateToTemplateData(template);
    onUseTemplate(merged);
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

        {isLoading && (
          <p className="text-center py-8 text-muted-foreground">
            Loading templates...
          </p>
        )}

        {error && (
          <p className="text-center py-8 text-red-500">
            Failed to load templates: {error.message}
          </p>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {(templates?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">No templates available yet.</div>
                <div className="text-xs mt-1">
                  Create an event and save it as a template to get started.
                </div>
              </div>
            ) : (
              templates!.map((template: EventTemplate) => {
                const event = template.eventData.event;
                return (
                  <Card
                    key={template.templateId}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
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

                    {event && (
                      <CardContent className="pt-0 space-y-3">
                        {event.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        )}

                        {event.start_at && (
                          <div className="flex justify-end text-xs text-muted-foreground pt-2 border-t border-border">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(event.start_at).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
