import { getCurrentUser } from '@/lib/jwt';
import { db } from '@/src/db';
import { teams, teamMembers, projects } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Key, UserPlus, Plus } from 'lucide-react';
import { ApiKeyForm } from '@/components/api-key/api-key-form';
import { ApiKeyTable } from '@/components/api-key/api-key-table';
import { CreateProjectForm } from '@/components/team/create-project-form';
import { TeamCodeDisplay } from '@/components/ui/team-code-display';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  searchParams: Promise<{ team?: string; project?: string }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const sp = await props.searchParams;
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const userTeams = await db
    .select({
      id: teams.id,
      name: teams.name,
      teamCode: teams.teamCode,
      createdBy: teams.createdBy,
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, user.userId));

  if (userTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="p-6 bg-sage/20 rounded-full animate-pulse">
          <ShieldAlert className="w-12 h-12 text-forest" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-heading font-bold text-forest tracking-tight">No Vaults Found</h2>
          <p className="text-muted-foreground text-lg max-w-sm font-medium">Setup your first team vault to start securing your API keys.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Button asChild className="flex-1 h-24 bg-green-dark hover:bg-green-dark/90 text-white font-bold flex flex-col gap-2">
            <Link href="/team/create"><Plus className="w-6 h-6" /><span>Create Team</span></Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 h-24 border-border-light hover:border-green-dark text-forest font-bold flex flex-col gap-2">
            <Link href="/team/join"><UserPlus className="w-6 h-6" /><span>Join Team</span></Link>
          </Button>
        </div>
      </div>
    );
  }

  const activeTeamId = sp.team ? parseInt(sp.team) : userTeams[0].id;
  const activeTeam = userTeams.find(t => t.id === activeTeamId) || userTeams[0];

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.teamId, activeTeamId));

  if (sp.project === 'new') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-light">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-forest tracking-tight">New Project</h2>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 font-medium text-xs sm:text-sm">
              <Key className="w-3.5 h-3.5 text-forest/40" />
              Create a new project under <strong>{activeTeam.name}</strong>
            </p>
          </div>
        </div>
        <CreateProjectForm teamId={activeTeamId} />
      </div>
    );
  }

  const activeProjectId = sp.project ? parseInt(sp.project) : userProjects[0]?.id;
  const activeProject = userProjects.find(p => p.id === activeProjectId);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="p-6 bg-sage/20 rounded-full animate-pulse">
          <ShieldAlert className="w-12 h-12 text-forest" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-heading font-bold text-forest tracking-tight">No Projects Yet</h2>
          <p className="text-muted-foreground text-lg max-w-sm font-medium">
            Create your first project to organize API keys under {activeTeam.name}.
          </p>
        </div>
        <Link
          href={`/dashboard?team=${activeTeamId}&project=new`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-dark hover:bg-green-dark/90 text-white font-semibold rounded-full transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Project
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-light">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href={`/dashboard?team=${activeTeamId}`} className="hover:text-forest transition-colors">{activeTeam.name}</Link>
            <span>/</span>
            <span className="text-forest font-medium">{activeProject.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-forest tracking-tight">{activeProject.name}</h2>
            <Badge className="bg-sage text-forest font-bold px-3 text-xs">Vault</Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 font-medium text-xs sm:text-sm">
            <Key className="w-3.5 h-3.5 text-forest/40" />
            Project ID: <code className="bg-forest/5 px-1.5 py-0.5 rounded text-forest font-mono">P-{activeProject.id.toString().padStart(3, '0')}</code>
          </p>
        </div>

        {activeTeam.createdBy === user.userId && (
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-xs font-semibold text-green-mid uppercase tracking-wider mr-1">Invite Members</span>
            <div className="flex items-center p-1 bg-bg-muted border border-border-light rounded-lg w-full sm:w-auto">
              <TeamCodeDisplay code={activeTeam.teamCode} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ApiKeyForm projectId={activeProject.id} />
        </div>
        <div className="lg:col-span-2">
          <ApiKeyTable key={activeProject.id} projectId={activeProject.id} />
        </div>
      </div>
    </div>
  );
}
