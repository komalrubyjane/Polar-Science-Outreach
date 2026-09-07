import { z } from 'zod';
import {
  contentStatusEnum,
  disciplineEnum,
  educationTypeEnum,
  eventModeEnum,
  eventTypeEnum,
  latitude,
  licenseEnum,
  longitude,
  mediaTypeEnum,
  newsCategoryEnum,
  nonEmptyString,
  optionalUrl,
  poleEnum,
  repositoryTypeEnum,
  slugString,
  stringArray,
} from './common';

export * from './common';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  name: nonEmptyString.max(120),
  email: z.string().email().max(200),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(200)
    .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v), {
      message: 'Use upper, lower and a number',
    }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetSchema = z.object({
  token: z.string().min(10),
  password: registerSchema.shape.password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: registerSchema.shape.password,
});

export const profileUpdateSchema = z.object({
  name: nonEmptyString.max(120),
  bio: z.string().max(2000).optional().or(z.literal('')),
  organization: z.string().max(200).optional().or(z.literal('')),
});

// ---------------------------------------------------------------------------
// Research
// ---------------------------------------------------------------------------

export const researchAuthorInput = z.object({
  researcherId: z.string().min(1),
  authorOrder: z.number().int().min(0).default(0),
  isCorresponding: z.boolean().default(false),
});

export const researchCreateSchema = z.object({
  title: nonEmptyString.max(300),
  abstract: nonEmptyString.max(5000),
  description: z.string().max(50000).optional().or(z.literal('')),
  type: repositoryTypeEnum.default('RESEARCH_PAPER'),
  discipline: disciplineEnum,
  pole: poleEnum,
  language: z.string().min(2).max(10).default('en'),
  license: licenseEnum.default('CC_BY'),
  status: contentStatusEnum.optional(),
  publicationDate: z.coerce.date().optional(),
  doi: z
    .string()
    .regex(/^10\.\d{4,9}\/\S+$/, 'Invalid DOI')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  isbn: z.string().max(20).optional().or(z.literal('')),
  externalUrl: optionalUrl,
  citationText: z.string().max(2000).optional().or(z.literal('')),
  latitude: latitude.optional(),
  longitude: longitude.optional(),
  keywords: stringArray,
  institutionId: z.string().optional().or(z.literal('').transform(() => undefined)),
  regionId: z.string().optional().or(z.literal('').transform(() => undefined)),
  topicIds: z.array(z.string()).max(20).default([]),
  tags: stringArray,
  authors: z.array(researchAuthorInput).max(50).default([]),
  fileIds: z.array(z.string()).max(20).default([]),
});

export const researchUpdateSchema = researchCreateSchema.partial();

// ---------------------------------------------------------------------------
// Dataset
// ---------------------------------------------------------------------------

export const datasetSeriesPoint = z.object({
  t: z.string().min(1),
  value: z.number(),
});

export const datasetCreateSchema = z.object({
  title: nonEmptyString.max(300),
  description: nonEmptyString.max(20000),
  discipline: disciplineEnum,
  pole: poleEnum,
  unit: z.string().max(50).optional().or(z.literal('')),
  variable: z.string().max(100).optional().or(z.literal('')),
  temporalStart: z.coerce.date().optional(),
  temporalEnd: z.coerce.date().optional(),
  source: nonEmptyString.max(300),
  publisher: z.string().max(200).optional().or(z.literal('')),
  methodology: z.string().max(20000).optional().or(z.literal('')),
  license: licenseEnum.default('CC_BY'),
  doi: z.string().max(100).optional().or(z.literal('')),
  externalUrl: optionalUrl,
  status: contentStatusEnum.optional(),
  isDemo: z.boolean().default(true),
  institutionId: z.string().optional().or(z.literal('').transform(() => undefined)),
  version: z.string().max(30).default('v1'),
  series: z.array(datasetSeriesPoint).max(2000).optional(),
});

