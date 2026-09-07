'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_LOCALES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

const STORAGE_KEY = 'psp.locale';

/**
 * Language selector. English is fully translated; other locales are registered
 * in the i18n architecture (see docs/architecture.md) and fall back to English
 * strings until their message catalogues are supplied.
 */
export function LanguageSelector() {
  const { toast } = useToast();
  const [locale, setLocale] = React.useState('en');

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLocale(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const choose = (code: string, label: string) => {
    setLocale(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
      document.cookie = `${STORAGE_KEY}=${code}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* ignore */
    }
    if (code !== 'en') {
      toast({
        title: `${label} selected`,
        description:
          'Interface translation for this language is being rolled out. English text is shown where a translation is not yet available.',
      });
    }
  };

  const current = SUPPORTED_LOCALES.find((l) => l.code === locale) ?? SUPPORTED_LOCALES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5" aria-label="Change language">
          <Globe className="h-4 w-4" />
          <span className="hidden text-xs font-semibold uppercase sm:inline">
            {current.code}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_LOCALES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => choose(l.code, l.label)}
            className={l.code === locale ? 'font-semibold text-accent' : undefined}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
