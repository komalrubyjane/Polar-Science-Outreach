/**
 * Centralised demonstration content.
 *
 * Used ONLY as a fallback so no major page ever looks empty while the database
 * is unseeded / unreachable. Every record carries `isDemo: true` and the UI
 * shows a "Demo" marker. Real data always wins:
 *
 *   const items = demoFallback(realItems, DEMO.research, { active: hasFilters });
 *
 * When the user has an active search/filter that genuinely matches nothing, we
 * keep the real empty state (pass `active: true`).
 */

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86_400_000);
const daysAhead = (n: number) => new Date(now + n * 86_400_000);

const DEMO = 'demo-';

/* ------------------------------------------------------------------ research */

const RESEARCH_ROWS: Array<{
  title: string;
  discipline: string;
  pole: 'ARCTIC' | 'ANTARCTIC' | 'BIPOLAR';
  type: string;
  year: number;
  institution: string;
  authors: string[];
  keywords: string[];
}> = [
  { title: 'Seasonal Dynamics of Antarctic Sea Ice', discipline: 'GLACIOLOGY', pole: 'ANTARCTIC', type: 'RESEARCH_PAPER', year: 2025, institution: 'Southern Ocean Institute', authors: ['Dr Lena Fjord', 'Dr Amare Okafor'], keywords: ['sea ice', 'seasonality', 'Southern Ocean'] },
  { title: 'Changes in Greenland Glacier Mass, 2003–2024', discipline: 'GLACIOLOGY', pole: 'ARCTIC', type: 'REPORT', year: 2025, institution: 'Northern Cryosphere Centre', authors: ['Prof. Idris Kane', 'Dr Sofia Marlow'], keywords: ['ice sheet', 'mass balance', 'sea level'] },
  { title: 'Arctic Ocean Temperature Variability at the Fram Strait', discipline: 'OCEANOGRAPHY', pole: 'ARCTIC', type: 'RESEARCH_PAPER', year: 2024, institution: 'Boreal Marine Laboratory', authors: ['Dr Nadia Sorensen'], keywords: ['ocean heat', 'Atlantic water', 'moorings'] },
  { title: 'Microbial Communities in Antarctic Sea Ice Brine Channels', discipline: 'ECOLOGY', pole: 'ANTARCTIC', type: 'RESEARCH_PAPER', year: 2024, institution: 'Polar Life Sciences Unit', authors: ['Dr Priya Anand', 'Dr Tomas Vega'], keywords: ['psychrophiles', 'brine', 'biogeochemistry'] },
  { title: 'Polar Atmospheric Circulation Patterns and Mid-latitude Weather', discipline: 'ATMOSPHERIC_SCIENCE', pole: 'BIPOLAR', type: 'RESEARCH_PAPER', year: 2025, institution: 'Institute for Polar Meteorology', authors: ['Prof. Hana Bergström', 'Dr Wei Lin'], keywords: ['polar vortex', 'teleconnections', 'jet stream'] },
  { title: 'Sea Ice and Climate Feedbacks in a Warming Arctic', discipline: 'CLIMATE', pole: 'ARCTIC', type: 'RESEARCH_SUMMARY', year: 2025, institution: 'Northern Cryosphere Centre', authors: ['Dr Sofia Marlow'], keywords: ['albedo feedback', 'amplification', 'projections'] },
  { title: 'Ice-Shelf Basal Melt Beneath the Ross Ice Shelf', discipline: 'GLACIOLOGY', pole: 'ANTARCTIC', type: 'RESEARCH_PAPER', year: 2024, institution: 'Southern Ocean Institute', authors: ['Dr Amare Okafor', 'Dr Lena Fjord'], keywords: ['ice shelf', 'basal melt', 'warm water'] },
  { title: 'Permafrost Carbon Flux Across the Siberian Tundra', discipline: 'CLIMATE', pole: 'ARCTIC', type: 'FIELD_REPORT', year: 2024, institution: 'Tundra Carbon Observatory', authors: ['Dr Mikael Aalto'], keywords: ['permafrost', 'methane', 'eddy covariance'] },
  { title: 'Krill Distribution and the Retreating Winter Ice Edge', discipline: 'MARINE_SCIENCE', pole: 'ANTARCTIC', type: 'RESEARCH_PAPER', year: 2025, institution: 'Polar Life Sciences Unit', authors: ['Dr Tomas Vega'], keywords: ['krill', 'acoustics', 'food web'] },
  { title: 'A 400-Year Accumulation Record from a West Antarctic Ice Core', discipline: 'PALEOCLIMATE', pole: 'ANTARCTIC', type: 'RESEARCH_PAPER', year: 2023, institution: 'Institute for Polar Meteorology', authors: ['Prof. Hana Bergström'], keywords: ['ice core', 'accumulation', 'isotopes'] },
  { title: 'Autonomous Under-Ice Survey of the Weddell Gyre', discipline: 'POLAR_TECHNOLOGY', pole: 'ANTARCTIC', type: 'TECHNICAL_DOCUMENT', year: 2025, institution: 'Polar Robotics Group', authors: ['Dr Elena Ruiz'], keywords: ['gliders', 'under-ice', 'navigation'] },
  { title: 'Co-producing Sea-Ice Travel Safety Knowledge in Nunavut', discipline: 'HUMAN_INDIGENOUS', pole: 'ARCTIC', type: 'POLICY_DOCUMENT', year: 2024, institution: 'Arctic Communities Partnership', authors: ['Dr Maya Qitsualik'], keywords: ['Indigenous knowledge', 'co-production', 'safety'] },
  { title: 'Snow-Cover Duration Trends on the Antarctic Peninsula', discipline: 'GLACIOLOGY', pole: 'ANTARCTIC', type: 'RESEARCH_PAPER', year: 2024, institution: 'Southern Ocean Institute', authors: ['Dr Lena Fjord'], keywords: ['snow', 'remote sensing', 'peninsula'] },
  { title: 'Deep-Water Formation in the Weddell Sea Under Freshening', discipline: 'OCEANOGRAPHY', pole: 'ANTARCTIC', type: 'RESEARCH_PAPER', year: 2025, institution: 'Boreal Marine Laboratory', authors: ['Dr Nadia Sorensen', 'Dr Wei Lin'], keywords: ['AABW', 'overturning', 'salinity'] },
  { title: 'Emperor Penguin Colony Detection from Satellite Imagery', discipline: 'BIODIVERSITY', pole: 'ANTARCTIC', type: 'RESEARCH_PAPER', year: 2024, institution: 'Polar Life Sciences Unit', authors: ['Dr Priya Anand'], keywords: ['penguins', 'satellite', 'population'] },
  { title: 'Glacier Speed-Up After Larsen-Style Ice-Shelf Loss', discipline: 'GLACIOLOGY', pole: 'ANTARCTIC', type: 'RESEARCH_PAPER', year: 2025, institution: 'Northern Cryosphere Centre', authors: ['Prof. Idris Kane'], keywords: ['buttressing', 'ice dynamics', 'discharge'] },
];

