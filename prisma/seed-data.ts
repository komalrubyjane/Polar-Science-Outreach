/**
 * Static demo content for the seed script.
 *
 * IMPORTANT: institutions, researchers and datasets here are FICTIONAL and used
 * only to demonstrate the platform. No invented findings are attributed to real
 * people or organisations. Everything is flagged `isDemo: true` in the database.
 */

export const REGIONS = [
  { slug: 'arctic-ocean', name: 'Arctic Ocean', pole: 'ARCTIC', summary: 'The ice-covered ocean basin around the North Pole.' },
  { slug: 'greenland', name: 'Greenland', pole: 'ARCTIC', summary: 'The world’s largest island, ~80% ice sheet.' },
  { slug: 'svalbard', name: 'Svalbard', pole: 'ARCTIC', summary: 'Norwegian high-Arctic archipelago.' },
  { slug: 'alaska', name: 'Alaska', pole: 'ARCTIC', summary: 'US Arctic and sub-Arctic territory.' },
  { slug: 'northern-canada', name: 'Northern Canada', pole: 'ARCTIC', summary: 'Canadian Arctic Archipelago and mainland north.' },
  { slug: 'nordic-arctic', name: 'Nordic Arctic', pole: 'ARCTIC', summary: 'Northern Fennoscandia and the Barents region.' },
  { slug: 'antarctic-peninsula', name: 'Antarctic Peninsula', pole: 'ANTARCTIC', summary: 'The fastest-warming part of Antarctica.' },
  { slug: 'ross-sea', name: 'Ross Sea', pole: 'ANTARCTIC', summary: 'Deep bay of the Southern Ocean; large marine protected area.' },
  { slug: 'weddell-sea', name: 'Weddell Sea', pole: 'ANTARCTIC', summary: 'Sea south of the Atlantic; major bottom-water formation.' },
  { slug: 'east-antarctica', name: 'East Antarctica', pole: 'ANTARCTIC', summary: 'The vast, high, cold interior ice sheet.' },
  { slug: 'southern-ocean', name: 'Southern Ocean', pole: 'ANTARCTIC', summary: 'The ocean encircling Antarctica.' },
] as const;

export const INSTITUTIONS = [
  { slug: 'northern-cryosphere-institute', name: 'Northern Cryosphere Institute', acronym: 'NCI', country: 'Norway', areas: ['GLACIOLOGY', 'CLIMATE'] },
  { slug: 'austral-polar-research-council', name: 'Austral Polar Research Council', acronym: 'APRC', country: 'New Zealand', areas: ['OCEANOGRAPHY', 'MARINE_SCIENCE'] },
  { slug: 'boreal-university-of-tromsdal', name: 'Boreal University of Tromsdal', acronym: 'BUT', country: 'Norway', areas: ['BIODIVERSITY', 'ECOLOGY'] },
  { slug: 'polar-atmosphere-observatory', name: 'Polar Atmosphere Observatory', acronym: 'PAO', country: 'Canada', areas: ['ATMOSPHERIC_SCIENCE', 'CLIMATE'] },
  { slug: 'southern-ocean-consortium', name: 'Southern Ocean Consortium', acronym: 'SOC', country: 'Australia', areas: ['OCEANOGRAPHY', 'MARINE_SCIENCE'] },
  { slug: 'high-latitude-geoscience-centre', name: 'High-Latitude Geoscience Centre', acronym: 'HLGC', country: 'Germany', areas: ['GEOLOGY', 'PALEOCLIMATE'] },
  { slug: 'arctic-peoples-knowledge-network', name: 'Arctic Peoples Knowledge Network', acronym: 'APKN', country: 'Canada', areas: ['HUMAN_INDIGENOUS'] },
  { slug: 'polar-robotics-lab', name: 'Polar Robotics Lab', acronym: 'PRL', country: 'United States', areas: ['POLAR_TECHNOLOGY'] },
] as const;

