/** Shared, non-secret constants and display metadata. */

export const SITE = {
  name: 'Polar Science Portal',
  longName:
    'Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal',
  tagline: 'Discover the Science of the Polar Regions',
  description:
    'Explore research, data, discoveries, expeditions, educational resources and stories from the Arctic and Antarctic.',
} as const;

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Explore Polar Science', href: '/explore', description: 'Browse scientific topics by theme' },
  { label: 'Knowledge Repository', href: '/repository', description: 'Papers, reports, datasets and theses' },
  { label: 'Polar Data', href: '/data', description: 'Environmental data visualisations' },
  { label: 'Media', href: '/media', description: 'Photos, video, audio and infographics' },
  { label: 'Education & Outreach', href: '/education', description: 'Explainers, lessons, activities, quizzes' },
  { label: 'Expeditions', href: '/expeditions', description: 'Field campaigns and live journals' },
  { label: 'Events', href: '/events', description: 'Conferences, webinars and public lectures' },
  { label: 'News', href: '/news', description: 'Announcements and stories' },
  { label: 'About', href: '/about', description: 'Mission, partners and policies' },
];

/** Minimal editorial primary navigation. */
export const EDITORIAL_NAV: NavItem[] = [
  { label: 'Explore', href: '/explore' },
  { label: 'Research', href: '/repository' },
  { label: 'Data', href: '/data' },
  { label: 'Media', href: '/media' },
  { label: 'Learn', href: '/education' },
  { label: 'Expeditions', href: '/expeditions' },
];

export const EDITORIAL_NAV_MORE: NavItem[] = [
  { label: 'Polar Map', href: '/map' },
  { label: 'Events', href: '/events' },
  { label: 'News', href: '/news' },
  { label: 'Glossary', href: '/glossary' },
  { label: 'Researchers', href: '/researchers' },
  { label: 'Institutions', href: '/institutions' },
  { label: 'About', href: '/about' },
];

export const FOOTER_NAV: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Explore',
    items: [
      { label: 'Polar Science', href: '/explore' },
      { label: 'Repository', href: '/repository' },
      { label: 'Polar Data', href: '/data' },
      { label: 'Polar Map', href: '/map' },
    ],
  },
  {
    heading: 'Learn',
    items: [
      { label: 'Education', href: '/education' },
      { label: 'Glossary', href: '/glossary' },
      { label: 'Lesson Plans', href: '/education?type=LESSON_PLAN' },
      { label: 'Quizzes', href: '/education/quizzes' },
    ],
  },
  {
    heading: 'Discover',
    items: [
      { label: 'Media', href: '/media' },
      { label: 'Expeditions', href: '/expeditions' },
      { label: 'Events', href: '/events' },
      { label: 'News', href: '/news' },
    ],
  },
  {
    heading: 'About',
    items: [
      { label: 'About the portal', href: '/about' },
      { label: 'Researchers', href: '/researchers' },
      { label: 'Institutions', href: '/institutions' },
      { label: 'Contact', href: '/about/contact' },
      { label: 'Data Policy', href: '/about/data-policy' },
    ],
  },
];

export const DISCIPLINE_LABELS: Record<string, string> = {
  CLIMATE: 'Climate',
  GLACIOLOGY: 'Glaciology',
  MARINE_SCIENCE: 'Marine Science',
  BIODIVERSITY: 'Biodiversity',
  ATMOSPHERIC_SCIENCE: 'Atmospheric Science',
  GEOLOGY: 'Geology',
  OCEANOGRAPHY: 'Oceanography',
  HUMAN_INDIGENOUS: 'Human & Indigenous Knowledge',
  POLAR_TECHNOLOGY: 'Polar Technology',
  PALEOCLIMATE: 'Paleoclimate',
  ECOLOGY: 'Ecology',
};

export const POLE_LABELS: Record<string, string> = {
  ARCTIC: 'Arctic',
  ANTARCTIC: 'Antarctic',
  BIPOLAR: 'Both poles',
};

export const REPOSITORY_TYPE_LABELS: Record<string, string> = {
  RESEARCH_PAPER: 'Research paper',
  REPORT: 'Report',
  TECHNICAL_DOCUMENT: 'Technical document',
  DATASET: 'Dataset',
  RESEARCH_SUMMARY: 'Research summary',
  POLICY_DOCUMENT: 'Policy document',
  CONFERENCE_PAPER: 'Conference paper',
  THESIS: 'Thesis',
  EDUCATIONAL_DOCUMENT: 'Educational document',
  FIELD_REPORT: 'Field report',
};

