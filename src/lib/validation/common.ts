import { z } from 'zod';

export const cuid = z.string().min(1);

export const slugString = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a lowercase kebab-case slug');

export const poleEnum = z.enum(['ARCTIC', 'ANTARCTIC', 'BIPOLAR']);

export const disciplineEnum = z.enum([
  'CLIMATE',
  'GLACIOLOGY',
  'MARINE_SCIENCE',
  'BIODIVERSITY',
  'ATMOSPHERIC_SCIENCE',
  'GEOLOGY',
  'OCEANOGRAPHY',
  'HUMAN_INDIGENOUS',
  'POLAR_TECHNOLOGY',
  'PALEOCLIMATE',
  'ECOLOGY',
]);

export const contentStatusEnum = z.enum([
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED',
  'REJECTED',
]);

export const repositoryTypeEnum = z.enum([
  'RESEARCH_PAPER',
  'REPORT',
  'TECHNICAL_DOCUMENT',
  'DATASET',
  'RESEARCH_SUMMARY',
  'POLICY_DOCUMENT',
  'CONFERENCE_PAPER',
  'THESIS',
  'EDUCATIONAL_DOCUMENT',
  'FIELD_REPORT',
]);

export const mediaTypeEnum = z.enum([
  'PHOTO',
  'VIDEO',
  'AUDIO',
  'DOCUMENT',
  'INFOGRAPHIC',
  'INTERACTIVE',
]);

export const eventTypeEnum = z.enum([
  'CONFERENCE',
  'WEBINAR',
  'WORKSHOP',
  'SCHOOL_PROGRAM',
  'EXHIBITION',
  'PUBLIC_LECTURE',
  'EXPEDITION',
]);

export const eventModeEnum = z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']);

export const newsCategoryEnum = z.enum([
  'RESEARCH',
  'CLIMATE',
  'EXPEDITIONS',
  'POLICY',
  'EDUCATION',
  'TECHNOLOGY',
  'BIODIVERSITY',
]);

export const educationTypeEnum = z.enum([
  'EXPLAINER',
  'LESSON_PLAN',
  'INTERACTIVE_ACTIVITY',
  'QUIZ',
  'STUDENT_RESOURCE',
  'TEACHER_RESOURCE',
]);

export const licenseEnum = z.enum([
  'CC_BY',
  'CC_BY_SA',
  'CC_BY_NC',
  'CC_BY_NC_SA',
  'CC0',
  'PUBLIC_DOMAIN',
  'ALL_RIGHTS_RESERVED',
  'OTHER',
]);

export const bookmarkTypeEnum = z.enum([
  'RESEARCH',
  'DATASET',
  'MEDIA',
  'NEWS',
  'EDUCATION',
  'EXPEDITION',
]);

export const latitude = z.number().min(-90).max(90);
export const longitude = z.number().min(-180).max(180);

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.enum(['relevance', 'newest', 'oldest', 'most_viewed']).default('newest'),
});

export const nonEmptyString = z.string().trim().min(1);
export const optionalUrl = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal('').transform(() => undefined));

export const stringArray = z.array(z.string().trim().min(1)).max(50).default([]);