export const RESEARCHERS = [
  { slug: 'aila-nkasi', fullName: 'Dr Aila Nkasi', title: 'Glaciologist', areas: ['GLACIOLOGY', 'CLIMATE'], pole: 'ARCTIC', inst: 'northern-cryosphere-institute' },
  { slug: 'bjorn-halvorsen', fullName: 'Prof. Bjørn Halvorsen', title: 'Physical oceanographer', areas: ['OCEANOGRAPHY'], pole: 'ANTARCTIC', inst: 'southern-ocean-consortium' },
  { slug: 'mei-tanaka', fullName: 'Dr Mei Tanaka', title: 'Sea-ice physicist', areas: ['GLACIOLOGY', 'CLIMATE'], pole: 'ARCTIC', inst: 'northern-cryosphere-institute' },
  { slug: 'carlos-arriaga', fullName: 'Dr Carlos Arriaga', title: 'Marine ecologist', areas: ['MARINE_SCIENCE', 'BIODIVERSITY'], pole: 'ANTARCTIC', inst: 'austral-polar-research-council' },
  { slug: 'freya-lindqvist', fullName: 'Prof. Freya Lindqvist', title: 'Atmospheric scientist', areas: ['ATMOSPHERIC_SCIENCE'], pole: 'ARCTIC', inst: 'polar-atmosphere-observatory' },
  { slug: 'niels-eriksen', fullName: 'Dr Niels Eriksen', title: 'Palaeoclimatologist', areas: ['PALEOCLIMATE', 'GEOLOGY'], pole: 'ANTARCTIC', inst: 'high-latitude-geoscience-centre' },
  { slug: 'sana-qadir', fullName: 'Dr Sana Qadir', title: 'Polar biologist', areas: ['BIODIVERSITY', 'ECOLOGY'], pole: 'ANTARCTIC', inst: 'boreal-university-of-tromsdal' },
  { slug: 'tuktu-avaala', fullName: 'Tuktu Avaala', title: 'Indigenous knowledge researcher', areas: ['HUMAN_INDIGENOUS'], pole: 'ARCTIC', inst: 'arctic-peoples-knowledge-network' },
  { slug: 'olivia-brandt', fullName: 'Dr Olivia Brandt', title: 'Robotics engineer', areas: ['POLAR_TECHNOLOGY'], pole: 'ANTARCTIC', inst: 'polar-robotics-lab' },
  { slug: 'rahul-menon', fullName: 'Dr Rahul Menon', title: 'Climate modeller', areas: ['CLIMATE', 'ATMOSPHERIC_SCIENCE'], pole: 'BIPOLAR', inst: 'polar-atmosphere-observatory' },
  { slug: 'greta-solberg', fullName: 'Prof. Greta Solberg', title: 'Ice-sheet modeller', areas: ['GLACIOLOGY'], pole: 'ARCTIC', inst: 'northern-cryosphere-institute' },
  { slug: 'kofi-asante', fullName: 'Dr Kofi Asante', title: 'Biogeochemist', areas: ['OCEANOGRAPHY', 'MARINE_SCIENCE'], pole: 'ANTARCTIC', inst: 'southern-ocean-consortium' },
] as const;

export const STATIONS = [
  { slug: 'aurora-borealis-station', name: 'Aurora Borealis Station', country: 'Norway', pole: 'ARCTIC', status: 'ACTIVE', lat: 78.923, lng: 11.921, region: 'svalbard', operator: 'northern-cryosphere-institute', year: 1968 },
  { slug: 'north-water-observatory', name: 'North Water Observatory', country: 'Canada', pole: 'ARCTIC', status: 'SEASONAL', lat: 76.25, lng: -73.0, region: 'northern-canada', operator: 'polar-atmosphere-observatory', year: 1994 },
  { slug: 'greenland-summit-camp', name: 'Greenland Summit Camp', country: 'Denmark', pole: 'ARCTIC', status: 'ACTIVE', lat: 72.58, lng: -38.46, region: 'greenland', operator: 'northern-cryosphere-institute', year: 1989 },
  { slug: 'weddell-ice-base', name: 'Weddell Ice Base', country: 'Germany', pole: 'ANTARCTIC', status: 'ACTIVE', lat: -70.65, lng: -8.25, region: 'weddell-sea', operator: 'high-latitude-geoscience-centre', year: 1981 },
  { slug: 'ross-gateway-station', name: 'Ross Gateway Station', country: 'New Zealand', pole: 'ANTARCTIC', status: 'ACTIVE', lat: -77.85, lng: 166.67, region: 'ross-sea', operator: 'austral-polar-research-council', year: 1957 },
  { slug: 'peninsula-field-hut', name: 'Peninsula Field Hut', country: 'Australia', pole: 'ANTARCTIC', status: 'SEASONAL', lat: -64.77, lng: -64.05, region: 'antarctic-peninsula', operator: 'southern-ocean-consortium', year: 2003 },
  { slug: 'dome-concordia-annex', name: 'Dome Concordia Annex', country: 'Germany', pole: 'ANTARCTIC', status: 'ACTIVE', lat: -75.1, lng: 123.35, region: 'east-antarctica', operator: 'high-latitude-geoscience-centre', year: 2005 },
  { slug: 'barents-coastal-lab', name: 'Barents Coastal Lab', country: 'Norway', pole: 'ARCTIC', status: 'ACTIVE', lat: 70.0, lng: 25.0, region: 'nordic-arctic', operator: 'boreal-university-of-tromsdal', year: 1975 },
] as const;

