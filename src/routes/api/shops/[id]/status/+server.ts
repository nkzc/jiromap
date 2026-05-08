import type { RequestHandler } from './$types';
import { errorResponse } from '$lib/error';
import { getWaitLevelLabel } from '$lib/wait-level';

interface StatusRow {
	shop_id: number;
	current_wait_level: number | null;
	report_count: number;
	confidence: number;
	last_reported_at: string | null;
	aggregated_at: string;
}

export const GET: RequestHandler = async ({ params, platform }) => {
	const idStr = params.id;
	const id = parseInt(idStr, 10);

	if (!Number.isInteger(id) || isNaN(id) || id <= 0 || String(id) !== idStr) {
		return errorResponse('INVALID_SHOP_ID', '店舗IDは正の整数で指定してください', 400);
	}

	if (!platform?.env.DB || !platform?.env.JIROMAP_KV) {
		return errorResponse('INTERNAL_SERVER_ERROR', 'サービスに接続できません', 500);
	}

	const kvKey = `status:shop:${id}`;

	try {
		// 1. Try KV cache first
		const cached = await platform.env.JIROMAP_KV.get(kvKey);
		if (cached !== null) {
			const data = JSON.parse(cached) as StatusRow & { aggregated_at: string };
			// Calculate approximate expiry (now + 90s is not exact but reasonable hint)
			const expiresAt = new Date(Date.now() + 90 * 1000).toISOString();
			return new Response(
				JSON.stringify({
					shop_id: data.shop_id,
					current_wait_level: data.current_wait_level,
					wait_level_label: getWaitLevelLabel(data.current_wait_level),
					report_count: data.report_count,
					confidence: data.confidence,
					last_reported_at: data.last_reported_at,
					aggregated_at: data.aggregated_at,
					cache: { hit: true, expires_at: expiresAt }
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// 2. KV miss: check shop exists
		const shopExists = await platform.env.DB.prepare('SELECT id FROM shops WHERE id = ?')
			.bind(id)
			.first<{ id: number }>();

		if (!shopExists) {
			return errorResponse('SHOP_NOT_FOUND', '店舗が見つかりません', 404);
		}

		// 3. Load from D1 shop_statuses
		const row = await platform.env.DB.prepare(
			`SELECT shop_id, current_wait_level, report_count, confidence,
              last_reported_at, aggregated_at
       FROM shop_statuses WHERE shop_id = ?`
		)
			.bind(id)
			.first<StatusRow>();

		if (!row) {
			// No status yet — return null status
			return new Response(
				JSON.stringify({
					shop_id: id,
					current_wait_level: null,
					wait_level_label: null,
					report_count: 0,
					confidence: 0,
					last_reported_at: null,
					aggregated_at: null,
					cache: { hit: false, expires_at: null }
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// 4. Write to KV for next requests
		await platform.env.JIROMAP_KV.put(kvKey, JSON.stringify(row), { expirationTtl: 90 });

		return new Response(
			JSON.stringify({
				shop_id: row.shop_id,
				current_wait_level: row.current_wait_level,
				wait_level_label: getWaitLevelLabel(row.current_wait_level),
				report_count: row.report_count,
				confidence: row.confidence,
				last_reported_at: row.last_reported_at,
				aggregated_at: row.aggregated_at,
				cache: { hit: false, expires_at: null }
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (e) {
		console.error('GET /api/shops/:id/status error:', e);
		return errorResponse('DATABASE_ERROR', 'データベースエラーが発生しました', 500);
	}
};
