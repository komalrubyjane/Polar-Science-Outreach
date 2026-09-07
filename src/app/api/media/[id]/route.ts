import { makeRestItem } from '@/lib/services/rest-factory';
import { mediaEntity } from '@/lib/services/entities';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET, PUT, DELETE } = makeRestItem(mediaEntity);
