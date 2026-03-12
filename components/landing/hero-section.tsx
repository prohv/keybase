import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ChevronRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="py-24 lg:py-32 px-6 text-center max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage/20 border border-sage/30 text-forest text-sm font-bold tracking-wide">
        <ShieldCheck className="w-4 h-4 text-olive" />
        ENTERPRISE-GRADE SECURITY FOR YOUR ENTIRE TEAM
      </div>
      <h1 className="text-5xl lg:text-7xl font-black text-forest tracking-tight leading-[1.1]">
        Securely Share Team <span className="text-olive underline decoration-sage/50 underline-offset-8">API Keys</span> Without Compromise.
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
        Stop pasting sensitive tokens in Slack or .env files. Encrypted,
        audited, and collaborative vault for your team's project keys.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button asChild size="lg" className="h-16 px-10 bg-sage hover:bg-olive text-forest font-black text-lg rounded-2xl shadow-xl shadow-sage/20 transition-all active:scale-[0.98]">
          <Link href="/auth/register" className="flex items-center gap-2">
            Initialize Your Vault
            <ChevronRight className="w-5 h-5" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-16 px-10 border-forest/10 text-forest font-bold text-lg rounded-2xl hover:bg-forest/5">
          <Link href="/auth/login">Access Existing Vault</Link>
        </Button>
      </div>
    </section>
  );
}
