import type { RequestHandler } from './$types';
import { errorResponse } from '$lib/error';
import { getWaitLevelLabel } from '$lib/wait-level';

interface ReportRow {
	id: number;
	shop_id: number;
	wait_level: number;
	comment: string | null;
	created_at: string;
}

/** GET /api/shops/:id/reports — recent reports list */
export const GET: RequestHandler = async ({ params, url, platform }) => {
	const idStr = params.id;
	const id = parseInt(idStr, 10);

	if (!Number.isInteger(id) || isNaN(id) || id <= 0 || String(id) !== idStr) {
		return errorResponse('INVALID_SHOP_ID', '店舗IDは正の整数で指定してください', 400);
	}

	if (!platform?.env.DB) {
		return errorResponse('INTERNAL_SERVER_ERROR', 'データベースに接続できません', 500);
	}

	const limitStr = url.searchParams.get('limit') ?? '20';
	const limit = Math.min(100, Math.max(1, parseInt(limitStr, 10) || 20));

	try {
		// Check shop exists
		const shopExists = await platform.env.DB.prepare('SELECT id FROM shops WHERE id = ?')
			.bind(id)
			.first<{ id: number }>();

		if (!shopExists) {
			return errorResponse('SHOP_NOT_FOUND', '店舗が見つかりません', 404);
		}

		const rows = await platform.env.DB.prepare(
			`SELECT id, shop_id, wait_level, comment, created_at
       FROM crowd_reports
       WHERE shop_id = ? AND is_deleted = 0
       ORDER BY created_at DESC
       LIMIT ?`
		)
			.bind(id, limit)
			.all<ReportRow>();

		const reports = (rows.results ?? []).map((r) => ({
			id: r.id,
			shop_id: r.shop_id,
			wait_level: r.wait_level,
			wait_level_label: getWaitLevelLabel(r.wait_level),
			comment: r.comment,
			created_at: r.created_at
		}));

		return new Response(
			JSON.stringify({
				reports,
				meta: { total: reports.length, shop_id: id }
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (e) {
		console.error('GET /api/shops/:id/reports error:', e);
		return errorResponse('DATABASE_ERROR', 'データベースエラーが発生しました', 500);
	}
};
