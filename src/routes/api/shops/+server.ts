import type { RequestHandler } from './$types';
import { haversineMeters, boundingBox } from '$lib/haversine';
import { getWaitLevelLabel } from '$lib/wait-level';
import { errorResponse } from '$lib/error';

const DEFAULT_RADIUS_M = 3000;
const MAX_RADIUS_M = 10000;
const MIN_RADIUS_M = 100;

interface ShopRow {
	id: number;
	name: string;
	lat: number;
	lng: number;
	address: string;
	nearest_station: string | null;
	business_hours: string | null;
	closed_days: string | null;
	category: string;
	// shop_statuses fields (LEFT JOIN)
	current_wait_level: number | null;
	report_count: number | null;
	confidence: number | null;
	last_reported_at: string | null;
	aggregated_at: string | null;
}

export const GET: RequestHandler = async ({ url, platform }) => {
	const latStr = url.searchParams.get('lat');
	const lngStr = url.searchParams.get('lng');
	const radiusStr = url.searchParams.get('radius');

	if (!latStr || !lngStr) {
		return errorResponse('MISSING_REQUIRED_PARAMS', 'lat と lng は必須パラメータです', 400);
	}

	const lat = parseFloat(latStr);
	const lng = parseFloat(lngStr);

	if (isNaN(lat) || lat < -90 || lat > 90) {
		return errorResponse('INVALID_PARAM_VALUE', 'lat は -90〜90 の数値で指定してください', 400);
	}
	if (isNaN(lng) || lng < -180 || lng > 180) {
		return errorResponse('INVALID_PARAM_VALUE', 'lng は -180〜180 の数値で指定してください', 400);
	}

	let radiusM = DEFAULT_RADIUS_M;
	if (radiusStr !== null) {
		radiusM = parseInt(radiusStr, 10);
		if (isNaN(radiusM) || radiusM < MIN_RADIUS_M || radiusM > MAX_RADIUS_M) {
			return errorResponse(
				'INVALID_PARAM_VALUE',
				`radius は ${MIN_RADIUS_M}〜${MAX_RADIUS_M} メートルで指定してください`,
				400
			);
		}
	}

	if (!platform?.env.DB) {
		return errorResponse('INTERNAL_SERVER_ERROR', 'データベースに接続できません', 500);
	}

	try {
		const { latMin, latMax, lngMin, lngMax } = boundingBox(lat, lng, radiusM);

		// Bounding box query with LEFT JOIN on shop_statuses (no N+1)
		const rows = await platform.env.DB.prepare(
			`SELECT s.id, s.name, s.lat, s.lng, s.address, s.nearest_station,
              s.business_hours, s.closed_days, s.category,
              ss.current_wait_level, ss.report_count, ss.confidence,
              ss.last_reported_at, ss.aggregated_at
       FROM shops s
       LEFT JOIN shop_statuses ss ON s.id = ss.shop_id
       WHERE s.lat BETWEEN ? AND ? AND s.lng BETWEEN ? AND ?`
		)
			.bind(latMin, latMax, lngMin, lngMax)
			.all<ShopRow>();

		// Haversine filter and sort
		const shops = (rows.results ?? [])
			.map((row) => {
				const distanceM = Math.round(haversineMeters(lat, lng, row.lat, row.lng));
				return { row, distanceM };
			})
			.filter(({ distanceM }) => distanceM <= radiusM)
			.sort((a, b) => a.distanceM - b.distanceM)
			.map(({ row, distanceM }) => {
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

				return {
					id: row.id,
					name: row.name,
					lat: row.lat,
					lng: row.lng,
					address: row.address,
					nearest_station: row.nearest_station,
					category: row.category,
					business_hours: row.business_hours,
					closed_days: row.closed_days,
					distance_m: distanceM,
					status
				};
			});

		return new Response(
			JSON.stringify({
				shops,
				meta: {
					total: shops.length,
					lat,
					lng,
					radius_m: radiusM,
					retrieved_at: new Date().toISOString()
				}
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} catch (e) {
		console.error('GET /api/shops error:', e);
		return errorResponse('DATABASE_ERROR', 'データベースエラーが発生しました', 500);
	}
};
