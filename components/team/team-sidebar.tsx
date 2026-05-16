'use client';

import { useState } from 'react';
import { Trash2, Users, PlusCircle, UserPlus, AlertTriangle, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteTeamsAction } from '@/app/team/delete/action';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from '@/components/ui/sidebar';

interface Team {
    id: number;
    name: string;
    teamCode: string;
}

interface TeamSidebarProps {
    teams: Team[];
}

export function TeamSidebar({ teams }: TeamSidebarProps) {
    const router = useRouter();
    const [selecting, setSelecting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showDialog, setShowDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function toggleSelect(id: number) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function cancelSelection() {
        setSelecting(false);
        setSelectedIds(new Set());
    }

    function handleDeleteClick() {
        if (selectedIds.size === 0) return;
        setShowDialog(true);
    }

    async function confirmDelete() {
        setDeleting(true);
        const res = await deleteTeamsAction(Array.from(selectedIds));
        setDeleting(false);
        setShowDialog(false);
        cancelSelection();

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(`Deleted ${selectedIds.size} team(s)`);
            router.push('/dashboard');
        }
    }

    return (
        <>
            <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-forest/60 font-medium px-4">
                    Your Teams
                </SidebarGroupLabel>
                <SidebarGroupContent className="p-2">
                    {teams.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground italic">No teams yet</div>
                    ) : (
                        <div className="space-y-0.5">
                            {teams.map((team) => (
                                <div key={team.id} className="flex items-center gap-2 px-2">
                                    {selecting && (
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(team.id)}
                                            onChange={() => toggleSelect(team.id)}
                                            className="w-4 h-4 rounded border-border-light text-green-dark accent-green-dark shrink-0"
                                        />
                                    )}
                                    {selecting ? (
                                        <div
                                            onClick={() => toggleSelect(team.id)}
                                            className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer flex-1 transition-colors ${
                                                selectedIds.has(team.id)
                                                    ? 'bg-green-dark/10 text-forest'
                                                    : 'text-forest hover:bg-bg-muted'
                                            }`}
                                        >
                                            <Users className="w-4 h-4 text-forest/40" />
                                            <span className="font-medium truncate text-sm">{team.name}</span>
                                        </div>
                                    ) : (
                                        <Link
                                            href={`/dashboard?team=${team.id}`}
                                            className="flex items-center gap-3 px-2 py-2 text-forest hover:bg-bg-muted rounded-lg flex-1 group"
                                        >
                                            <Users className="w-4 h-4 text-forest/40 group-hover:text-forest" />
                                            <span className="font-medium truncate text-sm">{team.name}</span>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-forest/60 font-medium px-4">
                    Actions
                </SidebarGroupLabel>
                <SidebarGroupContent className="p-2">
                    {selecting ? (
                        <div className="flex flex-col gap-2 px-2">
                            <div className="text-xs text-muted-foreground font-medium italic">
                                Select teams to delete
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelSelection}
                                    className="flex-1 h-8 text-xs border-border-light"
                                >
                                    <X className="w-3 h-3 mr-1" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleDeleteClick}
                                    disabled={selectedIds.size === 0}
                                    className="flex-1 h-8 text-xs bg-destructive hover:bg-destructive/90 text-white disabled:opacity-40"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete ({selectedIds.size})
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            <Link
                                href="/team/create"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-forest hover:bg-bg-muted rounded-lg transition-colors font-medium"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Create Team
                            </Link>
                            <Link
                                href="/team/join"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-olive hover:bg-bg-muted rounded-lg transition-colors font-medium"
                            >
                                <UserPlus className="w-4 h-4" />
                                Join Team
                            </Link>
                            <button
                                onClick={() => { setSelecting(true); setSelectedIds(new Set()); }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Team
                            </button>
                        </div>
                    )}
                </SidebarGroupContent>
            </SidebarGroup>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md bg-white border-border-light">
                    <DialogHeader>
                        <DialogTitle className="font-heading font-bold text-forest flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Delete Teams
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                            Are you sure you want to delete <span className="font-semibold text-forest">{selectedIds.size}</span> team(s)?
                            This will permanently delete all API keys and member data. This action is{' '}
                            <span className="text-destructive font-semibold">irreversible</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setShowDialog(false)}
                            disabled={deleting}
                            className="border-border-light hover:bg-bg-muted"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-destructive hover:bg-red-700 text-white"
                        >
                            {deleting ? (
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
        </>
    );
}
