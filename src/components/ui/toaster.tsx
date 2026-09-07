'use client';

import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from './use-toast';

const ICONS = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 p-4 sm:bottom-4 sm:right-4 sm:items-end sm:p-0"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.variant ?? 'default'];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-card p-4 shadow-lg animate-fade-in',
              t.variant === 'success' && 'border-success/40',
              t.variant === 'error' && 'border-destructive/50',
            )}
          >
            <Icon
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0',
                t.variant === 'success' && 'text-success',
                t.variant === 'error' && 'text-destructive',
                (!t.variant || t.variant === 'default') && 'text-accent',
              )}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              ) : null}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded p-1 text-muted-foreground hover:bg-secondary"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
