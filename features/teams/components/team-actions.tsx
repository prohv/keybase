import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { PlusCircle, UserPlus, Trash2, X } from 'lucide-react';

interface TeamActionsProps {
  selecting: boolean;
  isCreator: boolean;
  selectedTeamCount: number;
  onCancelSelection: () => void;
  onDeleteTeamClick: () => void;
  onStartSelectingTeams: () => void;
}

export function TeamActions({
  selecting,
  isCreator,
  selectedTeamCount,
  onCancelSelection,
  onDeleteTeamClick,
  onStartSelectingTeams,
}: TeamActionsProps) {
  return (
    <SidebarGroup className="mt-2">
      <SidebarGroupLabel className="text-forest/60 font-medium px-4">Team Actions</SidebarGroupLabel>
      <SidebarGroupContent className="p-2">
        {selecting ? (
          <div className="flex flex-col gap-2 px-2">
            <div className="text-xs text-muted-foreground font-medium italic">Select teams to delete</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onCancelSelection} className="flex-1 h-8 text-xs border-border-light">
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onDeleteTeamClick}
                disabled={selectedTeamCount === 0}
                className="flex-1 h-8 text-xs bg-destructive hover:bg-destructive/90 text-white disabled:opacity-40"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete ({selectedTeamCount})
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            <Link
              href="/team/join"
              className="flex items-center gap-3 px-4 py-2 text-sm text-olive hover:bg-bg-muted rounded-lg transition-colors font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Join Team
            </Link>
            <Link
              href="/team/create"
              className="flex items-center gap-3 px-4 py-2 text-sm text-olive hover:bg-bg-muted rounded-lg transition-colors font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Create Team
            </Link>
            {isCreator && (
              <button
                onClick={onStartSelectingTeams}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Team
              </button>
            )}
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
