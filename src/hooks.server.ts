import type { Handle } from '@sveltejs/kit';
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';
import { getWaitLevelLabel } from '$lib/wait-level';

// ──────────────────────────────────────────────
// Batch aggregation SQL (Window function query)
// ──────────────────────────────────────────────
const BATCH_SQL = `
WITH recent_reports AS (
  SELECT shop_id, wait_level, COUNT(*) AS level_count, MAX(created_at) AS last_reported_at
  FROM crowd_reports
  WHERE created_at >= datetime('now', '-30 minutes') AND is_deleted = 0
  GROUP BY shop_id, wait_level
),
ranked AS (
  SELECT shop_id, wait_level, level_count, last_reported_at,
    ROW_NUMBER() OVER (PARTITION BY shop_id ORDER BY level_count DESC, last_reported_at DESC) AS rn
  FROM recent_reports
),
totals AS (SELECT shop_id, SUM(level_count) AS total_count FROM recent_reports GROUP BY shop_id)
SELECT r.shop_id, r.wait_level AS current_wait_level, t.total_count AS report_count,
  r.last_reported_at, MIN(1.0, CAST(t.total_count AS REAL) / 3.0) AS confidence
FROM ranked r JOIN totals t ON r.shop_id = t.shop_id
WHERE r.rn = 1
`;

interface AggRow {
	shop_id: number;
	current_wait_level: number;
	report_count: number;
	last_reported_at: string;
	confidence: number;
}

/**
 * Run the 1-minute batch aggregation job.
 * - Queries D1 for last-30-min reports
 * - Updates shop_statuses table
 * - Updates KV cache (only when value changed — diff check)
 */
export async function runBatchAggregation(db: D1Database, kv: KVNamespace): Promise<void> {
	const aggregatedAt = new Date().toISOString();

	const result = await db.prepare(BATCH_SQL).all<AggRow>();
	const rows = result.results ?? [];

	for (const row of rows) {
		const statusPayload = {
			shop_id: row.shop_id,
			current_wait_level: row.current_wait_level,
			wait_level_label: getWaitLevelLabel(row.current_wait_level),
			report_count: row.report_count,
			confidence: row.confidence,
			last_reported_at: row.last_reported_at,
			aggregated_at: aggregatedAt
		};
		const newJson = JSON.stringify(statusPayload);
		const kvKey = `status:shop:${row.shop_id}`;

		// KV diff check — skip write if unchanged
		const existing = await kv.get(kvKey);
		if (existing !== newJson) {
			await kv.put(kvKey, newJson, { expirationTtl: 90 });
		}

		// Upsert into shop_statuses (D1 persistent fallback)
		await db
			.prepare(
				`INSERT INTO shop_statuses (shop_id, current_wait_level, report_count, confidence, last_reported_at, aggregated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(shop_id) DO UPDATE SET
           current_wait_level = excluded.current_wait_level,
           report_count       = excluded.report_count,
           confidence         = excluded.confidence,
           last_reported_at   = excluded.last_reported_at,
           aggregated_at      = excluded.aggregated_at`
			)
			.bind(
				row.shop_id,
				row.current_wait_level,
				row.report_count,
				row.confidence,
				row.last_reported_at,
				aggregatedAt
			)
			.run();
	}
}

// ──────────────────────────────────────────────
// SvelteKit handle hook (pass-through)
// ──────────────────────────────────────────────
export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};

// ──────────────────────────────────────────────
// Cloudflare Workers scheduled handler
// Wrangler injects this via `scheduled` export
// ──────────────────────────────────────────────
export async function scheduled(
	_event: ScheduledEvent,
	env: { DB: D1Database; JIROMAP_KV: KVNamespace },
	_ctx: ExecutionContext
): Promise<void> {
	await runBatchAggregation(env.DB, env.JIROMAP_KV);
}
