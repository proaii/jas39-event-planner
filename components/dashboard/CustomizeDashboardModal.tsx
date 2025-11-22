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
import { useToast } from "@/components/ui/use-toast";
import { useDashboardUiStore, DEFAULT_WIDGETS, type DashboardWidget } from "@/stores/dashboard-ui-store";

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomizeDashboardModal({
  isOpen,
  onClose,
}: CustomizeDashboardModalProps) {
  const { toast } = useToast();

  const {
    tempWidgets,
    setTempWidgets,
    saveWidgetConfig,
    resetWidgetConfig,
    isLoading,
    error,
    setLoading,
    setError,
  } = useDashboardUiStore();

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

  const handleSave = async () => {
    setError(null);
    setLoading(true);

    try {
      // mock async save
      await new Promise((res) => setTimeout(res, 500));
      saveWidgetConfig();

      toast({
        title: "Success",
        description: "Dashboard updated!",
      });

      onClose();
    } catch (err: any) {
      const msg = err?.message ?? "Failed to save settings";
      setError(msg);

      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                disabled={isLoading}
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

        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={resetWidgetConfig}
            disabled={isLoading}
          >
            Reset to Default
          </Button>

          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
