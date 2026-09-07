import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { uniqueSlug } from '@/lib/utils';
import { z } from 'zod';
import { researchCreateSchema } from '@/lib/validation';

export const researchDetailInclude = {
  institution: true,
  region: true,
  authors: {
    orderBy: { authorOrder: 'asc' },
    include: { researcher: { include: { institution: { select: { name: true, slug: true } } } } },
  },
  topics: { include: { topic: { select: { name: true, slug: true } } } },
  tags: { include: { tag: true } },
  files: {
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      key: true,
      isPublic: true,
    },
  },
  relatedDatasets: {
    include: { dataset: { select: { id: true, slug: true, title: true, pole: true } } },
  },
  relatedMedia: {
    include: { media: { select: { id: true, slug: true, title: true, type: true, thumbnailUrl: true } } },
  },
} satisfies Prisma.ResearchInclude;

type ResearchInput = z.infer<typeof researchCreateSchema>;

async function connectTags(tags: string[]) {
  const unique = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];
  return Promise.all(
    unique.map((label) => {
      const slug = uniqueSlug(label).replace(/-[a-z0-9]{5}$/, '');
      return prisma.tag.upsert({
        where: { slug },
        create: { slug, label },
        update: {},
        select: { id: true },
      });
    }),
  );
}

export async function createResearch(input: ResearchInput, userId: string) {
  const tagRecords = await connectTags(input.tags ?? []);
  const status = input.status ?? 'DRAFT';

  return prisma.research.create({
    data: {
      slug: uniqueSlug(input.title),
      title: input.title,
      abstract: input.abstract,
      description: input.description || null,
      type: input.type,
      discipline: input.discipline,
      pole: input.pole,
      language: input.language,
      license: input.license,
      status,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      approvedAt: status === 'PUBLISHED' || status === 'APPROVED' ? new Date() : null,
      publicationDate: input.publicationDate ?? null,
      doi: input.doi || null,
      isbn: input.isbn || null,
      externalUrl: input.externalUrl || null,
      citationText: input.citationText || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      keywords: input.keywords ?? [],
      institutionId: input.institutionId || null,
      regionId: input.regionId || null,
      createdById: userId,
      updatedById: userId,
      topics: input.topicIds?.length
        ? { create: input.topicIds.map((topicId) => ({ topicId })) }
        : undefined,
      tags: tagRecords.length
        ? { create: tagRecords.map((t) => ({ tagId: t.id })) }
        : undefined,
      authors: input.authors?.length
        ? {
            create: input.authors.map((a) => ({
              researcherId: a.researcherId,
              authorOrder: a.authorOrder,
              isCorresponding: a.isCorresponding,
            })),
          }
        : undefined,
      files: input.fileIds?.length
        ? { connect: input.fileIds.map((id) => ({ id })) }
        : undefined,
    },
    include: researchDetailInclude,
  });
}

export async function updateResearch(
  id: string,
  input: Partial<ResearchInput>,
  userId: string,
) {
  const existing = await prisma.research.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return null;

  const data: Prisma.ResearchUpdateInput = { updatedBy: { connect: { id: userId } } };
  if (input.title !== undefined) data.title = input.title;
  if (input.abstract !== undefined) data.abstract = input.abstract;
  if (input.description !== undefined) data.description = input.description || null;
  if (input.type !== undefined) data.type = input.type;
  if (input.discipline !== undefined) data.discipline = input.discipline;
  if (input.pole !== undefined) data.pole = input.pole;
  if (input.language !== undefined) data.language = input.language;
  if (input.license !== undefined) data.license = input.license;
  if (input.publicationDate !== undefined) data.publicationDate = input.publicationDate ?? null;
  if (input.doi !== undefined) data.doi = input.doi || null;
  if (input.isbn !== undefined) data.isbn = input.isbn || null;
  if (input.externalUrl !== undefined) data.externalUrl = input.externalUrl || null;
  if (input.citationText !== undefined) data.citationText = input.citationText || null;
  if (input.latitude !== undefined) data.latitude = input.latitude ?? null;
  if (input.longitude !== undefined) data.longitude = input.longitude ?? null;
  if (input.keywords !== undefined) data.keywords = input.keywords;
  if (input.institutionId !== undefined)
    data.institution = input.institutionId
      ? { connect: { id: input.institutionId } }
      : { disconnect: true };
  if (input.regionId !== undefined)
    data.region = input.regionId ? { connect: { id: input.regionId } } : { disconnect: true };

  if (input.status !== undefined) {
    data.status = input.status;
    if (input.status === 'PUBLISHED') {
      data.publishedAt = new Date();
      data.approvedAt = new Date();
    }
  }

  const research = await prisma.research.update({
    where: { id },
    data,
    include: researchDetailInclude,
  });

  if (input.topicIds) {
    await prisma.researchTopic.deleteMany({ where: { researchId: id } });
    if (input.topicIds.length) {
      await prisma.researchTopic.createMany({
        data: input.topicIds.map((topicId) => ({ researchId: id, topicId })),
        skipDuplicates: true,
      });
    }
  }
  if (input.tags) {
    const tagRecords = await connectTags(input.tags);
    await prisma.researchTag.deleteMany({ where: { researchId: id } });
    if (tagRecords.length) {
      await prisma.researchTag.createMany({
        data: tagRecords.map((t) => ({ researchId: id, tagId: t.id })),
        skipDuplicates: true,
      });
    }
  }
  if (input.authors) {
    await prisma.researchAuthor.deleteMany({ where: { researchId: id } });
    if (input.authors.length) {
      await prisma.researchAuthor.createMany({
        data: input.authors.map((a) => ({
          researchId: id,
          researcherId: a.researcherId,
          authorOrder: a.authorOrder,
          isCorresponding: a.isCorresponding,
        })),
        skipDuplicates: true,
      });
    }
  }

  return research;
}

export async function incrementResearchView(id: string) {
  await prisma.research
    .update({ where: { id }, data: { viewCount: { increment: 1 } } })
    .catch(() => undefined);
}

export async function getRelatedResearch(researchId: string, discipline: string, pole: string) {
  return prisma.research.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: researchId },
      OR: [{ discipline: discipline as never }, { pole: pole as never }],
    },
    take: 4,
    orderBy: { viewCount: 'desc' },
    include: {
      institution: { select: { name: true } },
      authors: {
        take: 3,
        orderBy: { authorOrder: 'asc' },
        include: { researcher: { select: { fullName: true } } },
      },
    },
  });
}
