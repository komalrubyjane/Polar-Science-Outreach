import {
  mediaCreateSchema,
  eventCreateSchema,
  newsCreateSchema,
  educationCreateSchema,
  expeditionCreateSchema,
  topicCreateSchema,
  glossaryCreateSchema,
  researcherCreateSchema,
  institutionCreateSchema,
} from '@/lib/validation';

const strip = <T extends Record<string, unknown>>(o: T): Partial<T> => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) out[k] = v === '' ? null : v;
  return out as Partial<T>;
};

export const mediaEntity = {
  model: 'media' as const,
  entityName: 'Media',
  createSchema: mediaCreateSchema,
  updateSchema: mediaCreateSchema,
  managePermission: 'media:manage' as const,
  searchFields: ['title', 'description', 'creator', 'locationName'],
  filters: ['type', 'status', 'regionId'],
  publishGate: true,
  listInclude: { region: { select: { name: true } } },
  detailInclude: {
    region: true,
    institution: { select: { name: true, slug: true } },
    topics: { include: { topic: { select: { name: true, slug: true } } } },
    tags: { include: { tag: true } },
  },
  toCreateData: (i: Record<string, unknown>, userId: string) => {
    const { topicIds, tags, ...rest } = i as never as {
      topicIds?: string[];
      tags?: string[];
    } & Record<string, unknown>;
    return {
      ...strip(rest),
      status: (i.status as string) ?? 'DRAFT',
      createdById: userId,
      ...(topicIds?.length ? { topics: { create: topicIds.map((topicId) => ({ topicId })) } } : {}),
    };
  },
  toUpdateData: (i: Record<string, unknown>) => {
    const { topicIds, tags, ...rest } = i as { topicIds?: string[]; tags?: string[] } & Record<
      string,
      unknown
    >;
    return strip(rest);
  },
};

export const eventEntity = {
  model: 'event' as const,
  entityName: 'Event',
  createSchema: eventCreateSchema,
  updateSchema: eventCreateSchema,
  managePermission: 'event:manage' as const,
  searchFields: ['title', 'description', 'organizer', 'locationName'],
  filters: ['type', 'status', 'mode'],
  publishGate: true,
  toCreateData: (i: Record<string, unknown>, userId: string) => ({
    ...strip(i),
    status: (i.status as string) ?? 'DRAFT',
    createdById: userId,
  }),
  toUpdateData: (i: Record<string, unknown>) => strip(i),
};

export const newsEntity = {
  model: 'newsArticle' as const,
  entityName: 'NewsArticle',
  createSchema: newsCreateSchema,
  updateSchema: newsCreateSchema,
  managePermission: 'news:manage' as const,
  searchFields: ['title', 'subtitle', 'body'],
  filters: ['category', 'status'],
  publishGate: true,
  detailInclude: { author: { select: { name: true } }, tags: { include: { tag: true } } },
  toCreateData: (i: Record<string, unknown>, userId: string) => {
    const { tags, ...rest } = i as { tags?: string[] } & Record<string, unknown>;
    const status = (i.status as string) ?? 'DRAFT';
    return {
      ...strip(rest),
      status,
      authorId: userId,
      publishedAt: status === 'PUBLISHED' ? (i.publishedAt ?? new Date()) : (i.publishedAt ?? null),
    };
  },
  toUpdateData: (i: Record<string, unknown>) => {
    const { tags, ...rest } = i as { tags?: string[] } & Record<string, unknown>;
    const data = strip(rest);
    if (data.status === 'PUBLISHED' && !data.publishedAt) data.publishedAt = new Date();
    return data;
  },
};

export const educationEntity = {
  model: 'educationResource' as const,
  entityName: 'EducationResource',
  createSchema: educationCreateSchema,
  updateSchema: educationCreateSchema,
  managePermission: 'education:manage' as const,
  searchFields: ['title', 'summary', 'body'],
  filters: ['type', 'status', 'topicId'],
  publishGate: true,
  detailInclude: { topic: { select: { name: true, slug: true } }, quiz: { include: { questions: { include: { options: true } } } } },
  toCreateData: (i: Record<string, unknown>, userId: string) => ({
    ...strip(i),
    status: (i.status as string) ?? 'DRAFT',
    createdById: userId,
  }),
  toUpdateData: (i: Record<string, unknown>) => strip(i),
};

