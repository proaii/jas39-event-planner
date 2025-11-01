import React from 'react';
import { Button } from './ui/button';
import { ExternalLink, Paperclip } from 'lucide-react';
import type { Attachment } from '@/lib/types';

interface AttachmentListProps {
  attachments: Attachment[];
  showHeader?: boolean;
  compact?: boolean;
  maxItems?: number;
}

function getDisplayParts(urlStr: string): { host: string; name: string } {
  try {
    const u = new URL(urlStr);
    const host = u.hostname;
    const path = u.pathname;
    const name = decodeURIComponent(path.split('/').filter(Boolean).pop() ?? u.hostname);
    return { host, name: name || host };
  } catch {
    return { host: '', name: urlStr };
  }
}

export function AttachmentList({
  attachments,
  showHeader = true,
  compact = false,
  maxItems,
}: AttachmentListProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const displayAttachments = maxItems ? attachments.slice(0, maxItems) : attachments;
  const hasMoreItems = !!maxItems && attachments.length > maxItems;

  const handleAttachmentClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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

      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        {displayAttachments.map((attachment) => {
          const { host, name } = getDisplayParts(attachment.attachmentUrl);
          return (
            <div
              key={attachment.attachmentId}
              className={`group flex items-center justify-between ${
                compact
                  ? 'p-2 hover:bg-muted/50 rounded cursor-pointer'
                  : 'p-3 bg-muted/30 hover:bg-muted/50 rounded-lg cursor-pointer'
              } transition-colors`}
              onClick={() => handleAttachmentClick(attachment.attachmentUrl)}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className={compact ? 'text-sm' : 'text-base'} aria-hidden>
                  🔗
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${compact ? 'text-sm' : 'text-sm'}`}>
                    {name}
                  </div>
                  {!compact && host && (
                    <div className="text-xs text-muted-foreground truncate">{host}</div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${
                  compact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAttachmentClick(attachment.attachmentUrl);
                }}
                aria-label="Open attachment"
                title="Open attachment"
              >
                <ExternalLink className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
              </Button>
            </div>
          );
        })}

        {hasMoreItems && (
          <div className="text-xs text-muted-foreground text-center py-1">
            +{attachments.length - (maxItems as number)} more attachment
            {attachments.length - (maxItems as number) > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
