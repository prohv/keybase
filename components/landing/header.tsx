import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 gap-6 md:gap-12 shadow-sm border border-border-light">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/keybase-logo.svg" alt="KeyBase" width={28} height={28} className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="text-base sm:text-xl font-heading font-bold text-forest tracking-tight">KeyBase</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/auth/login" className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-green-dark transition-colors">
            Sign In
          </Link>
          <Button asChild className="hidden sm:inline-flex bg-green-dark hover:bg-green-dark/90 text-white px-5 py-2 font-medium text-xs sm:text-sm rounded-full shadow-sm shadow-forest/10 h-9">
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
