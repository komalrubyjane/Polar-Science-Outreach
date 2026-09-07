'use client';

import * as React from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      const next: Toast = { id, duration: 5000, variant: 'default', ...t };
      setToasts((prev) => [...prev, next]);
      if (next.duration && next.duration > 0) {
        setTimeout(() => dismiss(id), next.duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
