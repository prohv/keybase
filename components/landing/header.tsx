import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Header() {
  return (
    <header className="px-4 lg:px-12 h-16 flex items-center justify-between sticky top-0 bg-cream/80 backdrop-blur-md z-50 border-b border-border-light">
      <Link href="/" className="flex items-center gap-2 group">
        <Image src="/keybase-logo.svg" alt="KeyBase" width={28} height={28} className="w-7 h-7 sm:w-8 sm:h-8" />
        <span className="text-base sm:text-xl font-heading font-bold text-forest tracking-tight">KeyBase</span>
      </Link>
      <nav className="flex items-center gap-4 sm:gap-6">
        <Link href="/auth/login" className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-green-dark transition-colors">
          Sign In
        </Link>
        <Button asChild className="bg-green-dark hover:bg-green-dark/90 text-white px-5 py-2 font-medium text-xs sm:text-sm rounded-full shadow-sm shadow-forest/10 h-9">
          <Link href="/auth/register">Get Started</Link>
        </Button>
      </nav>
    </header>
  );
}
