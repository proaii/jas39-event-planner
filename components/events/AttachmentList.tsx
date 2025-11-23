"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Paperclip } from "lucide-react";
import type { Attachment, Task } from "@/lib/types";
import { useFetchEventTasks } from "@/lib/client/features/tasks/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { create } from "zustand";

interface AttachmentListProps {
  eventId: string;
  showHeader?: boolean;
  compact?: boolean;
  maxItems?: number;
}

interface AttachmentUiState {
  hasError: boolean;
  setError: (state: boolean) => void;
}

const useAttachmentUiStore = create<AttachmentUiState>((set) => ({
  hasError: false,
  setError: (state) => set({ hasError: state }),
}));

export function AttachmentList({ eventId, showHeader, compact, maxItems }: AttachmentListProps) {
  const { data, isLoading, error } = useFetchEventTasks({ eventId, pageSize: 50 });
  const { toast } = useToast();
  const { hasError, setError } = useAttachmentUiStore();

  // ---- Handle error via toast ----
  React.useEffect(() => {
    if (error) {
      setError(true);
      toast({
        title: "Error loading attachments",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  }, [error, setError, toast]);

  // ---- Flatten paginated tasks safely ----
  const tasks: Task[] = useMemo(() => {
    if (!data) return [];
    if ("pages" in data && Array.isArray(data.pages)) {
      return data.pages.flatMap((p) =>
        Array.isArray(p.items) ? p.items : []
      );
    }
    if ("items" in data && Array.isArray(data.items)) {
      return data.items;
    }
    return [];
  }, [data]);

  // ---- Gather all attachments ----
  const attachments: Attachment[] = useMemo(
    () => tasks.flatMap((t) => t.attachments ?? []),
    [tasks]
  );

  // ---- Loading state with Skeleton ----
  if (isLoading) {
    return (
      <div className="space-y-3">
        {showHeader && (
          <div className="flex items-center space-x-2">
            <Paperclip className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Attachments
            </span>
          </div>
        )}

        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-5/6" />
        <Skeleton className="h-8 w-4/6" />
      </div>
    );
  }

  // ---- Error UI fallback (toast already fired) ----
  if (hasError) {
    return (
      <p className="text-sm text-red-500">
        Failed to load attachments. Please try again later.
      </p>
    );
  }

  if (attachments.length === 0) return null;

  const displayAttachments = maxItems
    ? attachments.slice(0, maxItems)
    : attachments;

  const hasMoreItems = maxItems && attachments.length > maxItems;

  const handleAttachmentClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-2">
      {showHeader && (
        <div className="flex items-center space-x-2">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Attachments ({attachments.length})
          </span>
        </div>
      )}

      <div className={compact ? "space-y-1" : "space-y-2"}>
        {displayAttachments.map((attachment) => (
          <div
            key={attachment.attachmentId}
            className={`group flex items-center justify-between ${
              compact
                ? "p-2 hover:bg-muted/50 rounded cursor-pointer"
                : "p-3 bg-muted/30 hover:bg-muted/50 rounded-lg cursor-pointer"
            } transition-colors`}
            onClick={() => handleAttachmentClick(attachment.attachmentUrl)}
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <span className={compact ? "text-sm" : "text-base"}>{"🔗"}</span>
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium truncate ${compact ? "text-sm" : "text-sm"}`}
                >
                  {attachment.attachmentUrl}
                </div>
                {!compact && (
                  <div className="text-xs text-muted-foreground truncate">
                    {attachment.attachmentUrl}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={`opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${
                compact ? "h-6 w-6 p-0" : "h-8 w-8 p-0"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleAttachmentClick(attachment.attachmentUrl);
              }}
            >
              <ExternalLink className={compact ? "w-3 h-3" : "w-4 h-4"} />
            </Button>
          </div>
        ))}

        {hasMoreItems && (
          <div className="text-xs text-muted-foreground text-center py-1">
            +{attachments.length - maxItems!} more attachment
            {attachments.length - maxItems! > 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
