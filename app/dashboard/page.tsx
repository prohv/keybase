// app/dashboard/page.tsx
import { getCurrentUser } from '@/lib/jwt';
import { createTeamAction } from '@/app/team/create/action'; // ← adjust path if needed
import { db } from '@/src/db';
import { teams, teamMembers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';

  export default async function Dashboard({
    searchParams,
}: {
  searchParams: { message?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all teams the user is part of
  const userTeams = await db
    .select({
      id: teams.id,
      name: teams.name,
      teamCode: teams.teamCode,
      createdBy: teams.createdBy,
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, user.userId))
    .orderBy(teams.createdAt);

  // Optional: if you want to show success after create
  const successMessage = searchParams.message;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <form
          action={async () => {
            'use server';
            // Simple server-side logout
            const { cookies } = await import('next/headers');
            (await cookies()).delete('auth_token');
            redirect('/auth/login');
          }}
        >
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              background: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </form>
      </div>

      <p style={{ marginBottom: '2rem' }}>
        Welcome back, <strong>{user.email}</strong> ({user.role})
      </p>

      {successMessage && (
        <div
          style={{
            background: '#e6ffe6',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            border: '1px solid #b3ffb3',
          }}
        >
          {successMessage}
        </div>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h2>Create New Team</h2>
        <form
          action={async (formData: FormData) => {
            'use server';
            const result = await createTeamAction(formData);

            if (result?.error) {
              // For simplicity, we could redirect with error, but let's just show message
              redirect(`/dashboard?message=Error: ${encodeURIComponent(result.error)}`);
            }

            // On success - redirect with the code in message
            const teamCode = result?.teamCode; // you'll need to return it from action
            redirect(`/dashboard?message=Team created! Code: ${teamCode}`);
          }}
        >
          <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
            <input
              name="name"
              placeholder="Team name (e.g. My Startup)"
              required
              style={{
                padding: '10px',
                flex: 1,
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Create Team
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2>Your Teams</h2>
        {userTeams.length === 0 ? (
          <p style={{ color: '#888' }}>You are not part of any teams yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {userTeams.map((team) => (
              <li
                key={team.id}
                style={{
                  padding: '12px',
                  border: '1px solid #eee',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  background: '#fafafa',
                }}
              >
                <strong>{team.name}</strong>
                <br />
                <small>
                  Code: <code style={{ background: '#f0f0f0', padding: '2px 6px' }}>{team.teamCode}</code>
                </small>
                {team.createdBy === user.userId && (
                  <small style={{ color: '#52c41a', marginLeft: '12px' }}>(You are admin)</small>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div style={{ marginTop: '2rem' }}>
        <Link href="/team/join" style={{ color: '#1890ff' }}>
          Join a team with code →
        </Link>
      </div>
    </div>
  );
}