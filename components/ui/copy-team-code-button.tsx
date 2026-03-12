'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface CopyTeamCodeButtonProps {
  code: string;
}

export function CopyTeamCodeButton({ code }: CopyTeamCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-10 w-10 text-olive hover:bg-olive/10 transition-all active:scale-90"
      onClick={handleCopy}
      title="Copy Code"
    >
      {copied ? (
        <Check className="w-5 h-5 text-forest animate-in zoom-in duration-200" />
      ) : (
        <Copy className="w-5 h-5 animate-in zoom-in duration-200" />
      )}
    </Button>
  );
}
