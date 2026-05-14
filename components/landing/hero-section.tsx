import Link from 'next/link';
import Image from 'next/image';
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
              Stop pasting sensitive tokens in Slack or sharing .env files. Use Keybase, encrypted
              & collaborative vault for your team.
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
            <div className="relative w-full aspect-square rounded-[40px] bg-gradient-to-br from-green-pale via-bg-green-light to-green-soft shadow-xl overflow-hidden">
              <Image
                src="/hero-keys-2.png"
                alt="3D rendered security keys"
                fill
                className="object-contain scale-[0.82]"
                sizes="50vw"
                priority
              />
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
        <div className="relative w-full aspect-[5/4] rounded-[40px] bg-gradient-to-br from-green-pale via-bg-green-light to-green-soft shadow-xl overflow-hidden">
          <Image
            src="/hero-keys-2.png"
            alt="3D rendered security keys"
            fill
            className="object-contain scale-[0.8]"
            sizes="100vw"
          />
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
