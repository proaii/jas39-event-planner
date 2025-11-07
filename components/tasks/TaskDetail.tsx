import React from 'react';
import { Task, UserLite } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { priorityColorMap, statusColorMap } from "@/lib/constants";

interface TaskDetailProps {
  task: Task;
}

export function TaskDetail({ task }: TaskDetailProps) {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Status</h3>
            <Badge className={statusColorMap[task.taskStatus]}>{task.taskStatus}</Badge>
          </div>
          <div>
            <h3 className="font-medium">Priority</h3>
            <Badge className={priorityColorMap[task.taskPriority]}>{task.taskPriority}</Badge>
          </div>
          {task.endAt && (
            <div>
              <h3 className="font-medium">Due Date</h3>
              <p>{new Date(task.endAt).toLocaleDateString()}</p>
            </div>
          )}
          {task.description && (
            <div>
              <h3 className="font-medium">Description</h3>
              <p>{task.description}</p>
            </div>
          )}
          <div>
            <h3 className="font-medium">Assignees</h3>
            <div className="flex space-x-2">
              {task.assignees?.map((assignee: UserLite) => (
                <Badge key={assignee.userId}>{assignee.username}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}