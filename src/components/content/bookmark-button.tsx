'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

type BookmarkType = 'RESEARCH' | 'DATASET' | 'MEDIA' | 'NEWS' | 'EDUCATION' | 'EXPEDITION';

export function BookmarkButton({
  entityType,
  entityId,
  initialBookmarked = false,
  size = 'default',
}: {
  entityType: BookmarkType;
  entityId: string;
  initialBookmarked?: boolean;
  size?: 'default' | 'sm' | 'icon';
}) {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [bookmarked, setBookmarked] = React.useState(initialBookmarked);
  const [loading, setLoading] = React.useState(false);

  const toggle = async () => {
    if (status !== 'authenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setLoading(true);
    try {
      if (bookmarked) {
        const res = await fetch(
          `/api/bookmarks?entityType=${entityType}&entityId=${entityId}`,
          { method: 'DELETE' },
        );
        if (!res.ok) throw new Error();
        setBookmarked(false);
      } else {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entityType, entityId }),
        });
        if (!res.ok) throw new Error();
        setBookmarked(true);
        toast({ variant: 'success', title: 'Saved to your bookmarks' });
      }
    } catch {
      toast({ variant: 'error', title: 'Could not update bookmark' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={bookmarked ? 'secondary' : 'outline'}
      size={size}
      onClick={toggle}
      disabled={loading}
      aria-pressed={bookmarked}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {size !== 'icon' ? (bookmarked ? 'Saved' : 'Save') : null}
    </Button>
  );
}
