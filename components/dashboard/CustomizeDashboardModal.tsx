"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWidgets: string[];
  onSave: (selected: string[]) => void;
  onResetDefault?: () => void; 
}

export function CustomizeDashboardModal({
  isOpen,
  onClose,
  selectedWidgets,
  onSave,
}: CustomizeDashboardModalProps) {
  const defaultWidgets = [
    "upcomingEvents",
    "upcomingDeadlines",
    "recentActivity",
    "progressOverview",
  ];

  const widgetInfo: Record<string, { label: string; desc: string }> = {
    upcomingEvents: {
      label: "Upcoming Events",
      desc: "Show your upcoming events overview",
    },
    upcomingDeadlines: {
      label: "Upcoming Deadlines",
      desc: "Show tasks with upcoming due dates",
    },
    recentActivity: {
      label: "Recent Activity",
      desc: "Show team activity and updates",
    },
    progressOverview: {
      label: "Progress Overview",
      desc: "Show event progress charts",
    },
  };

  const [tempWidgets, setTempWidgets] = useState<string[]>(selectedWidgets);

  const toggleWidget = (name: string) => {
    setTempWidgets((prev) =>
      prev.includes(name) ? prev.filter((w) => w !== name) : [...prev, name]
    );
  };

  const handleSave = () => {
    onSave(tempWidgets);
    onClose();
  };

  const handleReset = () => {
    setTempWidgets(defaultWidgets); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Choose which widgets to display on your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {defaultWidgets.map((widget) => (
            <div key={widget} className="flex items-start space-x-3">
              <Checkbox
                checked={tempWidgets.includes(widget)}
                onCheckedChange={() => toggleWidget(widget)}
              />
              <div>
                <span className="font-medium text-sm">{widgetInfo[widget].label}</span>
                <p className="text-xs text-muted-foreground">{widgetInfo[widget].desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
