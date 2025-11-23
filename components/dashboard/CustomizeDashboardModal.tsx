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
import { toast } from "react-hot-toast";
import { useUiStore, DEFAULT_WIDGETS, type DashboardWidget } from "@/stores/ui-store";

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomizeDashboardModal({
  isOpen,
  onClose,
}: CustomizeDashboardModalProps) {
  const {
    tempWidgets,
    setTempWidgets,
    saveWidgetConfig,
    resetWidgets,
  } = useUiStore();

  const widgetInfo: Record<DashboardWidget, { label: string; desc: string }> = {
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

  const widgetKeys = Object.keys(widgetInfo) as DashboardWidget[];

  const toggleWidget = (name: DashboardWidget) => {
    setTempWidgets((prev) =>
      prev.includes(name) ? prev.filter((w) => w !== name) : [...prev, name]
    );
  };

  const handleSave = () => {
    saveWidgetConfig();
    toast.success("Dashboard updated!");
    onClose();
  };

  const handleReset = () => {
    resetWidgets();
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
                checked={tempWidgets.includes(widget)}
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