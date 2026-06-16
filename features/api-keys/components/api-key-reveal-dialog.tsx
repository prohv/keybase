import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface ApiKeyRevealDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  revealedValue: string | null;
}

export function ApiKeyRevealDialog({ isOpen, onOpenChange, revealedValue }: ApiKeyRevealDialogProps) {
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    if (!revealedValue) return;
    navigator.clipboard.writeText(revealedValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-border-light">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-forest flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Revealed API Key
          </DialogTitle>
          <DialogDescription className="font-medium">
            This sensitive token is now decrypted. Handle with extreme caution.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 p-4 bg-bg-muted rounded-lg border border-border-light relative group">
          <code className="text-sm font-mono break-all text-forest font-medium">
            {revealedValue}
          </code>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 text-forest/40 hover:text-forest hover:bg-forest/10"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="w-4 h-4 text-olive" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)} className="bg-forest text-white hover:bg-forest/90">
            Close Securely
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
