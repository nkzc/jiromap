import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

export interface SpamCheckResult {
	blocked: boolean;
	nextAllowedAt?: string;
}

/**
 * Check for duplicate/spam reports using KV (primary) + D1 fallback.
 *
 * Flow:
 * 1. KV.get(`spam:session:{session_id}:shop:{shop_id}`) → 429 if exists
 * 2. KV.get(`spam:ip:{ip_hash}:shop:{shop_id}`)        → 429 if exists
 * 3. [KV miss fallback] D1: check last 30 min same session/IP reports
 */
export async function checkSpam(
	kv: KVNamespace,
	db: D1Database,
	sessionId: string,
	ipHash: string,
	shopId: number
): Promise<SpamCheckResult> {
	// 1. KV session check
	const sessionKey = `spam:session:${sessionId}:shop:${shopId}`;
	const sessionBlock = await kv.get(sessionKey);
	if (sessionBlock !== null) {
		const nextAllowedAt = sessionBlock || new Date(Date.now() + 1800000).toISOString();
		return { blocked: true, nextAllowedAt };
	}

	// 2. KV IP check
	const ipKey = `spam:ip:${ipHash}:shop:${shopId}`;
	const ipBlock = await kv.get(ipKey);
	if (ipBlock !== null) {
		const nextAllowedAt = ipBlock || new Date(Date.now() + 1800000).toISOString();
		return { blocked: true, nextAllowedAt };
	}

	// 3. D1 fallback: check last 30 minutes
	const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

	const sessionRow = await db
		.prepare(
			`SELECT created_at FROM crowd_reports
       WHERE shop_id = ? AND session_id = ? AND created_at >= ? AND is_deleted = 0
       ORDER BY created_at DESC LIMIT 1`
		)
		.bind(shopId, sessionId, thirtyMinAgo)
		.first<{ created_at: string }>();

	if (sessionRow) {
		const nextAllowedAt = new Date(
			new Date(sessionRow.created_at).getTime() + 30 * 60 * 1000
		).toISOString();
		return { blocked: true, nextAllowedAt };
	}

	const ipRow = await db
		.prepare(
			`SELECT created_at FROM crowd_reports
       WHERE shop_id = ? AND ip_hash = ? AND created_at >= ? AND is_deleted = 0
       ORDER BY created_at DESC LIMIT 1`
		)
		.bind(shopId, ipHash, thirtyMinAgo)
		.first<{ created_at: string }>();

	if (ipRow) {
		const nextAllowedAt = new Date(
			new Date(ipRow.created_at).getTime() + 30 * 60 * 1000
		).toISOString();
		return { blocked: true, nextAllowedAt };
	}

	return { blocked: false };
}

/**
 * Write spam block entries to KV after a successful report.
 * TTL: 1800 seconds (30 minutes).
 */
export async function writeSpamBlock(
	kv: KVNamespace,
	sessionId: string,
	ipHash: string,
	shopId: number,
	nextAllowedAt: string
): Promise<void> {
	const ttl = 1800;
	const sessionKey = `spam:session:${sessionId}:shop:${shopId}`;
	const ipKey = `spam:ip:${ipHash}:shop:${shopId}`;

	await Promise.all([
		kv.put(sessionKey, nextAllowedAt, { expirationTtl: ttl }),
		kv.put(ipKey, nextAllowedAt, { expirationTtl: ttl })
	]);
}
