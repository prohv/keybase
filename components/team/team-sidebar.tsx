'use client';

import { useRouter } from 'next/navigation';
import { useTeamSidebar } from '@/features/teams/hooks/use-team-sidebar';
import { TeamDeleteDialog } from '@/features/teams/components/team-delete-dialog';
import { TeamSwitcher } from '@/features/teams/components/team-switcher';
import { ProjectList } from '@/features/teams/components/project-list';
import { TeamActions } from '@/features/teams/components/team-actions';

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

export function TeamSidebar({ teams, currentUserId }: TeamSidebarProps) {
  const router = useRouter();
  const {
    activeTeamId,
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
  } = useTeamSidebar(teams, currentUserId);

  return (
    <>
      {/* Team Switcher */}
      <TeamSwitcher
        teams={teams}
        activeTeamId={activeTeamId}
        onChange={(val) => {
          router.push(qs({ team: String(val), project: '' }));
        }}
      />

      {/* Projects */}
      <ProjectList
        projects={projects}
        displayProjects={displayProjects}
        activeProjectId={activeProjectId}
        projectSelecting={projectSelecting}
        selectedProjectIds={selectedProjectIds}
        showAllProjects={showAllProjects}
        projectPage={projectPage}
        totalProjectPages={totalProjectPages}
        remaining={remaining}
        qs={qs}
        toggleProjectSelect={toggleProjectSelect}
        handleProjectDeleteClick={handleProjectDeleteClick}
        cancelAllSelection={cancelAllSelection}
        setProjectSelecting={setProjectSelecting}
        setSelectedProjectIds={setSelectedProjectIds}
        setShowAllProjects={setShowAllProjects}
        setProjectPage={setProjectPage}
      />

      {/* Team Actions */}
      <TeamActions
        selecting={selecting}
        isCreator={isCreator}
        selectedTeamCount={selectedIds.size}
        onCancelSelection={cancelAllSelection}
        onDeleteTeamClick={handleTeamDeleteClick}
        onStartSelectingTeams={() => {
          cancelAllSelection();
          setSelecting(true);
          setSelectedIds(new Set([activeTeamId]));
        }}
      />

      {/* Delete Confirmation Dialog */}
      <TeamDeleteDialog
        isOpen={showDialog}
        onOpenChange={setShowDialog}
        deleteMode={deleteMode}
        selectedTeamCount={selectedIds.size}
        selectedProjectCount={selectedProjectIds.size}
        isPending={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
