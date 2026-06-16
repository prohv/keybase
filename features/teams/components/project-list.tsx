import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Trash2,
  X,
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
}

interface ProjectListProps {
  projects: Project[];
  displayProjects: Project[];
  activeProjectId: string | null;
  projectSelecting: boolean;
  selectedProjectIds: Set<number>;
  showAllProjects: boolean;
  projectPage: number;
  totalProjectPages: number;
  remaining: number;
  qs: (params: Record<string, string>) => string;
  toggleProjectSelect: (id: number) => void;
  handleProjectDeleteClick: () => void;
  cancelAllSelection: () => void;
  setProjectSelecting: (val: boolean) => void;
  setSelectedProjectIds: (val: Set<number>) => void;
  setShowAllProjects: (val: boolean) => void;
  setProjectPage: (val: number | ((prev: number) => number)) => void;
}

export function ProjectList({
  projects,
  displayProjects,
  activeProjectId,
  projectSelecting,
  selectedProjectIds,
  showAllProjects,
  projectPage,
  totalProjectPages,
  remaining,
  qs,
  toggleProjectSelect,
  handleProjectDeleteClick,
  cancelAllSelection,
  setProjectSelecting,
  setSelectedProjectIds,
  setShowAllProjects,
  setProjectPage,
}: ProjectListProps) {
  const PER_PAGE = 3;

  return (
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
                      <FolderKanban
                        className={`w-4 h-4 shrink-0 ${
                          selectedProjectIds.has(p.id) ? 'text-green-dark' : 'text-forest/40'
                        }`}
                      />
                      <span className="truncate flex-1">{p.name}</span>
                    </div>
                  ) : (
                    <Link
                      href={qs({ project: String(p.id) })}
                      className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors flex-1 group ${
                        isActive ? 'bg-green-dark/10 text-forest font-semibold' : 'text-forest hover:bg-bg-muted'
                      }`}
                    >
                      <FolderKanban
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-green-dark' : 'text-forest/40 group-hover:text-forest'
                        }`}
                      />
                      <span className="truncate flex-1">{p.name}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {projectSelecting && projects.length > 0 && (
          <div className="mt-2 px-1 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={cancelAllSelection}
              className="flex-1 h-8 text-xs border-border-light"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleProjectDeleteClick}
              disabled={selectedProjectIds.size === 0}
              className="flex-1 h-8 text-xs bg-destructive hover:bg-destructive/90 text-white disabled:opacity-40"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete ({selectedProjectIds.size})
            </Button>
          </div>
        )}

        {projects.length > PER_PAGE && (
          <div className="mt-2 px-1">
            {showAllProjects ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setProjectPage((prev) => Math.max(1, prev - 1))}
                  disabled={projectPage <= 1}
                  className="p-1 text-forest/40 hover:text-forest disabled:opacity-20"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-medium text-forest/40">
                  {projectPage} / {totalProjectPages}
                </span>
                <button
                  onClick={() => setProjectPage((prev) => Math.min(totalProjectPages, prev + 1))}
                  disabled={projectPage >= totalProjectPages}
                  className="p-1 text-forest/40 hover:text-forest disabled:opacity-20"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowAllProjects(true);
                  setProjectPage(2);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:text-forest font-medium transition-colors"
              >
                +{remaining} more
              </button>
            )}
          </div>
        )}

        {!projectSelecting && (
          <Link
            href={qs({ project: 'new' })}
            className="flex items-center gap-3 px-3 py-2 mt-1 text-sm text-muted-foreground hover:text-forest hover:bg-bg-muted rounded-lg transition-colors font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Create Project
          </Link>
        )}

        {!projectSelecting && projects.length > 0 && (
          <button
            onClick={() => {
              cancelAllSelection();
              setProjectSelecting(true);
              setSelectedProjectIds(new Set());
              setShowAllProjects(true);
              setProjectPage(1);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete Project
          </button>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
