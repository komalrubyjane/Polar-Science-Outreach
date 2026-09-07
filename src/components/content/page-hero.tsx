import { Breadcrumb, type Crumb } from '@/components/ui/misc';
import { Eyebrow, Hairline } from '@/components/editorial/primitives';
import { SmartImage } from '@/components/editorial/smart-image';
import { getEditorialImage } from '@/lib/images/provider';
import type { CatalogSlot } from '@/lib/images/catalog';
import { cn } from '@/lib/utils';

/**
 * Editorial page header. Without `imageSlot` it's a clean oversized type block;
 * with one it becomes a compact cinematic banner.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  imageSlot,
  index,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  children?: React.ReactNode;
  imageSlot?: CatalogSlot;
  index?: string;
}) {
  const img = imageSlot ? getEditorialImage(imageSlot, 1920) : null;

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden border-b border-border',
        img ? 'grain bg-polar-ocean text-white' : 'bg-surface',
      )}
    >
      {img ? (
        <>
          <div className="absolute inset-0 -z-10">
            <SmartImage
              candidates={img.candidates}
              fallback={img.fallback}
              alt=""
              priority
              sizes="100vw"
              className="h-full w-full"
              imgClassName="scale-105"
            />
          </div>
          <div className="cinematic-overlay absolute inset-0 -z-10" aria-hidden />
        </>
      ) : null}

      <div className={cn('editorial', img ? 'py-16 sm:py-24' : 'py-14 sm:py-20')}>
        {breadcrumbs?.length ? (
          <div className={img ? '[&_*]:!text-white/70 [&_a:hover]:!text-white' : undefined}>
            <Breadcrumb items={breadcrumbs} />
          </div>
        ) : (
          <Hairline className={img ? 'bg-white/25' : undefined} />
        )}

        <div className="mt-6 max-w-4xl">
          {eyebrow ? (
            <Eyebrow accent={!img} className={img ? 'text-white/70' : undefined}>
              {index ? <span className="tabular-nums">{index}</span> : null}
              {index ? <span className="opacity-40">/</span> : null}
              {eyebrow}
            </Eyebrow>
          ) : null}
          <h1 className="display-1 mt-4 text-balance">{title}</h1>
          {description ? (
            <p
              className={cn(
                'mt-6 max-w-2xl text-lg leading-relaxed',
                img ? 'text-white/80' : 'text-muted-foreground',
              )}
            >
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
