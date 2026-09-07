import { makeRestCollection } from '@/lib/services/rest-factory';
import { researcherEntity } from '@/lib/services/entities';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET, POST } = makeRestCollection(researcherEntity);
