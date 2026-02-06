import { getSession } from '@/lib/jwt';

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.email}</p>
      <p>Role: {session.role}</p>
    </div>
  );
}