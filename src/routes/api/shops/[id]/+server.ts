import type { RequestHandler } from './$types';
import { errorResponse } from '$lib/error';
import { getWaitLevelLabel } from '$lib/wait-level';

interface ShopRow {
	id: number;
	name: string;
	lat: number;
	lng: number;
	address: string;
	nearest_station: string | null;
	phone: string | null;
	business_hours: string | null;
	closed_days: string | null;
	category: string;
	tabelog_url: string | null;
	gurunavi_url: string | null;
	twitter_handle: string | null;
	created_at: string;
	updated_at: string;
	// shop_statuses fields (LEFT JOIN)
	current_wait_level: number | null;
	report_count: number | null;
	confidence: number | null;
	last_reported_at: string | null;
	aggregated_at: string | null;
}

export const GET: RequestHandler = async ({ params, platform }) => {
	const idStr = params.id;
	const id = parseInt(idStr, 10);

	if (!Number.isInteger(id) || isNaN(id) || id <= 0 || String(id) !== idStr) {
		return errorResponse('INVALID_SHOP_ID', '店舗IDは正の整数で指定してください', 400);
	}

	if (!platform?.env.DB) {
		return errorResponse('INTERNAL_SERVER_ERROR', 'データベースに接続できません', 500);
	}

	try {
		const row = await platform.env.DB.prepare(
			`SELECT s.*, ss.current_wait_level, ss.report_count, ss.confidence,
              ss.last_reported_at, ss.aggregated_at
       FROM shops s
       LEFT JOIN shop_statuses ss ON s.id = ss.shop_id
       WHERE s.id = ?`
		)
			.bind(id)
			.first<ShopRow>();

		if (!row) {
			return errorResponse('SHOP_NOT_FOUND', '店舗が見つかりません', 404);
		}

		const status =
			row.current_wait_level !== null
				? {
						current_wait_level: row.current_wait_level,
						wait_level_label: getWaitLevelLabel(row.current_wait_level),
						report_count: row.report_count ?? 0,
						confidence: row.confidence ?? 0,
						last_reported_at: row.last_reported_at,
						aggregated_at: row.aggregated_at
					}
				: null;

		const shop = {
			id: row.id,
			name: row.name,
			lat: row.lat,
			lng: row.lng,
			address: row.address,
			nearest_station: row.nearest_station,
			phone: row.phone,
			business_hours: row.business_hours,
			closed_days: row.closed_days,
			category: row.category,
			tabelog_url: row.tabelog_url,
			gurunavi_url: row.gurunavi_url,
			twitter_handle: row.twitter_handle,
			created_at: row.created_at,
			updated_at: row.updated_at,
			status
		};

		return new Response(JSON.stringify(shop), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		console.error('GET /api/shops/:id error:', e);
		return errorResponse('DATABASE_ERROR', 'データベースエラーが発生しました', 500);
	}
};
