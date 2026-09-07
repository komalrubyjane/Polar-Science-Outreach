import Link from 'next/link';
import { SmartImage } from '@/components/editorial/smart-image';
import { getEditorialImage } from '@/lib/images/provider';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const img = getEditorialImage('auth', 1600);
  return (
    <div className="-mt-[var(--header-h)] grid min-h-dvh lg:grid-cols-2">
      {/* Editorial image side */}
      <aside className="relative hidden overflow-hidden bg-polar-ocean text-white lg:block">
        <div className="absolute inset-0">
          <SmartImage
            candidates={img.candidates}
            fallback={img.fallback}
            alt=""
            priority
            sizes="50vw"
            className="h-full w-full"
          />
        </div>
        <div className="cinematic-overlay absolute inset-0" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-14">
          <Link
            href="/"
            className="font-display text-[0.95rem] font-medium uppercase leading-[1.05] tracking-[0.18em]"
          >
            Polar
            <br />
            Science
          </Link>
          <div>
            <p className="font-serif-editorial text-2xl leading-snug text-white/90">
              “Understanding the poles means understanding our planet.”
            </p>
            <p className="metadata mt-4 text-white/60">Polar Science Portal</p>
          </div>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-12 inline-block font-display text-[0.95rem] font-medium uppercase tracking-[0.18em] lg:hidden"
          >
            Polar Science
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
