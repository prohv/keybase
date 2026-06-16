'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card2, CardContent } from '@/components/ui/card';
import { Loader2, FolderKanban } from 'lucide-react';
import { createProjectAction } from '@/app/project/create/action';

interface CreateProjectFormProps {
    teamId: number;
}

export function CreateProjectForm({ teamId }: CreateProjectFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const name = (new FormData(e.currentTarget)).get('name') as string;

        try {
            const res = await createProjectAction({ teamId, name });
            if (res && 'success' in res && res.success && res.project) {
                toast.success('Project created');
                router.push(`/dashboard?team=${teamId}&project=${res.project.id}`);
                router.refresh();
            } else {
                const errMsg = res && 'error' in res ? res.error : 'Failed to create project';
                toast.error(errMsg);
            }
        } catch {
            toast.error('Failed to create project');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card2 className="max-w-lg mx-auto bg-white border-border-light shadow-sm rounded-2xl">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="font-heading font-semibold text-xs tracking-wide uppercase text-forest">Project Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. Payment Gateway"
                            required
                            disabled={loading}
                            className="bg-white border-border-light focus:border-green-dark focus:ring-green-dark/20 rounded-lg"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-dark hover:bg-green-dark/90 text-white font-heading font-semibold text-sm rounded-full"
                    >
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : <><FolderKanban className="w-4 h-4 mr-2" />Create Project</>}
                    </Button>
                </form>
            </CardContent>
        </Card2>
    );
}
