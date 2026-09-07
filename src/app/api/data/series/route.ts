import { handle, ok } from '@/lib/api';
import { listAllSeries, anyExternalProviderConfigured } from '@/lib/data-providers';

export const runtime = 'nodejs';
export const revalidate = 3600;

export const GET = handle(async () => {
  const providers = await listAllSeries();
  return ok({
    providers,
    externalConfigured: anyExternalProviderConfigured(),
    note: anyExternalProviderConfigured()
      ? 'Some series are fetched from configured external providers; others are demo data.'
      : 'No external scientific data provider is configured — all series below are clearly-labelled demo datasets.',
  });
});
