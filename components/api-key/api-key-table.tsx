'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Eye,
    Trash2,
    Copy,
    Check,
    Key,
    Calendar,
    User as UserIcon,
    Loader2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Download
} from 'lucide-react';
import { toast } from 'sonner';
import { revealApiKeyAction } from '@/app/api-key/reveal/action';
import { getProviderInfo } from '@/lib/providers';
import { useApiKeys, useDeleteApiKeyMutation, useExportKeysMutation } from '@/hooks/use-api-keys';

interface ApiKeyTableProps {
    projectId: number;
}

export function ApiKeyTable({ projectId }: ApiKeyTableProps) {
    const [revealingId, setRevealingId] = useState<number | null>(null);
    const [revealedValue, setRevealedValue] = useState<string | null>(null);
    const [isRevealOpen, setIsRevealOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState<{ id: number; name: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [viewingPage, setViewingPage] = useState(1);

    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useApiKeys(projectId);

    const allKeys = data?.pages.flatMap(page => page.keys) || [];
    const loadedPagesCount = data?.pages.length || 0;
    const totalKeys = data?.pages[0]?.total || 0;

    const keysPerPage = 4;
    const totalPages = Math.ceil(totalKeys / keysPerPage) || 1;
    const startIndex = (viewingPage - 1) * keysPerPage;
    const currentPageKeys = allKeys.slice(startIndex, startIndex + keysPerPage);

    async function handlePreviousPage() {
        if (viewingPage > 1) {
            setViewingPage(prev => prev - 1);
        }
    }

    async function handleNextPage() {
        if (viewingPage < loadedPagesCount) {
            setViewingPage(prev => prev + 1);
        } else if (viewingPage < totalPages && hasNextPage) {
            fetchNextPage();
            setViewingPage(prev => prev + 1);
        }
    }

    const handleMouseEnterNext = () => {
        if (viewingPage === loadedPagesCount && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    async function handleReveal(id: number) {
        setRevealingId(id);
        try {
            const res = await revealApiKeyAction(id);
            if (res.success && res.data) {
                setRevealedValue(res.data);
                setIsRevealOpen(true);
            } else {
                toast.error(res.error || 'Failed to decrypt key');
            }
        } catch (err) {
            toast.error('Unexpected error during decryption');
        } finally {
            setRevealingId(null);
        }
    }

    const deleteMutation = useDeleteApiKeyMutation(projectId);
    const exportMutation = useExportKeysMutation();

    async function handleExport() {
        if (totalKeys === 0) return;
        const result = await exportMutation.mutateAsync(projectId);
        if (!result.success || !result.data) return;

        const envContent = result.data
            .map((entry) => `${entry.name}="${entry.value}"`)
            .join('\n');

        try {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: '.env',
                types: [{
                    description: 'Environment File',
                    accept: { 'text/plain': ['.env'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(envContent);
            await writable.close();
            toast.success('Downloaded .env file');
        } catch (err: any) {
            if (err?.name === 'AbortError') return;
            const blob = new Blob([envContent], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'keybase.env';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Downloaded keybase.env');
        }
    }

    async function handleDelete() {
        if (!deleteCandidate) return;
        deleteMutation.mutate(deleteCandidate.id, {
            onSuccess: () => {
                setIsDeleteOpen(false);
            }
        });
    }

    function copyToClipboard() {
        if (!revealedValue) return;
        navigator.clipboard.writeText(revealedValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-forest" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-40 text-destructive">
                Failed to load API keys
            </div>
        );
    }

    return (
        <>
            <Card className="border-border-light shadow-sm min-h-[200px] overflow-hidden">
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
                            onClick={handleExport}
                            disabled={exportMutation.isPending}
                            className="h-8 w-8 rounded-full border border-border-light bg-white flex items-center justify-center text-forest hover:bg-bg-muted hover:border-sage transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Export as .env"
                        >
                            {exportMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Download className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                <TableHeader className="bg-forest/[0.02]">
                    <TableRow className="hover:bg-transparent border-border-light">
                        <TableHead className="w-full sm:w-[300px] font-heading font-semibold text-xs tracking-wide uppercase text-forest px-4 sm:px-6">Identity</TableHead>
                        <TableHead className="hidden sm:table-cell font-heading font-semibold text-xs tracking-wide uppercase text-forest">Ownership</TableHead>
                        <TableHead className="hidden sm:table-cell font-heading font-semibold text-xs tracking-wide uppercase text-forest">Created</TableHead>
                        <TableHead className="text-right px-4 sm:px-6 font-heading font-semibold text-xs tracking-wide uppercase text-forest">Safety</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentPageKeys.length === 0 && isFetchingNextPage ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-40 text-center">
                                <Loader2 className="w-5 h-5 animate-spin text-forest/40 mx-auto" />
                            </TableCell>
                        </TableRow>
                    ) : currentPageKeys.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-medium italic">
                                The vault is currently empty.
                            </TableCell>
                        </TableRow>
                    ) : (
                        currentPageKeys.map((key) => {
                            if (!key) return null;
                            return (
                                <TableRow key={key.id} className="border-border-light hover:bg-bg-muted transition-colors">
                                    <TableCell className="px-4 sm:px-6 py-4 font-semibold text-forest flex items-center gap-3">
                                        <div className="relative group/icon shrink-0">
                                            {(() => {
                                                const provider = getProviderInfo(key.name);
                                                if (provider) {
                                                    return (
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
                                                    );
                                                }
                                                return (
                                                    <div className="p-1.5 sm:p-2 bg-white rounded-lg border border-border-light shadow-sm group-hover/icon:bg-sage/10 transition-colors">
                                                        <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-forest/40" />
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <span className="truncate text-sm sm:text-base">{key.name}</span>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge variant="ghost" className="flex items-center gap-1.5 px-0 text-muted-foreground font-medium text-xs">
                                            <UserIcon className="w-3 h-3" />
                                            UID-{key.createdBy}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                                            <Calendar className="w-3 h-3" />
                                            {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-4 sm:px-6 space-x-1 sm:space-x-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 sm:h-9 sm:w-9 border-border-light hover:border-green-dark hover:bg-green-dark/10 text-forest"
                                            title="Reveal Secret"
                                            disabled={revealingId === key.id}
                                            onClick={() => handleReveal(key.id)}
                                        >
                                            {revealingId === key.id ? (
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
                                            onClick={() => {
                                                setDeleteCandidate(key);
                                                setIsDeleteOpen(true);
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 0 && (
                <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-border-light bg-forest/[0.01]">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-forest/40 hover:text-forest/60 hover:bg-bg-muted disabled:opacity-10 transition-colors"
                        onClick={handlePreviousPage}
                        disabled={viewingPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-xs font-medium text-forest/40 uppercase tracking-wider tabular-nums min-w-[6rem] text-center">
                        Page {viewingPage} of {totalPages}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-forest/40 hover:text-forest/60 hover:bg-bg-muted disabled:opacity-10 transition-colors"
                        onClick={handleNextPage}
                        onMouseEnter={handleMouseEnterNext}
                        disabled={viewingPage >= totalPages}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
            </CardContent>
        </Card>

            {/* Reveal Dialog */}
            <Dialog open={isRevealOpen} onOpenChange={setIsRevealOpen}>
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
                        <Button onClick={() => setIsRevealOpen(false)} className="bg-forest text-white hover:bg-forest/90">
                            Close Securely
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-md bg-white border-border-light">
                    <DialogHeader>
                        <DialogTitle className="font-heading font-bold text-forest flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-olive" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                            Are you sure you want to delete <span className="font-semibold text-forest">"{deleteCandidate?.name}"</span>?
                            This action is <span className="text-destructive font-semibold">irreversible</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={deleteMutation.isPending} className="border-border-light hover:bg-bg-muted">
                            Keep Key
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive hover:bg-red-700 text-white"
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Permanently'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
