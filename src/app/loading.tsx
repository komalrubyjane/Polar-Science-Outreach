import { CardSkeleton } from '@/components/ui/misc';

export default function Loading() {
  return (
    <div className="container-page py-16">
      <div className="mb-8 h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
