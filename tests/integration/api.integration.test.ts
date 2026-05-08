/**
 * Integration tests for API endpoints (endpoints 1–8).
 * Uses real HTTP fetch against BASE_URL (default: https://jiromap.pages.dev).
 * No mocks — tests hit the actual deployed service.
 */

import { describe, it, expect } from 'vitest';

const BASE_URL = process.env['INTEGRATION_BASE_URL'] || process.env['BASE_URL'] || 'https://jiromap.pages.dev';

// ─── 1. GET /api/health ───────────────────────────────────────────────────────

describe('GET /api/health', () => {
	it('returns 200 with status ok and healthy services', async () => {
		const res = await fetch(`${BASE_URL}/api/health`);
		expect(res.status).toBe(200);

		const body = await res.json() as { status: string; services: { d1: string; kv: string } };
		expect(body.status).toBe('ok');
		expect(body.services.d1).toBe('ok');
		expect(body.services.kv).toBe('ok');
	});
});

// ─── 2. GET /api/shops ───────────────────────────────────────────────────────

describe('GET /api/shops', () => {
	it('returns 200 with shops array and correct meta for lat/lng/radius', async () => {
		const res = await fetch(`${BASE_URL}/api/shops?lat=35.6585&lng=139.7454&radius=5000`);
		expect(res.status).toBe(200);

		const body = await res.json() as {
			shops: Array<{
				id: number;
				name: string;
				lat: number;
				lng: number;
				distance_m: number;
			}>;
			meta: { radius_m: number; lat: number; lng: number; total: number; retrieved_at: string };
		};

		expect(Array.isArray(body.shops)).toBe(true);

		// Each shop must have required fields
		for (const shop of body.shops) {
			expect(typeof shop.id).toBe('number');
			expect(typeof shop.name).toBe('string');
			expect(typeof shop.lat).toBe('number');
			expect(typeof shop.lng).toBe('number');
			expect(typeof shop.distance_m).toBe('number');
		}

		expect(body.meta.radius_m).toBe(5000);
	});

	it('includes 三田本店 when using radius=3000 centered near it', async () => {
		const res = await fetch(
			`${BASE_URL}/api/shops?lat=35.6474&lng=139.7399&radius=3000`
		);
		expect(res.status).toBe(200);

		const body = await res.json() as {
			shops: Array<{ id: number; name: string; lat: number; lng: number }>;
		};

		const mitaHonten = body.shops.find(
			(s) => Math.abs(s.lat - 35.6474) < 0.001 && Math.abs(s.lng - 139.7399) < 0.001
		);
		expect(mitaHonten).toBeDefined();
	});
});

// ─── 3. GET /api/shops/1 ─────────────────────────────────────────────────────

describe('GET /api/shops/1', () => {
	it('returns 200 with shop id=1 and name', async () => {
		const res = await fetch(`${BASE_URL}/api/shops/1`);
		expect(res.status).toBe(200);

		// The server returns the shop object directly (not wrapped)
		const shop = await res.json() as { id: number; name: string };
		expect(shop.id).toBe(1);
		expect(typeof shop.name).toBe('string');
		expect(shop.name.length).toBeGreaterThan(0);
	});
});

// ─── 4. GET /api/shops/9999 (non-existent) ───────────────────────────────────

describe('GET /api/shops/9999', () => {
	it('returns 404 with SHOP_NOT_FOUND error code', async () => {
		const res = await fetch(`${BASE_URL}/api/shops/9999`);
		expect(res.status).toBe(404);

		const body = await res.json() as { error: { code: string } };
		expect(body.error.code).toBe('SHOP_NOT_FOUND');
	});
});

// ─── 5. GET /api/shops/1/status ──────────────────────────────────────────────

describe('GET /api/shops/1/status', () => {
	it('returns 200 with shop_id=1 and cache object', async () => {
		const res = await fetch(`${BASE_URL}/api/shops/1/status`);
		expect(res.status).toBe(200);

		const body = await res.json() as {
			shop_id: number;
			cache: { hit: boolean };
		};

		expect(body.shop_id).toBe(1);
		expect(body.cache).toBeDefined();
		expect(typeof body.cache.hit).toBe('boolean');
	});
});

// ─── 6. GET /api/shops/1/reports ─────────────────────────────────────────────

describe('GET /api/shops/1/reports', () => {
	it('returns 200 with reports array and meta', async () => {
		const res = await fetch(`${BASE_URL}/api/shops/1/reports`);
		expect(res.status).toBe(200);

		const body = await res.json() as {
			reports: unknown[];
			meta: { shop_id: number; total: number; window_minutes?: number };
		};

		expect(Array.isArray(body.reports)).toBe(true);
		expect(body.meta).toBeDefined();
		expect(body.meta.shop_id).toBe(1);
		// window_minutes may be present (future extension) — check if present it equals 30
		if (body.meta.window_minutes !== undefined) {
			expect(body.meta.window_minutes).toBe(30);
		}
	});
});

// ─── 7. POST /api/shops/1/reports — validation errors ────────────────────────

describe('POST /api/shops/1/reports — validation', () => {
	it('returns 400 when wait_level is omitted', async () => {
		const res = await fetch(`${BASE_URL}/api/shops/1/reports`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ comment: 'no wait_level' })
		});
		expect(res.status).toBe(400);
	});

	it('returns 400 INVALID_WAIT_LEVEL when wait_level=5 (out of range)', async () => {
		const res = await fetch(`${BASE_URL}/api/shops/1/reports`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ wait_level: 5 })
		});
		expect(res.status).toBe(400);

		const body = await res.json() as { error: { code: string } };
		expect(body.error.code).toBe('INVALID_WAIT_LEVEL');
	});

	it('returns 400 COMMENT_TOO_LONG when comment is 101 characters', async () => {
		const longComment = 'a'.repeat(101);
		const res = await fetch(`${BASE_URL}/api/shops/1/reports`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ wait_level: 1, comment: longComment })
		});
		expect(res.status).toBe(400);

		const body = await res.json() as { error: { code: string } };
		expect(body.error.code).toBe('COMMENT_TOO_LONG');
	});
});

// ─── 8. GET /api/shops?lat=35.6585 (lng missing) ─────────────────────────────

describe('GET /api/shops with missing required params', () => {
	it('returns 400 MISSING_REQUIRED_PARAMS when lng is absent', async () => {
		const res = await fetch(`${BASE_URL}/api/shops?lat=35.6585`);
		expect(res.status).toBe(400);

		const body = await res.json() as { error: { code: string } };
		expect(body.error.code).toBe('MISSING_REQUIRED_PARAMS');
	});
});
