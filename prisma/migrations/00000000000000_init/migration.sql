-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'RESEARCHER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Pole" AS ENUM ('ARCTIC', 'ANTARCTIC', 'BIPOLAR');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Discipline" AS ENUM ('CLIMATE', 'GLACIOLOGY', 'MARINE_SCIENCE', 'BIODIVERSITY', 'ATMOSPHERIC_SCIENCE', 'GEOLOGY', 'OCEANOGRAPHY', 'HUMAN_INDIGENOUS', 'POLAR_TECHNOLOGY', 'PALEOCLIMATE', 'ECOLOGY');

-- CreateEnum
CREATE TYPE "RepositoryType" AS ENUM ('RESEARCH_PAPER', 'REPORT', 'TECHNICAL_DOCUMENT', 'DATASET', 'RESEARCH_SUMMARY', 'POLICY_DOCUMENT', 'CONFERENCE_PAPER', 'THESIS', 'EDUCATIONAL_DOCUMENT', 'FIELD_REPORT');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO', 'AUDIO', 'DOCUMENT', 'INFOGRAPHIC', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CONFERENCE', 'WEBINAR', 'WORKSHOP', 'SCHOOL_PROGRAM', 'EXHIBITION', 'PUBLIC_LECTURE', 'EXPEDITION');

