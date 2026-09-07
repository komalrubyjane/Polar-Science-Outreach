import { CardSkeleton, Skeleton } from '@/components/ui/misc';

export default function Loading() {
  return (
    <div>
      <div className="border-b border-border bg-surface">
        <div className="editorial py-14 sm:py-20">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-6 h-14 w-2/3 max-w-2xl" />
          <Skeleton className="mt-6 h-5 w-full max-w-xl" />
        </div>
      </div>
      <div className="editorial py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
