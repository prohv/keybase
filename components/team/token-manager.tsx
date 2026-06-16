'use client';

import { useState, useEffect, useCallback } from 'react';
import { Key, Plus, Loader2, Copy, Check, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTokenAction } from '@/app/token/create/action';
import { revokeTokenAction } from '@/app/token/revoke/action';

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
    { label: '90 days', value: 90 }
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

    const fetchTokens = useCallback(async () => {
        try {
            const res = await fetch(`/api/token/list?projectId=${projectId}`);
            const data = await res.json();
            if (data.success) setTokens(data.data);
        } catch { /* ignore */ }
    }, [projectId]);

    useEffect(() => {
        if (open) {
            setRawToken(null);
            setName('');
            fetchTokens();
        }
    }, [open, fetchTokens]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        setCreating(true);
        try {
            const res = await createTokenAction({
                projectId,
                name: name.trim(),
                expiryDays: expiryDays || null,
            });
            if (res && 'success' in res && res.success && res.token) {
                setRawToken(res.token);
                toast.success('Token created');
                fetchTokens();
            } else {
                const errMsg = res && 'error' in res ? res.error : 'Failed to create token';
                toast.error(errMsg);
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
            const res = await revokeTokenAction(tokenId);
            if (res && 'success' in res && res.success) {
                toast.success('Token revoked');
                fetchTokens();
            } else {
                const errMsg = res && 'error' in res ? res.error : 'Failed to revoke';
                toast.error(errMsg);
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
                    Generate CLI Tokens
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
                        <div className="bg-green-dark/10 border border-green-dark/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">

                                <span className="text-xs font-medium text-green-dark uppercase tracking-wider">Token created successfully</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white rounded-lg border border-border-light p-3">
                                <code className="flex-1 text-xs font-mono break-all text-forest select-all">
                                    {rawToken}
                                </code>
                                <button
                                    onClick={copyToken}
                                    className="shrink-0 h-8 px-3 flex items-center gap-1.5 text-xs font-medium text-forest bg-forest/5 hover:bg-forest/10 rounded-md transition-colors"
                                >
                                    {copied ? <><Check className="w-3.5 h-3.5 text-olive" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                This token will not be shown again. Store it securely.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setRawToken(null)} variant="outline" className="flex-1 border-border-light">
                                Create Another
                            </Button>
                            <Button onClick={() => setOpen(false)} className="flex-1 bg-forest hover:bg-forest/90 text-cream">
                                Done
                            </Button>
                        </div>
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

            </DialogContent>
        </Dialog>
    );
}
