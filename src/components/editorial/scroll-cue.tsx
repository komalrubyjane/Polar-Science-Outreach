'use client';

import { ArrowDown } from 'lucide-react';

export function ScrollCue({ label = 'Scroll to explore' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' })
      }
      className="group inline-flex items-center gap-3 text-white/70 transition-colors hover:text-white"
    >
      <span className="metadata text-white/70 group-hover:text-white">{label}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25">
        <ArrowDown className="h-4 w-4 animate-scroll-cue" />
      </span>
    </button>
  );
}
