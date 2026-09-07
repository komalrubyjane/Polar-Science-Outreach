'use client';

import * as React from 'react';
import { Upload, File as FileIcon, X, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadedFile {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

/**
 * Reusable secure file uploader. POSTs to /api/files (multipart) which performs
 * MIME + extension + size validation server-side. Client-side checks here are a
 * convenience only.
 */
export function FileUploader({
  purpose,
  accept,
  maxFiles = 5,
  onChange,
  hint,
}: {
  purpose: string;
  accept?: string;
  maxFiles?: number;
  onChange: (files: UploadedFile[]) => void;
  hint?: string;
}) {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const push = (next: UploadedFile[]) => {
    setFiles(next);
    onChange(next);
  };

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setError(null);
    setBusy(true);
    const added: UploadedFile[] = [];
    try {
      for (const file of Array.from(list)) {
        if (files.length + added.length >= maxFiles) break;
        const fd = new FormData();
        fd.append('file', file);
        fd.append('purpose', purpose);
        const res = await fetch('/api/files', { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message ?? `Upload failed for ${file.name}`);
        added.push(json.data as UploadedFile);
      }
      push([...files, ...added]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = (id: string) => push(files.filter((f) => f.id !== id));

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-6 text-center transition-colors',
          busy && 'opacity-70',
        )}
      >
        {busy ? (
          <Loader2 className="mb-2 h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">
          Drag &amp; drop, or{' '}
          <button
            type="button"
            className="text-accent underline"
            onClick={() => inputRef.current?.click()}
          >
            browse
          </button>
        </p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

      {files.length ? (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <FileIcon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 truncate">{f.originalName}</span>
              <span className="text-xs text-muted-foreground">
                {(f.sizeBytes / 1024).toFixed(0)} KB
              </span>
              <button
                type="button"
                onClick={() => remove(f.id)}
                aria-label={`Remove ${f.originalName}`}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
