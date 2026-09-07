import { Breadcrumb, type Crumb } from '@/components/ui/misc';

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container-page py-10">
        {breadcrumbs?.length ? <Breadcrumb items={breadcrumbs} /> : null}
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-muted-foreground">{description}</p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </div>
  );
}
