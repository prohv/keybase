import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden pt-8 lg:pt-12 pb-16 lg:pb-20">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 lg:space-y-8 pt-4 lg:pt-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-forest tracking-tight leading-[1.1]">
              Serve API keys to your team.{' '}
              <span className="relative inline-block">
                Securely.
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-green-pale/60 -z-10" />
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed font-medium">
              Stop pasting sensitive tokens in Slack or .env files. Encrypted,
              audited, and collaborative vault for your team&apos;s project keys.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 pt-2">
              <Button asChild className="bg-green-dark hover:bg-green-dark/90 text-white px-8 py-6 font-heading font-semibold text-sm rounded-full shadow-lg shadow-green-dark/15 transition-all active:scale-[0.98]">
                <Link href="/auth/register" className="flex items-center gap-2">
                  Initialize Your Vault
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="px-8 py-6 font-heading font-semibold text-sm rounded-full border-border-light text-forest hover:bg-forest/5">
                <Link href="/auth/login">Access Existing Vault</Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-[4/5] rounded-[40px] bg-gradient-to-br from-green-pale via-bg-green-light to-green-soft shadow-xl overflow-hidden">
              <div className="absolute top-8 left-8 w-40 h-40 rounded-full bg-gradient-to-br from-white/30 to-transparent blur-sm" />
              <div className="absolute bottom-16 right-8 w-56 h-56 rounded-full bg-gradient-to-tl from-green-dark/10 to-transparent blur-sm" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-green-soft/20 to-transparent blur-md" />
            </div>

            <div className="absolute -bottom-5 right-0 lg:-left-6 lg:right-auto bg-stat-bg text-white rounded-2xl p-5 shadow-xl min-w-[180px]">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-2xl font-heading font-bold">500+</p>
                  <p className="text-xs text-white/70 mt-0.5">Teams</p>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">10K+</p>
                  <p className="text-xs text-white/70 mt-0.5">Keys Secured</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden mx-auto max-w-[1160px] px-4 sm:px-8 pb-4">
        <div className="relative w-full aspect-[16/9] rounded-[40px] bg-gradient-to-br from-green-pale via-bg-green-light to-green-soft shadow-xl overflow-hidden">
          <div className="absolute top-6 left-6 w-32 h-32 rounded-full bg-gradient-to-br from-white/30 to-transparent blur-sm" />
          <div className="absolute bottom-8 right-6 w-44 h-44 rounded-full bg-gradient-to-tl from-green-dark/10 to-transparent blur-sm" />
          <div className="absolute -bottom-5 right-0 bg-stat-bg text-white rounded-2xl p-4 shadow-xl">
            <div className="flex gap-6">
              <div>
                <p className="text-xl font-heading font-bold">500+</p>
                <p className="text-[10px] text-white/70">Teams</p>
              </div>
              <div>
                <p className="text-xl font-heading font-bold">10K+</p>
                <p className="text-[10px] text-white/70">Keys</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
