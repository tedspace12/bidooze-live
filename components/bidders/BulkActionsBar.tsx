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
    <div className="animate-fade-in sticky bottom-4 mx-auto mt-2 flex w-fit items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      <span className="text-sm font-medium text-foreground">
        {selectedCount} bidder{selectedCount > 1 ? 's' : ''} selected
      </span>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={onBlock}
          className="gap-1.5"
        >
          <Ban className="h-4 w-4" />
          Block
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onUnblock}
          className="gap-1.5"
        >
          <CheckCircle className="h-4 w-4" />
          Unblock
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onMessage}
          className="gap-1.5"
        >
          <MessageSquare className="h-4 w-4" />
          Message
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="gap-1.5"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="h-4 w-px bg-border" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
