import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-bg-section py-16 lg:py-20">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-forest leading-[1.15]">
            Ready to secure your{" "}
            <span className="relative inline-block">
              team&apos;s keys
              <span className="absolute bottom-1 left-0 right-0 h-2.5 bg-green-pale/60 -z-10" />
            </span>
            ?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Stop sharing API keys over Slack and email. Get your team on a
            secure, encrypted vault today.
          </p>
          <div className="pt-2">
            <Button
              asChild
              className="bg-green-dark hover:bg-green-dark/90 text-white px-8 py-6 font-heading font-semibold text-sm rounded-full shadow-lg shadow-green-dark/15 transition-all active:scale-[0.98]"
            >
              <Link href="/auth/register" className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
