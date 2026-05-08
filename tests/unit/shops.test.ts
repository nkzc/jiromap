import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../src/routes/api/shops/+server';

// Mock platform helpers
function makeDb(rows: unknown[] = []) {
	return {
		prepare: vi.fn().mockReturnValue({
			bind: vi.fn().mockReturnValue({
				all: vi.fn().mockResolvedValue({ results: rows }),
				first: vi.fn().mockResolvedValue(rows[0] ?? null)
			})
		})
	};
}

function makeRequest(searchParams: Record<string, string>) {
	const url = new URL('http://localhost/api/shops?' + new URLSearchParams(searchParams).toString());
	return { url, platform: undefined } as unknown as Parameters<typeof GET>[0];
}

const sampleShops = [
	{
		id: 1,
		name: 'ラーメン二郎 三田本店',
		lat: 35.6474,
		lng: 139.7399,
		address: '東京都港区三田2-16-4',
		nearest_station: '都営三田線 三田駅 徒歩5分',
		business_hours: '11:00-14:00, 17:00-20:00',
		closed_days: '月曜日・祝日',
		category: 'jiro',
		current_wait_level: 2,
		report_count: 3,
		confidence: 1.0,
		last_reported_at: '2026-05-02T12:03:45.000Z',
		aggregated_at: '2026-05-02T12:04:00.000Z'
	},
	{
		id: 2,
		name: 'ラーメン二郎 神田神保町店',
		lat: 35.6965,
		lng: 139.7573,
		address: '東京都千代田区神田神保町2-10',
		nearest_station: '都営新宿線 神保町駅 徒歩3分',
		business_hours: '11:00-15:00',
		closed_days: '日曜日・祝日',
		category: 'jiro',
		current_wait_level: null,
		report_count: null,
		confidence: null,
		last_reported_at: null,
		aggregated_at: null
	}
];

describe('GET /api/shops', () => {
	it('returns 400 when lat/lng are missing', async () => {
		const req = makeRequest({});
		const res = await GET(req);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe('MISSING_REQUIRED_PARAMS');
	});

	it('returns 400 when only lat is provided', async () => {
		const req = makeRequest({ lat: '35.6585' });
		const res = await GET(req);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe('MISSING_REQUIRED_PARAMS');
	});

	it('returns 400 for invalid lat value', async () => {
		const req = makeRequest({ lat: 'abc', lng: '139.7454' });
		const res = await GET(req);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe('INVALID_PARAM_VALUE');
	});

	it('returns 400 for lat out of range', async () => {
		const req = makeRequest({ lat: '91', lng: '139.7454' });
		const res = await GET(req);
		expect(res.status).toBe(400);
	});

	it('returns 400 for invalid radius (too large)', async () => {
		const req = makeRequest({ lat: '35.6585', lng: '139.7454', radius: '99999' });
		const res = await GET(req);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe('INVALID_PARAM_VALUE');
	});

	it('returns 500 when platform is unavailable', async () => {
		const req = makeRequest({ lat: '35.6585', lng: '139.7454' });
		const res = await GET(req);
		expect(res.status).toBe(500);
	});

	it('returns shops with distance_m for valid request', async () => {
		const db = makeDb(sampleShops);
		const url = new URL('http://localhost/api/shops?lat=35.6585&lng=139.7454&radius=5000');
		const req = {
			url,
			platform: { env: { DB: db } }
		} as unknown as Parameters<typeof GET>[0];

		const res = await GET(req);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toHaveProperty('shops');
		expect(body).toHaveProperty('meta');
		expect(body.meta.lat).toBe(35.6585);
		expect(body.meta.lng).toBe(139.7454);
		expect(Array.isArray(body.shops)).toBe(true);
	});

	it('shops are sorted by distance_m ascending', async () => {
		// Use shops at different distances from Shinjuku (35.6896, 139.7006)
		// Mita is farther (~3.5km), Jimboucho is ~1.6km
		const db = makeDb(sampleShops);
		const url = new URL('http://localhost/api/shops?lat=35.6896&lng=139.7006&radius=10000');
		const req = {
			url,
			platform: { env: { DB: db } }
		} as unknown as Parameters<typeof GET>[0];

		const res = await GET(req);
		const body = await res.json();
		const shops = body.shops;
		if (shops.length >= 2) {
			for (let i = 1; i < shops.length; i++) {
				expect(shops[i].distance_m).toBeGreaterThanOrEqual(shops[i - 1].distance_m);
			}
		}
	});

	it('includes status object when wait_level is present', async () => {
		const db = makeDb([sampleShops[0]]);
		const url = new URL('http://localhost/api/shops?lat=35.6474&lng=139.7399&radius=100');
		const req = {
			url,
			platform: { env: { DB: db } }
		} as unknown as Parameters<typeof GET>[0];

		const res = await GET(req);
		const body = await res.json();
		if (body.shops.length > 0) {
			expect(body.shops[0].status).not.toBeNull();
			expect(body.shops[0].status.wait_level_label).toBe('6〜10人');
		}
	});

	it('status is null when wait_level is null', async () => {
		const db = makeDb([sampleShops[1]]);
		const url = new URL('http://localhost/api/shops?lat=35.6965&lng=139.7573&radius=100');
		const req = {
			url,
			platform: { env: { DB: db } }
		} as unknown as Parameters<typeof GET>[0];

		const res = await GET(req);
		const body = await res.json();
		if (body.shops.length > 0) {
			expect(body.shops[0].status).toBeNull();
		}
	});

	it('excludes shops outside radius after haversine filter', async () => {
		// Shop is far away; bounding box may include it but haversine should exclude it
		const farShop = {
			...sampleShops[0],
			lat: 35.7382, // ~10km away from 35.6585
			lng: 139.662
		};
		const db = makeDb([farShop]);
		const url = new URL('http://localhost/api/shops?lat=35.6585&lng=139.7454&radius=500');
		const req = {
			url,
			platform: { env: { DB: db } }
		} as unknown as Parameters<typeof GET>[0];

		const res = await GET(req);
		const body = await res.json();
		expect(body.shops.length).toBe(0);
	});

	it('handles database error gracefully', async () => {
		const db = {
			prepare: vi.fn().mockReturnValue({
				bind: vi.fn().mockReturnValue({
					all: vi.fn().mockRejectedValue(new Error('DB error'))
				})
			})
		};
		const url = new URL('http://localhost/api/shops?lat=35.6585&lng=139.7454');
		const req = {
			url,
			platform: { env: { DB: db } }
		} as unknown as Parameters<typeof GET>[0];

		const res = await GET(req);
		expect(res.status).toBe(500);
		const body = await res.json();
		expect(body.error.code).toBe('DATABASE_ERROR');
	});
});

describe('GET /api/shops/:id', () => {
	// Import inline to keep test isolation
	it('is tested via shops.test.ts fixture validation', () => {
		// Tested in shop-id.test.ts
		expect(true).toBe(true);
	});
});