export const demoResearch = RESEARCH_ROWS.map((r, i) => ({
  id: `${DEMO}research-${i + 1}`,
  slug: `${DEMO}${slugify(r.title)}`,
  title: r.title,
  abstract: `A demonstration record. ${r.title} examines ${r.keywords.join(', ')} across the ${r.pole.toLowerCase()} region using a mix of field observations, remote sensing and modelling. Findings are illustrative and provided to demonstrate the repository interface.`,
  description: `## Background\n\nThis is **demonstration content**, generated to populate the portal while the database is unseeded.\n\n## Approach\n\nSynthetic and reanalysis-style inputs were combined with standard time-series methods.\n\n## Note\n\nThe portal is a dissemination platform; a production record links to the original publication via its DOI.`,
  type: r.type,
  discipline: r.discipline,
  pole: r.pole,
  language: 'en',
  license: 'CC_BY',
  status: 'PUBLISHED',
  publicationDate: daysAgo(40 + i * 33),
  publishedAt: daysAgo(38 + i * 33),
  approvedAt: daysAgo(38 + i * 33),
  doi: `10.5555/demo.${r.year}.${1000 + i}`,
  isbn: null,
  externalUrl: null,
  citationText: null,
  latitude: r.pole === 'ARCTIC' ? 76 + (i % 6) : -70 - (i % 8),
  longitude: -60 + i * 9,
  keywords: r.keywords,
  viewCount: 120 + ((i * 137) % 800),
  downloadCount: 20 + ((i * 61) % 180),
  isDemo: true,
  createdAt: daysAgo(38 + i * 33),
  updatedAt: daysAgo(10 + i),
  institution: { name: r.institution, slug: slugify(r.institution), country: null },
  region: null,
  authors: r.authors.map((fullName, ai) => ({
    id: `${DEMO}ra-${i}-${ai}`,
    authorOrder: ai,
    isCorresponding: ai === 0,
    researcher: { fullName, slug: `${DEMO}${slugify(fullName)}` },
  })),
  topics: [] as { topic: { name: string; slug: string } }[],
  tags: [] as { tag: { id: string; label: string } }[],
  files: [] as unknown[],
  relatedDatasets: [] as unknown[],
  relatedMedia: [] as unknown[],
}));

/* ------------------------------------------------------------------ researchers */

