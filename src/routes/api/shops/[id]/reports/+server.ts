import type { RequestHandler } from './$types';
import { errorResponse } from '$lib/error';
import { getWaitLevelLabel } from '$lib/wait-level';
import { hashIp } from '$lib/hash';
import { checkSpam, writeSpamBlock } from '$lib/spam-check';

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

/** POST /api/shops/:id/reports — submit crowdsourced report */
export const POST: RequestHandler = async ({ params, request, platform, cookies }) => {
	const idStr = params.id;
	const id = parseInt(idStr, 10);

	if (!Number.isInteger(id) || isNaN(id) || id <= 0 || String(id) !== idStr) {
		return errorResponse('INVALID_SHOP_ID', '店舗IDは正の整数で指定してください', 400);
	}

	if (!platform?.env.DB || !platform?.env.JIROMAP_KV || !platform?.env.IP_HASH_SALT) {
		return errorResponse('INTERNAL_SERVER_ERROR', 'サービスに接続できません', 500);
	}

	// Parse request body
	let body: { wait_level?: unknown; comment?: unknown };
	try {
		body = await request.json();
	} catch {
		return errorResponse('MISSING_REQUIRED_PARAMS', 'リクエストボディのJSONが不正です', 400);
	}

	const waitLevel = body.wait_level;
	if (
		waitLevel === undefined ||
		waitLevel === null ||
		typeof waitLevel !== 'number' ||
		![0, 1, 2, 3, 4].includes(waitLevel)
	) {
		return errorResponse('INVALID_WAIT_LEVEL', 'wait_level は 0〜4 の整数で指定してください', 400);
	}

	const comment = body.comment;
	if (comment !== undefined && comment !== null) {
		if (typeof comment !== 'string') {
			return errorResponse('INVALID_PARAM_VALUE', 'comment は文字列で指定してください', 400);
		}
		if (comment.length > 100) {
			return errorResponse('COMMENT_TOO_LONG', 'コメントは100文字以内で入力してください', 400);
		}
	}

	const commentStr = typeof comment === 'string' ? comment : null;

	// Session management via cookie
	let sessionId = cookies.get('jiromap_session');
	if (!sessionId) {
		sessionId = crypto.randomUUID();
	}

	// IP hash
	const ip =
		request.headers.get('CF-Connecting-IP') ??
		request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ??
		'unknown';
	const ipHash = await hashIp(ip, platform.env.IP_HASH_SALT);

	try {
		// Check shop exists
		const shopExists = await platform.env.DB.prepare('SELECT id FROM shops WHERE id = ?')
			.bind(id)
			.first<{ id: number }>();

		if (!shopExists) {
			return errorResponse('SHOP_NOT_FOUND', '店舗が見つかりません', 404);
		}

		// Spam check
		const spamResult = await checkSpam(
			platform.env.JIROMAP_KV,
			platform.env.DB,
			sessionId,
			ipHash,
			id
		);

		if (spamResult.blocked) {
			const nextAllowedAt = spamResult.nextAllowedAt ?? new Date(Date.now() + 1800000).toISOString();
			const retryAfter = Math.max(
				0,
				Math.ceil((new Date(nextAllowedAt).getTime() - Date.now()) / 1000)
			);
			return errorResponse('DUPLICATE_REPORT', '同じ店舗への投稿は30分後に可能です', 429, {
				next_allowed_at: nextAllowedAt,
				retry_after: retryAfter
			});
		}

		// Insert report
		const insertResult = await platform.env.DB.prepare(
			`INSERT INTO crowd_reports (shop_id, wait_level, comment, session_id, ip_hash)
       VALUES (?, ?, ?, ?, ?)
       RETURNING id, shop_id, wait_level, comment, created_at`
		)
			.bind(id, waitLevel, commentStr, sessionId, ipHash)
			.first<ReportRow>();

		if (!insertResult) {
			return errorResponse('DATABASE_ERROR', 'レポートの保存に失敗しました', 500);
		}

		// Write spam block to KV
		const nextAllowedAt = new Date(
			new Date(insertResult.created_at).getTime() + 30 * 60 * 1000
		).toISOString();
		await writeSpamBlock(platform.env.JIROMAP_KV, sessionId, ipHash, id, nextAllowedAt);

		// Invalidate status cache
		await platform.env.JIROMAP_KV.delete(`status:shop:${id}`);

		// Build current status from fresh D1 query (aggregate last 30 min)
		const status = await buildStatus(platform.env.DB, id);

		// Set session cookie
		const response = new Response(
			JSON.stringify({
				report: {
					id: insertResult.id,
					shop_id: insertResult.shop_id,
					wait_level: insertResult.wait_level,
					wait_level_label: getWaitLevelLabel(insertResult.wait_level),
					comment: insertResult.comment,
					created_at: insertResult.created_at
				},
				status,
				next_allowed_at: nextAllowedAt
			}),
			{ status: 201, headers: { 'Content-Type': 'application/json' } }
		);

		// Set session cookie if new
		if (!cookies.get('jiromap_session')) {
			response.headers.append(
				'Set-Cookie',
				`jiromap_session=${sessionId}; HttpOnly; SameSite=Strict; Max-Age=${86400 * 30}; Path=/`
			);
		}

		return response;
	} catch (e) {
		console.error('POST /api/shops/:id/reports error:', e);
		return errorResponse('DATABASE_ERROR', 'データベースエラーが発生しました', 500);
	}
};

interface StatusAggRow {
	shop_id: number;
	current_wait_level: number;
	report_count: number;
	last_reported_at: string;
	confidence: number;
}

async function buildStatus(db: ReturnType<typeof Object.create>, shopId: number) {
	try {
		const row = await db
			.prepare(
				`WITH recent_reports AS (
          SELECT shop_id, wait_level, COUNT(*) AS level_count, MAX(created_at) AS last_reported_at
          FROM crowd_reports
          WHERE shop_id = ? AND created_at >= datetime('now', '-30 minutes') AND is_deleted = 0
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
        WHERE r.rn = 1`
			)
			.bind(shopId)
			.first<StatusAggRow>();

		if (!row) {
			return {
				current_wait_level: null,
				wait_level_label: null,
				report_count: 0,
				confidence: 0,
				last_reported_at: null,
				aggregated_at: new Date().toISOString()
			};
		}

		return {
			current_wait_level: row.current_wait_level,
			wait_level_label: getWaitLevelLabel(row.current_wait_level),
			report_count: row.report_count,
			confidence: row.confidence,
			last_reported_at: row.last_reported_at,
			aggregated_at: new Date().toISOString()
		};
	} catch {
		return null;
	}
}
