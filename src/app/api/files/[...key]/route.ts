import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fail } from '@/lib/api';
import { logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth/session';
import { getStorage } from '@/lib/storage';
import { track } from '@/lib/analytics';
import { hashIp, ipFromRequest } from '@/lib/audit';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  ctx: { params: Promise<{ key: string[] }> },
) {
  try {
    const { key: parts } = await ctx.params;
    const key = (Array.isArray(parts) ? parts : [parts]).map(decodeURIComponent).join('/');

    const asset = await prisma.fileAsset.findFirst({ where: { key } });
    if (!asset) return fail(404, 'File not found');

    if (!asset.isPublic) {
      const user = await getCurrentUser();
      if (!user) return fail(401, 'Authentication required to download this file');
    }

    const storage = getStorage();
    let object;
    try {
      object = await storage.get(key);
    } catch {
      return fail(404, 'File is no longer available');
    }

    void prisma.download
      .create({
        data: {
          fileId: asset.id,
          entityType: 'FileAsset',
          entityId: asset.id,
          fileType: asset.mimeType,
          ipHash: hashIp(ipFromRequest(req)),
        },
      })
      .catch(() => undefined);
    void track({ type: 'download', entityType: 'FileAsset', entityId: asset.id });

    return new NextResponse(new Uint8Array(object.body), {
      status: 200,
      headers: {
        'Content-Type': asset.mimeType || object.contentType,
        'Content-Length': String(object.size),
        'Content-Disposition': `inline; filename="${asset.originalName.replace(/"/g, '')}"`,
        'Cache-Control': asset.isPublic ? 'public, max-age=86400' : 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    const ref = Math.random().toString(36).slice(2, 10);
    logger.error('file serve error', {
      ref,
      message: err instanceof Error ? err.message : String(err),
    });
    return fail(500, `Internal server error (ref: ${ref})`);
  }
}
