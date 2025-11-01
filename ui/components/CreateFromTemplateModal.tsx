import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  eventData: {
    title: string;
    location: string;
    description: string;
    tasks: { name: string }[];
    coverImage?: string;
    color?: string;
  };
  createdBy: string;
  createdAt: string;
}

interface CreateFromTemplateModalProps {
  isOpen: boolean;
  templates: EventTemplate[];
  onClose: () => void;
  onUseTemplate: (eventData: EventTemplate["eventData"]) => void;
}

export function CreateFromTemplateModal({
  isOpen,
  templates,
  onClose,
  onUseTemplate,
}: CreateFromTemplateModalProps) {
  const handleUseTemplate = (template: EventTemplate) => {
    onUseTemplate(template.eventData);
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
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    </div>
                    <Button onClick={() => handleUseTemplate(template)} size="sm">
                      Use Template
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {template.eventData.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {template.eventData.tasks.length} task
                        {template.eventData.tasks.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    {template.eventData.tasks.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">Included Tasks:</div>
                        <div className="flex flex-wrap gap-2">
                          {template.eventData.tasks.slice(0, 3).map((task, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {task.name}
                            </Badge>
                          ))}
                          {template.eventData.tasks.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.eventData.tasks.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                      <span>Created by {template.createdBy}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(template.createdAt).toLocaleDateString()}
                      </div>
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