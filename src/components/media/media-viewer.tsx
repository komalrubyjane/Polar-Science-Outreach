'use client';

import * as React from 'react';
import { Maximize2, X } from 'lucide-react';

export interface MediaViewerProps {
  type: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'INFOGRAPHIC' | 'INTERACTIVE';
  src: string | null;
  externalUrl: string | null;
  title: string;
  altText: string | null;
  captionsUrl: string | null;
  poster: string | null;
}

function toEmbed(url: string): string {
  const yt = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/.exec(url);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = /vimeo\.com\/(\d+)/.exec(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export function MediaViewer(props: MediaViewerProps) {
  const { type, src, externalUrl, title, altText, captionsUrl, poster } = props;
  const [fullscreen, setFullscreen] = React.useState(false);

  const image = (src || poster) && (type === 'PHOTO' || type === 'INFOGRAPHIC');

  return (
    <>
      <div className="relative overflow-hidden border border-border bg-surface-muted">
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(src || poster)!}
              alt={altText || title}
              className="max-h-[70vh] w-full object-contain"
            />
            <button
              onClick={() => setFullscreen(true)}
              className="absolute right-3 top-3 rounded-md bg-polar-night/70 p-2 text-white hover:bg-navy"
              aria-label="View full screen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </>
        ) : type === 'VIDEO' && src ? (
          <video controls poster={poster ?? undefined} className="w-full" preload="metadata">
            <source src={src} />
            {captionsUrl ? (
              <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />
            ) : null}
            Your browser does not support the video element.
          </video>
        ) : type === 'VIDEO' && externalUrl ? (
          <div className="aspect-video w-full">
            <iframe
              src={toEmbed(externalUrl)}
              title={title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : type === 'AUDIO' && src ? (
          <div className="p-6">
            <audio controls className="w-full" preload="metadata">
              <source src={src} />
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : type === 'DOCUMENT' && src ? (
          <iframe src={src} title={title} className="h-[70vh] w-full" />
        ) : type === 'INTERACTIVE' && externalUrl ? (
          <div className="aspect-video w-full">
            <iframe src={externalUrl} title={title} className="h-full w-full" />
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No preview available for this asset.
          </div>
        )}
      </div>

      {fullscreen ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-polar-night/95 p-4"
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — full screen`}
        >
          <button
            className="absolute right-4 top-4 rounded-md bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setFullscreen(false)}
            aria-label="Close full screen"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(src || poster)!}
            alt={altText || title}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : null}
    </>
  );
}
