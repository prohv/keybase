import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';

interface ApiKeyTableHeaderProps {
  totalKeys: number;
  isPending: boolean;
  onExport: () => void;
}

export function ApiKeyTableHeader({ totalKeys, isPending, onExport }: ApiKeyTableHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-end justify-between space-y-0 pb-3 border-b border-border-light">
      <div className="flex-1">
        <CardTitle className="text-2xl font-heading font-bold text-forest">Vault Secrets</CardTitle>
        <CardDescription className="font-medium">Decrypted keys are never persisted in cleartext.</CardDescription>
      </div>
      {totalKeys > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-border-light rounded-full px-3 py-1">
            <span className="text-xs font-medium text-forest/40 uppercase tracking-wider leading-none">
              Total Keys : <span className="text-forest ml-1">{totalKeys}</span>
            </span>
          </div>
          <button
            onClick={onExport}
            disabled={isPending}
            className="h-8 w-8 rounded-full border border-border-light bg-white flex items-center justify-center text-forest hover:bg-bg-muted hover:border-sage transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export as .env"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </CardHeader>
  );
}
