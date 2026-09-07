'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUploader, type UploadedFile } from '@/components/ui/file-uploader';
import { useToast } from '@/components/ui/use-toast';
import { researchCreateSchema } from '@/lib/validation';
import { DISCIPLINE_LABELS, POLE_LABELS, REPOSITORY_TYPE_LABELS } from '@/lib/constants';

export function ResearchSubmitForm({
  institutions,
}: {
  institutions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [form, setForm] = React.useState({
    title: '',
    abstract: '',
    description: '',
    type: 'RESEARCH_PAPER',
    discipline: 'CLIMATE',
    pole: 'ARCTIC',
    publicationDate: '',
    doi: '',
    externalUrl: '',
    institutionId: '',
    keywords: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      title: form.title,
      abstract: form.abstract,
      description: form.description || undefined,
      type: form.type,
      discipline: form.discipline,
      pole: form.pole,
      publicationDate: form.publicationDate || undefined,
      doi: form.doi || undefined,
      externalUrl: form.externalUrl || undefined,
      institutionId: form.institutionId || undefined,
      keywords: form.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      fileIds: files.map((f) => f.id),
    };

    const parsed = researchCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
      setErrors(fe);
      toast({ variant: 'error', title: 'Please fix the highlighted fields' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'RESEARCH',
          title: form.title,
          payload: parsed.data,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Submission failed');
      toast({
        variant: 'success',
        title: 'Submitted for review',
        description: 'An editor will review your submission. You can track its status below.',
      });
      router.refresh();
      setForm({
        title: '', abstract: '', description: '', type: 'RESEARCH_PAPER',
        discipline: 'CLIMATE', pole: 'ARCTIC', publicationDate: '', doi: '',
        externalUrl: '', institutionId: '', keywords: '',
      });
      setFiles([]);
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Could not submit',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const Err = ({ name }: { name: string }) =>
    errors[name] ? <p className="mt-1 text-xs text-destructive">{errors[name]}</p> : null;

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
        <Err name="title" />
      </div>

      <div>
        <Label htmlFor="abstract">Abstract *</Label>
        <Textarea
          id="abstract"
          rows={4}
          value={form.abstract}
          onChange={(e) => set('abstract', e.target.value)}
          required
        />
        <Err name="abstract" />
      </div>

      <div>
        <Label htmlFor="description">Extended description (Markdown supported)</Label>
        <Textarea
          id="description"
          rows={5}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => set('type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(REPOSITORY_TYPE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Discipline</Label>
          <Select value={form.discipline} onValueChange={(v) => set('discipline', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(DISCIPLINE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Polar region</Label>
          <Select value={form.pole} onValueChange={(v) => set('pole', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(POLE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pubdate">Publication date</Label>
          <Input
            id="pubdate"
            type="date"
            value={form.publicationDate}
            onChange={(e) => set('publicationDate', e.target.value)}
          />
        </div>
        <div>
          <Label>Institution</Label>
          <Select
            value={form.institutionId || '__none'}
            onValueChange={(v) => set('institutionId', v === '__none' ? '' : v)}
          >
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">None</SelectItem>
              {institutions.map((i) => (
                <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="doi">DOI</Label>
          <Input
            id="doi"
            placeholder="10.1234/abcd.5678"
            value={form.doi}
            onChange={(e) => set('doi', e.target.value)}
          />
          <Err name="doi" />
        </div>
        <div>
          <Label htmlFor="url">External URL</Label>
          <Input
            id="url"
            type="url"
            value={form.externalUrl}
            onChange={(e) => set('externalUrl', e.target.value)}
          />
          <Err name="externalUrl" />
        </div>
      </div>

      <div>
        <Label htmlFor="keywords">Keywords (comma-separated)</Label>
        <Input
          id="keywords"
          value={form.keywords}
          onChange={(e) => set('keywords', e.target.value)}
          placeholder="sea ice, albedo, Fram Strait"
        />
      </div>

      <div>
        <Label>Attachment (PDF or dataset)</Label>
        <FileUploader
          purpose="research-file"
          accept=".pdf,.csv,.json,.geojson"
          maxFiles={3}
          onChange={setFiles}
          hint="PDF up to 40 MB, or CSV / JSON / GeoJSON up to 40 MB."
        />
      </div>

      <Button type="submit" disabled={loading} size="lg">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Submit for review
      </Button>
      <p className="text-xs text-muted-foreground">
        Submissions are not published immediately. An editor reviews every submission before it
        appears in the public repository.
      </p>
    </form>
  );
}
