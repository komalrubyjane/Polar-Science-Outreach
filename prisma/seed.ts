/**
 * Database seed.
 *
 * Populates the portal with realistic DEMO content:
 *   4 accounts, 11 regions, 8 institutions, 12 researchers, 8 stations,
 *   34 topics, 18 glossary terms, 20 research records, 10 datasets, 30 media
 *   assets, 10 news articles, 8 events, 5 expeditions (with journals),
 *   15 education resources and 3 quizzes, plus map locations.
 *
 * All institutions, researchers and datasets are fictional and flagged
 * `isDemo: true`. Re-running the seed clears previously seeded demo rows first.
 *
 *   npm run db:seed
 */

import { PrismaClient, type Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { REGIONS, INSTITUTIONS, RESEARCHERS, STATIONS, TOPIC_TREE, GLOSSARY } from './seed-data';
import { DEMO_SERIES } from '../src/lib/data-providers/demo';

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

const rand = (() => {
  let s = 12345;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
})();
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000);

const DISCIPLINES = [
  'CLIMATE', 'GLACIOLOGY', 'MARINE_SCIENCE', 'BIODIVERSITY', 'ATMOSPHERIC_SCIENCE',
  'GEOLOGY', 'OCEANOGRAPHY', 'HUMAN_INDIGENOUS', 'POLAR_TECHNOLOGY', 'PALEOCLIMATE', 'ECOLOGY',
] as const;

