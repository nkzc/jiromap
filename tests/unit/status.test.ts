import { describe, it, expect, vi } from 'vitest';
import { GET } from '../../src/routes/api/shops/[id]/status/+server';

interface MockDb {
	prepare: ReturnType<typeof vi.fn>;
}

function makeDb(shopRow: unknown = { id: 1 }, statusRow: unknown = null): MockDb {
	return {
		prepare: vi.fn().mockImplementation((sql: string) => {
			// Route different queries to different mock responses
			const isShopCheck = sql.includes('FROM shops');
			return {
				bind: vi.fn().mockReturnValue({
					first: vi.fn().mockResolvedValue(isShopCheck ? shopRow : statusRow)
				})
			};
		})
	};
}

function makeKv(cached: string | null = null) {
	return {
		get: vi.fn().mockResolvedValue(cached),
		put: vi.fn().mockResolvedValue(undefined),
		delete: vi.fn().mockResolvedValue(undefined)
	};
}

function makeReq(id: string, db?: unknown, kv?: unknown) {
	return {
		params: { id },
		platform:
			db && kv
				? { env: { DB: db, JIROMAP_KV: kv } }
				: db
					? { env: { DB: db } }
					: undefined
	} as unknown as Parameters<typeof GET>[0];
}

const sampleStatus = {
	shop_id: 1,
	current_wait_level: 2,
	report_count: 3,
	confidence: 1.0,
	last_reported_at: '2026-05-02T12:03:45.000Z',
	aggregated_at: '2026-05-02T12:04:00.000Z'
};

describe('GET /api/shops/:id/status', () => {
	it('returns 400 for invalid id', async () => {
		const res = await GET(makeReq('abc'));
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe('INVALID_SHOP_ID');
	});

	it('returns 400 for negative id', async () => {
		const res = await GET(makeReq('-1'));
		expect(res.status).toBe(400);
	});

	it('returns 500 when platform is unavailable', async () => {
		const res = await GET(makeReq('1'));
		expect(res.status).toBe(500);
	});

	it('returns cached status from KV (cache hit)', async () => {
		const kv = makeKv(JSON.stringify(sampleStatus));
		const db = makeDb();
		const res = await GET(makeReq('1', db, kv));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.cache.hit).toBe(true);
		expect(body.current_wait_level).toBe(2);
		expect(body.wait_level_label).toBe('6〜10人');
	});

	it('returns 404 when shop not found (cache miss)', async () => {
		const kv = makeKv(null);
		const db = makeDb(null, null); // shop not found
		const res = await GET(makeReq('999', db, kv));
		expect(res.status).toBe(404);
		const body = await res.json();
		expect(body.error.code).toBe('SHOP_NOT_FOUND');
	});

	it('returns D1 status on KV cache miss', async () => {
		const kv = makeKv(null);
		// First call returns shop, second call returns status
		let callCount = 0;
		const db = {
			prepare: vi.fn().mockImplementation(() => ({
				bind: vi.fn().mockReturnValue({
					first: vi.fn().mockImplementation(() => {
						callCount++;
						if (callCount === 1) return Promise.resolve({ id: 1 }); // shop exists
						return Promise.resolve(sampleStatus); // status
					})
				})
			}))
		};
		const res = await GET(makeReq('1', db, kv));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.cache.hit).toBe(false);
		expect(body.current_wait_level).toBe(2);
	});

	it('returns null status when no reports exist', async () => {
		const kv = makeKv(null);
		let callCount = 0;
		const db = {
			prepare: vi.fn().mockImplementation(() => ({
				bind: vi.fn().mockReturnValue({
					first: vi.fn().mockImplementation(() => {
						callCount++;
						if (callCount === 1) return Promise.resolve({ id: 1 });
						return Promise.resolve(null); // no status
					})
				})
			}))
		};
		const res = await GET(makeReq('1', db, kv));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.current_wait_level).toBeNull();
		expect(body.wait_level_label).toBeNull();
		expect(body.report_count).toBe(0);
	});

	it('writes to KV on cache miss with existing status', async () => {
		const kv = makeKv(null);
		let callCount = 0;
		const db = {
			prepare: vi.fn().mockImplementation(() => ({
				bind: vi.fn().mockReturnValue({
					first: vi.fn().mockImplementation(() => {
						callCount++;
						if (callCount === 1) return Promise.resolve({ id: 1 });
						return Promise.resolve(sampleStatus);
					})
				})
			}))
		};
		await GET(makeReq('1', db, kv));
		expect(kv.put).toHaveBeenCalledWith(
			'status:shop:1',
			expect.any(String),
			{ expirationTtl: 90 }
		);
	});

	it('includes expires_at in cache hit response', async () => {
		const kv = makeKv(JSON.stringify(sampleStatus));
		const db = makeDb();
		const res = await GET(makeReq('1', db, kv));
		const body = await res.json();
		expect(body.cache.expires_at).toBeTruthy();
	});
});
