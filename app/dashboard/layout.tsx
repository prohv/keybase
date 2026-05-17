import { getCurrentUser } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import { db } from '@/src/db';
import { teams, teamMembers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarInset,
    SidebarTrigger
} from '@/components/ui/sidebar';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import { UserAvatar } from '@/components/ui/user-avatar';
import { logoutAction } from '@/app/auth/logout/action';
import { TeamSidebar } from '@/components/team/team-sidebar';
import Link from 'next/link';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/login');
    }

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

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-white w-full">
                <Sidebar className="border-r border-border-light w-60">
                    <SidebarHeader className="p-4 border-b border-border-light h-16 flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Image src="/keybase-logo.svg" alt="KeyBase" width={36} height={36} className="w-9 h-9" />
                            <span className="font-heading font-bold text-xl text-forest tracking-tight">KeyBase</span>
                        </Link>
                    </SidebarHeader>
                    <SidebarContent>
                        <TeamSidebar teams={userTeams} currentUserId={user.userId} />
                    </SidebarContent>
                </Sidebar>

                <SidebarInset className="flex-1 flex flex-col min-h-screen bg-white">
                    <header className="h-16 border-b border-border-light flex items-center justify-between px-6 sticky top-0 bg-white/80 backdrop-blur-md z-10 w-full">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="text-forest" />
                            <div className="h-6 w-px bg-forest/10 hidden md:block" />
                            <h1 className="text-lg font-heading font-semibold text-forest hidden md:block">Security Vault</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 pr-4 border-r border-border-light">
                                <div className="text-right hidden sm:block">
                                    <div className="text-base font-heading font-medium text-forest leading-none">{user.name || user.email.split('@')[0]}</div>
                                </div>
                                <UserAvatar initials={user.email.substring(0, 2).toUpperCase()} avatarUrl={user.avatarUrl} />
                            </div>

                            <form action={logoutAction}>
                                <button
                                    type="submit"
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </header>

                    <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