const RESEARCHER_ROWS: Array<{
  name: string;
  title: string;
  areas: string[];
  pole: 'ARCTIC' | 'ANTARCTIC' | 'BIPOLAR';
  institution: string;
  bio: string;
}> = [
  { name: 'Dr Lena Fjord', title: 'Sea-ice physicist', areas: ['GLACIOLOGY', 'CLIMATE'], pole: 'ANTARCTIC', institution: 'Southern Ocean Institute', bio: 'Studies the seasonal life-cycle of Antarctic sea ice and its coupling to the Southern Ocean.' },
  { name: 'Prof. Idris Kane', title: 'Ice-sheet modeller', areas: ['GLACIOLOGY'], pole: 'ARCTIC', institution: 'Northern Cryosphere Centre', bio: 'Develops models of Greenland ice-sheet dynamics and their contribution to sea level.' },
  { name: 'Dr Nadia Sorensen', title: 'Physical oceanographer', areas: ['OCEANOGRAPHY'], pole: 'BIPOLAR', institution: 'Boreal Marine Laboratory', bio: 'Uses moorings and floats to track heat and freshwater in polar seas.' },
  { name: 'Dr Priya Anand', title: 'Polar microbiologist', areas: ['ECOLOGY', 'BIODIVERSITY'], pole: 'ANTARCTIC', institution: 'Polar Life Sciences Unit', bio: 'Investigates life in sea-ice brine channels and subglacial environments.' },
  { name: 'Prof. Hana Bergström', title: 'Palaeoclimatologist', areas: ['PALEOCLIMATE', 'ATMOSPHERIC_SCIENCE'], pole: 'ANTARCTIC', institution: 'Institute for Polar Meteorology', bio: 'Reconstructs past polar climate from ice cores and lake sediments.' },
  { name: 'Dr Amare Okafor', title: 'Glaciologist', areas: ['GLACIOLOGY', 'OCEANOGRAPHY'], pole: 'ANTARCTIC', institution: 'Southern Ocean Institute', bio: 'Measures ice-shelf/ocean interaction beneath floating ice.' },
  { name: 'Dr Sofia Marlow', title: 'Climate scientist', areas: ['CLIMATE'], pole: 'ARCTIC', institution: 'Northern Cryosphere Centre', bio: 'Quantifies Arctic feedbacks in coupled climate models.' },
  { name: 'Dr Tomas Vega', title: 'Marine ecologist', areas: ['MARINE_SCIENCE', 'BIODIVERSITY'], pole: 'ANTARCTIC', institution: 'Polar Life Sciences Unit', bio: 'Works on krill acoustics and Southern Ocean food-web structure.' },
  { name: 'Dr Elena Ruiz', title: 'Robotics engineer', areas: ['POLAR_TECHNOLOGY'], pole: 'ANTARCTIC', institution: 'Polar Robotics Group', bio: 'Builds autonomous platforms for under-ice ocean observation.' },
  { name: 'Dr Maya Qitsualik', title: 'Knowledge co-production researcher', areas: ['HUMAN_INDIGENOUS'], pole: 'ARCTIC', institution: 'Arctic Communities Partnership', bio: 'Bridges community observations and instrumental science for ice safety.' },
  { name: 'Dr Mikael Aalto', title: 'Biogeochemist', areas: ['CLIMATE', 'ECOLOGY'], pole: 'ARCTIC', institution: 'Tundra Carbon Observatory', bio: 'Measures greenhouse-gas exchange across thawing permafrost.' },
  { name: 'Dr Wei Lin', title: 'Atmospheric scientist', areas: ['ATMOSPHERIC_SCIENCE', 'CLIMATE'], pole: 'BIPOLAR', institution: 'Institute for Polar Meteorology', bio: 'Studies polar–mid-latitude atmospheric linkages.' },
];

export const demoResearchers = RESEARCHER_ROWS.map((r, i) => ({
  id: `${DEMO}researcher-${i + 1}`,
  slug: `${DEMO}${slugify(r.name)}`,
  fullName: r.name,
  title: r.title,
  email: null,
  bio: `${r.bio} This is a demonstration profile — fictional, with no findings attributed to a real person.`,
  photoUrl: null,
  researchAreas: r.areas,
  primaryPole: r.pole,
  orcid: null,
  websiteUrl: null,
  isDemo: true,
  createdAt: daysAgo(200 - i),
  updatedAt: daysAgo(20),
  institution: { name: r.institution, slug: slugify(r.institution), country: null },
  _count: { authorships: 2 + (i % 5), expeditions: i % 3 },
  authorships: [] as unknown[],
  expeditions: [] as unknown[],
}));

/* ------------------------------------------------------------------ institutions */

const INSTITUTION_ROWS: Array<{ name: string; country: string; areas: string[]; desc: string }> = [
  { name: 'Southern Ocean Institute', country: 'New Zealand', areas: ['OCEANOGRAPHY', 'GLACIOLOGY', 'MARINE_SCIENCE'], desc: 'A demonstration institute focused on the Southern Ocean and Antarctic margin.' },
  { name: 'Northern Cryosphere Centre', country: 'Norway', areas: ['GLACIOLOGY', 'CLIMATE'], desc: 'Demonstration centre for Arctic ice-sheet and sea-ice science.' },
  { name: 'Boreal Marine Laboratory', country: 'Iceland', areas: ['OCEANOGRAPHY', 'MARINE_SCIENCE'], desc: 'Demonstration lab studying heat and freshwater exchange in polar seas.' },
  { name: 'Polar Life Sciences Unit', country: 'Australia', areas: ['ECOLOGY', 'BIODIVERSITY'], desc: 'Demonstration unit for polar microbiology and ecosystem research.' },
  { name: 'Institute for Polar Meteorology', country: 'Germany', areas: ['ATMOSPHERIC_SCIENCE', 'PALEOCLIMATE'], desc: 'Demonstration institute for polar atmospheric and palaeoclimate science.' },
  { name: 'Polar Robotics Group', country: 'United States', areas: ['POLAR_TECHNOLOGY'], desc: 'Demonstration group building autonomous polar observing platforms.' },
  { name: 'Arctic Communities Partnership', country: 'Canada', areas: ['HUMAN_INDIGENOUS'], desc: 'Demonstration partnership for community-led Arctic monitoring.' },
  { name: 'Tundra Carbon Observatory', country: 'Finland', areas: ['CLIMATE', 'ECOLOGY'], desc: 'Demonstration observatory for permafrost carbon fluxes.' },
  { name: 'Weddell Geoscience Consortium', country: 'United Kingdom', areas: ['GEOLOGY', 'GLACIOLOGY'], desc: 'Demonstration consortium for Antarctic geology and ice history.' },
  { name: 'Svalbard Field Station Network', country: 'Norway', areas: ['GLACIOLOGY', 'ATMOSPHERIC_SCIENCE'], desc: 'Demonstration network of high-Arctic field stations.' },
];

