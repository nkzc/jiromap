/**
 * Standalone Cloudflare Worker for batch aggregation (1-minute cron).
 * Deployed separately from the Pages project via wrangler.cron.toml.
 *
 * Why separate: Cloudflare Pages Functions do not support Cron Triggers.
 * This Worker shares the same D1 / KV bindings as the Pages app.
 */

import type { D1Database, KVNamespace, ScheduledEvent, ExecutionContext } from '@cloudflare/workers-types';

interface Env {
	DB: D1Database;
	JIROMAP_KV: KVNamespace;
}

interface AggRow {
	shop_id: number;
	current_wait_level: number;
	report_count: number;
	last_reported_at: string;
	confidence: number;
}

const WAIT_LEVEL_LABELS: Record<number, string> = {
	0: '並びなし',
	1: '1〜5人',
	2: '6〜10人',
	3: '11人以上',
	4: '麺切れ/臨時休業'
};

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

export default {
	async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
		const aggregatedAt = new Date().toISOString();
		const result = await env.DB.prepare(BATCH_SQL).all<AggRow>();

		for (const row of (result.results ?? [])) {
			const payload = {
				shop_id: row.shop_id,
				current_wait_level: row.current_wait_level,
				wait_level_label: WAIT_LEVEL_LABELS[row.current_wait_level] ?? null,
				report_count: row.report_count,
				confidence: row.confidence,
				last_reported_at: row.last_reported_at,
				aggregated_at: aggregatedAt
			};
			const newJson = JSON.stringify(payload);
			const kvKey = `status:shop:${row.shop_id}`;

			// KV diff check — skip write if value unchanged
			const existing = await env.JIROMAP_KV.get(kvKey);
			if (existing !== newJson) {
				await env.JIROMAP_KV.put(kvKey, newJson, { expirationTtl: 90 });
			}

			await env.DB.prepare(
				`INSERT INTO shop_statuses (shop_id, current_wait_level, report_count, confidence, last_reported_at, aggregated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(shop_id) DO UPDATE SET
           current_wait_level = excluded.current_wait_level,
           report_count       = excluded.report_count,
           confidence         = excluded.confidence,
           last_reported_at   = excluded.last_reported_at,
           aggregated_at      = excluded.aggregated_at`
			)
				.bind(row.shop_id, row.current_wait_level, row.report_count, row.confidence, row.last_reported_at, aggregatedAt)
				.run();
		}
	},

	// Fallback fetch handler (required by Workers runtime; returns 404 for all HTTP requests)
	async fetch(): Promise<Response> {
		return new Response('Not Found', { status: 404 });
	}
};
