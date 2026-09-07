import type { Metadata } from 'next';
import { analyticsSummary } from '@/lib/analytics';
import { safe } from '@/lib/safe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GrowthChart } from '@/components/admin/dashboard-charts';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Analytics' };
export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const summary = await safe(
    () => analyticsSummary(30),
    { totals: {} as Record<string, number>, pageViewsByDay: [], topSearches: [], topResources: [] },
    'adminAnalytics',
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Anonymous product analytics for the last 30 days. No personal data is collected; the
          opt-out cookie is honoured server-side.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(summary.totals).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-card p-4">
            <p className="font-display text-2xl font-semibold">{formatNumber(v)}</p>
            <p className="text-xs capitalize text-muted-foreground">{k.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Page views by day</CardTitle>
        </CardHeader>
        <CardContent>
          <GrowthChart
            data={summary.pageViewsByDay.map((d) => ({ month: d.date, count: d.count }))}
            color="#3fd0e0"
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top searches</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topSearches.length ? (
              <ol className="space-y-1 text-sm">
                {summary.topSearches.map((s) => (
                  <li key={s.query} className="flex justify-between">
                    <span>{s.query}</span>
                    <span className="text-muted-foreground">{s.count}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No searches recorded</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Most viewed resources</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topResources.length ? (
              <ol className="space-y-1 text-sm">
                {summary.topResources.map((r) => (
                  <li key={`${r.entityType}-${r.entityId}`} className="flex justify-between">
                    <span className="truncate">
                      {r.entityType}:{r.entityId.slice(0, 8)}
                    </span>
                    <span className="text-muted-foreground">{r.count}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
