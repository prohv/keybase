'use client';

import { useState } from 'react';
import { UserPlus, Copy, Check, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InviteButtonProps {
    teamCode: string;
}

export function InviteButton({ teamCode }: InviteButtonProps) {
    const [copied, setCopied] = useState(false);

    function copy() {
        navigator.clipboard.writeText(teamCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-forest bg-white border border-border-light rounded-full hover:bg-bg-muted hover:border-sage transition-all">
                    <UserPlus className="w-3.5 h-3.5" />
                    Invite
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm bg-white border-border-light">
                <DialogHeader>
                    <DialogTitle className="font-heading font-bold text-forest flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Invite Members
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground font-medium">
                        Share this code with your team to grant them access:
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-bg-muted rounded-lg border border-border-light">
                        <code className="flex-1 text-lg font-bold tracking-widest text-forest text-center">{teamCode}</code>
                        <button onClick={copy} className="shrink-0 p-2 text-forest/40 hover:text-forest hover:bg-forest/5 rounded-lg transition-colors">
                            {copied ? <Check className="w-4 h-4 text-olive" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                        Members can join by going to Dashboard → Join Team and entering this code.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
