// app/team/join/page.tsx
'use client';

import { joinTeamAction } from './action';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinTeamPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('code', code.toUpperCase());

    const result = await joinTeamAction(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(`Joined team: ${result.teamName}!`);
      setTimeout(() => router.push('/dashboard'), 1500);
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Join a Team</h1>
      <p>Enter the team code provided by the admin.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter team code (e.g. A1B2C3D4)"
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1.1rem',
              textTransform: 'uppercase',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: '12px 24px',
            background: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Join Team
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>
      )}

      {success && (
        <div style={{ color: 'green', marginTop: '1rem' }}>{success}</div>
      )}
    </div>
  );
}