import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface TeamDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deleteMode: 'team' | 'project';
  selectedTeamCount: number;
  selectedProjectCount: number;
  isPending: boolean;
  onConfirm: () => void;
}

export function TeamDeleteDialog({
  isOpen,
  onOpenChange,
  deleteMode,
  selectedTeamCount,
  selectedProjectCount,
  isPending,
  onConfirm,
}: TeamDeleteDialogProps) {
  const isTeam = deleteMode === 'team';
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-border-light">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-forest flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete {isTeam ? 'Teams' : 'Projects'}
          </DialogTitle>
          <DialogDescription className="font-medium">
            Are you sure you want to delete <span className="font-semibold text-forest">
              {isTeam ? selectedTeamCount : selectedProjectCount}
            </span> {isTeam ? 'team(s)' : 'project(s)'}?
            {isTeam
              ? ' This will permanently delete all projects, API keys, and member data.'
              : ' This will permanently delete all API keys in this project.'}
            {' '}This action is <span className="text-destructive font-semibold">irreversible</span>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="border-border-light hover:bg-bg-muted"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
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