export const demoInstitutions = INSTITUTION_ROWS.map((r, i) => ({
  id: `${DEMO}institution-${i + 1}`,
  slug: `${DEMO}${slugify(r.name)}`,
  name: r.name,
  acronym: r.name.split(' ').map((w) => w[0]).join('').slice(0, 4).toUpperCase(),
  description: r.desc,
  country: r.country,
  website: null,
  logoUrl: null,
  researchAreas: r.areas,
  isDemo: true,
  createdAt: daysAgo(400 - i * 5),
  updatedAt: daysAgo(30),
  _count: { researchers: 4 + (i % 8), research: 6 + (i % 10), expeditions: i % 4 },
  researchers: [] as unknown[],
  research: [] as unknown[],
  expeditions: [] as unknown[],
}));

/* ------------------------------------------------------------------ datasets */

const DATASET_ROWS: Array<{ title: string; unit: string; discipline: string; pole: 'ARCTIC' | 'ANTARCTIC' | 'BIPOLAR'; source: string }> = [
  { title: 'Arctic Sea Ice Extent (monthly)', unit: 'million km²', discipline: 'GLACIOLOGY', pole: 'ARCTIC', source: 'Demo generator' },
  { title: 'Antarctic Sea Ice Extent (monthly)', unit: 'million km²', discipline: 'GLACIOLOGY', pole: 'ANTARCTIC', source: 'Demo generator' },
  { title: 'Arctic Near-Surface Temperature Anomaly', unit: '°C', discipline: 'CLIMATE', pole: 'ARCTIC', source: 'Demo generator' },
  { title: 'Southern Ocean Sea-Surface Temperature', unit: '°C', discipline: 'OCEANOGRAPHY', pole: 'ANTARCTIC', source: 'Demo generator' },
  { title: 'Greenland Ice-Sheet Mass Change', unit: 'Gt', discipline: 'GLACIOLOGY', pole: 'ARCTIC', source: 'Demo generator' },
  { title: 'Antarctic Peninsula Snow-Cover Duration', unit: 'days/month', discipline: 'GLACIOLOGY', pole: 'ANTARCTIC', source: 'Demo generator' },
  { title: 'Arctic Ocean Salinity (upper 100 m)', unit: 'PSU', discipline: 'OCEANOGRAPHY', pole: 'ARCTIC', source: 'Demo generator' },
  { title: 'Global Mean Sea Level', unit: 'mm', discipline: 'OCEANOGRAPHY', pole: 'BIPOLAR', source: 'Demo generator' },
  { title: 'Antarctic Surface Mass Balance', unit: 'Gt/yr', discipline: 'GLACIOLOGY', pole: 'ANTARCTIC', source: 'Demo generator' },
  { title: 'Arctic Ocean Heat Content Anomaly', unit: 'ZJ', discipline: 'OCEANOGRAPHY', pole: 'ARCTIC', source: 'Demo generator' },
  { title: 'Northern Hemisphere Snow-Cover Extent', unit: 'million km²', discipline: 'GLACIOLOGY', pole: 'ARCTIC', source: 'Demo generator' },
  { title: 'Southern Annular Mode Index', unit: 'index', discipline: 'ATMOSPHERIC_SCIENCE', pole: 'ANTARCTIC', source: 'Demo generator' },
];

export const demoDatasets = DATASET_ROWS.map((r, i) => ({
  id: `${DEMO}dataset-${i + 1}`,
  slug: `${DEMO}${slugify(r.title)}`,
  title: r.title,
  description: `Illustrative demonstration dataset for "${r.title}". Generated for interface demonstration — not a scientific measurement and not to be cited.`,
  discipline: r.discipline,
  pole: r.pole,
  unit: r.unit,
  variable: r.title,
  temporalStart: daysAgo(3650),
  temporalEnd: new Date(),
  source: r.source,
  publisher: 'Polar Science Portal (demo generator)',
  methodology: 'Synthetic series: seasonal component + trend + bounded noise.',
  license: 'CC0',
  doi: null,
  externalUrl: null,
  status: 'PUBLISHED',
  isDemo: true,
  viewCount: 40 + i * 7,
  downloadCount: i * 3,
  lastUpdatedAt: daysAgo(2 + i),
  createdAt: daysAgo(120 + i * 10),
  updatedAt: daysAgo(2 + i),
  institution: { name: DATASET_ROWS[i]!.source === 'Demo generator' ? 'Polar Science Portal' : '', slug: 'polar-science-portal' },
  versions: [{ id: `${DEMO}dv-${i}`, version: 'v1', releasedAt: daysAgo(2 + i), series: [] as unknown[] }],
}));

/* ------------------------------------------------------------------ media */

