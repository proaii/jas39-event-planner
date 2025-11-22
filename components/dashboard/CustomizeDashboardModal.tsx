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
import { create } from "zustand";
import { useToast } from "@/components/ui/use-toast";

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomizeDashboardUiState {
  tempWidgets: string[];
  setTempWidgets: (widgets: string[] | ((prev: string[]) => string[])) => void;
  isPending: boolean;
  setIsPending: (pending: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;
}

const useCustomizeDashboardUiStore = create<CustomizeDashboardUiState>((set) => ({
  tempWidgets: ["upcomingEvents", "upcomingDeadlines", "recentActivity", "progressOverview"],
  setTempWidgets: (widgets) =>
    typeof widgets === "function"
      ? set((state) => ({ tempWidgets: widgets(state.tempWidgets) }))
      : set({ tempWidgets: widgets }),
  isPending: false,
  setIsPending: (pending) => set({ isPending: pending }),
  error: null,
  setError: (err) => set({ error: err }),
}));

export function CustomizeDashboardModal({ isOpen, onClose }: CustomizeDashboardModalProps) {
  const defaultWidgets = ["upcomingEvents", "upcomingDeadlines", "recentActivity", "progressOverview"];

  const widgetInfo: Record<string, { label: string; desc: string }> = {
    upcomingEvents: { label: "Upcoming Events", desc: "Show your upcoming events overview" },
    upcomingDeadlines: { label: "Upcoming Deadlines", desc: "Show tasks with upcoming due dates" },
    recentActivity: { label: "Recent Activity", desc: "Show team activity and updates" },
    progressOverview: { label: "Progress Overview", desc: "Show event progress charts" },
  };

  const { tempWidgets, setTempWidgets, isPending, setIsPending, error, setError } =
    useCustomizeDashboardUiStore();
  const { toast } = useToast();

  const toggleWidget = (name: string) => {
    setTempWidgets((prev) =>
      prev.includes(name) ? prev.filter((w) => w !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    setError(null);
    setIsPending(true);
    try {
      // Front-end only: simulate async save
      await new Promise((res) => setTimeout(res, 500));
      toast({ title: "Success", description: "Dashboard updated!" });
      onClose();
    } catch (err: any) {
      const msg = err?.message || "Failed to save settings";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
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
                disabled={isPending}
              />
              <div>
                <span className="font-medium text-sm">{widgetInfo[widget].label}</span>
                <p className="text-xs text-muted-foreground">{widgetInfo[widget].desc}</p>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleReset} disabled={isPending}>
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