export const TOPIC_TREE: {
  slug: string;
  name: string;
  category: string;
  discipline?: string;
  pole?: string;
  overview: string;
  keyConcepts: string[];
}[] = [
  { slug: 'climate-change', name: 'Climate change', category: 'Climate & Atmosphere', discipline: 'CLIMATE', overview: 'The polar regions are warming faster than the global average, a phenomenon called polar amplification. Feedbacks involving sea ice, snow and clouds accelerate the change.', keyConcepts: ['Polar amplification', 'Ice–albedo feedback', 'Permafrost carbon', 'Teleconnections'] },
  { slug: 'atmospheric-chemistry', name: 'Atmospheric chemistry', category: 'Climate & Atmosphere', discipline: 'ATMOSPHERIC_SCIENCE', overview: 'Polar atmospheres host unique chemistry, including stratospheric ozone depletion and springtime surface ozone and mercury depletion events.', keyConcepts: ['Ozone hole', 'Polar stratospheric clouds', 'Bromine explosion', 'Aerosols'] },
  { slug: 'polar-weather', name: 'Polar weather', category: 'Climate & Atmosphere', discipline: 'ATMOSPHERIC_SCIENCE', overview: 'Katabatic winds, polar lows and atmospheric rivers shape day-to-day conditions and can drive rapid melt events.', keyConcepts: ['Katabatic wind', 'Polar low', 'Atmospheric river', 'Temperature inversion'] },
  { slug: 'carbon-cycle', name: 'Carbon cycle', category: 'Climate & Atmosphere', discipline: 'CLIMATE', overview: 'Polar oceans absorb carbon dioxide while thawing permafrost can release it. The net balance matters for future warming.', keyConcepts: ['Solubility pump', 'Biological pump', 'Permafrost thaw', 'Methane'] },
  { slug: 'sea-ice', name: 'Sea ice', category: 'Ice & Glaciers', discipline: 'GLACIOLOGY', overview: 'Frozen seawater that forms, drifts and melts each year. Arctic summer sea ice has declined markedly over recent decades.', keyConcepts: ['Extent vs area', 'First-year vs multi-year ice', 'Leads and polynyas', 'Ice–ocean albedo'] },
  { slug: 'ice-sheets', name: 'Ice sheets', category: 'Ice & Glaciers', discipline: 'GLACIOLOGY', overview: 'The Greenland and Antarctic ice sheets store enough water to raise global sea level by tens of metres. Their mass balance is closely watched.', keyConcepts: ['Mass balance', 'Surface melt', 'Ice discharge', 'Grounding line'] },
  { slug: 'glaciers', name: 'Glaciers', category: 'Ice & Glaciers', discipline: 'GLACIOLOGY', overview: 'Rivers of ice that flow downhill under their own weight. Most mountain glaciers in polar regions are losing mass.', keyConcepts: ['Accumulation zone', 'Ablation zone', 'Calving', 'Surge'] },
  { slug: 'ice-shelves', name: 'Ice shelves', category: 'Ice & Glaciers', discipline: 'GLACIOLOGY', pole: 'ANTARCTIC', overview: 'Floating extensions of ice sheets that buttress the ice behind them. Their thinning or collapse can speed up glacier flow.', keyConcepts: ['Buttressing', 'Basal melt', 'Hydrofracture', 'Collapse'] },
  { slug: 'snow', name: 'Snow', category: 'Ice & Glaciers', discipline: 'GLACIOLOGY', overview: 'Snow cover controls surface reflectivity, insulates the ground and feeds glaciers.', keyConcepts: ['Albedo', 'Snow water equivalent', 'Firn', 'Metamorphism'] },
  { slug: 'ocean-currents', name: 'Ocean currents', category: 'Ocean', discipline: 'OCEANOGRAPHY', overview: 'Polar oceans drive the global overturning circulation by forming cold, dense water that sinks and spreads worldwide.', keyConcepts: ['Overturning circulation', 'Deep water formation', 'Gyres', 'Ekman transport'] },
  { slug: 'ocean-temperature', name: 'Ocean temperature', category: 'Ocean', discipline: 'OCEANOGRAPHY', overview: 'Warming subsurface water reaches glacier fronts and ice-shelf cavities, driving melt from below.', keyConcepts: ['Warm deep water', 'Thermocline', 'Ocean heat content', 'Basal melt'] },
  { slug: 'salinity', name: 'Salinity', category: 'Ocean', discipline: 'OCEANOGRAPHY', overview: 'Freshwater from melting ice lowers salinity and can slow local overturning and stratify the surface ocean.', keyConcepts: ['Halocline', 'Freshwater flux', 'Brine rejection', 'Stratification'] },
  { slug: 'marine-ecosystems', name: 'Marine ecosystems', category: 'Ocean', discipline: 'MARINE_SCIENCE', overview: 'Polar marine food webs are short and productive, often resting on ice algae and krill.', keyConcepts: ['Ice algae', 'Krill', 'Trophic cascade', 'Phenology'] },
  { slug: 'penguins', name: 'Penguins', category: 'Biodiversity', discipline: 'BIODIVERSITY', pole: 'ANTARCTIC', overview: 'Flightless seabirds of the Southern Hemisphere. Several species depend on sea ice or ice-free ground for breeding.', keyConcepts: ['Colony', 'Krill dependence', 'Moult', 'Sea-ice habitat'] },
  { slug: 'polar-bears', name: 'Polar bears', category: 'Biodiversity', discipline: 'BIODIVERSITY', pole: 'ARCTIC', overview: 'Marine mammals that hunt seals from sea ice. Loss of summer ice lengthens their fasting season.', keyConcepts: ['Sea-ice platform', 'Fasting', 'Denning', 'Body condition'] },
  { slug: 'seals', name: 'Seals', category: 'Biodiversity', discipline: 'BIODIVERSITY', overview: 'Both poles host ice-associated seals that pup, rest and moult on ice.', keyConcepts: ['Haul-out', 'Pupping', 'Lairs', 'Ice association'] },
  { slug: 'whales', name: 'Whales', category: 'Biodiversity', discipline: 'BIODIVERSITY', overview: 'Baleen and toothed whales migrate to polar seas to feed on dense summer prey.', keyConcepts: ['Feeding grounds', 'Migration', 'Baleen', 'Recovery'] },
  { slug: 'krill', name: 'Krill', category: 'Biodiversity', discipline: 'MARINE_SCIENCE', pole: 'ANTARCTIC', overview: 'Small shrimp-like crustaceans that are the keystone of the Southern Ocean food web.', keyConcepts: ['Swarm', 'Ice-edge bloom', 'Fishery management', 'Recruitment'] },
  { slug: 'polar-microorganisms', name: 'Polar microorganisms', category: 'Biodiversity', discipline: 'ECOLOGY', overview: 'Microbes thrive in sea ice brine channels, subglacial lakes and permafrost, with roles in every biogeochemical cycle.', keyConcepts: ['Psychrophile', 'Brine channels', 'Subglacial life', 'Cryoconite'] },
  { slug: 'polar-plants', name: 'Polar plants', category: 'Biodiversity', discipline: 'ECOLOGY', overview: 'Tundra plants, mosses and lichens are adapted to cold, wind and a short growing season; the Antarctic has only two native flowering plants.', keyConcepts: ['Tundra', 'Cushion plants', 'Greening', 'Growing season'] },
  { slug: 'polar-tectonics', name: 'Tectonics', category: 'Geology', discipline: 'GEOLOGY', overview: 'Plate motions opened the Southern Ocean and isolated Antarctica, helping it glaciate ~34 million years ago.', keyConcepts: ['Gondwana breakup', 'Drake Passage opening', 'Rifting', 'Isostasy'] },
  { slug: 'polar-minerals', name: 'Minerals', category: 'Geology', discipline: 'GEOLOGY', overview: 'Polar bedrock records billions of years of Earth history; mineral prospecting in Antarctica is banned by treaty.', keyConcepts: ['Cratons', 'Provenance', 'Treaty protection', 'Exposure dating'] },
  { slug: 'sediments', name: 'Sediments', category: 'Geology', discipline: 'GEOLOGY', overview: 'Marine and lake sediments preserve past ice extent, ocean conditions and ecosystems.', keyConcepts: ['Ice-rafted debris', 'Varves', 'Microfossils', 'Cores'] },
  { slug: 'paleoclimate', name: 'Paleoclimate', category: 'Geology', discipline: 'PALEOCLIMATE', overview: 'Ice cores and sediments reveal past temperature, greenhouse gases and abrupt climate change over hundreds of thousands of years.', keyConcepts: ['Ice cores', 'Isotopes', 'Dansgaard–Oeschger events', 'Orbital forcing'] },
  { slug: 'indigenous-knowledge', name: 'Indigenous knowledge', category: 'Human Dimensions', discipline: 'HUMAN_INDIGENOUS', pole: 'ARCTIC', overview: 'Arctic Indigenous peoples hold deep, place-based knowledge of ice, weather and wildlife that complements instrumental science.', keyConcepts: ['Co-production', 'Ice safety knowledge', 'Food security', 'Self-determination'] },
  { slug: 'polar-communities', name: 'Communities', category: 'Human Dimensions', discipline: 'HUMAN_INDIGENOUS', pole: 'ARCTIC', overview: 'Around four million people live in the Arctic, in cities, towns and villages facing rapid environmental and social change.', keyConcepts: ['Infrastructure on permafrost', 'Coastal erosion', 'Health', 'Connectivity'] },
  { slug: 'polar-history', name: 'History', category: 'Human Dimensions', overview: 'From early exploration to the International Geophysical Year and the Antarctic Treaty, polar history shaped today’s science.', keyConcepts: ['Heroic age', 'IGY 1957–58', 'Antarctic Treaty 1959', 'Station networks'] },
  { slug: 'polar-policy', name: 'Policy', category: 'Human Dimensions', overview: 'The Antarctic Treaty System and the Arctic Council govern cooperation, environmental protection and science in the polar regions.', keyConcepts: ['Antarctic Treaty System', 'Arctic Council', 'CCAMLR', 'Marine protected areas'] },
  { slug: 'sustainable-development', name: 'Sustainable development', category: 'Human Dimensions', overview: 'Balancing livelihoods, conservation and research in a changing Arctic, guided by community priorities.', keyConcepts: ['Community-led monitoring', 'Renewable energy', 'Tourism management', 'Fisheries'] },
  { slug: 'satellites', name: 'Satellites', category: 'Polar Technology', discipline: 'POLAR_TECHNOLOGY', overview: 'Radar and microwave satellites map sea ice, ice-sheet elevation and glacier speed through polar night and cloud.', keyConcepts: ['Synthetic aperture radar', 'Altimetry', 'Passive microwave', 'Gravimetry'] },
  { slug: 'autonomous-vehicles', name: 'Autonomous vehicles', category: 'Polar Technology', discipline: 'POLAR_TECHNOLOGY', overview: 'Underwater gliders and floats profile the polar ocean year-round, including under ice.', keyConcepts: ['Argo floats', 'Gliders', 'Under-ice navigation', 'Data telemetry'] },
  { slug: 'drones', name: 'Drones', category: 'Polar Technology', discipline: 'POLAR_TECHNOLOGY', overview: 'Uncrewed aircraft survey wildlife colonies, map crevasses and measure surface melt at fine scale.', keyConcepts: ['Photogrammetry', 'Thermal imaging', 'Wildlife survey', 'Cold-weather ops'] },
  { slug: 'sensors', name: 'Sensors', category: 'Polar Technology', discipline: 'POLAR_TECHNOLOGY', overview: 'Automatic weather stations, GPS and seismometers stream data from remote ice, often powered by sun and wind.', keyConcepts: ['Automatic weather station', 'GNSS', 'Seismometer', 'Low-power design'] },
  { slug: 'research-stations', name: 'Research stations', category: 'Polar Technology', discipline: 'POLAR_TECHNOLOGY', overview: 'Permanent and seasonal bases provide the logistics backbone for polar fieldwork.', keyConcepts: ['Logistics', 'Winter-over', 'Traverse', 'Energy systems'] },
];