export const expeditionEntity = {
  model: 'expedition' as const,
  entityName: 'Expedition',
  createSchema: expeditionCreateSchema,
  updateSchema: expeditionCreateSchema,
  managePermission: 'expedition:manage' as const,
  titleField: 'name',
  searchFields: ['name', 'summary', 'objectives', 'vessel'],
  filters: ['status', 'regionId'],
  publishGate: true,
  detailInclude: {
    region: true,
    institution: { select: { name: true, slug: true } },
    members: { include: { researcher: { select: { fullName: true, slug: true } } } },
    updates: { orderBy: { postedAt: 'asc' } },
  },
  toCreateData: (i: Record<string, unknown>, _userId: string) => ({
    ...strip(i),
    status: (i.status as string) ?? 'DRAFT',
  }),
  toUpdateData: (i: Record<string, unknown>) => strip(i),
};

export const topicEntity = {
  model: 'topic' as const,
  entityName: 'Topic',
  createSchema: topicCreateSchema,
  updateSchema: topicCreateSchema,
  managePermission: 'taxonomy:manage' as const,
  searchFields: ['name', 'overview', 'category'],
  filters: ['category', 'discipline', 'pole', 'parentId'],
  publishGate: false,
  detailInclude: { parent: { select: { name: true, slug: true } }, children: { select: { name: true, slug: true } } },
  toCreateData: (i: Record<string, unknown>) => strip(i),
  toUpdateData: (i: Record<string, unknown>) => strip(i),
};

export const glossaryEntity = {
  model: 'glossaryTerm' as const,
  entityName: 'GlossaryTerm',
  createSchema: glossaryCreateSchema,
  updateSchema: glossaryCreateSchema,
  managePermission: 'taxonomy:manage' as const,
  titleField: 'term',
  searchFields: ['term', 'definition'],
  publishGate: false,
  detailInclude: { topic: { select: { name: true, slug: true } } },
  toCreateData: (i: Record<string, unknown>) => strip(i),
  toUpdateData: (i: Record<string, unknown>) => strip(i),
};

export const researcherEntity = {
  model: 'researcher' as const,
  entityName: 'Researcher',
  createSchema: researcherCreateSchema,
  updateSchema: researcherCreateSchema,
  managePermission: 'directory:manage' as const,
  titleField: 'fullName',
  searchFields: ['fullName', 'bio', 'title'],
  filters: ['institutionId', 'primaryPole'],
  publishGate: false,
  detailInclude: {
    institution: { select: { name: true, slug: true } },
    authorships: { include: { research: { select: { id: true, slug: true, title: true, publishedAt: true, status: true } } } },
    expeditions: { include: { expedition: { select: { id: true, slug: true, name: true } } } },
  },
  toCreateData: (i: Record<string, unknown>) => strip(i),
  toUpdateData: (i: Record<string, unknown>) => strip(i),
};

export const institutionEntity = {
  model: 'institution' as const,
  entityName: 'Institution',
  createSchema: institutionCreateSchema,
  updateSchema: institutionCreateSchema,
  managePermission: 'directory:manage' as const,
  searchFields: ['name', 'description', 'country'],
  filters: ['country'],
  publishGate: false,
  detailInclude: {
    researchers: { select: { id: true, slug: true, fullName: true, title: true } },
    research: { where: { status: 'PUBLISHED' }, select: { id: true, slug: true, title: true }, take: 20 },
    expeditions: { select: { id: true, slug: true, name: true }, take: 20 },
  },
  toCreateData: (i: Record<string, unknown>) => strip(i),
  toUpdateData: (i: Record<string, unknown>) => strip(i),
};
