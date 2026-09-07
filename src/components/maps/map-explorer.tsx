'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { List, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LAYER_META, type MapFeature } from './polar-map';
import { cn } from '@/lib/utils';

const PolarMap = dynamic(() => import('./polar-map').then((m) => m.PolarMap), {
  ssr: false,
  loading: () => (
    <div className="relative h-full w-full overflow-hidden bg-surface-muted"><div className="skeleton absolute inset-0" /><div className="absolute inset-0 flex items-center justify-center">      <span className="glass rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-foreground">Loading map…</span></div>
    </div>
  ),
});

export function MapExplorer({ features }: { features: MapFeature[] }) {
  const [view, setView] = React.useState<'arctic' | 'antarctic'>('arctic');
  const allLayers = React.useMemo(
    () => [...new Set(features.map((f) => f.layer))],
    [features],
  );
  const [active, setActive] = React.useState<Set<string>>(() => new Set(allLayers));
  const [tab, setTab] = React.useState<'map' | 'list'>('map');
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    setActive(new Set(allLayers));
  }, [allLayers]);

  const toggleLayer = (layer: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  const listFeatures = features
    .filter((f) => active.has(f.layer))
    .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="space-y-4">
        <div className="glass rounded-card p-4">
          <p className="mb-2 text-sm font-semibold">View</p>
          <div className="flex gap-2">
            {(['arctic', 'antarctic'] as const).map((v) => (
              <Button
                key={v}
                size="sm"
                variant={view === v ? 'default' : 'outline'}
                onClick={() => setView(v)}
                className="flex-1 capitalize"
              >
                {v}
              </Button>
            ))}
          </div>
        </div>

        <div className="glass rounded-card p-4">
          <p className="mb-2 text-sm font-semibold">Layers</p>
          <ul className="space-y-2">
            {allLayers.map((layer) => {
              const meta = LAYER_META[layer] ?? { label: layer, color: '#888' };
              const count = features.filter((f) => f.layer === layer).length;
              return (
                <li key={layer}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={active.has(layer)}
                      onChange={() => toggleLayer(layer)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: meta.color }}
                      aria-hidden
                    />
                    {meta.label}
                    <span className="ml-auto text-xs text-muted-foreground">{count}</span>
                  </label>
                </li>
              );
            })}
            {allLayers.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                No map features yet. Seed the database to populate stations and expeditions.
              </li>
            ) : null}
          </ul>
        </div>

        <div className="glass rounded-card p-4">
          <label htmlFor="loc-search" className="mb-2 block text-sm font-semibold">
            Search locations
          </label>
          <Input
            id="loc-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name…"
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex gap-2">
          <Button
            size="sm"
            variant={tab === 'map' ? 'default' : 'outline'}
            onClick={() => setTab('map')}
          >
            <MapIcon className="h-4 w-4" /> Map
          </Button>
          <Button
            size="sm"
            variant={tab === 'list' ? 'default' : 'outline'}
            onClick={() => setTab('list')}
          >
            <List className="h-4 w-4" /> Accessible list ({listFeatures.length})
          </Button>
        </div>

        <div className={cn('h-[560px] overflow-hidden rounded-card border border-border', tab === 'list' && 'hidden')}>
          <PolarMap features={features} view={view} activeLayers={active} />
        </div>

        {tab === 'list' ? (
          <div className="max-h-[560px] overflow-y-auto rounded-card border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Layer</th>
                  <th className="px-3 py-2 text-left">Coordinates</th>
                  <th className="px-3 py-2 text-left">Link</th>
                </tr>
              </thead>
              <tbody>
                {listFeatures.map((f) => (
                  <tr key={`${f.layer}-${f.id}`} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{f.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {LAYER_META[f.layer]?.label ?? f.layer}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {f.lat.toFixed(2)}°, {f.lng.toFixed(2)}°
                    </td>
                    <td className="px-3 py-2">
                      {f.href ? (
                        <a href={f.href} className="text-accent hover:underline">
                          Details
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
                {listFeatures.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                      No locations match the current filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
