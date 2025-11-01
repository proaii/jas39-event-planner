import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Event } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface UpcomingEventsWidgetProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
  onNavigateToAllEvents?: () => void;
}

// color:number -> ใช้พาเลตง่ายๆจากเลข
const COLOR_PALETTE = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#A855F7"];

export function UpcomingEventsWidget({ events, onEventClick, onNavigateToAllEvents }: UpcomingEventsWidgetProps) {
  const dateOf = (e: Event) => e.startAt ?? e.endAt ?? e.createdAt;
  const sortedEvents = [...events].sort((a, b) => new Date(dateOf(a)).getTime() - new Date(dateOf(b)).getTime());

  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Upcoming Events</h3>
          <Button variant="ghost" size="sm" className="text-primary" onClick={onNavigateToAllEvents}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {sortedEvents.slice(0, 3).map((event) => {
            const bgColor = COLOR_PALETTE[Math.abs(event.color) % COLOR_PALETTE.length];
            const dateStr = dateOf(event);
            return (
              <div
                key={event.eventId}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onEventClick(event.eventId)}
              >
                <div
                  className={cn("w-8 h-8 rounded-md flex-shrink-0")}
                  style={{
                    backgroundColor: event.coverImageUri ? undefined : bgColor,
                    backgroundImage: event.coverImageUri ? `url(${event.coverImageUri})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(dateStr)}</p>
                </div>
              </div>
            );
          })}

          {sortedEvents.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">No upcoming events</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
