import { Task, Event, Activity } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { priorityColorMap, statusColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Mock Data
const mockTasks: Task[] = [
  {
    id: "1",
    name: "Design the new landing page",
    status: "In Progress",
    priority: "High",
    dueDate: "2025-11-15",
  },
  {
    id: "2",
    name: "Develop the API for the new feature",
    status: "To Do",
    priority: "Urgent",
    dueDate: "2025-11-10",
  },
  {
    id: "3",
    name: "Write the documentation for the API",
    status: "To Do",
    priority: "Normal",
    dueDate: "2025-11-20",
  },
  {
    id: "4",
    name: "Test the new feature",
    status: "Done",
    priority: "High",
    dueDate: "2025-11-05",
  },
];

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Quarterly Business Review",
    ownerId: "1",
    date: "2025-11-10",
    time: "10:00",
    location: "Boardroom A",
    description: "Review of Q3 performance and planning for Q4.",
    progress: 60,
    tasks: [],
    members: ["Alice", "Bob", "Charlie"],
    color: "#4A90E2",
  },
  {
    id: "2",
    title: "New Feature Launch Party",
    ownerId: "1",
    date: "2025-11-20",
    time: "18:00",
    location: "Main Hall",
    description: "Celebrating the launch of our new feature.",
    progress: 25,
    tasks: [],
    members: ["Alice", "David", "Eve"],
  },
];

const mockActivities: Activity[] = [
  { id: "1", user: "Sarah Chen", action: "completed", item: "Invite speakers", time: "2h ago" },
  { id: "2", user: "Michael Brown", action: "was assigned to", item: "Setup registration", time: "4h ago" },
  { id: "3", user: "Emily Davis", action: "commented on", item: "Hackathon 2025", time: "1d ago" },
  { id: "4", user: "Alice", action: "created event", item: "New Feature Launch Party", time: "2d ago" },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, here is your overview.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-muted/50 border">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.date} at {event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{getInitials(activity.user)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockEvents.map((event) => (
                <div key={event.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.progress}%</p>
                  </div>
                  <Progress value={event.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Tasks</CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Personal Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search tasks..." className="pl-10" />
              </div>
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Sort</Button>
            </div>
            {mockTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-muted/50 border">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", priorityColorMap[task.priority])} />
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                  </div>
                </div>
                <span className={cn("text-sm font-semibold", statusColorMap[task.status])}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
