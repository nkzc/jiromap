import { describe, it, expect, vi } from 'vitest';
import { GET } from '../../src/routes/api/shops/[id]/+server';

function makeDb(row: unknown = null) {
	return {
		prepare: vi.fn().mockReturnValue({
			bind: vi.fn().mockReturnValue({
				first: vi.fn().mockResolvedValue(row)
			})
		})
	};
}

function makeReq(id: string, db?: unknown) {
	return {
		params: { id },
		platform: db ? { env: { DB: db } } : undefined
	} as unknown as Parameters<typeof GET>[0];
}

const sampleShop = {
	id: 1,
	name: 'ラーメン二郎 三田本店',
	lat: 35.6474,
	lng: 139.7399,
	address: '東京都港区三田2-16-4',
	nearest_station: '都営三田線 三田駅 徒歩5分',
	phone: null,
	business_hours: '11:00-14:00, 17:00-20:00',
	closed_days: '月曜日・祝日',
	category: 'jiro',
	tabelog_url: null,
	gurunavi_url: null,
	twitter_handle: null,
	created_at: '2026-05-02T00:00:00.000Z',
	updated_at: '2026-05-02T00:00:00.000Z',
	current_wait_level: 2,
	report_count: 3,
	confidence: 1.0,
	last_reported_at: '2026-05-02T12:03:45.000Z',
	aggregated_at: '2026-05-02T12:04:00.000Z'
};

describe('GET /api/shops/:id', () => {
	it('returns 400 for non-integer id', async () => {
		const res = await GET(makeReq('abc'));
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe('INVALID_SHOP_ID');
	});

	it('returns 400 for negative id', async () => {
		const res = await GET(makeReq('-1'));
		expect(res.status).toBe(400);
	});

	it('returns 400 for zero', async () => {
		const res = await GET(makeReq('0'));
		expect(res.status).toBe(400);
	});

	it('returns 400 for float id', async () => {
		const res = await GET(makeReq('1.5'));
		expect(res.status).toBe(400);
	});

	it('returns 500 when platform is unavailable', async () => {
		const res = await GET(makeReq('1'));
		expect(res.status).toBe(500);
	});

	it('returns 404 when shop not found', async () => {
		const db = makeDb(null);
		const res = await GET(makeReq('999', db));
		expect(res.status).toBe(404);
		const body = await res.json();
		expect(body.error.code).toBe('SHOP_NOT_FOUND');
	});

	it('returns 200 with shop data', async () => {
		const db = makeDb(sampleShop);
		const res = await GET(makeReq('1', db));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.id).toBe(1);
		expect(body.name).toBe('ラーメン二郎 三田本店');
	});

	it('includes status when wait_level is present', async () => {
		const db = makeDb(sampleShop);
		const res = await GET(makeReq('1', db));
		const body = await res.json();
		expect(body.status).not.toBeNull();
		expect(body.status.current_wait_level).toBe(2);
		expect(body.status.wait_level_label).toBe('6〜10人');
	});

	it('returns null status when wait_level is null', async () => {
		const shopNoStatus = { ...sampleShop, current_wait_level: null, report_count: null };
		const db = makeDb(shopNoStatus);
		const res = await GET(makeReq('1', db));
		const body = await res.json();
		expect(body.status).toBeNull();
	});

	it('handles database error gracefully', async () => {
		const db = {
			prepare: vi.fn().mockReturnValue({
				bind: vi.fn().mockReturnValue({
					first: vi.fn().mockRejectedValue(new Error('DB error'))
				})
			})
		};
		const res = await GET(makeReq('1', db));
		expect(res.status).toBe(500);
		const body = await res.json();
		expect(body.error.code).toBe('DATABASE_ERROR');
	});
});