export const MEDIA_TYPE_LABELS: Record<string, string> = {
  PHOTO: 'Photo',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  DOCUMENT: 'Document',
  INFOGRAPHIC: 'Infographic',
  INTERACTIVE: 'Interactive story',
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  CONFERENCE: 'Conference',
  WEBINAR: 'Webinar',
  WORKSHOP: 'Workshop',
  SCHOOL_PROGRAM: 'School programme',
  EXHIBITION: 'Exhibition',
  PUBLIC_LECTURE: 'Public lecture',
  EXPEDITION: 'Expedition',
};

export const NEWS_CATEGORY_LABELS: Record<string, string> = {
  RESEARCH: 'Research',
  CLIMATE: 'Climate',
  EXPEDITIONS: 'Expeditions',
  POLICY: 'Policy',
  EDUCATION: 'Education',
  TECHNOLOGY: 'Technology',
  BIODIVERSITY: 'Biodiversity',
};

export const EDUCATION_TYPE_LABELS: Record<string, string> = {
  EXPLAINER: 'Explainer',
  LESSON_PLAN: 'Lesson plan',
  INTERACTIVE_ACTIVITY: 'Interactive activity',
  QUIZ: 'Quiz',
  STUDENT_RESOURCE: 'Student resource',
  TEACHER_RESOURCE: 'Teacher resource',
};

export const LICENSE_LABELS: Record<string, string> = {
  CC_BY: 'CC BY 4.0',
  CC_BY_SA: 'CC BY-SA 4.0',
  CC_BY_NC: 'CC BY-NC 4.0',
  CC_BY_NC_SA: 'CC BY-NC-SA 4.0',
  CC0: 'CC0 1.0 (Public Domain Dedication)',
  PUBLIC_DOMAIN: 'Public Domain',
  ALL_RIGHTS_RESERVED: 'All rights reserved',
  OTHER: 'Other / see description',
};

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  APPROVED: 'Approved',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
  REJECTED: 'Rejected',
};

/** The explorer's top-level thematic groups and their child topic slugs. */
export const EXPLORER_CATEGORIES: {
  title: string;
  slug: string;
  blurb: string;
  topics: string[];
}[] = [
  {
    title: 'Climate & Atmosphere',
    slug: 'climate-atmosphere',
    blurb: 'How the polar atmosphere shapes — and responds to — global climate.',
    topics: ['climate-change', 'atmospheric-chemistry', 'polar-weather', 'carbon-cycle'],
  },
  {
    title: 'Ice & Glaciers',
    slug: 'ice-glaciers',
    blurb: 'Sea ice, ice sheets, glaciers, ice shelves and snow.',
    topics: ['sea-ice', 'ice-sheets', 'glaciers', 'ice-shelves', 'snow'],
  },
  {
    title: 'Ocean',
    slug: 'ocean',
    blurb: 'Currents, temperature, salinity and marine ecosystems.',
    topics: ['ocean-currents', 'ocean-temperature', 'salinity', 'marine-ecosystems'],
  },
  {
    title: 'Biodiversity',
    slug: 'biodiversity',
    blurb: 'Life at the poles, from microbes to whales.',
    topics: ['penguins', 'polar-bears', 'seals', 'whales', 'krill', 'polar-microorganisms', 'polar-plants'],
  },
  {
    title: 'Geology',
    slug: 'geology',
    blurb: 'Tectonics, minerals, sediments and deep-time climate.',
    topics: ['polar-tectonics', 'polar-minerals', 'sediments', 'paleoclimate'],
  },
  {
    title: 'Human Dimensions',
    slug: 'human-dimensions',
    blurb: 'Indigenous knowledge, communities, history and policy.',
    topics: ['indigenous-knowledge', 'polar-communities', 'polar-history', 'polar-policy', 'sustainable-development'],
  },
  {
    title: 'Polar Technology',
    slug: 'polar-technology',
    blurb: 'Satellites, autonomous vehicles, drones, sensors and stations.',
    topics: ['satellites', 'autonomous-vehicles', 'drones', 'sensors', 'research-stations'],
  },
];

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'nl', label: 'Nederlands (Dutch)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'no', label: 'Norsk (Norwegian)' },
  { code: 'ru', label: 'Русский (Russian)' },
  { code: 'es', label: 'Español (Spanish)' },
] as const;
