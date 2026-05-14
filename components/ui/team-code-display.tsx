'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

interface TeamCodeDisplayProps {
  code: string;
}

export function TeamCodeDisplay({ code }: TeamCodeDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayText = isVisible ? code : '*'.repeat(code.length);

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
    <div className="flex items-center gap-0">
      <code className="w-[10ch] text-lg md:text-xl text-center font-mono tracking-wider text-forest px-2 py-1.5">
        <span className={isVisible ? 'font-medium' : 'font-bold'}>
          {displayText}
        </span>
      </code>
      <Button
        size="icon"
        variant="ghost"
        className="h-10 w-10 text-muted-foreground hover:bg-bg-muted transition-all active:scale-90"
        onClick={() => setIsVisible(!isVisible)}
        title={isVisible ? 'Hide Code' : 'Show Code'}
      >
        {isVisible ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-10 w-10 text-olive hover:bg-olive/10 transition-all active:scale-90"
        onClick={handleCopy}
        title="Copy Code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-forest animate-in zoom-in duration-200" />
        ) : (
          <Copy className="w-4 h-4 animate-in zoom-in duration-200" />
        )}
      </Button>
    </div>
  );
}
