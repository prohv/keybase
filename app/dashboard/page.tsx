import { getCurrentUser } from '@/lib/jwt';
import { db } from '@/src/db';
import { teams, teamMembers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Copy,
  ShieldAlert,
  Key,
  UserPlus
} from 'lucide-react';
import { getApiKeysAction } from '@/app/api-key/list/action';
import { ApiKeyForm } from '@/components/api-key/ApiKeyForm';
import { ApiKeyTable } from '@/components/api-key/ApiKeyTable';
import Link from 'next/link';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { team?: string };
}) {
  console.log('[DashboardPage] Rendering - checking session');
  const user = await getCurrentUser();
  console.log('[DashboardPage] Session result:', user?.email || 'unauthenticated');
  if (!user) redirect('/auth/login');

  // Fetch user's teams
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
          <h2 className="text-3xl font-bold text-forest tracking-tight">No Vaults Found</h2>
          <p className="text-muted-foreground text-lg max-w-sm">
            Setup your first team vault to start securing your API keys.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Button asChild className="flex-1 h-24 bg-sage hover:bg-olive text-forest font-bold flex flex-col gap-2">
            <Link href="/team/create">
              <Plus className="w-6 h-6" />
              <span>Create Team</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 h-24 border-forest/10 hover:border-sage text-forest font-bold flex flex-col gap-2">
            <Link href="/team/join">
              <UserPlus className="w-6 h-6" />
              <span>Join Team</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Determine active team
  const activeTeamId = searchParams.team ? parseInt(searchParams.team) : userTeams[0].id;
  const activeTeam = userTeams.find(t => t.id === activeTeamId) || userTeams[0];

  // Fetch API keys for active team
  const keysResult = await getApiKeysAction(activeTeam.id);
  const keys = keysResult.success && keysResult.data ? keysResult.data : [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Team Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-forest/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-extrabold text-forest tracking-tight">{activeTeam.name}</h2>
            <Badge className="bg-sage text-forest font-bold px-3">Active Vault</Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 font-medium">
            <Key className="w-4 h-4 text-forest/40" />
            Vault ID: <code className="bg-forest/5 px-2 py-0.5 rounded text-forest font-mono">T-{activeTeam.id.toString().padStart(3, '0')}</code>
          </p>
        </div>

        {activeTeam.createdBy === user.userId && (
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-bold text-olive uppercase tracking-widest mr-1">Invite Members (Team Code)</span>
            <div className="flex items-center gap-1 p-1 bg-olive/5 border border-olive/20 rounded-lg">
              <code className="text-2xl font-black text-forest tracking-widest px-4">{activeTeam.teamCode}</code>
              <Button size="icon" variant="ghost" className="h-10 w-10 text-olive hover:bg-olive/10" title="Copy Code">
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Key Creation Form */}
        <div className="lg:col-span-1">
          <ApiKeyForm teamId={activeTeam.id} />
        </div>

        {/* Right: API Keys Table */}
        <div className="lg:col-span-2">
          <Card className="border-forest/10 shadow-sm min-h-[400px] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-forest/10">
              <div>
                <CardTitle className="text-2xl font-bold text-forest">Vault Secrets</CardTitle>
                <CardDescription>Decrypted keys are never persisted in cleartext.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-forest/5 text-forest border-forest/10 px-4">
                {keys.length} Keys
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ApiKeyTable initialKeys={keys} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}