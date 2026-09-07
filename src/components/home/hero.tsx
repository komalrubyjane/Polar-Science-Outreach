import Link from 'next/link';
import { ArrowRight, Map as MapIcon, Compass, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/constants';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="aurora-bg animate-aurora-shift absolute inset-0 opacity-90" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]"
        aria-hidden
      />
      <div className="container-page relative py-20 sm:py-28">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
            Arctic &amp; Antarctic · Research, data &amp; stories
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {SITE.tagline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">{SITE.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-navy hover:bg-white/90">
              <Link href="/explore">
                <Compass className="h-4 w-4" /> Explore Polar Science
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/repository">
                <Library className="h-4 w-4" /> Browse Knowledge Repository
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="link"
              className="text-white hover:text-white"
            >
              <Link href="/map">
                <MapIcon className="h-4 w-4" /> Explore Polar Map <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
