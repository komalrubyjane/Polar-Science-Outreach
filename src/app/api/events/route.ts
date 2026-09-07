import { makeRestCollection } from '@/lib/services/rest-factory';
import { eventEntity } from '@/lib/services/entities';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET, POST } = makeRestCollection(eventEntity);
