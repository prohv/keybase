import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { Ticker } from '@/components/landing/ticker';
import { FeatureGrid } from '@/components/landing/feature-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { CTASection } from '@/components/landing/cta-footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white/90 selection:bg-green-pale selection:text-green-dark">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <Ticker />
        <FeatureGrid />
        <HowItWorks />
        <CTASection />
      </main>

      <footer className="py-6 px-6 border-t border-border-light text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} KeyBase Security. Built for high-performance teams.
        </p>
      </footer>
    </div>
  );
}
