import { AlertTriangle, Ban, CheckCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'block' | 'unblock';
  bidderName?: string;
  count?: number;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
  bidderName,
  count,
}: ConfirmationDialogProps) {
  const isBlock = type === 'block';
  const isBulk = count && count > 1;

  const title = isBlock
    ? isBulk
      ? `Block ${count} bidders?`
      : `Block ${bidderName}?`
    : isBulk
    ? `Unblock ${count} bidders?`
    : `Unblock ${bidderName}?`;

  const description = isBlock
    ? isBulk
      ? `These ${count} bidders will not be able to place bids on your auctions. You can unblock them at any time.`
      : `${bidderName} will not be able to place bids on your auctions. You can unblock them at any time.`
    : isBulk
    ? `These ${count} bidders will be able to participate in your auctions again.`
    : `${bidderName} will be able to participate in your auctions again.`;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={
                isBlock
                  ? 'rounded-full bg-destructive/10 p-2'
                  : 'rounded-full bg-primary/10 p-2'
              }
            >
              {isBlock ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-700" />
              )}
            </div>
            <AlertDialogTitle className="text-foreground">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isBlock ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isBlock ? (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Block
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Unblock
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