export const GLOSSARY = [
  { term: 'Albedo', definition: 'The fraction of incoming sunlight that a surface reflects, from 0 (black) to 1 (white). Fresh snow is around 0.8; open ocean about 0.06.', plain: 'How much sunlight a surface bounces back instead of soaking up.', topic: 'snow', pron: 'AL-bee-doh' },
  { term: 'Sea ice extent', definition: 'The total area of ocean with at least 15% sea ice cover, usually reported monthly.', plain: 'How much of the sea has a meaningful amount of ice on it.', topic: 'sea-ice' },
  { term: 'Polar amplification', definition: 'The tendency for surface warming to be larger in the polar regions than the global average, driven by feedbacks such as ice–albedo.', plain: 'The poles warm faster than the rest of the planet.', topic: 'climate-change' },
  { term: 'Grounding line', definition: 'The boundary where a glacier or ice sheet stops resting on bedrock and begins to float as an ice shelf.', plain: 'Where land ice lifts off the ground and starts floating.', topic: 'ice-sheets' },
  { term: 'Katabatic wind', definition: 'A wind that blows downslope as cold, dense air drains from an ice sheet under gravity; common and strong in Antarctica.', plain: 'Cold air sliding downhill off the ice, sometimes very fast.', topic: 'polar-weather', pron: 'kat-uh-BAT-ik' },
  { term: 'Firn', definition: 'Compacted, multi-year snow that is denser than fresh snow but not yet glacial ice.', plain: 'Old, packed snow on its way to becoming glacier ice.', topic: 'snow', pron: 'firn' },
  { term: 'Polynya', definition: 'An area of open water or thin ice surrounded by thicker sea ice, kept open by wind or upwelling.', plain: 'A patch of open sea in the middle of the ice.', topic: 'sea-ice', pron: 'puh-LIN-yuh' },
  { term: 'Mass balance', definition: 'The net gain or loss of ice, comparing snowfall input against melt and iceberg discharge output.', plain: 'Whether an ice sheet or glacier is gaining or losing ice overall.', topic: 'ice-sheets' },
  { term: 'Brine rejection', definition: 'The process by which growing sea ice expels salt, producing cold, dense, salty water that sinks.', plain: 'When seawater freezes it pushes out salt, making heavy water that sinks.', topic: 'salinity' },
  { term: 'Permafrost', definition: 'Ground that stays at or below 0 °C for at least two consecutive years; it can store large amounts of carbon.', plain: 'Soil and rock that stays frozen year-round.', topic: 'carbon-cycle' },
  { term: 'Ice core', definition: 'A cylinder of ice drilled from a glacier or ice sheet whose layers record past climate and atmospheric composition.', plain: 'A long tube of ice that works like a climate diary.', topic: 'paleoclimate' },
  { term: 'Krill', definition: 'Small shrimp-like crustaceans, especially Antarctic krill, that form vast swarms and underpin the Southern Ocean food web.', plain: 'Tiny sea creatures that almost everything in the Antarctic ocean eats.', topic: 'krill', pron: 'kril' },
  { term: 'Overturning circulation', definition: 'The global pattern of ocean flow in which dense polar water sinks and slowly returns to the surface elsewhere, redistributing heat and carbon.', plain: 'A worldwide ocean conveyor belt powered partly at the poles.', topic: 'ocean-currents' },
  { term: 'Ablation', definition: 'All processes that remove snow or ice from a glacier, including melt, sublimation and calving.', plain: 'The ways a glacier loses ice.', topic: 'glaciers', pron: 'uh-BLAY-shun' },
  { term: 'Sublimation', definition: 'The direct change of ice to water vapour without melting, important in cold, dry polar air.', plain: 'Ice turning straight into vapour, skipping the liquid stage.', topic: 'snow' },
  { term: 'Ice shelf', definition: 'A thick, floating platform of ice formed where a glacier or ice sheet flows onto the ocean surface.', plain: 'A giant floating ledge of ice attached to the land ice.', topic: 'ice-shelves' },
  { term: 'Teleconnection', definition: 'A statistical link between climate anomalies in widely separated regions, e.g. between polar and mid-latitude weather.', plain: 'How weather at the poles can be connected to weather far away.', topic: 'climate-change' },
  { term: 'Cryoconite', definition: 'Dark dust and microbial material on a glacier surface that absorbs sunlight and melts small holes.', plain: 'Grubby dust on ice that soaks up sun and melts little pits.', topic: 'polar-microorganisms', pron: 'CRY-oh-con-ite' },
];