const MEDIA_SUBJECTS = [
  ['Iceberg at dawn', 'PHOTO', 'Ice'],
  ['Sea ice from the air', 'PHOTO', 'Ice'],
  ['Glacier calving front', 'PHOTO', 'Glaciers'],
  ['Research station in a storm', 'PHOTO', 'Stations'],
  ['Scientist logging an ice core', 'PHOTO', 'Researchers'],
  ['Weddell seal on fast ice', 'PHOTO', 'Wildlife'],
  ['Emperor penguin colony', 'PHOTO', 'Wildlife'],
  ['Autonomous glider recovery', 'PHOTO', 'Expeditions'],
  ['Aurora over the ice sheet', 'PHOTO', 'Climate'],
  ['Melt ponds on sea ice', 'PHOTO', 'Ice'],
  ['Field camp at midnight', 'PHOTO', 'Expeditions'],
  ['Satellite view of a polynya', 'PHOTO', 'Satellite'],
  ['Blue ice pressure ridges', 'PHOTO', 'Ice'],
  ['Ship in the pack ice', 'PHOTO', 'Expeditions'],
  ['Katabatic wind plume', 'PHOTO', 'Climate'],
  ['Meltwater river on Greenland', 'PHOTO', 'Glaciers'],
  ['Snow petrel in flight', 'PHOTO', 'Wildlife'],
  ['Sediment core on deck', 'PHOTO', 'Ocean'],
  ['Weather balloon launch', 'PHOTO', 'Climate'],
  ['Tabular iceberg edge', 'PHOTO', 'Ice'],
  ['Diver under the ice', 'PHOTO', 'Ocean'],
  ['Traverse across the plateau', 'PHOTO', 'Expeditions'],
  ['Instrument mast at a station', 'PHOTO', 'Stations'],
  ['Krill swarm underwater', 'PHOTO', 'Wildlife'],
] as const;

export const demoMedia = MEDIA_SUBJECTS.map(([title, type, category], i) => ({
  id: `${DEMO}media-${i + 1}`,
  slug: `${DEMO}${slugify(title as string)}`,
  title: title as string,
  description: `Demonstration ${String(type).toLowerCase()} — "${title}". Placeholder imagery is shown; a production asset carries full rights metadata.`,
  type: type as string,
  status: 'PUBLISHED',
  creator: RESEARCHER_ROWS[i % RESEARCHER_ROWS.length]!.name,
  copyright: `© ${RESEARCHER_ROWS[i % RESEARCHER_ROWS.length]!.name} (demo)`,
  license: (['CC_BY', 'CC_BY_NC', 'CC_BY_SA'] as const)[i % 3],
  attribution: `${RESEARCHER_ROWS[i % RESEARCHER_ROWS.length]!.name}, ${INSTITUTION_ROWS[i % INSTITUTION_ROWS.length]!.name} (demo)`,
  capturedAt: daysAgo(15 + i * 9),
  locationName: (i % 2 === 0 ? 'Arctic Ocean' : 'Antarctic Peninsula'),
  latitude: i % 2 === 0 ? 78 : -66,
  longitude: -30 + i * 6,
  fileId: null,
  thumbnailUrl: null,
  externalUrl: null,
  transcript: null,
  captionsUrl: null,
  altText: `${title} — demonstration placeholder image.`,
  durationSec: null,
  viewCount: 30 + i * 5,
  downloadCount: i,
  isDemo: true,
  category: category as string,
  createdAt: daysAgo(15 + i * 9),
  updatedAt: daysAgo(5 + i),
  region: { name: i % 2 === 0 ? 'Arctic Ocean' : 'Antarctic Peninsula', pole: i % 2 === 0 ? 'ARCTIC' : 'ANTARCTIC' },
  institution: { name: INSTITUTION_ROWS[i % INSTITUTION_ROWS.length]!.name, slug: '' },
  topics: [] as unknown[],
  tags: [] as unknown[],
}));

/* ------------------------------------------------------------------ news */

const NEWS_ROWS: Array<{ title: string; category: string; sub: string }> = [
  { title: 'Winter sea-ice maximum among the lowest on record', category: 'CLIMATE', sub: 'The demonstration dashboard adds a new Southern Hemisphere comparison.' },
  { title: 'Demo expedition returns from the Weddell Sea', category: 'EXPEDITIONS', sub: 'Highlights from 24 days on the ice, in the expedition journal.' },
  { title: 'New explainer: what sea-ice extent actually measures', category: 'EDUCATION', sub: 'Plain-language piece plus a short quiz, no account needed.' },
  { title: 'Under-ice gliders complete a full winter mission', category: 'TECHNOLOGY', sub: 'Autonomous platforms profiled the ocean through the polar night.' },
  { title: 'Ice-core record extends the accumulation history', category: 'RESEARCH', sub: 'A 400-year West Antarctic reconstruction, presented as demo data.' },
  { title: 'Community observers join the ice-safety network', category: 'RESEARCH', sub: 'Co-produced knowledge feeds into travel-safety mapping.' },
  { title: 'Krill survey visualised against the ice edge', category: 'RESEARCH', sub: 'An interactive look at a synthetic acoustic survey.' },
  { title: 'Data portal adds CSV and JSON export to every series', category: 'TECHNOLOGY', sub: 'Provenance shown on every chart.' },
  { title: 'Polar oceans symposium opens registration', category: 'EVENTS', sub: 'Hybrid event; places are limited.' },
  { title: 'Accessibility pass: charts gain textual summaries', category: 'EDUCATION', sub: 'Every chart now has a data table and a written summary.' },
];

export const demoNews = NEWS_ROWS.map((r, i) => ({
  id: `${DEMO}news-${i + 1}`,
  slug: `${DEMO}${slugify(r.title)}`,
  title: r.title,
  subtitle: r.sub,
  heroImageUrl: null,
  body: `${r.sub}\n\n## Overview\n\nThis is **demonstration news content**, shown while the database is unseeded. It exercises the newsroom layout, categories, related-article logic and reading-time estimate.\n\n## Details\n\n- Categories filter the newsroom.\n- Articles support Markdown, references and tags.\n\nSee the [data policy](/about/data-policy) for how the portal treats sources.`,
  category: r.category,
  status: 'PUBLISHED',
  publishedAt: daysAgo(2 + i * 6),
  references: ['https://example.org/demo-reference'],
  viewCount: 50 + i * 12,
  isDemo: true,
  createdAt: daysAgo(2 + i * 6),
  updatedAt: daysAgo(1 + i),
  author: { name: 'Editorial team' },
  tags: [] as unknown[],
}));

