import { Ban, CheckCircle, MessageSquare, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionsBarProps {
  selectedCount: number;
  onBlock: () => void;
  onUnblock: () => void;
  onMessage: () => void;
  onExport: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onBlock,
  onUnblock,
  onMessage,
  onExport,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="animate-fade-in fixed inset-x-3 bottom-3 z-40 sm:sticky sm:bottom-4 sm:mx-auto sm:mt-2 sm:w-fit sm:inset-x-auto">
      <div className="rounded-lg border border-border bg-card px-3 py-3 shadow-lg sm:px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <span className="text-sm font-medium text-foreground">
              {selectedCount} bidder{selectedCount > 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground sm:hidden"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={onBlock}
              className="h-9 w-full gap-1.5 sm:w-auto"
            >
              <Ban className="h-4 w-4" />
              Block
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onUnblock}
              className="h-9 w-full gap-1.5 sm:w-auto"
            >
              <CheckCircle className="h-4 w-4" />
              Unblock
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onMessage}
              className="h-9 w-full gap-1.5 sm:w-auto"
            >
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="h-9 w-full gap-1.5 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="hidden h-4 w-px bg-border sm:block" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="hidden h-8 w-8 p-0 text-muted-foreground hover:text-foreground sm:inline-flex"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
