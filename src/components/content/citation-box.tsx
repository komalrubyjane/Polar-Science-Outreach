'use client';

import * as React from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

export interface Citations {
  apa: string;
  mla: string;
  chicago: string;
  bibtex: string;
}

export function CitationBox({ citations, slug }: { citations: Citations; slug: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState<string | null>(null);

  const copy = async (key: keyof Citations) => {
    try {
      await navigator.clipboard.writeText(citations[key]);
      setCopied(key);
      toast({ variant: 'success', title: 'Citation copied' });
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast({ variant: 'error', title: 'Copy failed', description: 'Select and copy manually.' });
    }
  };

  const downloadBibtex = () => {
    const blob = new Blob([citations.bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.bib`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Tabs defaultValue="apa" className="w-full">
      <TabsList className="flex-wrap">
        <TabsTrigger value="apa">APA</TabsTrigger>
        <TabsTrigger value="mla">MLA</TabsTrigger>
        <TabsTrigger value="chicago">Chicago</TabsTrigger>
        <TabsTrigger value="bibtex">BibTeX</TabsTrigger>
      </TabsList>
      {(['apa', 'mla', 'chicago', 'bibtex'] as const).map((key) => (
        <TabsContent key={key} value={key}>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/50 p-3 text-xs leading-relaxed">
            {citations[key]}
          </pre>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => copy(key)}>
              {copied === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy citation
            </Button>
            {key === 'bibtex' ? (
              <Button size="sm" variant="outline" onClick={downloadBibtex}>
                <Download className="h-4 w-4" /> Download .bib
              </Button>
            ) : null}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
