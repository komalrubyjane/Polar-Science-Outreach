'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FilterField {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export function FilterBar({
  fields,
  sortOptions,
  sortParam = 'sort',
  searchPlaceholder = 'Search…',
  className,
}: {
  fields: FilterField[];
  sortOptions?: { value: string; label: string }[];
  sortParam?: string;
  searchPlaceholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get('q') ?? '');
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setQ(params.get('q') ?? '');
  }, [params]);

  const update = React.useCallback(
    (mut: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(params.toString());
      mut(sp);
      sp.delete('page');
      router.push(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router],
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    update((sp) => {
      if (q.trim()) sp.set('q', q.trim());
      else sp.delete('q');
    });
  };

  const activeCount = fields.filter((f) => params.get(f.key)).length + (params.get('q') ? 1 : 0);

  const clearAll = () => {
    setQ('');
    router.push(pathname);
  };

  return (
    <div className={cn('mb-8 space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={onSearch} className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label="Search"
          />
        </form>
        {sortOptions?.length ? (
          <Select
            value={params.get(sortParam) ?? sortOptions[0]!.value}
            onValueChange={(v) => update((sp) => sp.set(sortParam, v))}
          >
            <SelectTrigger className="w-[160px]" aria-label="Sort order">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        {fields.length ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen((v) => !v)}
            className="gap-2"
            aria-expanded={open}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount ? (
              <span className="rounded-full bg-accent px-1.5 text-xs text-accent-foreground">
                {activeCount}
              </span>
            ) : null}
          </Button>
        ) : null}
        {activeCount ? (
          <Button type="button" variant="ghost" onClick={clearAll} className="gap-1">
            <X className="h-4 w-4" /> Clear
          </Button>
        ) : null}
      </div>

      {open && fields.length ? (
        <div className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                {f.label}
              </label>
              <Select
                value={params.get(f.key) ?? '__all'}
                onValueChange={(v) =>
                  update((sp) => (v === '__all' ? sp.delete(f.key) : sp.set(f.key, v)))
                }
              >
                <SelectTrigger aria-label={f.label}>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Any</SelectItem>
                  {f.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
