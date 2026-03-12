import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Header() {
  return (
    <header className="px-4 lg:px-12 h-20 flex items-center justify-between sticky top-0 bg-cream/80 backdrop-blur-md z-50 border-b border-forest/5">
      <Link href="/" className="flex items-center gap-2 group">
        <Image src="/keybase-logo.svg" alt="KeyBase" width={32} height={32} className="w-8 h-8 sm:w-10 sm:h-10" />
        <span className="text-xl sm:text-2xl font-black text-forest tracking-tighter">KeyBase</span>
      </Link>
      <nav className="flex items-center gap-3 sm:gap-6">
        <Link href="/auth/login" className="hidden xs:block text-xs sm:text-sm font-bold text-forest hover:text-olive transition-colors underline-offset-4 hover:underline">
          Member Login
        </Link>
        <Button asChild size="sm" className="bg-forest hover:bg-forest/90 text-cream px-4 sm:px-6 font-bold shadow-lg shadow-forest/10 rounded-full text-xs sm:text-sm h-9 sm:h-10">
          <Link href="/auth/register">Get Started</Link>
        </Button>
      </nav>
    </header>
  );
}
