"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner"; // Using sonner for toasts


interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardConfig: {
    upcomingEvents: boolean;
    recentActivity: boolean;
    upcomingDeadlines: boolean;
    progressOverview: boolean;
    miniCalendar: boolean;
  };
  setDashboardConfig: (config: {
    upcomingEvents: boolean;
    recentActivity: boolean;
    upcomingDeadlines: boolean;
    progressOverview: boolean;
    miniCalendar: boolean;
  }) => void;
}

export function CustomizeDashboardModal({
  isOpen,
  onClose,
  dashboardConfig,
  setDashboardConfig,
}: CustomizeDashboardModalProps) {
  const [tempConfig, setTempConfig] = useState(dashboardConfig); // Local state for temp changes

  // Initialize tempConfig when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempConfig(dashboardConfig);
    }
  }, [isOpen, dashboardConfig]);


  const widgetInfo: Record<keyof typeof dashboardConfig, { label: string; desc: string }> = {
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
    miniCalendar: {
      label: "Mini Calendar",
      desc: "Show a mini calendar",
    },
  };

  const widgetKeys = Object.keys(widgetInfo) as (keyof typeof dashboardConfig)[];

  const toggleWidget = (name: keyof typeof dashboardConfig) => {
    setTempConfig((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSave = () => {
    setDashboardConfig(tempConfig); // Use setDashboardConfig from props
    toast.success("Dashboard updated!");
    onClose();
  };

  const handleReset = () => {
    setTempConfig({
      upcomingEvents: true,
      recentActivity: true,
      upcomingDeadlines: true,
      progressOverview: true,
      miniCalendar: false,
    }); // Reset local tempConfig to defaults
    toast.success("Dashboard reset to default!");
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
          {widgetKeys.map((widget) => (
            <div key={widget} className="flex items-start space-x-3">
              <Checkbox
                checked={tempConfig[widget]}
                onCheckedChange={() => toggleWidget(widget)}
              />
              <div>
                <span className="font-medium text-sm">
                  {widgetInfo[widget].label}
                </span>
                <p className="text-xs text-muted-foreground">
                  {widgetInfo[widget].desc}
                </p>
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