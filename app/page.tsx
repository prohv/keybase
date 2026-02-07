import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { KeyRound, ShieldCheck, Users, Lock, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-cream selection:bg-sage selection:text-forest">
      {/* Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between sticky top-0 bg-cream/80 backdrop-blur-md z-50 border-b border-forest/5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-sage rounded-xl group-hover:bg-olive transition-all">
            <KeyRound className="w-6 h-6 text-forest" />
          </div>
          <span className="text-2xl font-black text-forest tracking-tighter">KeyBase</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/auth/login" className="text-sm font-bold text-forest hover:text-olive transition-colors underline-offset-4 hover:underline">
            Member Login
          </Link>
          <Button asChild className="bg-forest hover:bg-forest/90 text-cream px-6 font-bold shadow-lg shadow-forest/10 rounded-full">
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
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

        {/* Feature Grid */}
        <section className="py-20 bg-forest/5 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 text-center p-8 bg-white rounded-3xl shadow-sm border border-forest/5">
              <div className="w-16 h-16 bg-sage/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-forest" />
              </div>
              <h3 className="text-xl font-bold text-forest">AES-256 Encryption</h3>
              <p className="text-muted-foreground">Each key is encrypted with unique Initialization Vectors (IV) before hitting our database.</p>
            </div>
            <div className="space-y-4 text-center p-8 bg-white rounded-3xl shadow-sm border border-forest/5">
              <div className="w-16 h-16 bg-sage/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-forest" />
              </div>
              <h3 className="text-xl font-bold text-forest">Team Collaboration</h3>
              <p className="text-muted-foreground">Invite members using unique team codes. Manage access at a granular team level.</p>
            </div>
            <div className="space-y-4 text-center p-8 bg-white rounded-3xl shadow-sm border border-forest/5">
              <div className="w-16 h-16 bg-sage/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-forest" />
              </div>
              <h3 className="text-xl font-bold text-forest">Audit Log</h3>
              <p className="text-muted-foreground">Keep track of who created and accessed keys. Complete visibility into your security posture.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-forest/10 text-center">
        <p className="text-sm text-muted-foreground font-medium">
          &copy; {new Date().getFullYear()} KeyBase Security. Built for high-performance teams.
        </p>
      </footer>
    </div>
  );
}
