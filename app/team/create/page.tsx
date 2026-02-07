'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTeamAction } from './action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Loader2, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

export default function CreateTeamPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            const result = await createTeamAction(formData);

            if (result.error) {
                toast.error(result.error);
            } else if (result.teamCode) {
                toast.success('Team vault created successfully!');
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            toast.error('An unexpected error occurred while creating the team.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-cream bg-[url('/bg-pattern.svg')] bg-cover">
            <div className="fixed inset-0 bg-cream/80 -z-10" />

            <Card className="w-full max-w-md glass-card border-forest/10 shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center mb-2">
                        <div className="p-4 bg-sage rounded-full shadow-inner ring-4 ring-sage/10">
                            <Plus className="w-8 h-8 text-forest" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-forest tracking-tight">Create a Vault</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg">
                        Initialize a new secure space for your team's secrets.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="name" className="text-forest font-bold text-sm uppercase tracking-widest">
                                Team Name
                            </Label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/30" />
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="e.g. Engineering Alpha"
                                    required
                                    disabled={loading}
                                    className="pl-10 h-14 bg-white/50 border-forest/20 focus:border-sage focus:ring-sage text-lg font-medium"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                                Choose a descriptive name for your team or project.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                className="w-full bg-forest hover:bg-forest/90 text-cream h-14 text-lg font-bold shadow-lg transition-all active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Initializing Vault...
                                    </>
                                ) : (
                                    'Create Team Vault'
                                )}
                            </Button>

                            <Button asChild variant="ghost" className="text-muted-foreground hover:text-forest">
                                <Link href="/dashboard" className="flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
