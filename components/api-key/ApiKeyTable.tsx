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
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { revealApiKeyAction } from '@/app/api-key/reveal/action';
import { deleteApiKeyAction } from '@/app/api-key/delete/action';

interface ApiKey {
    id: number;
    name: string;
    createdBy: number | null;
    createdAt: Date | null;
}

interface ApiKeyTableProps {
    initialKeys: ApiKey[];
}

export function ApiKeyTable({ initialKeys }: ApiKeyTableProps) {
    const [revealingId, setRevealingId] = useState<number | null>(null);
    const [revealedValue, setRevealedValue] = useState<string | null>(null);
    const [isRevealOpen, setIsRevealOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState<ApiKey | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);

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

    async function handleDelete() {
        if (!deleteCandidate) return;
        setIsDeleting(true);
        try {
            const res = await deleteApiKeyAction(deleteCandidate.id);
            if (res.success) {
                toast.success('API Key deleted permanently.');
                setIsDeleteOpen(false);
            } else {
                toast.error(res.error || 'Failed to delete key');
            }
        } catch (err) {
            toast.error('Unexpected error during deletion');
        } finally {
            setIsDeleting(false);
        }
    }

    function copyToClipboard() {
        if (!revealedValue) return;
        navigator.clipboard.writeText(revealedValue);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <>
            <Table>
                <TableHeader className="bg-forest/[0.02]">
                    <TableRow className="hover:bg-transparent border-forest/10">
                        <TableHead className="w-[300px] text-forest font-bold px-6">Identity</TableHead>
                        <TableHead className="text-forest font-bold">Ownership</TableHead>
                        <TableHead className="text-forest font-bold">Created</TableHead>
                        <TableHead className="text-right px-6 text-forest font-bold">Safety</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialKeys.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic">
                                The vault is currently empty.
                            </TableCell>
                        </TableRow>
                    ) : (
                        initialKeys.map((key) => (
                            <TableRow key={key.id} className="border-forest/5 hover:bg-sage/5 transition-colors">
                                <TableCell className="px-6 py-4 font-bold text-forest flex items-center gap-3">
                                    <div className="p-2 bg-cream rounded-lg border border-forest/10">
                                        <Key className="w-4 h-4 text-forest/40" />
                                    </div>
                                    {key.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="ghost" className="flex items-center gap-1.5 px-0 text-muted-foreground font-medium">
                                        <UserIcon className="w-3 h-3" />
                                        UID-{key.createdBy}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right px-6 space-x-2">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-9 w-9 border-forest/10 hover:border-sage hover:bg-sage/10 text-forest"
                                        title="Reveal Secret"
                                        disabled={revealingId === key.id}
                                        onClick={() => handleReveal(key.id)}
                                    >
                                        {revealingId === key.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-forest" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-9 w-9 border-forest/10 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 text-muted-foreground"
                                        title="Delete Key"
                                        onClick={() => {
                                            setDeleteCandidate(key);
                                            setIsDeleteOpen(true);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Reveal Dialog */}
            <Dialog open={isRevealOpen} onOpenChange={setIsRevealOpen}>
                <DialogContent className="max-w-md bg-cream border-forest/10">
                    <DialogHeader>
                        <DialogTitle className="text-forest flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Revealed API Key
                        </DialogTitle>
                        <DialogDescription>
                            This sensitive token is now decrypted. Handle with extreme caution.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 p-4 bg-forest/5 rounded-lg border border-forest/10 relative group">
                        <code className="text-sm font-mono break-all text-forest">
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
                <DialogContent className="max-w-sm bg-white border-destructive/20">
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Are you sure you want to delete <span className="font-bold text-forest">"{deleteCandidate?.name}"</span>?
                            This action is <span className="text-destructive font-semibold">irreversible</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
                            Keep Key
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-red-700"
                        >
                            {isDeleting ? (
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
