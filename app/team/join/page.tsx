'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinTeamAction } from './action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function JoinTeamPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await joinTeamAction(formData);

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(`Successfully joined team: ${result.teamName}!`);
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    } catch (err) {
      toast.error('An unexpected error occurred while joining the team.');
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
              <UserPlus className="w-8 h-8 text-forest" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-forest tracking-tight">Join a Vault</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Enter a team code to gain access to shared keys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="code" className="text-forest font-bold text-sm uppercase tracking-widest">
                Verification Code
              </Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="A1B2C3D4"
                required
                disabled={loading}
                className="text-center text-2xl font-black tracking-[0.5em] h-16 bg-white/50 border-forest/20 focus:border-sage focus:ring-sage uppercase placeholder:text-forest/10"
              />
              <p className="text-xs text-muted-foreground text-center italic">
                Get this 8-character code from your team administrator.
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
                    Verifying Access...
                  </>
                ) : (
                  'Join Team Vault'
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