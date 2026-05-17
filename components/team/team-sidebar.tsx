'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trash2, PlusCircle, UserPlus, AlertTriangle, Loader2, X, ChevronLeft, ChevronRight, FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
    createdBy: number | null;
}

interface TeamSidebarProps {
    teams: Team[];
    currentUserId?: number;
}

interface Project {
    id: number;
    name: string;
}

const PER_PAGE = 3;

export function TeamSidebar({ teams, currentUserId }: TeamSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selecting, setSelecting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [projectSelecting, setProjectSelecting] = useState(false);
    const [selectedProjectIds, setSelectedProjectIds] = useState<Set<number>>(new Set());
    const [showDialog, setShowDialog] = useState(false);
    const [deleteMode, setDeleteMode] = useState<'team' | 'project'>('team');
    const [deleting, setDeleting] = useState(false);
    const [projectPage, setProjectPage] = useState(1);
    const [showAllProjects, setShowAllProjects] = useState(false);

    const activeTeamId = parseInt(searchParams.get('team') || String(teams[0]?.id || 0));
    const activeTeam = teams.find(t => t.id === activeTeamId) || teams[0];
    const isCreator = activeTeam ? activeTeam.createdBy === currentUserId : false;
    const activeProjectId = searchParams.get('project') || null;

    const fetchProjects = useCallback(async () => {
        if (!activeTeamId) return;
        try {
            const res = await fetch(`/api/project/list?teamId=${activeTeamId}`);
            const data = await res.json();
            if (data.success) setProjects(data.data);
        } catch { /* ignore */ }
    }, [activeTeamId]);

    useEffect(() => { fetchProjects(); }, [fetchProjects, searchParams.toString()]);

    const totalProjectPages = Math.ceil(projects.length / PER_PAGE);
    const displayProjects = showAllProjects
        ? projects.slice((projectPage - 1) * PER_PAGE, projectPage * PER_PAGE)
        : projects.slice(0, PER_PAGE);
    const remaining = projects.length - PER_PAGE;

    function qs(params: Record<string, string>) {
        const sp = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([k, v]) => v ? sp.set(k, v) : sp.delete(k));
        return `/dashboard?${sp.toString()}`;
    }

    function cancelAllSelection() {
        setSelecting(false);
        setSelectedIds(new Set());
        setProjectSelecting(false);
        setSelectedProjectIds(new Set());
    }

    function toggleSelect(id: number) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleProjectSelect(id: number) {
        setSelectedProjectIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function handleTeamDeleteClick() {
        if (selectedIds.size === 0) return;
        setDeleteMode('team');
        setShowDialog(true);
    }

    function handleProjectDeleteClick() {
        if (selectedProjectIds.size === 0) return;
        setDeleteMode('project');
        setShowDialog(true);
    }

    async function confirmDelete() {
        setDeleting(true);
        if (deleteMode === 'team') {
            const res = await deleteTeamsAction(Array.from(selectedIds));
            setDeleting(false);
            setShowDialog(false);
            cancelAllSelection();
            if (res.error) { toast.error(res.error); }
            else { toast.success(`Deleted ${selectedIds.size} team(s)`); router.push('/dashboard'); }
        } else {
            try {
                for (const pid of selectedProjectIds) {
                    await fetch('/api/project/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ projectId: pid }),
                    });
                }
                setDeleting(false);
                setShowDialog(false);
                cancelAllSelection();
                toast.success(`Deleted ${selectedProjectIds.size} project(s)`);
                fetchProjects();
            } catch {
                setDeleting(false);
                toast.error('Failed to delete projects');
            }
        }
    }

    function renderDialog() {
        const isTeam = deleteMode === 'team';
        return (
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md bg-white border-border-light">
                    <DialogHeader>
                        <DialogTitle className="font-heading font-bold text-forest flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Delete {isTeam ? 'Teams' : 'Projects'}
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                            Are you sure you want to delete <span className="font-semibold text-forest">
                                {isTeam ? selectedIds.size : selectedProjectIds.size}
                            </span> {isTeam ? 'team(s)' : 'project(s)'}?
                            {isTeam
                                ? ' This will permanently delete all projects, API keys, and member data.'
                                : ' This will permanently delete all API keys in this project.'}
                            {' '}This action is <span className="text-destructive font-semibold">irreversible</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setShowDialog(false)} disabled={deleting} className="border-border-light hover:bg-bg-muted">Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={deleting} className="bg-destructive hover:bg-red-700 text-white">
                            {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : 'Delete Permanently'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <>
            {/* Team Switcher */}
            <SidebarGroup className="mt-2">
                <SidebarGroupLabel className="text-forest/60 font-medium px-4">Team</SidebarGroupLabel>
                <SidebarGroupContent className="p-2">
                    <select
                        value={activeTeamId}
                        onChange={(e) => router.push(qs({ team: e.target.value, project: '' }))}
                        className="w-full px-3 py-2 text-sm font-medium text-forest bg-white border border-border-light rounded-lg focus:outline-none focus:border-sage cursor-pointer appearance-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 8px center',
                            paddingRight: '28px',
                        }}
                    >
                        {teams.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </SidebarGroupContent>
            </SidebarGroup>

            {/* Projects */}
            <SidebarGroup className="mt-2">
                <SidebarGroupLabel className="text-forest/60 font-medium px-4">Projects</SidebarGroupLabel>
                <SidebarGroupContent className="p-2">
                    {projects.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground italic">No projects yet</div>
                    ) : (
                        <div className="space-y-0.5">
                            {displayProjects.map((p) => {
                                const isActive = String(p.id) === activeProjectId;
                                return (
                                    <div key={p.id} className="flex items-center gap-2 px-1">
                                        {projectSelecting && (
                                            <input
                                                type="checkbox"
                                                checked={selectedProjectIds.has(p.id)}
                                                onChange={() => toggleProjectSelect(p.id)}
                                                className="w-4 h-4 rounded border-border-light text-green-dark accent-green-dark shrink-0"
                                            />
                                        )}
                                        {projectSelecting ? (
                                            <div
                                                onClick={() => toggleProjectSelect(p.id)}
                                                className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer flex-1 transition-colors text-sm ${
                                                    selectedProjectIds.has(p.id)
                                                        ? 'bg-green-dark/10 text-forest font-semibold'
                                                        : 'text-forest hover:bg-bg-muted'
                                                }`}
                                            >
                                                <FolderKanban className={`w-4 h-4 shrink-0 ${selectedProjectIds.has(p.id) ? 'text-green-dark' : 'text-forest/40'}`} />
                                                <span className="truncate flex-1">{p.name}</span>
                                            </div>
                                        ) : (
                                            <Link
                                                href={qs({ project: String(p.id) })}
                                                className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors flex-1 group ${
                                                    isActive
                                                        ? 'bg-green-dark/10 text-forest font-semibold'
                                                        : 'text-forest hover:bg-bg-muted'
                                                }`}
                                            >
                                                <FolderKanban className={`w-4 h-4 shrink-0 ${isActive ? 'text-green-dark' : 'text-forest/40 group-hover:text-forest'}`} />
                                                <span className="truncate flex-1">{p.name}</span>
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {projectSelecting && projects.length > 0 && (
                        <div className="mt-2 px-1">
                            <Button size="sm" variant="destructive" onClick={handleProjectDeleteClick} disabled={selectedProjectIds.size === 0} className="w-full h-8 text-xs">
                                <Trash2 className="w-3 h-3 mr-1" />Delete ({selectedProjectIds.size})
                            </Button>
                        </div>
                    )}

                    {projects.length > PER_PAGE && !projectSelecting && (
                        <div className="mt-2 px-1">
                            {showAllProjects ? (
                                <div className="flex items-center justify-between">
                                    <button onClick={() => setProjectPage(Math.max(1, projectPage - 1))} disabled={projectPage <= 1} className="p-1 text-forest/40 hover:text-forest disabled:opacity-20"><ChevronLeft className="w-3.5 h-3.5" /></button>
                                    <span className="text-[11px] font-medium text-forest/40">{projectPage} / {totalProjectPages}</span>
                                    <button onClick={() => setProjectPage(Math.min(totalProjectPages, projectPage + 1))} disabled={projectPage >= totalProjectPages} className="p-1 text-forest/40 hover:text-forest disabled:opacity-20"><ChevronRight className="w-3.5 h-3.5" /></button>
                                </div>
                            ) : (
                                <button onClick={() => { setShowAllProjects(true); setProjectPage(2); }} className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:text-forest font-medium transition-colors">
                                    +{remaining} more
                                </button>
                            )}
                        </div>
                    )}

                    {!projectSelecting && (
                        <Link href={qs({ project: 'new' })} className="flex items-center gap-3 px-3 py-2 mt-1 text-sm text-muted-foreground hover:text-forest hover:bg-bg-muted rounded-lg transition-colors font-medium">
                            <PlusCircle className="w-4 h-4" />Create Project
                        </Link>
                    )}

                    {!projectSelecting && projects.length > 0 && (
                        <button onClick={() => { cancelAllSelection(); setProjectSelecting(true); setSelectedProjectIds(new Set()); setShowAllProjects(true); setProjectPage(1); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors font-medium">
                            <Trash2 className="w-4 h-4" />Delete Project
                        </button>
                    )}
                </SidebarGroupContent>
            </SidebarGroup>

            {/* Team Actions */}
            <SidebarGroup className="mt-2">
                <SidebarGroupLabel className="text-forest/60 font-medium px-4">Team Actions</SidebarGroupLabel>
                <SidebarGroupContent className="p-2">
                    {selecting ? (
                        <div className="flex flex-col gap-2 px-2">
                            <div className="text-xs text-muted-foreground font-medium italic">Select teams to delete</div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={cancelAllSelection} className="flex-1 h-8 text-xs border-border-light"><X className="w-3 h-3 mr-1" />Cancel</Button>
                                <Button size="sm" onClick={handleTeamDeleteClick} disabled={selectedIds.size === 0} className="flex-1 h-8 text-xs bg-destructive hover:bg-destructive/90 text-white disabled:opacity-40"><Trash2 className="w-3 h-3 mr-1" />Delete ({selectedIds.size})</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            <Link href="/team/join" className="flex items-center gap-3 px-4 py-2 text-sm text-olive hover:bg-bg-muted rounded-lg transition-colors font-medium"><UserPlus className="w-4 h-4" />Join Team</Link>
                            <Link href="/team/create" className="flex items-center gap-3 px-4 py-2 text-sm text-olive hover:bg-bg-muted rounded-lg transition-colors font-medium"><PlusCircle className="w-4 h-4" />Create Team</Link>
                            {isCreator && (
                                <button onClick={() => { cancelAllSelection(); setSelecting(true); setSelectedIds(new Set()); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors font-medium"><Trash2 className="w-4 h-4" />Delete Team</button>
                            )}
                        </div>
                    )}
                </SidebarGroupContent>
            </SidebarGroup>

            {renderDialog()}
        </>
    );
}
