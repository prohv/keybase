import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Loader2, User as UserIcon, Calendar, Key } from 'lucide-react';
import { getProviderInfo } from '@/lib/providers';

interface ApiKey {
  id: number;
  name: string;
  createdBy: number | null;
  createdAt: Date | null;
}

interface ApiKeyRowProps {
  apiKey: ApiKey;
  revealingId: number | null;
  onReveal: (id: number) => void;
  onDeleteClick: (key: ApiKey) => void;
}

export function ApiKeyRow({ apiKey, revealingId, onReveal, onDeleteClick }: ApiKeyRowProps) {
  const provider = getProviderInfo(apiKey.name);

  return (
    <TableRow className="border-border-light hover:bg-bg-muted transition-colors">
      <TableCell className="px-4 sm:px-6 py-4 font-semibold text-forest flex items-center gap-3">
        <div className="relative group/icon shrink-0">
          {provider ? (
            <div
              className="p-1.5 sm:p-2 bg-white rounded-lg border border-border-light shadow-sm flex items-center justify-center overflow-hidden"
              title={`${provider.slug.charAt(0).toUpperCase() + provider.slug.slice(1)} detected`}
            >
              <div
                className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/icon:scale-110"
                style={{
                  backgroundColor: provider.color,
                  maskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${provider.slug}.svg)`,
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${provider.slug}.svg)`,
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                }}
              />
            </div>
          ) : (
            <div className="p-1.5 sm:p-2 bg-white rounded-lg border border-border-light shadow-sm group-hover/icon:bg-sage/10 transition-colors">
              <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-forest/40" />
            </div>
          )}
        </div>
        <span className="truncate text-sm sm:text-base">{apiKey.name}</span>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="ghost" className="flex items-center gap-1.5 px-0 text-muted-foreground font-medium text-xs">
          <UserIcon className="w-3 h-3" />
          UID-{apiKey.createdBy}
        </Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
          <Calendar className="w-3 h-3" />
          {apiKey.createdAt ? new Date(apiKey.createdAt).toLocaleDateString() : 'N/A'}
        </div>
      </TableCell>
      <TableCell className="text-right px-4 sm:px-6 space-x-1 sm:space-x-2">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 sm:h-9 sm:w-9 border-border-light hover:border-green-dark hover:bg-green-dark/10 text-forest"
          title="Reveal Secret"
          disabled={revealingId === apiKey.id}
          onClick={() => onReveal(apiKey.id)}
        >
          {revealingId === apiKey.id ? (
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-forest" />
          ) : (
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 sm:h-9 sm:w-9 border-forest/10 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 text-muted-foreground"
          title="Delete Key"
          onClick={() => onDeleteClick(apiKey)}
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