export const datasetUpdateSchema = datasetCreateSchema.partial();

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export const mediaCreateSchema = z.object({
  title: nonEmptyString.max(300),
  description: z.string().max(20000).optional().or(z.literal('')),
  type: mediaTypeEnum,
  status: contentStatusEnum.optional(),
  creator: z.string().max(200).optional().or(z.literal('')),
  copyright: z.string().max(300).optional().or(z.literal('')),
  license: licenseEnum.default('CC_BY'),
  attribution: z.string().max(300).optional().or(z.literal('')),
  capturedAt: z.coerce.date().optional(),
  locationName: z.string().max(200).optional().or(z.literal('')),
  latitude: latitude.optional(),
  longitude: longitude.optional(),
  fileId: z.string().optional().or(z.literal('').transform(() => undefined)),
  thumbnailUrl: optionalUrl,
  externalUrl: optionalUrl,
  transcript: z.string().max(100000).optional().or(z.literal('')),
  captionsUrl: optionalUrl,
  altText: z.string().max(500).optional().or(z.literal('')),
  durationSec: z.number().int().min(0).max(360000).optional(),
  regionId: z.string().optional().or(z.literal('').transform(() => undefined)),
  institutionId: z.string().optional().or(z.literal('').transform(() => undefined)),
  topicIds: z.array(z.string()).max(20).default([]),
  tags: stringArray,
}).superRefine((val, ctx) => {
  if (val.type === 'VIDEO' && !val.fileId && !val.externalUrl) {
    ctx.addIssue({ code: 'custom', path: ['externalUrl'], message: 'Video needs a file or an embed URL' });
  }
});

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const eventCreateSchema = z
  .object({
    title: nonEmptyString.max(300),
    description: nonEmptyString.max(20000),
    type: eventTypeEnum,
    mode: eventModeEnum.default('ONLINE'),
    status: contentStatusEnum.optional(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date().optional(),
    timezone: z.string().max(64).default('UTC'),
    locationName: z.string().max(200).optional().or(z.literal('')),
    latitude: latitude.optional(),
    longitude: longitude.optional(),
    organizer: z.string().max(200).optional().or(z.literal('')),
    registrationUrl: optionalUrl,
    registrationStatus: z
      .enum(['OPEN', 'WAITLIST', 'CLOSED', 'NOT_REQUIRED'])
      .default('OPEN'),
    capacity: z.number().int().min(1).max(1_000_000).optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
    imageUrl: optionalUrl,
  })
  .refine((v) => !v.endAt || v.endAt >= v.startAt, {
    path: ['endAt'],
    message: 'End must be after start',
  });

export const eventRegistrationSchema = z.object({
  name: nonEmptyString.max(120),
  email: z.string().email(),
  note: z.string().max(1000).optional().or(z.literal('')),
});

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

export const newsCreateSchema = z.object({
  title: nonEmptyString.max(300),
  subtitle: z.string().max(400).optional().or(z.literal('')),
  heroImageUrl: optionalUrl,
  body: nonEmptyString.max(200000),
  category: newsCategoryEnum,
  status: contentStatusEnum.optional(),
  publishedAt: z.coerce.date().optional(),
  references: stringArray,
  tags: stringArray,
});

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

export const educationCreateSchema = z.object({
  title: nonEmptyString.max(300),
  summary: nonEmptyString.max(2000),
  body: nonEmptyString.max(200000),
  type: educationTypeEnum,
  status: contentStatusEnum.optional(),
  ageGroup: z.string().max(60).optional().or(z.literal('')),
  durationMin: z.number().int().min(1).max(6000).optional(),
  objectives: stringArray,
  materials: stringArray,
  assessment: z.string().max(20000).optional().or(z.literal('')),
  plainLanguage: z.string().max(20000).optional().or(z.literal('')),
  heroImageUrl: optionalUrl,
  attachmentId: z.string().optional().or(z.literal('').transform(() => undefined)),
  topicId: z.string().optional().or(z.literal('').transform(() => undefined)),
});

// ---------------------------------------------------------------------------
// Expeditions
// ---------------------------------------------------------------------------

export const expeditionCreateSchema = z.object({
  name: nonEmptyString.max(300),
  expeditionNumber: z.string().max(50).optional().or(z.literal('')),
  summary: z.string().max(5000).optional().or(z.literal('')),
  objectives: z.string().max(20000).optional().or(z.literal('')),
  researchTopics: stringArray,
  vessel: z.string().max(200).optional().or(z.literal('')),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: contentStatusEnum.optional(),
  heroImageUrl: optionalUrl,
  regionId: z.string().optional().or(z.literal('').transform(() => undefined)),
  institutionId: z.string().optional().or(z.literal('').transform(() => undefined)),
});

export const expeditionUpdateSchema = z.object({
  expeditionId: z.string().min(1),
  dayNumber: z.number().int().min(0).max(3650).optional(),
  title: nonEmptyString.max(300),
  body: nonEmptyString.max(50000),
  postedAt: z.coerce.date().optional(),
  locationName: z.string().max(200).optional().or(z.literal('')),
  latitude: latitude.optional(),
  longitude: longitude.optional(),
  imageUrls: z.array(z.string().url()).max(20).default([]),
  videoUrl: optionalUrl,
});

// ---------------------------------------------------------------------------
// Taxonomy & directory
// ---------------------------------------------------------------------------

export const topicCreateSchema = z.object({
  name: nonEmptyString.max(200),
  slug: slugString.optional(),
  category: nonEmptyString.max(120),
  overview: z.string().max(20000).optional().or(z.literal('')),
  keyConcepts: stringArray,
  discipline: disciplineEnum.optional(),
  pole: poleEnum.optional(),
  heroImageUrl: optionalUrl,
  parentId: z.string().optional().or(z.literal('').transform(() => undefined)),
});

export const institutionCreateSchema = z.object({
  name: nonEmptyString.max(200),
  acronym: z.string().max(30).optional().or(z.literal('')),
  description: z.string().max(10000).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  website: optionalUrl,
  logoUrl: optionalUrl,
  researchAreas: z.array(disciplineEnum).max(11).default([]),
});

export const researcherCreateSchema = z.object({
  fullName: nonEmptyString.max(200),
  title: z.string().max(120).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  bio: z.string().max(10000).optional().or(z.literal('')),
  photoUrl: optionalUrl,
  researchAreas: z.array(disciplineEnum).max(11).default([]),
  primaryPole: poleEnum.optional(),
  orcid: z
    .string()
    .regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, 'Invalid ORCID')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  websiteUrl: optionalUrl,
  institutionId: z.string().optional().or(z.literal('').transform(() => undefined)),
});

