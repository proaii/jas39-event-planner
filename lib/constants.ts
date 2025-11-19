export const priorityColorMap: Record<string, string> = {
  Urgent: "bg-destructive text-destructive-foreground",
  High: "bg-warning text-warning-foreground",
  Normal: "bg-primary text-primary-foreground",
  Low: "bg-muted text-muted-foreground",
};

export const statusColorMap: Record<string, string> = {
  "To Do": "bg-gray-100 text-gray-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Done: "bg-green-100 text-green-800",
};
