import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { deleteTeamsAction } from '@/app/team/delete/action';
import { deleteProjectAction } from '@/app/project/delete/action';

interface Team {
  id: number;
  name: string;
  teamCode: string;
  createdBy: number | null;
}

interface Project {
  id: number;
  name: string;
}

const PER_PAGE = 3;

export function useTeamSidebar(teams: Team[], currentUserId?: number) {
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

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!activeTeamId) return;
      try {
        const res = await fetch(`/api/project/list?teamId=${activeTeamId}`);
        const data = await res.json();
        if (data.success && active) {
          setProjects(data.data);
        }
      } catch { /* ignore */ }
    }
    load();
    return () => {
      active = false;
    };
  }, [activeTeamId, refreshTrigger]);

  const totalProjectPages = Math.ceil(projects.length / PER_PAGE);
  const displayProjects = showAllProjects
    ? projects.slice((projectPage - 1) * PER_PAGE, projectPage * PER_PAGE)
    : projects.slice(0, PER_PAGE);
  const remaining = projects.length - PER_PAGE;

  function qs(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
    return `/dashboard?${sp.toString()}`;
  }

  function cancelAllSelection() {
    setSelecting(false);
    setSelectedIds(new Set());
    setProjectSelecting(false);
    setSelectedProjectIds(new Set());
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
      if ('error' in res) {
        toast.error(res.error);
      } else {
        toast.success(`Deleted ${selectedIds.size} team(s)`);
        router.push('/dashboard');
      }
    } else {
      try {
        for (const pid of selectedProjectIds) {
          const res = await deleteProjectAction(pid);
          if (res && 'error' in res) {
            throw new Error(res.error);
          }
        }
        setDeleting(false);
        setShowDialog(false);
        cancelAllSelection();
        toast.success(`Deleted ${selectedProjectIds.size} project(s)`);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        setDeleting(false);
        const errMsg = err instanceof Error ? err.message : 'Failed to delete projects';
        toast.error(errMsg);
      }
    }
  }

  return {
    activeTeamId,
    activeTeam,
    isCreator,
    activeProjectId,
    projects,
    displayProjects,
    remaining,
    totalProjectPages,
    projectPage,
    setProjectPage,
    showAllProjects,
    setShowAllProjects,
    selecting,
    setSelecting,
    selectedIds,
    setSelectedIds,
    projectSelecting,
    setProjectSelecting,
    selectedProjectIds,
    setSelectedProjectIds,
    showDialog,
    setShowDialog,
    deleteMode,
    deleting,
    qs,
    cancelAllSelection,
    toggleProjectSelect,
    handleTeamDeleteClick,
    handleProjectDeleteClick,
    confirmDelete,
  };
}
