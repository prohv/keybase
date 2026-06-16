import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ApiKeyDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deleteCandidate: { id: number; name: string } | null;
  isPending: boolean;
  onDelete: () => void;
}

export function ApiKeyDeleteDialog({
  isOpen,
  onOpenChange,
  deleteCandidate,
  isPending,
  onDelete,
}: ApiKeyDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-border-light">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-forest flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-olive" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className="font-medium">
            Are you sure you want to delete <span className="font-semibold text-forest">&quot;{deleteCandidate?.name}&quot;</span>?
            This action is <span className="text-destructive font-semibold">irreversible</span>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="border-border-light hover:bg-bg-muted"
          >
            Keep Key
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-red-700 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Permanently'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
