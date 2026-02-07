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
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarInset,
    SidebarTrigger
} from '@/components/ui/sidebar';
import { KeyRound, Users, LogOut, LayoutDashboard, PlusCircle, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { logoutAction } from '@/app/auth/logout/action';
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

    // Fetch teams for the sidebar
    const userTeams = await db
        .select({
            id: teams.id,
            name: teams.name,
            teamCode: teams.teamCode,
        })
        .from(teams)
        .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
        .where(eq(teamMembers.userId, user.userId));

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-cream w-full">
                <Sidebar className="border-r border-forest/10">
                    <SidebarHeader className="p-4 border-b border-forest/10 h-16 flex items-center">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <div className="p-2 bg-sage rounded-xl group-hover:bg-olive transition-colors">
                                <KeyRound className="w-5 h-5 text-forest" />
                            </div>
                            <span className="font-bold text-xl text-forest tracking-tight">KeyBase</span>
                        </Link>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-forest/60 font-semibold px-4 pt-4">Navigation</SidebarGroupLabel>
                            <SidebarGroupContent className="p-2">
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip="Dashboard">
                                            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-forest hover:bg-sage/20 rounded-lg">
                                                <LayoutDashboard className="w-4 h-4" />
                                                <span className="font-medium">Overview</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarGroup className="mt-4">
                            <SidebarGroupLabel className="text-forest/60 font-semibold px-4 flex items-center justify-between">
                                Your Teams
                                <Link href="/team/create" className="hover:text-olive transition-colors">
                                    <PlusCircle className="w-4 h-4" />
                                </Link>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className="p-2">
                                <SidebarMenu>
                                    {userTeams.length === 0 ? (
                                        <div className="px-4 py-3 text-sm text-muted-foreground italic">No teams yet</div>
                                    ) : (
                                        userTeams.map((team) => (
                                            <SidebarMenuItem key={team.id}>
                                                <SidebarMenuButton asChild>
                                                    <Link href={`/dashboard?team=${team.id}`} className="flex items-center gap-3 px-4 py-2 text-forest hover:bg-sage/20 rounded-lg group">
                                                        <Users className="w-4 h-4 text-forest/40 group-hover:text-forest" />
                                                        <span className="font-medium truncate">{team.name}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))
                                    )}
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/team/create" className="flex items-center gap-3 px-4 py-2 text-forest hover:bg-sage/20 rounded-lg">
                                                <PlusCircle className="w-4 h-4" />
                                                <span className="font-medium">Create Team</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/team/join" className="flex items-center gap-3 px-4 py-2 text-olive hover:bg-sage/20 rounded-lg">
                                                <UserPlus className="w-4 h-4" />
                                                <span className="font-medium">Join Team</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>

                <SidebarInset className="flex-1 flex flex-col min-h-screen bg-cream">
                    <header className="h-16 border-b border-forest/10 flex items-center justify-between px-6 sticky top-0 bg-cream/80 backdrop-blur-md z-10 w-full">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="text-forest" />
                            <div className="h-6 w-px bg-forest/10 hidden md:block" />
                            <h1 className="text-lg font-bold text-forest hidden md:block">Security Vault</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 pr-4 border-r border-forest/10">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-forest leading-none">{user.email.split('@')[0]}</div>
                                    <Badge variant="outline" className="mt-1 bg-sage/10 text-forest border-forest/10 text-[10px] h-4">
                                        {user.role}
                                    </Badge>
                                </div>
                                <Avatar className="h-9 w-9 border-2 border-sage shadow-sm">
                                    <AvatarFallback className="bg-sage text-forest font-bold">
                                        {user.email.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
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

                    <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