/* ------------------------------------------------------------------ events */

const EVENT_ROWS: Array<{ title: string; type: string; mode: string; inDays: number; place: string | null }> = [
  { title: 'Polar Science Conference', type: 'CONFERENCE', mode: 'IN_PERSON', inDays: 40, place: 'Tromsø' },
  { title: 'Arctic Research Forum', type: 'WEBINAR', mode: 'ONLINE', inDays: 9, place: null },
  { title: 'Antarctic Field Seminar', type: 'WORKSHOP', mode: 'HYBRID', inDays: 22, place: 'Christchurch' },
  { title: 'Climate Data Workshop', type: 'WORKSHOP', mode: 'ONLINE', inDays: 14, place: null },
  { title: 'Polar Oceans Symposium', type: 'CONFERENCE', mode: 'HYBRID', inDays: 55, place: 'Hobart' },
  { title: 'Schools Polar Day', type: 'SCHOOL_PROGRAM', mode: 'ONLINE', inDays: 12, place: null },
  { title: 'Public Lecture: Life at the Poles', type: 'PUBLIC_LECTURE', mode: 'IN_PERSON', inDays: 30, place: 'Cambridge' },
  { title: 'Autonomous Platforms Meetup', type: 'WORKSHOP', mode: 'ONLINE', inDays: -6, place: null },
];

export const demoEvents = EVENT_ROWS.map((r, i) => {
  const start = r.inDays >= 0 ? daysAhead(r.inDays) : daysAgo(-r.inDays);
  return {
    id: `${DEMO}event-${i + 1}`,
    slug: `${DEMO}${slugify(r.title)}`,
    title: r.title,
    description: `${r.title} is a **demonstration event**, shown while the database is unseeded.\n\n## What to expect\n\nWelcome and context, demonstration talks, and discussion.`,
    type: r.type,
    mode: r.mode,
    status: 'PUBLISHED',
    startAt: start,
    endAt: new Date(start.getTime() + 2 * 3600_000),
    timezone: 'UTC',
    locationName: r.place,
    latitude: null,
    longitude: null,
    organizer: INSTITUTION_ROWS[i % INSTITUTION_ROWS.length]!.name,
    registrationUrl: null,
    registrationStatus: r.inDays < 0 ? 'CLOSED' : 'OPEN',
    capacity: r.mode === 'IN_PERSON' ? 120 : 500,
    contactEmail: 'events@example.org',
    imageUrl: null,
    isDemo: true,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(3),
    _count: { registrations: 10 + i * 7 },
  };
});

/* ------------------------------------------------------------------ expeditions */

const EXPEDITION_ROWS: Array<{ name: string; number: string; region: string; pole: 'ARCTIC' | 'ANTARCTIC'; vessel: string; days: number; topics: string[] }> = [
  { name: 'Weddell Sea Ice–Ocean Campaign', number: 'WSIO-01', region: 'Weddell Sea', pole: 'ANTARCTIC', vessel: 'RV Demo Polaris', days: 24, topics: ['Sea ice', 'Ocean currents'] },
  { name: 'Fram Strait Gateway Cruise', number: 'FSG-14', region: 'Arctic Ocean', pole: 'ARCTIC', vessel: 'RV Demo Nansen', days: 20, topics: ['Ocean temperature', 'Salinity'] },
  { name: 'Antarctic Peninsula Glacier Survey', number: 'APG-07', region: 'Antarctic Peninsula', pole: 'ANTARCTIC', vessel: 'RV Demo Shackleton', days: 18, topics: ['Glaciers', 'Ice shelves'] },
  { name: 'Greenland Firn Traverse', number: 'GFT-03', region: 'Greenland', pole: 'ARCTIC', vessel: 'Overland traverse', days: 30, topics: ['Snow', 'Ice sheets'] },
  { name: 'Ross Sea Ecosystem Expedition', number: 'RSE-11', region: 'Ross Sea', pole: 'ANTARCTIC', vessel: 'RV Demo Aurora', days: 26, topics: ['Krill', 'Marine ecosystems'] },
];

const MILESTONES = [
  { day: 1, title: 'Departure', body: 'Lines cast off. Safety briefings complete; first CTD station planned for tomorrow.' },
  { day: 2, title: 'First sampling', body: 'Completed the first transect of stations. Equipment performing well.' },
  { day: 5, title: 'Sea-ice measurements', body: 'Ice team drilled cores along a 500 m line; thickness and salinity logged.' },
  { day: 12, title: 'Ocean sampling', body: 'Deep casts to 3,000 m; water samples for oxygen and nutrients.' },
  { day: 20, title: 'Atmospheric observations', body: 'Radiosonde launches every six hours; boundary-layer profiling underway.' },
];

