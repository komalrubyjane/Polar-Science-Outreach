'use client';

import * as React from 'react';

/**
 * Small self-contained interactive learning widgets. Values are illustrative
 * teaching aids, not measurements.
 */

export function SeaIceSimulator() {
  const [warming, setWarming] = React.useState(1);
  // Illustrative: September Arctic minimum ~4.5 M km² at +1°C, falling ~1.1 M km² per °C.
  const extent = Math.max(0, 5.6 - warming * 1.1);
  const pct = Math.round((extent / 7) * 100);

  return (
    <div className="border border-border bg-surface p-6">
      <h3 className="font-display text-lg font-semibold">Sea ice simulator</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Drag to change global warming above pre-industrial levels and see an illustrative
        September Arctic sea-ice minimum.
      </p>
      <label className="mt-4 block text-sm font-medium">
        Global warming: +{warming.toFixed(1)} °C
      </label>
      <input
        type="range"
        min={0}
        max={5}
        step={0.1}
        value={warming}
        onChange={(e) => setWarming(Number(e.target.value))}
        className="mt-2 w-full accent-polar-ocean"
        aria-label="Global warming in degrees Celsius"
      />
      <div className="mt-4 h-6 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[color:rgb(var(--chart-2))] transition-all"
          style={{ width: `${Math.max(4, pct)}%` }}
        />
      </div>
      <p className="mt-2 text-sm">
        Illustrative minimum extent:{' '}
        <span className="font-semibold">{extent.toFixed(1)} million km²</span>
        {extent <= 1 ? ' — a practically ice-free Arctic summer.' : ''}
      </p>
    </div>
  );
}

export function AlbedoExplainer() {
  const [surface, setSurface] = React.useState<'ice' | 'ocean'>('ice');
  const albedo = surface === 'ice' ? 0.7 : 0.06;
  const reflected = Math.round(albedo * 100);
  const absorbed = 100 - reflected;

  return (
    <div className="border border-border bg-surface p-6">
      <h3 className="font-display text-lg font-semibold">Albedo: ice vs open ocean</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Albedo is the fraction of sunlight a surface reflects. Bright sea ice reflects most
        sunlight; dark ocean absorbs it — which warms the water and melts more ice.
      </p>
      <div className="mt-4 flex gap-2">
        {(['ice', 'ocean'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSurface(s)}
            className={`flex-1 rounded-sm border px-3 py-2 text-sm capitalize ${
              surface === s ? 'border-accent bg-accent/10 font-medium' : 'border-border'
            }`}
          >
            {s === 'ice' ? 'Sea ice' : 'Open ocean'}
          </button>
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-muted/50 p-3">
          <dt className="text-muted-foreground">Sunlight reflected</dt>
          <dd className="font-display text-2xl font-semibold">{reflected}%</dd>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <dt className="text-muted-foreground">Sunlight absorbed</dt>
          <dd className="font-display text-2xl font-semibold">{absorbed}%</dd>
        </div>
      </dl>
    </div>
  );
}

export function PolarFoodWeb() {
  const links = [
    ['Phytoplankton', 'Krill'],
    ['Krill', 'Fish'],
    ['Krill', 'Baleen whales'],
    ['Fish', 'Penguins'],
    ['Fish', 'Seals'],
    ['Penguins', 'Leopard seal'],
    ['Seals', 'Orca'],
  ];
  const [hover, setHover] = React.useState<string | null>(null);
  const nodes = [...new Set(links.flat())];

  return (
    <div className="border border-border bg-surface p-6">
      <h3 className="font-display text-lg font-semibold">Antarctic food web</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Hover a species to highlight what it eats and what eats it. Krill are the keystone —
        remove them and the whole web is affected.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {nodes.map((n) => {
          const connected =
            hover &&
            links.some(([a, b]) => (a === hover && b === n) || (b === hover && a === n));
          return (
            <span
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              className={`cursor-default rounded-full border px-3 py-1 text-sm transition-colors ${
                hover === n
                  ? 'border-accent bg-accent text-accent-foreground'
                  : connected
                    ? 'border-accent bg-accent/10'
                    : 'border-border'
              }`}
            >
              {n}
            </span>
          );
        })}
      </div>
      {hover ? (
        <p className="mt-3 text-sm text-muted-foreground">
          <strong>{hover}</strong> —{' '}
          {links.filter(([a]) => a === hover).map(([, b]) => b).join(', ') || 'top of its chain'}{' '}
          eats it; it eats{' '}
          {links.filter(([, b]) => b === hover).map(([a]) => a).join(', ') || 'produces its own energy'}.
        </p>
      ) : null}
    </div>
  );
}
