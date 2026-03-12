'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createApiKeyAction } from '@/app/api-key/create/action';

interface ApiKeyFormProps {
    teamId: number;
}

export function ApiKeyForm({ teamId }: ApiKeyFormProps) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            // Add teamId to formData
            formData.append('teamId', teamId.toString());

            const res = await createApiKeyAction(formData);

            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success('API Key successfully encrypted and stored.');
                // Reset form
                (document.getElementById('api-key-form') as HTMLFormElement)?.reset();
            }
        } catch (err) {
            toast.error('An unexpected error occurred while saving the key.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="border-forest/10 shadow-sm glass-card">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-forest">Add Security Key</CardTitle>
                <CardDescription>Encrypt and store a new API key in this vault.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="api-key-form" action={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-forest font-semibold">Key Identifier</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. OpenAI Production"
                            required
                            disabled={loading}
                            className="bg-white/50 border-forest/10 focus:ring-sage"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="key" className="text-forest font-semibold">API Token</Label>
                        <Input
                            id="key"
                            name="key"
                            type="password"
                            placeholder="sk-..."
                            required
                            disabled={loading}
                            className="bg-white/50 border-forest/10 focus:ring-sage"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-sage hover:bg-olive text-forest font-bold transition-all shadow-md"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Encrypting...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Encrypt & Save
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
