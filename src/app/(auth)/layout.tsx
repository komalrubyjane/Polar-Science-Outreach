import Link from 'next/link';
import { Snowflake } from 'lucide-react';
import { SITE } from '@/lib/constants';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page flex min-h-[calc(100dvh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Snowflake className="h-7 w-7 text-accent" />
          <span className="font-display text-lg font-semibold">{SITE.name}</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
