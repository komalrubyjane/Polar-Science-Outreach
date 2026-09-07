import { prisma } from '@/lib/db';
import { handle, created, badRequest, enforceRateLimit } from '@/lib/api';
import { requirePermission } from '@/lib/auth/session';
import {
  getStorage,
  validateUpload,
  buildStorageKey,
  sha256,
  scanForViruses,
  MAX_UPLOAD_BYTES,
  type UploadCategory,
} from '@/lib/storage';
import { recordAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const CATEGORY_FROM_PURPOSE: Record<string, UploadCategory[]> = {
  'research-file': ['document', 'data'],
  'dataset-file': ['data'],
  'media-image': ['image'],
  'media-video': ['video'],
  'media-audio': ['audio'],
  'education-attachment': ['document'],
  'expedition-photo': ['image'],
  generic: ['image', 'document', 'data'],
};

export const POST = handle(async (req) => {
  const user = await requirePermission('content:submit');
  enforceRateLimit(req, `upload:${user.id}`, { max: 40 });

  const form = await req.formData().catch(() => null);
  if (!form) badRequest('Expected multipart/form-data');

  const file = form!.get('file');
  const purpose = String(form!.get('purpose') ?? 'generic');
  const makePublic = String(form!.get('public') ?? 'false') === 'true';

  if (!(file instanceof File)) badRequest('Missing "file" field');
  const f = file as File;

  if (f.size > MAX_UPLOAD_BYTES) badRequest('File too large');

  const allow = CATEGORY_FROM_PURPOSE[purpose] ?? CATEGORY_FROM_PURPOSE.generic;
  const validated = validateUpload({
    originalName: f.name,
    mimeType: f.type,
    sizeBytes: f.size,
    allow,
  });

  const buffer = Buffer.from(await f.arrayBuffer());
  const scan = await scanForViruses(buffer);
  if (scan === 'infected') badRequest('File failed the malware scan');

  const key = buildStorageKey(`${validated.category}/${purpose}`, validated.safeName);
  // Media images may be served directly; everything else stays private.
  const isPublic = makePublic && validated.category === 'image';

  const storage = getStorage();
  await storage.put({ key, body: buffer, contentType: f.type, isPublic });

  const asset = await prisma.fileAsset.create({
    data: {
      provider: storage.name,
      key,
      originalName: validated.safeName,
      mimeType: f.type,
      sizeBytes: f.size,
      checksum: sha256(buffer),
      isPublic,
      scanStatus: scan,
      uploadedById: user.id,
    },
  });

  await recordAudit({
    actorId: user.id,
    action: 'file.upload',
    entityType: 'FileAsset',
    entityId: asset.id,
    metadata: { purpose, category: validated.category, sizeBytes: f.size },
    req,
  });
  logger.info('file uploaded', { assetId: asset.id, category: validated.category });

  return created({
    id: asset.id,
    url: storage.publicUrl(key, isPublic),
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
  });
});
