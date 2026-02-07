'use client';

import { useState } from 'react';
import { registerAction } from './action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import { isRedirectError } from 'next/dist/client/components/redirect';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const res = await registerAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Account created successfully! Please log in.');
      }
    } catch (err) {
      if (isRedirectError(err)) throw err;
      console.error('[Register] Submission error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/bg-pattern.svg')] bg-cover">
      <div className="fixed inset-0 bg-cream/80 -z-10" />

      <Card className="w-full max-w-md glass-card border-forest/10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-sage rounded-2xl shadow-lg ring-4 ring-sage/10">
              <ShieldCheck className="w-8 h-8 text-forest" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-forest">Initialize Vault</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Create your account to start securing API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-forest font-semibold">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="bg-white/50 border-forest/10 focus:border-sage focus:ring-sage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-forest font-semibold">Security Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white/50 border-forest/10 focus:border-sage focus:ring-sage"
              />
              <p className="text-xs text-muted-foreground italic">
                Password should be at least 6 characters.
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-sage hover:bg-olive text-forest font-bold py-6 text-lg transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Secure Account'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2">
          <p className="text-sm text-muted-foreground">Already have a vault?</p>
          <Link
            href="/auth/login"
            className="text-sm font-bold text-olive hover:text-forest transition-colors underline underline-offset-4"
          >
            Access your keys
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}