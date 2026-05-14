'use client';

import { useState } from 'react';

interface UserAvatarProps {
  email: string;
  initials: string;
}

export function UserAvatar({ email, initials }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-sage shadow-sm shrink-0 bg-sage">
      {!imgError ? (
        <img
          src={`https://www.google.com/s2/photos/profile/${email}?sz=96`}
          alt={initials}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-forest font-bold text-xs">
          {initials}
        </div>
      )}
    </div>
  );
}