async function main() {
  console.log('🧊  Seeding Polar Science Portal…');

  // ---------------------------------------------------------------------------
  // Clear previously-seeded demo content (safe: only touches isDemo rows +
  // demo accounts). Order respects FK constraints.
  // ---------------------------------------------------------------------------
  await prisma.quizAttempt.deleteMany({});
  await prisma.quizOption.deleteMany({});
  await prisma.quizQuestion.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.expeditionUpdate.deleteMany({});
  await prisma.expeditionMember.deleteMany({});
  await prisma.researchAuthor.deleteMany({});
  await prisma.researchTopic.deleteMany({});
  await prisma.researchTag.deleteMany({});
  await prisma.mediaTopic.deleteMany({});
  await prisma.mediaTag.deleteMany({});
  await prisma.newsTag.deleteMany({});
  await prisma.datasetVersion.deleteMany({});
  await prisma.datasetResearch.deleteMany({});
  await prisma.mediaResearch.deleteMany({});
  await prisma.eventRegistration.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.expedition.deleteMany({ where: { isDemo: true } });
  await prisma.research.deleteMany({ where: { isDemo: true } });
  await prisma.dataset.deleteMany({ where: { isDemo: true } });
  await prisma.media.deleteMany({ where: { isDemo: true } });
  await prisma.newsArticle.deleteMany({ where: { isDemo: true } });
  await prisma.event.deleteMany({ where: { isDemo: true } });
  await prisma.educationResource.deleteMany({ where: { isDemo: true } });
  await prisma.glossaryTerm.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.researchStation.deleteMany({ where: { isDemo: true } });
  await prisma.topic.deleteMany({});
  await prisma.researcher.deleteMany({ where: { isDemo: true } });
  await prisma.institution.deleteMany({ where: { isDemo: true } });
  await prisma.region.deleteMany({});
  await prisma.tag.deleteMany({});

  // ---------------------------------------------------------------------------
  // Accounts
  // ---------------------------------------------------------------------------
  const pw = (p: string) => bcrypt.hashSync(p, 10);
  const accounts = [
    { email: process.env.ADMIN_EMAIL ?? 'admin@example.com', pass: process.env.ADMIN_PASSWORD ?? 'ChangeThisPassword123!', role: 'ADMIN' as const, name: 'Portal Administrator' },
    { email: process.env.EDITOR_EMAIL ?? 'editor@example.com', pass: process.env.EDITOR_PASSWORD ?? 'ChangeThisPassword123!', role: 'EDITOR' as const, name: 'Content Editor' },
    { email: process.env.RESEARCHER_EMAIL ?? 'researcher@example.com', pass: process.env.RESEARCHER_PASSWORD ?? 'ChangeThisPassword123!', role: 'RESEARCHER' as const, name: 'Demo Researcher' },
    { email: process.env.USER_EMAIL ?? 'user@example.com', pass: process.env.USER_PASSWORD ?? 'ChangeThisPassword123!', role: 'USER' as const, name: 'Demo User' },
  ];
  const users: Record<string, string> = {};
  for (const a of accounts) {
    const u = await prisma.user.upsert({
      where: { email: a.email.toLowerCase() },
      update: { role: a.role, name: a.name, passwordHash: pw(a.pass) },
      create: {
        email: a.email.toLowerCase(),
        name: a.name,
        role: a.role,
        passwordHash: pw(a.pass),
        emailVerified: new Date(),
        mustChangePassword: a.role === 'ADMIN',
      },
    });
    users[a.role] = u.id;
  }
  console.log(`  ✓ ${accounts.length} accounts`);

  // ---------------------------------------------------------------------------
  // Regions
  // ---------------------------------------------------------------------------
  const regionId: Record<string, string> = {};
  for (const r of REGIONS) {
    const row = await prisma.region.create({
      data: { slug: r.slug, name: r.name, pole: r.pole, summary: r.summary },
    });
    regionId[r.slug] = row.id;
  }
  console.log(`  ✓ ${REGIONS.length} regions`);

  // ---------------------------------------------------------------------------
  // Institutions
  // ---------------------------------------------------------------------------
  const instId: Record<string, string> = {};
  for (const i of INSTITUTIONS) {
    const row = await prisma.institution.create({
      data: {
        slug: i.slug,
        name: i.name,
        acronym: i.acronym,
        country: i.country,
        website: `https://example.org/${i.slug}`,
        description: `${i.name} (${i.acronym}) is a fictional demonstration institution used to illustrate the portal. Its focus areas are ${i.areas.join(', ').toLowerCase()}.`,
        researchAreas: i.areas as unknown as Prisma.InstitutionCreateInput['researchAreas'],
        isDemo: true,
      },
    });
    instId[i.slug] = row.id;
  }
  console.log(`  ✓ ${INSTITUTIONS.length} institutions`);

  // ---------------------------------------------------------------------------
  // Researchers
  // ---------------------------------------------------------------------------
  const researcherId: Record<string, string> = {};
  for (const [idx, r] of RESEARCHERS.entries()) {
    const row = await prisma.researcher.create({
      data: {
        slug: r.slug,
        fullName: r.fullName,
        title: r.title,
        email: `${r.slug}@example.org`,
        bio: `${r.fullName} is a fictional demonstration profile. Their work concerns ${r.areas.join(' and ').toLowerCase()} in the ${r.pole.toLowerCase()} region. No real findings are attributed to this profile.`,
        researchAreas: r.areas as unknown as Prisma.ResearcherCreateInput['researchAreas'],
        primaryPole: r.pole,
        orcid: `0000-0002-${String(1000 + idx).padStart(4, '0')}-000X`.replace('X', String(idx % 10)),
        websiteUrl: `https://example.org/people/${r.slug}`,
        institutionId: instId[r.inst],
        userId: idx === 0 ? users.RESEARCHER : undefined,
        isDemo: true,
      },
    });
    researcherId[r.slug] = row.id;
  }
  console.log(`  ✓ ${RESEARCHERS.length} researchers`);

  // ---------------------------------------------------------------------------
  // Research stations + map locations
  // ---------------------------------------------------------------------------
  for (const s of STATIONS) {
    const st = await prisma.researchStation.create({
      data: {
        slug: s.slug,
        name: s.name,
        country: s.country,
        pole: s.pole,
        status: s.status,
        establishedYear: s.year,
        summerCapacity: 20 + Math.floor(rand() * 60),
        winterCapacity: 8 + Math.floor(rand() * 20),
        description: `${s.name} is a fictional demonstration ${s.status.toLowerCase()} station operated by ${INSTITUTIONS.find((i) => i.slug === s.operator)?.name}.`,
        latitude: s.lat,
        longitude: s.lng,
        regionId: regionId[s.region],
        operatorId: instId[s.operator],
        isDemo: true,
        location: {
          create: {
            name: s.name,
            kind: 'RESEARCH_STATION',
            latitude: s.lat,
            longitude: s.lng,
            regionId: regionId[s.region],
          },
        },
      },
    });
    void st;
  }
  // Observation sites / projects / protected areas
  const extraLocations = [
    { name: 'Fram Strait mooring array', kind: 'OBSERVATION_SITE', lat: 78.8, lng: 0.0, region: 'arctic-ocean', desc: 'Demo year-round ocean mooring line.' },
    { name: 'Utqiaġvik tundra flux tower', kind: 'OBSERVATION_SITE', lat: 71.3, lng: -156.6, region: 'alaska', desc: 'Demo carbon-flux monitoring site.' },
    { name: 'Pine Island glacier front', kind: 'OBSERVATION_SITE', lat: -75.0, lng: -100.0, region: 'east-antarctica', desc: 'Demo ice-front monitoring point.' },
    { name: 'Krill acoustic survey box A', kind: 'RESEARCH_PROJECT', lat: -61.0, lng: -55.0, region: 'antarctic-peninsula', desc: 'Demo acoustic survey grid.' },
    { name: 'Greenland firn traverse', kind: 'RESEARCH_PROJECT', lat: 74.0, lng: -42.0, region: 'greenland', desc: 'Demo overland firn-coring traverse.' },
    { name: 'Ross Sea Marine Protected Area (illustrative)', kind: 'PROTECTED_AREA', lat: -75.0, lng: 175.0, region: 'ross-sea', desc: 'Illustrative marker for the Ross Sea MPA.' },
    { name: 'South Orkney Islands MPA (illustrative)', kind: 'PROTECTED_AREA', lat: -60.6, lng: -45.6, region: 'weddell-sea', desc: 'Illustrative marker for a Southern Ocean MPA.' },
  ] as const;
  for (const l of extraLocations) {
    await prisma.location.create({
      data: {
        name: l.name,
        kind: l.kind,
        latitude: l.lat,
        longitude: l.lng,
        description: l.desc,
        regionId: regionId[l.region],
      },
    });
  }
  console.log(`  ✓ ${STATIONS.length} stations + ${extraLocations.length} map locations`);

  // ---------------------------------------------------------------------------
  // Topics
  // ---------------------------------------------------------------------------
  const topicId: Record<string, string> = {};
  for (const t of TOPIC_TREE) {
    const row = await prisma.topic.create({
      data: {
        slug: t.slug,
        name: t.name,
        category: t.category,
        overview: t.overview,
        keyConcepts: t.keyConcepts,
        discipline: (t.discipline ?? null) as Prisma.TopicCreateInput['discipline'],
        pole: (t.pole ?? null) as Prisma.TopicCreateInput['pole'],
      },
    });
    topicId[t.slug] = row.id;
  }
  console.log(`  ✓ ${TOPIC_TREE.length} topics`);

  // ---------------------------------------------------------------------------
  // Glossary
  // ---------------------------------------------------------------------------
  for (const g of GLOSSARY) {
    await prisma.glossaryTerm.create({
      data: {
        slug: slugify(g.term),
        term: g.term,
        definition: g.definition,
        plainLanguage: g.plain,
        pronunciation: 'pron' in g ? (g as { pron?: string }).pron ?? null : null,
        topicId: topicId[g.topic] ?? null,
      },
    });
  }
  console.log(`  ✓ ${GLOSSARY.length} glossary terms`);

  // ---------------------------------------------------------------------------
  // Tags
  // ---------------------------------------------------------------------------
  const TAG_LABELS = [
    'sea ice', 'albedo', 'ice sheet', 'sea level', 'permafrost', 'krill', 'penguins',
    'polar bears', 'ocean heat', 'ice core', 'remote sensing', 'field campaign',
    'model intercomparison', 'time series', 'Indigenous knowledge', 'policy',
    'autonomous vehicles', 'biogeochemistry', 'paleoclimate', 'snow',
  ];
  const tagId: Record<string, string> = {};
  for (const label of TAG_LABELS) {
    const row = await prisma.tag.create({ data: { slug: slugify(label), label } });
    tagId[label] = row.id;
  }

  // ---------------------------------------------------------------------------
  // Research (20)
  // ---------------------------------------------------------------------------
  const RESEARCH_SEEDS: {
    title: string; discipline: string; pole: string; topics: string[]; type?: string;
    abstract: string; status?: string;
  }[] = [
    { title: 'Multi-decadal decline of Arctic summer sea ice from a demo satellite composite', discipline: 'GLACIOLOGY', pole: 'ARCTIC', topics: ['sea-ice', 'satellites'], abstract: 'A demonstration analysis of a synthetic passive-microwave composite showing a sustained decline in September Arctic sea-ice extent and a shift toward younger, thinner ice. Presented to illustrate repository features; values are illustrative.' },
    { title: 'Basal melt beneath a demo Antarctic ice shelf inferred from mooring data', discipline: 'OCEANOGRAPHY', pole: 'ANTARCTIC', topics: ['ice-shelves', 'ocean-temperature'], abstract: 'Using a synthetic sub-shelf mooring record, this demonstration study attributes elevated basal melt to intrusions of warm deep water. For interface demonstration only.' },
    { title: 'Greenland firn air content changes in a demonstration dataset', discipline: 'GLACIOLOGY', pole: 'ARCTIC', topics: ['snow', 'ice-sheets'], abstract: 'A worked example examining modelled firn air content and its implications for altimetry-derived mass balance. Demo content.' },
    { title: 'Southern Ocean overturning sensitivity in an idealised demo model', discipline: 'OCEANOGRAPHY', pole: 'ANTARCTIC', topics: ['ocean-currents', 'salinity'], abstract: 'An idealised model experiment demonstrating how added meltwater alters the strength and structure of Southern Ocean overturning. Illustrative.' },
    { title: 'Krill swarm distribution and the sea-ice edge: a demonstration survey', discipline: 'MARINE_SCIENCE', pole: 'ANTARCTIC', topics: ['krill', 'marine-ecosystems'], abstract: 'Synthetic acoustic survey data used to demonstrate spatial analysis of krill biomass relative to the ice edge. Not a real survey.' },
    { title: 'Polar bear body condition and ice-free season length (demo analysis)', discipline: 'BIODIVERSITY', pole: 'ARCTIC', topics: ['polar-bears', 'sea-ice'], abstract: 'A demonstration statistical analysis linking a synthetic body-condition index to the modelled length of the ice-free season.' },
    { title: 'Springtime surface ozone depletion events in a demo Arctic record', discipline: 'ATMOSPHERIC_SCIENCE', pole: 'ARCTIC', topics: ['atmospheric-chemistry', 'polar-weather'], abstract: 'Illustrative time-series analysis of synthetic surface ozone showing episodic depletion linked to halogen chemistry over sea ice.' },
    { title: 'A 200-year demonstration ice-core proxy for accumulation', discipline: 'PALEOCLIMATE', pole: 'ANTARCTIC', topics: ['paleoclimate', 'ice-sheets'], abstract: 'A synthetic ice-core proxy record built to demonstrate age–depth modelling and accumulation reconstruction workflows.' },
    { title: 'Mapping crevasse fields with demonstration drone photogrammetry', discipline: 'POLAR_TECHNOLOGY', pole: 'ANTARCTIC', topics: ['drones', 'glaciers'], abstract: 'A methods demonstration of structure-from-motion photogrammetry for crevasse detection using synthetic imagery.' },
    { title: 'Co-producing sea-ice travel safety knowledge: a demonstration framework', discipline: 'HUMAN_INDIGENOUS', pole: 'ARCTIC', topics: ['indigenous-knowledge', 'polar-communities'], abstract: 'A demonstration description of a co-production framework combining community observations with remote sensing for travel safety. No community data included.' },
    { title: 'Permafrost carbon flux at a demo tundra site', discipline: 'CLIMATE', pole: 'ARCTIC', topics: ['carbon-cycle', 'polar-communities'], abstract: 'Synthetic eddy-covariance data used to demonstrate partitioning of net ecosystem exchange at an Arctic tundra site.' },
    { title: 'Antarctic Peninsula glacier speed-up after demo ice-shelf thinning', discipline: 'GLACIOLOGY', pole: 'ANTARCTIC', topics: ['ice-shelves', 'glaciers'], abstract: 'An idealised experiment demonstrating tributary glacier acceleration following prescribed ice-shelf thinning.' },
    { title: 'Under-ice glider survey of a demo Arctic halocline', discipline: 'OCEANOGRAPHY', pole: 'ARCTIC', topics: ['autonomous-vehicles', 'salinity'], abstract: 'A demonstration of processing synthetic glider profiles to map halocline structure beneath sea ice.' },
    { title: 'Emperor penguin colony detection from demo very-high-resolution imagery', discipline: 'BIODIVERSITY', pole: 'ANTARCTIC', topics: ['penguins', 'satellites'], abstract: 'A worked example of guano-stain detection and colony delineation using synthetic satellite imagery.' },
    { title: 'Snow albedo feedback in a regional demo climate model', discipline: 'CLIMATE', pole: 'ARCTIC', topics: ['snow', 'climate-change'], abstract: 'An idealised regional model experiment quantifying the contribution of snow albedo feedback to simulated Arctic warming.' },
    { title: 'Sediment cores and past ice extent in a demo fjord', discipline: 'GEOLOGY', pole: 'ARCTIC', topics: ['sediments', 'paleoclimate'], abstract: 'Synthetic core logs used to demonstrate reconstruction of Holocene glacier fluctuations from ice-rafted debris.' },
    { title: 'Drake Passage opening and Antarctic glaciation: a teaching demonstration', discipline: 'GEOLOGY', pole: 'ANTARCTIC', topics: ['polar-tectonics', 'paleoclimate'], abstract: 'A didactic synthesis, for demonstration, of how tectonic gateway changes are hypothesised to have contributed to Antarctic glaciation.' },
    { title: 'Automatic weather station network gap-filling (demo)', discipline: 'POLAR_TECHNOLOGY', pole: 'ANTARCTIC', topics: ['sensors', 'polar-weather'], abstract: 'A demonstration of machine-learning gap-filling for a synthetic Antarctic AWS network.' },
    { title: 'Whale acoustic presence at a demo Southern Ocean listening station', discipline: 'BIODIVERSITY', pole: 'ANTARCTIC', topics: ['whales', 'marine-ecosystems'], abstract: 'Synthetic passive-acoustic data used to demonstrate seasonal detection of baleen whale calls.' },
    { title: 'Governance of new Arctic shipping routes: a demonstration policy review', discipline: 'HUMAN_INDIGENOUS', pole: 'ARCTIC', topics: ['polar-policy', 'sustainable-development'], type: 'POLICY_DOCUMENT', abstract: 'A demonstration review outlining governance considerations for increased Arctic shipping. Illustrative, not legal advice.' },
  ];

  const researchIds: string[] = [];
  for (const [i, r] of RESEARCH_SEEDS.entries()) {
    const authors = [pick(RESEARCHERS), pick(RESEARCHERS), pick(RESEARCHERS)]
      .filter((v, idx, arr) => arr.findIndex((x) => x.slug === v.slug) === idx);
    const pubDate = daysAgo(30 + i * 47);
    const status = i >= 18 ? (i === 19 ? 'DRAFT' : 'SUBMITTED') : 'PUBLISHED';
    const inst = INSTITUTIONS.find((x) => x.slug === authors[0]!.inst)!;
    const row = await prisma.research.create({
      data: {
        slug: `${slugify(r.title).slice(0, 60)}-${i + 1}`,
        title: r.title,
        abstract: r.abstract,
        description: `## Background\n\nThis is **demonstration content** created to exercise the repository, search, citation and provenance features of the portal. It does not report real measurements or findings.\n\n## Approach\n\nSynthetic data were generated with a fixed random seed and analysed with standard time-series methods.\n\n## Note on provenance\n\nThe portal is a dissemination platform. In a production deployment this record would link to the original publication via its DOI.`,
        type: (r.type ?? 'RESEARCH_PAPER') as Prisma.ResearchCreateInput['type'],
        discipline: r.discipline as Prisma.ResearchCreateInput['discipline'],
        pole: r.pole as Prisma.ResearchCreateInput['pole'],
        language: 'en',
        license: 'CC_BY',
        status: status as Prisma.ResearchCreateInput['status'],
        publicationDate: pubDate,
        publishedAt: status === 'PUBLISHED' ? pubDate : null,
        approvedAt: status === 'PUBLISHED' ? pubDate : null,
        doi: status === 'PUBLISHED' ? `10.5555/demo.${2020 + (i % 6)}.${1000 + i}` : null,
        keywords: r.topics.concat([r.discipline.toLowerCase().replace('_', ' ')]),
        viewCount: Math.floor(rand() * 900) + 20,
        downloadCount: Math.floor(rand() * 200),
        latitude: r.pole === 'ARCTIC' ? 75 + rand() * 10 : -70 - rand() * 8,
        longitude: -60 + rand() * 120,
        isDemo: true,
        institutionId: instId[inst.slug],
        regionId: regionId[pick(REGIONS.filter((x) => x.pole === r.pole || r.pole === 'BIPOLAR')).slug],
        createdById: users.RESEARCHER,
        updatedById: users.EDITOR,
        authors: {
          create: authors.map((a, idx) => ({
            researcherId: researcherId[a.slug]!,
            authorOrder: idx,
            isCorresponding: idx === 0,
          })),
        },
        topics: { create: r.topics.filter((t) => topicId[t]).map((t) => ({ topicId: topicId[t]! })) },
        tags: {
          create: [pick(TAG_LABELS), pick(TAG_LABELS)]
            .filter((v, idx, arr) => arr.indexOf(v) === idx)
            .map((label) => ({ tagId: tagId[label]! })),
        },
      },
    });
    researchIds.push(row.id);
  }
  console.log(`  ✓ ${RESEARCH_SEEDS.length} research records`);

  // ---------------------------------------------------------------------------
  // Datasets (10) — 6 from demo providers + 4 extra
  // ---------------------------------------------------------------------------
  const demoSeriesEntries = Object.values(DEMO_SERIES).map((f) => f());
  const extraSeries = [
    { id: 'arctic-snow-cover-extent', name: 'Arctic snow cover extent (demo)', unit: 'million km²', pole: 'ARCTIC', discipline: 'GLACIOLOGY' },
    { id: 'antarctic-surface-mass-balance', name: 'Antarctic surface mass balance (demo)', unit: 'Gt/yr', pole: 'ANTARCTIC', discipline: 'GLACIOLOGY' },
    { id: 'arctic-ocean-heat-content', name: 'Arctic Ocean heat content anomaly (demo)', unit: 'ZJ', pole: 'ARCTIC', discipline: 'OCEANOGRAPHY' },
    { id: 'southern-annular-mode-index', name: 'Southern Annular Mode index (demo)', unit: 'index', pole: 'ANTARCTIC', discipline: 'ATMOSPHERIC_SCIENCE' },
  ];
  let dsCount = 0;
  for (const s of demoSeriesEntries) {
    const ds = await prisma.dataset.create({
      data: {
        slug: s.id,
        title: s.name,
        description: s.description,
        discipline: (s.pole === 'ARCTIC' ? 'GLACIOLOGY' : 'OCEANOGRAPHY') as Prisma.DatasetCreateInput['discipline'],
        pole: s.pole as Prisma.DatasetCreateInput['pole'],
        unit: s.unit,
        variable: s.name,
        temporalStart: new Date(`${s.points[0]!.t}-01`),
        temporalEnd: new Date(`${s.points[s.points.length - 1]!.t}-01`),
        source: s.source,
        publisher: 'Polar Science Portal (demo generator)',
        methodology: s.methodology,
        license: 'CC0',
        status: 'PUBLISHED',
        isDemo: true,
        lastUpdatedAt: new Date(),
        institutionId: instId[pick(INSTITUTIONS).slug],
        createdById: users.EDITOR,
        versions: {
          create: { version: 'v1', series: s.points as unknown as Prisma.InputJsonValue, rowCount: s.points.length },
        },
      },
    });
    // link to a couple of research records
    await prisma.datasetResearch.createMany({
      data: [researchIds[dsCount % researchIds.length]!, researchIds[(dsCount + 3) % researchIds.length]!]
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((rid) => ({ datasetId: ds.id, researchId: rid })),
      skipDuplicates: true,
    });
    dsCount++;
  }
  for (const s of extraSeries) {
    const base = demoSeriesEntries[dsCount % demoSeriesEntries.length]!;
    await prisma.dataset.create({
      data: {
        slug: s.id,
        title: s.name,
        description: `Illustrative demo dataset (${s.name}). Generated for interface demonstration; not a measurement and not to be cited.`,
        discipline: s.discipline as Prisma.DatasetCreateInput['discipline'],
        pole: s.pole as Prisma.DatasetCreateInput['pole'],
        unit: s.unit,
        variable: s.name,
        temporalStart: daysAgo(3650),
        temporalEnd: new Date(),
        source: 'Demo dataset (generated)',
        publisher: 'Polar Science Portal (demo generator)',
        methodology: 'Synthetic series: seasonal component + trend + bounded noise.',
        license: 'CC0',
        status: 'PUBLISHED',
        isDemo: true,
        lastUpdatedAt: new Date(),
        createdById: users.EDITOR,
        versions: {
          create: {
            version: 'v1',
            series: base.points.map((p) => ({ t: p.t, value: Math.round((p.value * (0.6 + rand())) * 100) / 100 })) as unknown as Prisma.InputJsonValue,
            rowCount: base.points.length,
          },
        },
      },
    });
    dsCount++;
  }
  console.log(`  ✓ ${dsCount} datasets`);

  // ---------------------------------------------------------------------------
  // Media (30)
  // ---------------------------------------------------------------------------
  const MEDIA_KINDS = ['PHOTO', 'PHOTO', 'PHOTO', 'VIDEO', 'AUDIO', 'INFOGRAPHIC'] as const;
  const MEDIA_SUBJECTS = [
    'Sea ice at the floe edge', 'Tabular iceberg', 'Emperor penguin colony', 'Aurora over a research station',
    'Glacier calving front', 'Weddell seal on fast ice', 'Ice core being logged', 'Autonomous glider recovery',
    'Katabatic wind plume', 'Melt ponds on sea ice', 'Field camp on the ice sheet', 'Krill swarm underwater',
    'Meltwater river on Greenland', 'Snow petrel in flight', 'Sediment core on deck', 'Weather balloon launch',
    'Blue ice area', 'Ship in pack ice', 'Sastrugi field', 'Polar bear tracks',
  ];
  let mediaCount = 0;
  for (let i = 0; i < 30; i++) {
    const type = MEDIA_KINDS[i % MEDIA_KINDS.length]!;
    const subject = MEDIA_SUBJECTS[i % MEDIA_SUBJECTS.length]!;
    const pole = i % 2 === 0 ? 'ARCTIC' : 'ANTARCTIC';
    const rr = pick(RESEARCHERS);
    const hue = (i * 37) % 360;
    const thumb = `https://placehold.co/800x600/${hslToHex(hue, 40, 30)}/ffffff.png?text=${encodeURIComponent(subject)}`;
    const m = await prisma.media.create({
      data: {
        slug: `${slugify(subject)}-${i + 1}`,
        title: `${subject} (demo ${type.toLowerCase()})`,
        description: `Demonstration ${type.toLowerCase()} asset: “${subject}”. Placeholder imagery is used; in production this would be a real photograph, clip or graphic with full rights metadata.`,
        type,
        status: 'PUBLISHED',
        creator: rr.fullName,
        copyright: `© ${rr.fullName} / ${INSTITUTIONS.find((x) => x.slug === rr.inst)?.acronym}`,
        license: pick(['CC_BY', 'CC_BY_NC', 'CC_BY_SA'] as const),
        attribution: `${rr.fullName}, ${INSTITUTIONS.find((x) => x.slug === rr.inst)?.name} (demo)`,
        capturedAt: daysAgo(20 + i * 15),
        locationName: pick(REGIONS.filter((x) => x.pole === pole)).name,
        latitude: pole === 'ARCTIC' ? 74 + rand() * 12 : -66 - rand() * 10,
        longitude: -80 + rand() * 160,
        thumbnailUrl: thumb,
        externalUrl: type === 'VIDEO' ? 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' : null,
        transcript:
          type === 'AUDIO'
            ? 'Demo transcript: [ambient wind] Narrator: This recording is a placeholder used to demonstrate the audio player and transcript panel.'
            : type === 'VIDEO'
              ? 'Demo captions/transcript placeholder for the video viewer.'
              : null,
        altText: `${subject} — demonstration ${type.toLowerCase()} placeholder.`,
        durationSec: type === 'VIDEO' ? 90 + i : type === 'AUDIO' ? 120 + i : null,
        regionId: regionId[pick(REGIONS.filter((x) => x.pole === pole)).slug],
        institutionId: instId[rr.inst],
        createdById: users.EDITOR,
        isDemo: true,
        topics: {
          create: [pick(TOPIC_TREE), pick(TOPIC_TREE)]
            .filter((v, idx, a) => a.findIndex((x) => x.slug === v.slug) === idx)
            .map((t) => ({ topicId: topicId[t.slug]! })),
        },
      },
    });
    mediaCount++;
    void m;
  }
  console.log(`  ✓ ${mediaCount} media assets`);

  // ---------------------------------------------------------------------------
  // News (10)
  // ---------------------------------------------------------------------------
  const NEWS_SEEDS: { title: string; category: string; sub: string }[] = [
    { title: 'Portal launches with demonstration polar science catalogue', category: 'RESEARCH', sub: 'A walkthrough of the repository, data dashboard and media library.' },
    { title: 'Demo sea-ice dashboard adds Antarctic series', category: 'CLIMATE', sub: 'Southern Hemisphere extent now shown alongside the Arctic.' },
    { title: 'Field season wrap-up: the demo Weddell expedition returns', category: 'EXPEDITIONS', sub: 'Highlights from the illustrative expedition journal.' },
    { title: 'Explainer refresh: what sea ice extent actually measures', category: 'EDUCATION', sub: 'New plain-language explainer and quiz added.' },
    { title: 'How the portal handles data provenance', category: 'POLICY', sub: 'Every record now carries source, licence and methodology.' },
    { title: 'Under-ice gliders: a demo methods feature', category: 'TECHNOLOGY', sub: 'Processing synthetic glider profiles for teaching.' },
    { title: 'Krill and the ice edge: demo survey visualised', category: 'BIODIVERSITY', sub: 'An interactive look at a synthetic acoustic survey.' },
    { title: 'Adding Indigenous knowledge co-production to the platform model', category: 'POLICY', sub: 'How the data model represents co-produced knowledge.' },
    { title: 'Accessibility pass: charts get textual summaries', category: 'EDUCATION', sub: 'Every chart now has a data table and a written summary.' },
    { title: 'Roadmap: connecting real scientific data providers', category: 'RESEARCH', sub: 'The provider abstraction and what comes next.' },
  ];
  for (const [i, n] of NEWS_SEEDS.entries()) {
    await prisma.newsArticle.create({
      data: {
        slug: `${slugify(n.title).slice(0, 60)}-${i + 1}`,
        title: n.title,
        subtitle: n.sub,
        heroImageUrl: `https://placehold.co/1200x675/1f3350/ffffff.png?text=${encodeURIComponent(n.category)}`,
        body: `${n.sub}\n\n## Overview\n\nThis is **demonstration news content**. It exists to show the newsroom layout, categories, related-article logic and reading-time estimate.\n\n## Details\n\n- Categories filter the newsroom.\n- Articles support Markdown, references and tags.\n- The rich-text body is stored as Markdown and rendered safely.\n\n## References\n\nSee the [data policy](/about/data-policy) for how the portal treats sources.`,
        category: n.category as Prisma.NewsArticleCreateInput['category'],
        status: 'PUBLISHED',
        publishedAt: daysAgo(3 + i * 9),
        references: ['https://example.org/demo-reference-1', 'Polar Science Portal internal note (demo)'],
        viewCount: Math.floor(rand() * 500),
        isDemo: true,
        authorId: users.EDITOR,
        tags: {
          create: [pick(TAG_LABELS)].map((label) => ({ tagId: tagId[label]! })),
        },
      },
    });
  }
  console.log(`  ✓ ${NEWS_SEEDS.length} news articles`);

  // ---------------------------------------------------------------------------
  // Events (8)
  // ---------------------------------------------------------------------------
  const EVENT_SEEDS: { title: string; type: string; mode: string; inDays: number }[] = [
    { title: 'Polar Data Dissemination Webinar', type: 'WEBINAR', mode: 'ONLINE', inDays: 7 },
    { title: 'Antarctic Sea Ice Workshop (demo)', type: 'WORKSHOP', mode: 'HYBRID', inDays: 21 },
    { title: 'Arctic Science Summit — demonstration programme', type: 'CONFERENCE', mode: 'IN_PERSON', inDays: 45 },
    { title: 'Schools Polar Day', type: 'SCHOOL_PROGRAM', mode: 'ONLINE', inDays: 14 },
    { title: 'Ice & Ocean Public Lecture', type: 'PUBLIC_LECTURE', mode: 'HYBRID', inDays: 30 },
    { title: 'Museum Exhibition: Life at the Poles (demo)', type: 'EXHIBITION', mode: 'IN_PERSON', inDays: 60 },
    { title: 'Autonomous Platforms in Polar Oceans', type: 'WORKSHOP', mode: 'ONLINE', inDays: -20 },
    { title: 'Polar Careers Q&A', type: 'WEBINAR', mode: 'ONLINE', inDays: -5 },
  ];
  for (const [i, e] of EVENT_SEEDS.entries()) {
    const start = e.inDays >= 0 ? daysAhead(e.inDays) : daysAgo(-e.inDays);
    await prisma.event.create({
      data: {
        slug: `${slugify(e.title).slice(0, 60)}-${i + 1}`,
        title: e.title,
        description: `${e.title} is a **demonstration event**.\n\n## What to expect\n\nThis entry shows the event detail layout, registration flow, capacity handling and calendar-style browsing on the events page.\n\n## Programme\n\n- Welcome and context\n- Demonstration talks\n- Discussion`,
        type: e.type as Prisma.EventCreateInput['type'],
        mode: e.mode as Prisma.EventCreateInput['mode'],
        status: 'PUBLISHED',
        startAt: start,
        endAt: new Date(start.getTime() + 2 * 3600_000),
        timezone: 'UTC',
        locationName: e.mode === 'ONLINE' ? null : pick(['Tromsø', 'Christchurch', 'Cambridge', 'Hobart', 'Bremerhaven']),
        organizer: pick(INSTITUTIONS).name,
        registrationStatus: e.inDays < 0 ? 'CLOSED' : i % 4 === 0 ? 'OPEN' : 'OPEN',
        capacity: e.mode === 'IN_PERSON' ? 120 : 500,
        contactEmail: 'events@example.org',
        imageUrl: `https://placehold.co/1200x675/183a2a/ffffff.png?text=${encodeURIComponent(e.type)}`,
        isDemo: true,
        createdById: users.EDITOR,
      },
    });
  }
  console.log(`  ✓ ${EVENT_SEEDS.length} events`);

  // ---------------------------------------------------------------------------
  // Expeditions (5) with members + journal updates
  // ---------------------------------------------------------------------------
  const EXPEDITION_SEEDS: { name: string; number: string; region: string; vessel: string; days: number; topics: string[] }[] = [
    { name: 'Weddell Sea Ice–Ocean Campaign (demo)', number: 'WSIO-01', region: 'weddell-sea', vessel: 'RV Demo Polaris', days: 24, topics: ['sea-ice', 'ocean-currents'] },
    { name: 'Fram Strait Gateway Cruise (demo)', number: 'FSG-14', region: 'arctic-ocean', vessel: 'RV Demo Nansen', days: 20, topics: ['ocean-temperature', 'salinity'] },
    { name: 'Antarctic Peninsula Glacier Survey (demo)', number: 'APG-07', region: 'antarctic-peninsula', vessel: 'RV Demo Shackleton', days: 18, topics: ['glaciers', 'ice-shelves'] },
    { name: 'Greenland Firn Traverse (demo)', number: 'GFT-03', region: 'greenland', vessel: 'Overland traverse', days: 30, topics: ['snow', 'ice-sheets'] },
    { name: 'Ross Sea Ecosystem Expedition (demo)', number: 'RSE-11', region: 'ross-sea', vessel: 'RV Demo Aurora', days: 26, topics: ['krill', 'marine-ecosystems'] },
  ];
  for (const [i, x] of EXPEDITION_SEEDS.entries()) {
    const start = daysAgo(120 + i * 30);
    const members = [pick(RESEARCHERS), pick(RESEARCHERS), pick(RESEARCHERS)]
      .filter((v, idx, a) => a.findIndex((y) => y.slug === v.slug) === idx);
    const exp = await prisma.expedition.create({
      data: {
        slug: `${slugify(x.name).slice(0, 60)}-${i + 1}`,
        name: x.name,
        expeditionNumber: x.number,
        summary: `A demonstration ${x.days}-day field campaign in the ${REGIONS.find((r) => r.slug === x.region)?.name} aboard ${x.vessel}.`,
        objectives: `## Objectives\n\n- Demonstrate the expedition detail page and journal timeline\n- Show team, route and research-topic metadata\n- Illustrate day-by-day live updates`,
        researchTopics: x.topics.map((t) => TOPIC_TREE.find((tt) => tt.slug === t)?.name ?? t),
        vessel: x.vessel,
        startDate: start,
        endDate: new Date(start.getTime() + x.days * 86_400_000),
        status: 'PUBLISHED',
        heroImageUrl: `https://placehold.co/1200x600/12293f/ffffff.png?text=${encodeURIComponent(x.number)}`,
        isDemo: true,
        regionId: regionId[x.region],
        institutionId: instId[members[0]!.inst],
        members: {
          create: members.map((m, idx) => ({
            researcherId: researcherId[m.slug]!,
            role: idx === 0 ? 'Lead Scientist' : 'Scientist',
          })),
        },
      },
    });
    const milestones = [
      { day: 1, title: 'Departure', body: 'Lines cast off. Safety briefings complete; first CTD station planned for tomorrow.' },
      { day: 5, title: 'First sampling', body: 'Completed the first transect of stations. Equipment performing well in demo conditions.' },
      { day: 12, title: 'Ice-core / core collection', body: 'Recovered the planned cores. Preliminary logging underway in the ship lab.' },
      { day: 20, title: 'Wildlife survey', body: 'Observers logged a synthetic wildlife survey along the ice edge for the demonstration dataset.' },
    ];
    for (const ms of milestones.filter((m) => m.day <= x.days)) {
      await prisma.expeditionUpdate.create({
        data: {
          expeditionId: exp.id,
          dayNumber: ms.day,
          title: ms.title,
          body: `${ms.body}\n\n_Demonstration journal entry._`,
          postedAt: new Date(start.getTime() + ms.day * 86_400_000),
          locationName: REGIONS.find((r) => r.slug === x.region)?.name,
          latitude: (REGIONS.find((r) => r.slug === x.region)?.pole === 'ARCTIC' ? 76 : -70) + (rand() - 0.5) * 4,
          longitude: -40 + rand() * 80,
          imageUrls: [`https://placehold.co/600x400/12293f/ffffff.png?text=Day+${ms.day}`],
          authorId: users.RESEARCHER,
        },
      });
    }
  }
  console.log(`  ✓ ${EXPEDITION_SEEDS.length} expeditions with journals`);

  // ---------------------------------------------------------------------------
  // Education (15) + quizzes (3)
  // ---------------------------------------------------------------------------
  const EXPLAINERS = [
    { title: 'What is sea ice?', topic: 'sea-ice', q: 'Why is sea ice important?' },
    { title: 'Why are the polar regions important?', topic: 'climate-change', q: '' },
    { title: 'How do glaciers form?', topic: 'glaciers', q: '' },
    { title: 'Why is Antarctica so cold?', topic: 'polar-weather', q: '' },
    { title: 'What happens when sea ice melts?', topic: 'sea-ice', q: '' },
    { title: 'How do scientists study the polar regions?', topic: 'satellites', q: '' },
    { title: 'What is albedo and why does it matter?', topic: 'snow', q: '' },
    { title: 'What lives under the sea ice?', topic: 'marine-ecosystems', q: '' },
  ];
  const eduIds: string[] = [];
  for (const [i, e] of EXPLAINERS.entries()) {
    const row = await prisma.educationResource.create({
      data: {
        slug: `${slugify(e.title)}-${i + 1}`,
        title: e.title,
        summary: `A short, plain-language explainer: ${e.title}`,
        body: `## ${e.title}\n\nThis is a demonstration explainer written to be understandable without a science background.\n\n- Key idea one, in simple terms.\n- Key idea two, with an everyday comparison.\n- Key idea three, and why it matters for people.\n\n> Tip: hover scientific terms elsewhere on the site for a plain-language definition.`,
        type: 'EXPLAINER',
        status: 'PUBLISHED',
        ageGroup: 'All ages',
        durationMin: 5,
        plainLanguage: 'The short version: this topic matters because the poles help keep the whole planet’s climate steady.',
        topicId: topicId[e.topic] ?? null,
        isDemo: true,
        createdById: users.EDITOR,
      },
    });
    eduIds.push(row.id);
  }
  const LESSONS = [
    { title: 'Build a virtual glacier (lesson plan)', age: 'Ages 11–14', mins: 60 },
    { title: 'Sea ice and albedo investigation', age: 'Ages 14–16', mins: 90 },
    { title: 'Mapping a research station', age: 'Ages 9–11', mins: 45 },
    { title: 'Polar food webs card sort', age: 'Ages 11–14', mins: 50 },
  ];
  for (const [i, l] of LESSONS.entries()) {
    await prisma.educationResource.create({
      data: {
        slug: `${slugify(l.title)}-${i + 1}`,
        title: l.title,
        summary: `Classroom-ready demonstration lesson plan: ${l.title}.`,
        body: `## Overview\n\nDemonstration lesson plan.\n\n## Instructions\n\n1. Introduce the concept (10 min)\n2. Group activity (25 min)\n3. Share findings (10 min)\n4. Wrap-up discussion (10 min)`,
        type: 'LESSON_PLAN',
        status: 'PUBLISHED',
        ageGroup: l.age,
        durationMin: l.mins,
        objectives: ['Describe the core concept', 'Carry out a simple investigation', 'Interpret a result'],
        materials: ['Printed worksheet', 'Ice cubes / trays', 'Thermometer', 'Coloured card'],
        assessment: 'Exit ticket: students write one sentence explaining what they found and one question they still have.',
        topicId: topicId[pick(TOPIC_TREE).slug] ?? null,
        isDemo: true,
        createdById: users.EDITOR,
      },
    });
  }
  const RESOURCES = [
    { title: 'Student guide to reading a sea-ice chart', type: 'STUDENT_RESOURCE' },
    { title: 'Teacher briefing: polar amplification', type: 'TEACHER_RESOURCE' },
    { title: 'Interactive: temperature comparison', type: 'INTERACTIVE_ACTIVITY' },
  ];
  for (const [i, r] of RESOURCES.entries()) {
    await prisma.educationResource.create({
      data: {
        slug: `${slugify(r.title)}-${i + 1}`,
        title: r.title,
        summary: `Demonstration ${r.type.replace('_', ' ').toLowerCase()}: ${r.title}.`,
        body: `## ${r.title}\n\nDemonstration resource content. See the [interactive activities](/education/activities) for hands-on models.`,
        type: r.type as Prisma.EducationResourceCreateInput['type'],
        status: 'PUBLISHED',
        ageGroup: 'Ages 14+',
        isDemo: true,
        createdById: users.EDITOR,
      },
    });
  }
  console.log(`  ✓ ${EXPLAINERS.length + LESSONS.length + RESOURCES.length} education resources`);

  const QUIZZES = [
    {
      slug: 'sea-ice-basics', title: 'Sea ice basics', category: 'Ice & Glaciers',
      questions: [
        { p: 'Sea ice forms from…', opts: [['seawater freezing', true], ['snow compacting', false], ['glaciers reaching the sea', false]], ex: 'Sea ice is frozen seawater; glacier ice comes from compacted snow on land.' },
        { p: '“Sea ice extent” counts ocean areas with at least…', opts: [['15% ice cover', true], ['50% ice cover', false], ['any ice at all', false]], ex: 'The standard threshold for extent is 15% concentration.' },
        { p: 'Multi-year ice is generally…', opts: [['thicker and less salty than first-year ice', true], ['thinner than first-year ice', false], ['identical to first-year ice', false]], ex: 'Multi-year ice has survived a melt season, losing brine and thickening.' },
      ],
    },
    {
      slug: 'polar-climate', title: 'Polar climate & feedbacks', category: 'Climate & Atmosphere',
      questions: [
        { p: 'Polar amplification means the poles warm…', opts: [['faster than the global average', true], ['slower than the global average', false], ['at exactly the global average', false]], ex: 'Feedbacks like ice–albedo accelerate polar warming.' },
        { p: 'The ice–albedo feedback is a…', opts: [['positive (amplifying) feedback', true], ['negative (damping) feedback', false], ['neutral process', false]], ex: 'Less ice → darker surface → more absorbed sunlight → more melt.' },
        { p: 'Thawing permafrost can release…', opts: [['carbon dioxide and methane', true], ['only oxygen', false], ['nothing of climate relevance', false]], ex: 'Permafrost stores large amounts of organic carbon.' },
      ],
    },
    {
      slug: 'antarctic-life', title: 'Life in the Antarctic', category: 'Biodiversity',
      questions: [
        { p: 'The keystone species of the Southern Ocean food web is…', opts: [['Antarctic krill', true], ['cod', false], ['seaweed', false]], ex: 'Krill link primary producers to whales, seals, penguins and fish.' },
        { p: 'How many native flowering plant species does Antarctica have?', opts: [['Two', true], ['Zero', false], ['Over one hundred', false]], ex: 'Antarctic hair grass and Antarctic pearlwort.' },
        { p: 'Emperor penguins breed…', opts: [['on sea ice during winter', true], ['in trees', false], ['only in summer on rock', false]], ex: 'They are uniquely adapted to incubate through the Antarctic winter on ice.' },
      ],
    },
  ];
  for (const [qi, quiz] of QUIZZES.entries()) {
    await prisma.quiz.create({
      data: {
        slug: quiz.slug,
        title: quiz.title,
        description: `A short demonstration quiz on ${quiz.title.toLowerCase()}. No account needed.`,
        category: quiz.category,
        isPublished: true,
        resourceId: eduIds[qi] ?? null,
        questions: {
          create: quiz.questions.map((q, i) => ({
            prompt: q.p,
            explanation: q.ex,
            position: i,
            options: {
              create: q.opts.map(([label, isCorrect], oi) => ({
                label: String(label),
                isCorrect: Boolean(isCorrect),
                position: oi,
              })),
            },
          })),
        },
      },
    });
  }
  console.log(`  ✓ ${QUIZZES.length} quizzes`);

  // ---------------------------------------------------------------------------
  // A couple of pending submissions to demonstrate the review queue
  // ---------------------------------------------------------------------------
  await prisma.submission.create({
    data: {
      kind: 'RESEARCH',
      status: 'SUBMITTED',
      title: 'Proposed: Snow grain-size retrieval from a demo hyperspectral sensor',
      authorId: users.RESEARCHER,
      payload: {
        title: 'Snow grain-size retrieval from a demo hyperspectral sensor',
        abstract: 'A demonstration submission awaiting editorial review. Proposes a retrieval method for snow grain size from synthetic hyperspectral data.',
        type: 'RESEARCH_PAPER',
        discipline: 'GLACIOLOGY',
        pole: 'ARCTIC',
        keywords: ['snow', 'remote sensing', 'albedo'],
      },
      reviews: { create: { decision: 'PENDING' } },
    },
  });
  await prisma.submission.create({
    data: {
      kind: 'DATASET',
      status: 'UNDER_REVIEW',
      title: 'Proposed dataset: demo tide-gauge compilation',
      authorId: users.RESEARCHER,
      payload: { title: 'Demo tide-gauge compilation', discipline: 'OCEANOGRAPHY', pole: 'ANTARCTIC' },
      reviews: { create: { decision: 'PENDING' } },
    },
  });

  // Newsletter sample
  await prisma.newsletterSubscriber.upsert({
    where: { email: 'subscriber@example.org' },
    update: {},
    create: {
      email: 'subscriber@example.org',
      token: 'demo-confirm-token',
      confirmedAt: new Date(),
      source: 'seed',
    },
  });

  console.log('✅  Seed complete.\n');
  console.log('   Accounts (password from .env, default ChangeThisPassword123!):');
  for (const a of accounts) console.log(`     ${a.role.padEnd(11)} ${a.email}`);
}

/** Cheap HSL→hex for placeholder image colours. */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `${f(0)}${f(8)}${f(4)}`;
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
