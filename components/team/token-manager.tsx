'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Loader2, Copy, Check, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Token {
    id: number;
    name: string;
    scopes: string;
    expiresAt: string | null;
    lastUsedAt: string | null;
    createdAt: string;
}

interface TokenManagerProps {
    projectId: number;
}

const EXPIRY_OPTIONS = [
    { label: '1 day', value: 1 },
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 },
    { label: 'Never', value: 0 },
];

export function TokenManager({ projectId }: TokenManagerProps) {
    const [open, setOpen] = useState(false);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [name, setName] = useState('');
    const [expiryDays, setExpiryDays] = useState(30);
    const [creating, setCreating] = useState(false);
    const [rawToken, setRawToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [revoking, setRevoking] = useState<number | null>(null);

    useEffect(() => {
        if (open) {
            setRawToken(null);
            setName('');
            fetchTokens();
        }
    }, [open]);

    async function fetchTokens() {
        try {
            const res = await fetch(`/api/token/list?projectId=${projectId}`);
            const data = await res.json();
            if (data.success) setTokens(data.data);
        } catch { /* ignore */ }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        setCreating(true);
        try {
            const res = await fetch('/api/token/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, name: name.trim(), expiryDays: expiryDays || null }),
            });
            const data = await res.json();
            if (data.success) {
                setRawToken(data.token);
                toast.success('Token created');
                fetchTokens();
            } else {
                toast.error(data.error || 'Failed to create token');
            }
        } catch {
            toast.error('Failed to create token');
        } finally {
            setCreating(false);
        }
    }

    async function handleRevoke(tokenId: number) {
        setRevoking(tokenId);
        try {
            const res = await fetch('/api/token/revoke', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokenId }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Token revoked');
                fetchTokens();
            } else {
                toast.error(data.error || 'Failed to revoke');
            }
        } catch {
            toast.error('Failed to revoke');
        } finally {
            setRevoking(null);
        }
    }

    function copyToken() {
        if (!rawToken) return;
        navigator.clipboard.writeText(rawToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function formatDate(d: string | null) {
        if (!d) return '—';
        return new Date(d).toLocaleDateString();
    }

    function isExpired(token: Token): boolean {
        if (!token.expiresAt) return false;
        return new Date(token.expiresAt) < new Date();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-forest bg-white border border-border-light rounded-full hover:bg-bg-muted hover:border-sage transition-all">
                    <Key className="w-3.5 h-3.5" />
                    Tokens
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white border-border-light">
                <DialogHeader>
                    <DialogTitle className="font-heading font-bold text-forest flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Access Tokens
                    </DialogTitle>
                    <DialogDescription className="font-medium">
                        Create and manage API tokens for programmatic access.
                    </DialogDescription>
                </DialogHeader>

                {rawToken ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-bg-muted rounded-lg border border-border-light">
                            <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Store this token securely. You won&apos;t see it again.
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs font-mono break-all text-forest bg-white p-2 rounded border border-border-light">
                                    {rawToken}
                                </code>
                                <button onClick={copyToken} className="shrink-0 p-2 text-forest/40 hover:text-forest hover:bg-forest/5 rounded-lg transition-colors">
                                    {copied ? <Check className="w-4 h-4 text-olive" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <Button onClick={() => setRawToken(null)} variant="outline" className="w-full border-border-light">
                            Create Another
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token-name" className="font-heading font-semibold text-xs tracking-wide uppercase text-forest">Token Name</Label>
                            <Input
                                id="token-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. CI/CD Pipeline"
                                required
                                disabled={creating}
                                className="bg-white border-border-light focus:border-green-dark rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-heading font-semibold text-xs tracking-wide uppercase text-forest">Expires In</Label>
                            <div className="flex flex-wrap gap-2">
                                {EXPIRY_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setExpiryDays(opt.value)}
                                        disabled={creating}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                                            expiryDays === opt.value
                                                ? 'bg-forest text-cream border-forest'
                                                : 'bg-white text-forest border-border-light hover:border-sage'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" disabled={creating || !name.trim()} className="w-full bg-forest hover:bg-forest/90 text-cream font-semibold rounded-full">
                            {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Plus className="w-4 h-4 mr-2" />Generate Token</>}
                        </Button>
                    </form>
                )}

                {tokens.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border-light">
                        <h4 className="text-xs font-semibold text-forest/60 uppercase tracking-wider mb-3">Existing Tokens ({tokens.length})</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-forest/10 scrollbar-track-transparent">
                            {tokens.map((t) => {
                                const expired = isExpired(t);
                                return (
                                    <div key={t.id} className="flex items-center justify-between px-3 py-2 bg-bg-muted rounded-lg border border-border-light">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-forest truncate">{t.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Created {formatDate(t.createdAt)}{t.expiresAt ? ` · Expires ${formatDate(t.expiresAt)}` : ' · Never expires'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-3">
                                            {expired && <span className="text-[10px] font-semibold text-destructive uppercase">Expired</span>}
                                            <button
                                                onClick={() => handleRevoke(t.id)}
                                                disabled={revoking === t.id}
                                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-colors"
                                                title="Revoke token"
                                            >
                                                {revoking === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-4">
                    <Button onClick={() => setOpen(false)} variant="outline" className="border-border-light">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
