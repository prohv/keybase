'use client';

import { useState } from 'react';

interface UserAvatarProps {
  initials: string;
  avatarUrl?: string | null;
}

export function UserAvatar({ initials, avatarUrl }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (avatarUrl && !imgError) {
    return (
      <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-sage shadow-sm shrink-0 bg-sage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={initials}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-sage shadow-sm shrink-0 bg-sage flex items-center justify-center text-forest font-bold text-xs">
      {initials}
    </div>
  );
}
