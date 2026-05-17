'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card2, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, Key } from 'lucide-react';
import { useCreateApiKeyMutation } from '@/hooks/use-api-keys';
import { getProviderInfo } from '@/lib/providers';

interface ApiKeyFormProps {
    projectId: number;
}

export function ApiKeyForm({ projectId }: ApiKeyFormProps) {
    const [name, setName] = useState('');
    const provider = getProviderInfo(name);
    const createMutation = useCreateApiKeyMutation(projectId);

    async function handleSubmit(formData: FormData) {
        createMutation.mutate(formData, {
            onSuccess: () => {
                (document.getElementById('api-key-form') as HTMLFormElement)?.reset();
                setName('');
            }
        });
    }

    return (
        <Card2 className="bg-white border-border-light shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-heading font-bold text-forest">Add Security Key</CardTitle>
                <CardDescription className="font-medium">Encrypt and store a new API key in this vault.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="api-key-form" action={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="font-heading font-semibold text-xs tracking-wide uppercase text-forest">Key Identifier</Label>
                        <div className="relative group/input">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                                {provider ? (
                                    <div
                                        className="w-5 h-5 transition-all duration-300"
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
                                ) : (
                                    <Key className="w-5 h-5 text-forest/20 group-focus-within/input:text-forest/40 transition-colors" />
                                )}
                            </div>
                            <Input
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. OpenAI Production"
                                required
                                disabled={createMutation.isPending}
                                className="bg-white border-border-light focus:border-green-dark focus:ring-green-dark/20 rounded-lg pl-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="key" className="font-heading font-semibold text-xs tracking-wide uppercase text-forest">API Token</Label>
                        <Input
                            id="key"
                            name="key"
                            type="password"
                            placeholder="sk-..."
                            required
                            disabled={createMutation.isPending}
                                className="bg-white border-border-light focus:border-green-dark focus:ring-green-dark/20 rounded-lg"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-green-dark hover:bg-green-dark/90 text-white font-heading font-semibold text-sm rounded-full"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? (
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
        </Card2>
    );
}
