'use client';

import * as React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

export interface MapFeature {
  id: string;
  name: string;
  layer: string;
  lat: number;
  lng: number;
  href?: string | null;
  description?: string | null;
}

const LAYER_META: Record<string, { label: string; color: string }> = {
  stations: { label: 'Research stations', color: '#2d6d94' },
  expeditions: { label: 'Expeditions', color: '#4be0a0' },
  observations: { label: 'Observation sites', color: '#8a7ff0' },
  projects: { label: 'Research projects', color: '#e0a13f' },
  protectedAreas: { label: 'Protected areas', color: '#e0563f' },
};

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ||
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export function PolarMap({
  features,
  view = 'arctic',
  activeLayers,
}: {
  features: MapFeature[];
  view?: 'arctic' | 'antarctic';
  activeLayers: Set<string>;
}) {
  const center: [number, number] = view === 'arctic' ? [78, 0] : [-75, 0];
  const zoom = view === 'arctic' ? 3 : 3;

  const visible = features.filter((f) => activeLayers.has(f.layer));

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={2}
      scrollWheelZoom
      className="h-full w-full"
      worldCopyJump
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={TILE_URL}
      />
      {visible.map((f) => {
        const meta = LAYER_META[f.layer] ?? { label: f.layer, color: '#2d6d94' };
        return (
          <CircleMarker
            key={`${f.layer}-${f.id}`}
            center={[f.lat, f.lng]}
            radius={6}
            pathOptions={{ color: meta.color, fillColor: meta.color, fillOpacity: 0.8, weight: 1.5 }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {meta.label}
                </p>
                <p className="font-medium">{f.name}</p>
                {f.description ? (
                  <p className="text-sm text-slate-600">{f.description}</p>
                ) : null}
                <p className="text-xs text-slate-500">
                  {f.lat.toFixed(3)}°, {f.lng.toFixed(3)}°
                </p>
                {f.href ? (
                  <a href={f.href} className="text-sm text-sky-700 underline">
                    Open details
                  </a>
                ) : null}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

export { LAYER_META };
