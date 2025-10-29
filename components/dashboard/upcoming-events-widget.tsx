import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Event } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface UpcomingEventsWidgetProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
  onNavigateToAllEvents?: () => void;
}

export function UpcomingEventsWidget({ events, onEventClick, onNavigateToAllEvents }: UpcomingEventsWidgetProps) {
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Upcoming Events</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={onNavigateToAllEvents}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {sortedEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onEventClick(event.id)}
            >
              <div
                className={cn("w-8 h-8 rounded-md flex-shrink-0", event.color ? event.color : "bg-primary")}
                style={{
                  backgroundImage: event.coverImage ? `url(${event.coverImage})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(event.date)}
                </p>
              </div>
            </div>
          ))}

          {sortedEvents.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No upcoming events
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
