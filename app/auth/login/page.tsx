'use client';

import { useLoginMutation } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card2, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthDivider } from '@/components/ui/auth-divider';
import { OAuthButton } from '@/components/ui/oauth-button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();

  async function handleSubmit(formData: FormData) {
    loginMutation.mutate(formData);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <Card2 className="w-full max-w-md bg-white border-border-light shadow-sm rounded-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Link href="/">
              <Image src="/keybase-logo.svg" alt="KeyBase" width={40} height={40} className="w-10 h-10" />
            </Link>
          </div>
          <CardTitle className="text-3xl font-heading font-bold tracking-tight text-forest">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Enter your credentials to access your vault
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-heading font-semibold text-xs tracking-wide uppercase text-forest">Email Account</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="bg-white border-border-light focus:border-green-dark focus:ring-green-dark/20 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-heading font-semibold text-xs tracking-wide uppercase text-forest">Security Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white border-border-light focus:border-green-dark focus:ring-green-dark/20 rounded-lg"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-dark hover:bg-green-dark/90 text-white font-heading font-semibold text-sm rounded-full py-2.5 transition-all active:scale-[0.98]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Secure Login'
              )}
            </Button>
          </form>
          <AuthDivider />
          <OAuthButton label="Sign in with Google" />
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2">
          <p className="text-sm text-muted-foreground">Dont have an account?</p>
          <Link
            href="/auth/register"
            className="text-sm font-medium text-green-mid hover:text-green-dark transition-colors"
          >
            Create your vault
          </Link>
        </CardFooter>
      </Card2>
    </div>
  );
}