-- CreateEnum
CREATE TYPE "EventMode" AS ENUM ('ONLINE', 'IN_PERSON', 'HYBRID');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('OPEN', 'WAITLIST', 'CLOSED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('RESEARCH', 'CLIMATE', 'EXPEDITIONS', 'POLICY', 'EDUCATION', 'TECHNOLOGY', 'BIODIVERSITY');

-- CreateEnum
CREATE TYPE "EducationType" AS ENUM ('EXPLAINER', 'LESSON_PLAN', 'INTERACTIVE_ACTIVITY', 'QUIZ', 'STUDENT_RESOURCE', 'TEACHER_RESOURCE');

-- CreateEnum
CREATE TYPE "BookmarkType" AS ENUM ('RESEARCH', 'DATASET', 'MEDIA', 'NEWS', 'EDUCATION', 'EXPEDITION');

-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('RESEARCH', 'DATASET', 'MEDIA', 'EXPEDITION_UPDATE', 'NEWS');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SUBMISSION_APPROVED', 'SUBMISSION_REJECTED', 'EVENT_REMINDER', 'RESEARCH_PUBLISHED', 'EXPEDITION_UPDATE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('CC_BY', 'CC_BY_SA', 'CC_BY_NC', 'CC_BY_NC_SA', 'CC0', 'PUBLIC_DOMAIN', 'ALL_RIGHTS_RESERVED', 'OTHER');

-- CreateEnum
CREATE TYPE "StationStatus" AS ENUM ('ACTIVE', 'SEASONAL', 'INACTIVE', 'HISTORIC');

-- CreateEnum
CREATE TYPE "LocationKind" AS ENUM ('RESEARCH_STATION', 'EXPEDITION_WAYPOINT', 'OBSERVATION_SITE', 'RESEARCH_PROJECT', 'PROTECTED_AREA', 'GEOGRAPHIC_FEATURE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "bio" TEXT,
    "organization" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "description" TEXT,
    "country" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "researchAreas" "Discipline"[],
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Researcher" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "researchAreas" "Discipline"[],
    "primaryPole" "Pole",
    "orcid" TEXT,
    "websiteUrl" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "institutionId" TEXT,

    CONSTRAINT "Researcher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "overview" TEXT,
    "keyConcepts" TEXT[],
    "discipline" "Discipline",
    "pole" "Pole",
    "heroImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pole" "Pole" NOT NULL,
    "summary" TEXT,
    "bbox" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "LocationKind" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "regionId" TEXT,
    "stationId" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchStation" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "pole" "Pole" NOT NULL,
    "status" "StationStatus" NOT NULL DEFAULT 'ACTIVE',
    "establishedYear" INTEGER,
    "elevationM" INTEGER,
    "summerCapacity" INTEGER,
    "winterCapacity" INTEGER,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "regionId" TEXT,
    "operatorId" TEXT,

    CONSTRAINT "ResearchStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Research" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "description" TEXT,
    "type" "RepositoryType" NOT NULL DEFAULT 'RESEARCH_PAPER',
    "discipline" "Discipline" NOT NULL,
    "pole" "Pole" NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "license" "LicenseType" NOT NULL DEFAULT 'CC_BY',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publicationDate" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "doi" TEXT,
    "isbn" TEXT,
    "externalUrl" TEXT,
    "citationText" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "keywords" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionId" TEXT,
    "regionId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchAuthor" (
    "id" TEXT NOT NULL,
    "researchId" TEXT NOT NULL,
    "researcherId" TEXT NOT NULL,
    "authorOrder" INTEGER NOT NULL DEFAULT 0,
    "isCorresponding" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ResearchAuthor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchTopic" (
    "researchId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "ResearchTopic_pkey" PRIMARY KEY ("researchId","topicId")
);

-- CreateTable
CREATE TABLE "ResearchTag" (
    "researchId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ResearchTag_pkey" PRIMARY KEY ("researchId","tagId")
);

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "pole" "Pole" NOT NULL,
    "unit" TEXT,
    "variable" TEXT,
    "temporalStart" TIMESTAMP(3),
    "temporalEnd" TIMESTAMP(3),
    "source" TEXT NOT NULL,
    "publisher" TEXT,
    "methodology" TEXT,
    "license" "LicenseType" NOT NULL DEFAULT 'CC_BY',
    "doi" TEXT,
    "externalUrl" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatasetVersion" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "notes" TEXT,
    "rowCount" INTEGER,
    "series" JSONB,
    "fileId" TEXT,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatasetVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatasetResearch" (
    "datasetId" TEXT NOT NULL,
    "researchId" TEXT NOT NULL,

    CONSTRAINT "DatasetResearch_pkey" PRIMARY KEY ("datasetId","researchId")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "MediaType" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "creator" TEXT,
    "copyright" TEXT,
    "license" "LicenseType" NOT NULL DEFAULT 'CC_BY',
    "attribution" TEXT,
    "capturedAt" TIMESTAMP(3),
    "locationName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "fileId" TEXT,
    "thumbnailUrl" TEXT,
    "externalUrl" TEXT,
    "transcript" TEXT,
    "captionsUrl" TEXT,
    "altText" TEXT,
    "durationSec" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "regionId" TEXT,
    "institutionId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaCollection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaCollectionItem" (
    "collectionId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MediaCollectionItem_pkey" PRIMARY KEY ("collectionId","mediaId")
);

-- CreateTable
CREATE TABLE "MediaTopic" (
    "mediaId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "MediaTopic_pkey" PRIMARY KEY ("mediaId","topicId")
);

-- CreateTable
CREATE TABLE "MediaTag" (
    "mediaId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "MediaTag_pkey" PRIMARY KEY ("mediaId","tagId")
);

-- CreateTable
CREATE TABLE "MediaResearch" (
    "mediaId" TEXT NOT NULL,
    "researchId" TEXT NOT NULL,

    CONSTRAINT "MediaResearch_pkey" PRIMARY KEY ("mediaId","researchId")
);

-- CreateTable
CREATE TABLE "Expedition" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expeditionNumber" TEXT,
    "summary" TEXT,
    "objectives" TEXT,
    "researchTopics" TEXT[],
    "vessel" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "heroImageUrl" TEXT,
    "routeGeoJson" JSONB,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "regionId" TEXT,
    "institutionId" TEXT,

    CONSTRAINT "Expedition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpeditionMember" (
    "id" TEXT NOT NULL,
    "expeditionId" TEXT NOT NULL,
    "researcherId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Scientist',

    CONSTRAINT "ExpeditionMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpeditionUpdate" (
    "id" TEXT NOT NULL,
    "expeditionId" TEXT NOT NULL,
    "dayNumber" INTEGER,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "imageUrls" TEXT[],
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "ExpeditionUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "mode" "EventMode" NOT NULL DEFAULT 'ONLINE',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locationName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "organizer" TEXT,
    "registrationUrl" TEXT,
    "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'OPEN',
    "capacity" INTEGER,
    "contactEmail" TEXT,
    "imageUrl" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "heroImageUrl" TEXT,
    "body" TEXT NOT NULL,
    "category" "NewsCategory" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "references" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsTag" (
    "articleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "NewsTag_pkey" PRIMARY KEY ("articleId","tagId")
);

-- CreateTable
CREATE TABLE "EducationResource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "EducationType" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "ageGroup" TEXT,
    "durationMin" INTEGER,
    "objectives" TEXT[],
    "materials" TEXT[],
    "assessment" TEXT,
    "plainLanguage" TEXT,
    "heroImageUrl" TEXT,
    "attachmentId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "topicId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "EducationResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resourceId" TEXT,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "explanation" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossaryTerm" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "plainLanguage" TEXT,
    "pronunciation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "topicId" TEXT,

    CONSTRAINT "GlossaryTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" "BookmarkType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fileType" TEXT,
    "fileId" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "token" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "kind" "SubmissionKind" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'SUBMITTED',
    "title" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "entityId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "decision" "ReviewDecision" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "key" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "scanStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT,
    "researchId" TEXT,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "linkUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT,
    "query" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "sessionId" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_slug_key" ON "Institution"("slug");

-- CreateIndex
CREATE INDEX "Institution_country_idx" ON "Institution"("country");

-- CreateIndex
CREATE UNIQUE INDEX "Researcher_slug_key" ON "Researcher"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Researcher_userId_key" ON "Researcher"("userId");

-- CreateIndex
CREATE INDEX "Researcher_institutionId_idx" ON "Researcher"("institutionId");

-- CreateIndex
CREATE INDEX "Researcher_primaryPole_idx" ON "Researcher"("primaryPole");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_category_idx" ON "Topic"("category");

-- CreateIndex
CREATE INDEX "Topic_parentId_idx" ON "Topic"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE INDEX "Region_pole_idx" ON "Region"("pole");

-- CreateIndex
CREATE UNIQUE INDEX "Location_stationId_key" ON "Location"("stationId");

-- CreateIndex
CREATE INDEX "Location_kind_idx" ON "Location"("kind");

-- CreateIndex
CREATE INDEX "Location_regionId_idx" ON "Location"("regionId");

-- CreateIndex
CREATE INDEX "Location_latitude_longitude_idx" ON "Location"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchStation_slug_key" ON "ResearchStation"("slug");

-- CreateIndex
CREATE INDEX "ResearchStation_pole_idx" ON "ResearchStation"("pole");

-- CreateIndex
CREATE INDEX "ResearchStation_status_idx" ON "ResearchStation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Research_slug_key" ON "Research"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Research_doi_key" ON "Research"("doi");

-- CreateIndex
CREATE INDEX "Research_status_idx" ON "Research"("status");

-- CreateIndex
CREATE INDEX "Research_discipline_idx" ON "Research"("discipline");

-- CreateIndex
CREATE INDEX "Research_pole_idx" ON "Research"("pole");

-- CreateIndex
CREATE INDEX "Research_publicationDate_idx" ON "Research"("publicationDate");

-- CreateIndex
CREATE INDEX "Research_institutionId_idx" ON "Research"("institutionId");

-- CreateIndex
CREATE INDEX "Research_viewCount_idx" ON "Research"("viewCount");

-- CreateIndex
CREATE INDEX "ResearchAuthor_researcherId_idx" ON "ResearchAuthor"("researcherId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchAuthor_researchId_researcherId_key" ON "ResearchAuthor"("researchId", "researcherId");

-- CreateIndex
CREATE INDEX "ResearchTopic_topicId_idx" ON "ResearchTopic"("topicId");

-- CreateIndex
CREATE INDEX "ResearchTag_tagId_idx" ON "ResearchTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_slug_key" ON "Dataset"("slug");

-- CreateIndex
CREATE INDEX "Dataset_status_idx" ON "Dataset"("status");

-- CreateIndex
CREATE INDEX "Dataset_discipline_idx" ON "Dataset"("discipline");

-- CreateIndex
CREATE INDEX "Dataset_pole_idx" ON "Dataset"("pole");

-- CreateIndex
CREATE UNIQUE INDEX "DatasetVersion_fileId_key" ON "DatasetVersion"("fileId");

-- CreateIndex
CREATE INDEX "DatasetVersion_datasetId_idx" ON "DatasetVersion"("datasetId");

-- CreateIndex
CREATE UNIQUE INDEX "DatasetVersion_datasetId_version_key" ON "DatasetVersion"("datasetId", "version");

-- CreateIndex
CREATE INDEX "DatasetResearch_researchId_idx" ON "DatasetResearch"("researchId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_slug_key" ON "Media"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Media_fileId_key" ON "Media"("fileId");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "Media_status_idx" ON "Media"("status");

-- CreateIndex
CREATE INDEX "Media_regionId_idx" ON "Media"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaCollection_slug_key" ON "MediaCollection"("slug");

-- CreateIndex
CREATE INDEX "MediaCollectionItem_mediaId_idx" ON "MediaCollectionItem"("mediaId");

-- CreateIndex
CREATE INDEX "MediaTopic_topicId_idx" ON "MediaTopic"("topicId");

-- CreateIndex
CREATE INDEX "MediaTag_tagId_idx" ON "MediaTag"("tagId");

-- CreateIndex
CREATE INDEX "MediaResearch_researchId_idx" ON "MediaResearch"("researchId");

-- CreateIndex
CREATE UNIQUE INDEX "Expedition_slug_key" ON "Expedition"("slug");

-- CreateIndex
CREATE INDEX "Expedition_status_idx" ON "Expedition"("status");

-- CreateIndex
CREATE INDEX "Expedition_startDate_idx" ON "Expedition"("startDate");

-- CreateIndex
CREATE INDEX "ExpeditionMember_researcherId_idx" ON "ExpeditionMember"("researcherId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpeditionMember_expeditionId_researcherId_key" ON "ExpeditionMember"("expeditionId", "researcherId");

-- CreateIndex
CREATE INDEX "ExpeditionUpdate_expeditionId_idx" ON "ExpeditionUpdate"("expeditionId");

-- CreateIndex
CREATE INDEX "ExpeditionUpdate_postedAt_idx" ON "ExpeditionUpdate"("postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_startAt_idx" ON "Event"("startAt");

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "Event"("type");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_eventId_userId_key" ON "EventRegistration"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_slug_key" ON "NewsArticle"("slug");

-- CreateIndex
CREATE INDEX "NewsArticle_status_idx" ON "NewsArticle"("status");

-- CreateIndex
CREATE INDEX "NewsArticle_category_idx" ON "NewsArticle"("category");

-- CreateIndex
CREATE INDEX "NewsArticle_publishedAt_idx" ON "NewsArticle"("publishedAt");

-- CreateIndex
CREATE INDEX "NewsTag_tagId_idx" ON "NewsTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationResource_slug_key" ON "EducationResource"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EducationResource_attachmentId_key" ON "EducationResource"("attachmentId");

-- CreateIndex
CREATE INDEX "EducationResource_type_idx" ON "EducationResource"("type");

-- CreateIndex
CREATE INDEX "EducationResource_status_idx" ON "EducationResource"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_slug_key" ON "Quiz"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_resourceId_key" ON "Quiz"("resourceId");

-- CreateIndex
CREATE INDEX "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");

-- CreateIndex
CREATE INDEX "QuizOption_questionId_idx" ON "QuizOption"("questionId");

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GlossaryTerm_slug_key" ON "GlossaryTerm"("slug");

-- CreateIndex
CREATE INDEX "GlossaryTerm_term_idx" ON "GlossaryTerm"("term");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_entityType_entityId_idx" ON "Bookmark"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_entityType_entityId_key" ON "Bookmark"("userId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Download_entityType_entityId_idx" ON "Download"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Download_createdAt_idx" ON "Download"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_token_key" ON "NewsletterSubscriber"("token");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_confirmedAt_idx" ON "NewsletterSubscriber"("confirmedAt");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_kind_idx" ON "Submission"("kind");

-- CreateIndex
CREATE INDEX "Submission_authorId_idx" ON "Submission"("authorId");

-- CreateIndex
CREATE INDEX "Review_submissionId_idx" ON "Review"("submissionId");

-- CreateIndex
CREATE INDEX "FileAsset_provider_key_idx" ON "FileAsset"("provider", "key");

-- CreateIndex
CREATE INDEX "FileAsset_researchId_idx" ON "FileAsset"("researchId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_entityType_entityId_idx" ON "AnalyticsEvent"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Researcher" ADD CONSTRAINT "Researcher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Researcher" ADD CONSTRAINT "Researcher_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "ResearchStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchStation" ADD CONSTRAINT "ResearchStation_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchStation" ADD CONSTRAINT "ResearchStation_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchAuthor" ADD CONSTRAINT "ResearchAuthor_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchAuthor" ADD CONSTRAINT "ResearchAuthor_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "Researcher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTopic" ADD CONSTRAINT "ResearchTopic_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTopic" ADD CONSTRAINT "ResearchTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTag" ADD CONSTRAINT "ResearchTag_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTag" ADD CONSTRAINT "ResearchTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetVersion" ADD CONSTRAINT "DatasetVersion_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetVersion" ADD CONSTRAINT "DatasetVersion_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetResearch" ADD CONSTRAINT "DatasetResearch_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetResearch" ADD CONSTRAINT "DatasetResearch_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaCollectionItem" ADD CONSTRAINT "MediaCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "MediaCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaCollectionItem" ADD CONSTRAINT "MediaCollectionItem_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTopic" ADD CONSTRAINT "MediaTopic_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTopic" ADD CONSTRAINT "MediaTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTag" ADD CONSTRAINT "MediaTag_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTag" ADD CONSTRAINT "MediaTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaResearch" ADD CONSTRAINT "MediaResearch_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaResearch" ADD CONSTRAINT "MediaResearch_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedition" ADD CONSTRAINT "Expedition_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedition" ADD CONSTRAINT "Expedition_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpeditionMember" ADD CONSTRAINT "ExpeditionMember_expeditionId_fkey" FOREIGN KEY ("expeditionId") REFERENCES "Expedition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpeditionMember" ADD CONSTRAINT "ExpeditionMember_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "Researcher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpeditionUpdate" ADD CONSTRAINT "ExpeditionUpdate_expeditionId_fkey" FOREIGN KEY ("expeditionId") REFERENCES "Expedition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpeditionUpdate" ADD CONSTRAINT "ExpeditionUpdate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsTag" ADD CONSTRAINT "NewsTag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsTag" ADD CONSTRAINT "NewsTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationResource" ADD CONSTRAINT "EducationResource_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationResource" ADD CONSTRAINT "EducationResource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationResource" ADD CONSTRAINT "EducationResource_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "EducationResource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossaryTerm" ADD CONSTRAINT "GlossaryTerm_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