export const glossaryCreateSchema = z.object({
  term: nonEmptyString.max(200),
  definition: nonEmptyString.max(5000),
  plainLanguage: z.string().max(2000).optional().or(z.literal('')),
  pronunciation: z.string().max(200).optional().or(z.literal('')),
  topicId: z.string().optional().or(z.literal('').transform(() => undefined)),
});

// ---------------------------------------------------------------------------
// Newsletter & bookmarks
// ---------------------------------------------------------------------------

export const newsletterSubscribeSchema = z.object({
  email: z.string().email().max(200),
  source: z.string().max(60).optional(),
});

export const bookmarkSchema = z.object({
  entityType: z.enum(['RESEARCH', 'DATASET', 'MEDIA', 'NEWS', 'EDUCATION', 'EXPEDITION']),
  entityId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

export const quizAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        optionId: z.string().min(1),
      }),
    )
    .min(1)
    .max(100),
});

// ---------------------------------------------------------------------------
// Admin: user management
// ---------------------------------------------------------------------------

export const userRoleUpdateSchema = z.object({
  role: z.enum(['USER', 'RESEARCHER', 'EDITOR', 'ADMIN']),
});

export const adminUserCreateSchema = z.object({
  name: nonEmptyString.max(120),
  email: z.string().email(),
  role: z.enum(['USER', 'RESEARCHER', 'EDITOR', 'ADMIN']).default('USER'),
  password: registerSchema.shape.password,
});

// ---------------------------------------------------------------------------
// Review / workflow
// ---------------------------------------------------------------------------

export const reviewDecisionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'CHANGES_REQUESTED']),
  comment: z.string().max(5000).optional().or(z.literal('')),
});