export const demoExpeditions = EXPEDITION_ROWS.map((r, i) => {
  const start = daysAgo(120 + i * 30);
  return {
    id: `${DEMO}expedition-${i + 1}`,
    slug: `${DEMO}${slugify(r.name)}`,
    name: r.name,
    expeditionNumber: r.number,
    summary: `A demonstration ${r.days}-day field campaign in the ${r.region} aboard ${r.vessel}.`,
    objectives: `## Objectives\n\n- Demonstrate the expedition detail page and journal timeline\n- Show team, route and research-topic metadata\n- Illustrate day-by-day updates`,
    researchTopics: r.topics,
    vessel: r.vessel,
    startDate: start,
    endDate: new Date(start.getTime() + r.days * 86_400_000),
    status: 'PUBLISHED',
    heroImageUrl: null,
    routeGeoJson: null,
    isDemo: true,
    createdAt: start,
    updatedAt: daysAgo(10),
    region: { name: r.region, pole: r.pole },
    institution: { name: INSTITUTION_ROWS[i % INSTITUTION_ROWS.length]!.name, slug: '' },
    members: RESEARCHER_ROWS.slice(i, i + 3).map((m, mi) => ({
      id: `${DEMO}em-${i}-${mi}`,
      role: mi === 0 ? 'Lead Scientist' : 'Scientist',
      researcher: { fullName: m.name, slug: `${DEMO}${slugify(m.name)}`, title: m.title },
    })),
    updates: MILESTONES.filter((m) => m.day <= r.days).map((m, ui) => ({
      id: `${DEMO}eu-${i}-${ui}`,
      dayNumber: m.day,
      title: m.title,
      body: `${m.body}\n\n_Demonstration journal entry._`,
      postedAt: new Date(start.getTime() + m.day * 86_400_000),
      locationName: r.region,
      latitude: r.pole === 'ARCTIC' ? 78 : -70,
      longitude: -30 + m.day,
      imageUrls: [] as string[],
      videoUrl: null,
      author: { name: 'Chief scientist' },
    })),
  };
});

/* ------------------------------------------------------------------ education */

const EDU_ROWS: Array<{ title: string; type: string; age: string; mins: number }> = [
  { title: 'What is sea ice?', type: 'EXPLAINER', age: 'All ages', mins: 5 },
  { title: 'Why do glaciers flow?', type: 'EXPLAINER', age: 'All ages', mins: 6 },
  { title: 'Why is Antarctica so cold?', type: 'EXPLAINER', age: 'All ages', mins: 5 },
  { title: 'What happens when sea ice melts?', type: 'EXPLAINER', age: 'All ages', mins: 6 },
  { title: 'How do scientists study the poles?', type: 'EXPLAINER', age: 'All ages', mins: 7 },
  { title: 'What is albedo?', type: 'EXPLAINER', age: 'All ages', mins: 4 },
  { title: 'What lives under the ice?', type: 'EXPLAINER', age: 'All ages', mins: 6 },
  { title: 'What causes the aurora?', type: 'EXPLAINER', age: 'All ages', mins: 5 },
  { title: 'Build a virtual glacier', type: 'LESSON_PLAN', age: 'Ages 11–14', mins: 60 },
  { title: 'Sea ice and albedo investigation', type: 'LESSON_PLAN', age: 'Ages 14–16', mins: 90 },
  { title: 'Mapping a research station', type: 'LESSON_PLAN', age: 'Ages 9–11', mins: 45 },
  { title: 'Polar food-web card sort', type: 'LESSON_PLAN', age: 'Ages 11–14', mins: 50 },
];

export const demoEducation = EDU_ROWS.map((r, i) => ({
  id: `${DEMO}education-${i + 1}`,
  slug: `${DEMO}${slugify(r.title)}`,
  title: r.title,
  summary: `A demonstration ${r.type.replace('_', ' ').toLowerCase()}: ${r.title}.`,
  body: `## ${r.title}\n\nDemonstration content shown while the database is unseeded. Written to be understandable without a science background.\n\n- Key idea one, in simple terms.\n- Key idea two, with an everyday comparison.\n- Why it matters for people.`,
  type: r.type,
  status: 'PUBLISHED',
  ageGroup: r.age,
  durationMin: r.mins,
  objectives: r.type === 'LESSON_PLAN' ? ['Describe the core concept', 'Carry out a simple investigation', 'Interpret a result'] : [],
  materials: r.type === 'LESSON_PLAN' ? ['Worksheet', 'Ice cubes / trays', 'Thermometer'] : [],
  assessment: r.type === 'LESSON_PLAN' ? 'Exit ticket: one sentence on what was found and one open question.' : null,
  plainLanguage: 'The short version: the poles help keep the whole planet’s climate steady.',
  heroImageUrl: null,
  attachmentId: null,
  viewCount: 20 + i * 8,
  downloadCount: i,
  isDemo: true,
  createdAt: daysAgo(60 - i),
  updatedAt: daysAgo(10),
  topic: null,
}));

/* ------------------------------------------------------------------ glossary */

