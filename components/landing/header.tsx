import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

export function Header() {
  return (
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
  );
}
