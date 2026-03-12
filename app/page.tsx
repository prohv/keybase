import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { FeatureGrid } from '@/components/landing/feature-grid';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-cream selection:bg-sage selection:text-forest">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <FeatureGrid />
      </main>

      <footer className="py-12 px-6 border-t border-forest/10 text-center">
        <p className="text-sm text-muted-foreground font-medium">
          &copy; {new Date().getFullYear()} KeyBase Security. Built for high-performance teams.
        </p>
      </footer>
    </div>
  );
}