const GLOSSARY_ROWS: Array<[string, string, string?]> = [
  ['Albedo', 'The fraction of incoming sunlight a surface reflects, from 0 (black) to 1 (white). Fresh snow is around 0.8.', 'How much sunlight a surface bounces back.'],
  ['Cryosphere', 'The parts of Earth’s surface where water is frozen: sea ice, ice sheets, glaciers, snow and permafrost.'],
  ['Permafrost', 'Ground that stays at or below 0 °C for at least two consecutive years.'],
  ['Sea ice', 'Frozen seawater that forms, drifts and melts on the ocean surface.'],
  ['Ice shelf', 'A thick, floating platform of ice where a glacier or ice sheet flows onto the sea.'],
  ['Iceberg', 'A large piece of freshwater ice that has broken off a glacier or ice shelf and floats in the sea.'],
  ['Glacier', 'A persistent body of dense ice that moves under its own weight.'],
  ['Katabatic wind', 'A wind that blows downslope as cold, dense air drains off an ice sheet.'],
  ['Thermohaline circulation', 'The global ocean circulation driven by differences in temperature and salinity.'],
  ['Polar vortex', 'A large area of low pressure and cold air near the poles, strongest in winter.'],
  ['Firn', 'Compacted, multi-year snow that is denser than fresh snow but not yet glacial ice.'],
  ['Polynya', 'An area of open water surrounded by sea ice, kept open by wind or upwelling.'],
  ['Mass balance', 'The net gain or loss of ice, comparing snowfall against melt and iceberg discharge.'],
  ['Brine rejection', 'The release of salt from growing sea ice, producing cold dense water that sinks.'],
  ['Ice core', 'A cylinder of ice drilled from a glacier whose layers record past climate.'],
  ['Krill', 'Small shrimp-like crustaceans that underpin the Southern Ocean food web.'],
  ['Sublimation', 'The direct change of ice to water vapour without melting.'],
  ['Ablation', 'All processes that remove snow or ice from a glacier.'],
  ['Grounding line', 'Where a glacier stops resting on bedrock and begins to float.'],
  ['Polar amplification', 'The tendency for warming to be larger at the poles than the global average.'],
  ['Snow water equivalent', 'The depth of water that would result if a snowpack melted completely.'],
  ['Fast ice', 'Sea ice that is anchored to the shore and does not move with currents or wind.'],
  ['Pancake ice', 'Rounded plates of new sea ice with raised rims from plates bumping together.'],
  ['Nilas', 'A thin, elastic crust of new sea ice up to about 10 cm thick.'],
  ['Meltwater', 'Water released by melting snow or ice, often pooling in ponds or draining through moulins.'],
  ['Moulin', 'A near-vertical shaft in a glacier that carries surface meltwater to the bed.'],
  ['Calving', 'The breaking-off of ice from the edge of a glacier or ice shelf.'],
  ['Iceberg keel', 'The submerged underside of an iceberg, typically about seven times its visible height.'],
  ['Supercooling', 'Water cooled below its freezing point without becoming solid.'],
  ['Frazil ice', 'Fine spicules of ice suspended in water, the first stage of sea-ice formation.'],
  ['Ice-albedo feedback', 'Less ice → darker surface → more absorbed sunlight → more melt.'],
  ['Antarctic Bottom Water', 'The dense, cold water formed near Antarctica that fills the deep global ocean.'],
];

export const demoGlossary = GLOSSARY_ROWS.map(([term, definition, plain], i) => ({
  id: `${DEMO}glossary-${i + 1}`,
  slug: slugify(term),
  term,
  definition,
  plainLanguage: plain ?? null,
  pronunciation: null,
  createdAt: daysAgo(90 - i),
  updatedAt: daysAgo(20),
  topic: null,
  isDemo: true,
}));

/* ------------------------------------------------------------------ helpers */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

/**
 * Return `real` if it has anything; otherwise, ONLY when `DEMO_MODE=true`,
 * `demo`. Production (DEMO_MODE=false) always returns the real result so
 * genuine empty states are shown honestly. An active search/filter also keeps
 * the real (empty) result — a real "no matches" is never masked.
 */
export function demoFallback<A, B>(
  real: A[],
  demo: B[],
  opts: { active?: boolean } = {},
): { items: (A | B)[]; isDemo: boolean } {
  if (real.length > 0) return { items: real, isDemo: false };
  if (opts.active || !demoEnabled()) return { items: real, isDemo: false };
  return { items: demo, isDemo: true };
}

let _demoMode: boolean | null = null;
/** Whether demonstration fallback content is enabled (env DEMO_MODE). */
export function demoEnabled(): boolean {
  if (_demoMode === null) {
    // Read lazily so this module stays importable from any context.
    _demoMode =
      (typeof process !== 'undefined' &&
        (process.env.DEMO_MODE === 'true' || process.env.DEMO_MODE === '1')) ||
      false;
  }
  return _demoMode;
}

const DEMO_INDEX = {
  research: demoResearch,
  media: demoMedia,
  news: demoNews,
  events: demoEvents,
  expeditions: demoExpeditions,
  education: demoEducation,
  datasets: demoDatasets,
  researchers: demoResearchers,
  institutions: demoInstitutions,
  glossary: demoGlossary,
} as const;

export type DemoKind = keyof typeof DEMO_INDEX;

/** Look up a single demo record by slug for detail-page fallback (DEMO_MODE only). */
export function findDemo<K extends DemoKind>(
  kind: K,
  slug: string,
): (typeof DEMO_INDEX)[K][number] | null {
  if (!demoEnabled() || !slug.startsWith(DEMO)) return null;
  return (DEMO_INDEX[kind] as ReadonlyArray<{ slug: string }>).find(
    (r) => r.slug === slug,
  ) as (typeof DEMO_INDEX)[K][number] | null ?? null;
}

export const DEMO_COUNTS = {
  research: demoResearch.length,
  researchers: demoResearchers.length,
  institutions: demoInstitutions.length,
  datasets: demoDatasets.length,
  media: demoMedia.length,
  news: demoNews.length,
  events: demoEvents.length,
  expeditions: demoExpeditions.length,
  education: demoEducation.length,
  glossary: demoGlossary.length,
};
