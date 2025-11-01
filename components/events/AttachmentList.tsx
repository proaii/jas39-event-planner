"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Paperclip } from "lucide-react";
import { Attachment } from "@/lib/types";
import { useAttachmentStore } from "@/stores/attachment-store";

interface AttachmentListProps {
  attachments?: Attachment[];
  showHeader?: boolean;
  compact?: boolean;
  maxItems?: number;
}

export function AttachmentList({
  attachments,
  showHeader,
  compact,
  maxItems,
}: AttachmentListProps) {
  const store = useAttachmentStore();

  React.useEffect(() => {
    if (attachments) store.setAttachments(attachments);
    if (showHeader !== undefined) store.setShowHeader(showHeader);
    if (compact !== undefined) store.setCompact(compact);
    if (maxItems !== undefined) store.setMaxItems(maxItems);
  }, [attachments, showHeader, compact, maxItems, store]);

  if (store.attachments.length === 0) return null;

  const displayAttachments = store.maxItems
    ? store.attachments.slice(0, store.maxItems)
    : store.attachments;

  const hasMoreItems = store.maxItems && store.attachments.length > store.maxItems;

  const handleAttachmentClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-2">
      {store.showHeader && (
        <div className="flex items-center space-x-2">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Attachments ({store.attachments.length})
          </span>
        </div>
      )}

      <div className={`space-y-1 ${store.compact ? "space-y-1" : "space-y-2"}`}>
        {displayAttachments.map((attachment) => (
          <div
            key={attachment.attachmentId}
            className={`group flex items-center justify-between ${
              store.compact
                ? "p-2 hover:bg-muted/50 rounded cursor-pointer"
                : "p-3 bg-muted/30 hover:bg-muted/50 rounded-lg cursor-pointer"
            } transition-colors`}
            onClick={() => handleAttachmentClick(attachment.attachmentUrl)}
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <span className={store.compact ? "text-sm" : "text-base"}>
                {"🔗"}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${store.compact ? "text-sm" : "text-sm"}`}>
                  {attachment.attachmentUrl}
                </div>
                {!store.compact && (
                  <div className="text-xs text-muted-foreground truncate">{attachment.attachmentUrl}</div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={`opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${
                store.compact ? "h-6 w-6 p-0" : "h-8 w-8 p-0"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleAttachmentClick(attachment.attachmentUrl);
              }}
            >
              <ExternalLink className={store.compact ? "w-3 h-3" : "w-4 h-4"} />
            </Button>
          </div>
        ))}

        {hasMoreItems && (
          <div className="text-xs text-muted-foreground text-center py-1">
            +{store.attachments.length - store.maxItems!} more attachment
            {store.attachments.length - store.maxItems! > 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}