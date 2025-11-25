// components/tasks/task-detail-sections/TaskDetailAttachments.tsx
import React from 'react';
import { Paperclip } from 'lucide-react';
import { Attachment } from '@/lib/types';

interface TaskDetailAttachmentsProps {
  attachments: Attachment[] | undefined;
}

export const TaskDetailAttachments: React.FC<TaskDetailAttachmentsProps> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
        <Paperclip className="w-4 h-4" />
        <h3>Attachments</h3>
      </div>
      <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
        {attachments.map((attachment) => (
          <a
            key={attachment.attachmentId}
            href={attachment.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
          >
            <Paperclip className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary hover:underline truncate">
              {attachment.attachmentUrl}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};
