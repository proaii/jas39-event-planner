import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, Paperclip, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  url: string;
  title: string;
  favicon?: string;
}

interface AttachmentViewModalProps {
  isOpen: boolean;
  attachments: Attachment[];
  taskName: string;
  onClose: () => void;
}

export function AttachmentViewModal({ 
  isOpen, 
  attachments, 
  taskName, 
  onClose 
}: AttachmentViewModalProps) {
  const handleAttachmentClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const getAttachmentType = (url: string): string => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('docs.google.com')) return 'Google Doc';
      if (urlObj.hostname.includes('figma.com')) return 'Figma Design';
      if (urlObj.hostname.includes('github.com')) return 'GitHub Repository';
      if (urlObj.hostname.includes('drive.google.com')) return 'Google Drive File';
      if (urlObj.hostname.includes('notion.so')) return 'Notion Page';
      if (urlObj.hostname.includes('slack.com')) return 'Slack Message';
      if (urlObj.hostname.includes('trello.com')) return 'Trello Board';
      return 'External Link';
    } catch {
      return 'External Link';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Paperclip className="w-5 h-5 text-primary" />
            <span>Attachments for "{taskName}"</span>
          </DialogTitle>
          <DialogDescription>
            View and manage all attachments linked to this task. Click on any attachment to open it in a new tab.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {attachments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Paperclip className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No attachments found for this task.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {attachments.length} attachment{attachments.length !== 1 ? 's' : ''} found
                </p>
                <Badge variant="secondary">
                  {attachments.length} total
                </Badge>
              </div>

              <div className="space-y-3">
                {attachments.map((attachment, index) => (
                  <div
                    key={attachment.id}
                    className="group p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="text-2xl mt-1 flex-shrink-0">
                          {attachment.favicon || '🔗'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-foreground truncate">
                              {attachment.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {getAttachmentType(attachment.url)}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground break-all mb-3">
                            {attachment.url}
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleAttachmentClick(attachment.url)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Open Link
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyUrl(attachment.url)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}