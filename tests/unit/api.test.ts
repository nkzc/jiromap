import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	fetchNearbyShops,
	fetchShopDetail,
	fetchShopStatus,
	fetchShopReports,
	postReport
} from '../../src/lib/api.js';

const mockShop = {
	id: 1,
	name: 'ラーメン二郎 三田本店',
	lat: 35.6474,
	lng: 139.7399,
	address: '東京都港区三田2-16-4',
	nearest_station: '都営三田線 三田駅 徒歩5分',
	category: 'jiro' as const,
	business_hours: '11:00-14:00, 17:00-20:00',
	closed_days: '月曜日・祝日',
	distance_m: 1331,
	status: {
		current_wait_level: 2,
		wait_level_label: '6〜10人',
		report_count: 3,
		confidence: 1.0,
		last_reported_at: null,
		aggregated_at: null
	}
};

function mockFetch(response: unknown, status = 200) {
	return vi.fn().mockResolvedValue({
		ok: status >= 200 && status < 300,
		status,
		json: () => Promise.resolve(response)
	});
}

describe('fetchNearbyShops', () => {
	beforeEach(() => {
		global.fetch = mockFetch({ shops: [mockShop] }) as unknown as typeof fetch;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('calls correct URL with lat/lng/radius', async () => {
		await fetchNearbyShops(35.6585, 139.7454, 3000);
		expect(global.fetch).toHaveBeenCalledWith(
			'/api/shops?lat=35.6585&lng=139.7454&radius=3000'
		);
	});

	it('uses default radius of 5000', async () => {
		await fetchNearbyShops(35.6585, 139.7454);
		expect(global.fetch).toHaveBeenCalledWith(
			'/api/shops?lat=35.6585&lng=139.7454&radius=5000'
		);
	});

	it('returns shops array', async () => {
		const result = await fetchNearbyShops(35.6585, 139.7454);
		expect(result).toEqual([mockShop]);
	});

	it('throws on non-ok response', async () => {
		global.fetch = mockFetch({ error: 'bad request' }, 400) as unknown as typeof fetch;
		await expect(fetchNearbyShops(0, 0)).rejects.toThrow('API error: 400');
	});
});

describe('fetchShopDetail', () => {
	beforeEach(() => {
		global.fetch = mockFetch({
			shop: { ...mockShop, phone: null, tabelog_url: null, gurunavi_url: null, twitter_handle: null }
		}) as unknown as typeof fetch;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('calls /api/shops/:id', async () => {
		await fetchShopDetail(1);
		expect(global.fetch).toHaveBeenCalledWith('/api/shops/1');
	});

	it('returns shop detail', async () => {
		const result = await fetchShopDetail(1);
		expect(result.id).toBe(1);
		expect(result.name).toBe('ラーメン二郎 三田本店');
	});

	it('throws on non-ok response', async () => {
		global.fetch = mockFetch({ error: 'not found' }, 404) as unknown as typeof fetch;
		await expect(fetchShopDetail(999)).rejects.toThrow('API error: 404');
	});
});

describe('fetchShopStatus', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('calls /api/shops/:id/status', async () => {
		global.fetch = mockFetch(mockShop.status) as unknown as typeof fetch;
		await fetchShopStatus(1);
		expect(global.fetch).toHaveBeenCalledWith('/api/shops/1/status');
	});

	it('throws on non-ok response', async () => {
		global.fetch = mockFetch({ error: 'not found' }, 404) as unknown as typeof fetch;
		await expect(fetchShopStatus(999)).rejects.toThrow('API error: 404');
	});
});

describe('fetchShopReports', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('calls /api/shops/:id/reports with default limit', async () => {
		global.fetch = mockFetch({ reports: [] }) as unknown as typeof fetch;
		await fetchShopReports(1);
		expect(global.fetch).toHaveBeenCalledWith('/api/shops/1/reports?limit=20');
	});

	it('calls /api/shops/:id/reports with custom limit', async () => {
		global.fetch = mockFetch({ reports: [] }) as unknown as typeof fetch;
		await fetchShopReports(1, 5);
		expect(global.fetch).toHaveBeenCalledWith('/api/shops/1/reports?limit=5');
	});

	it('throws on non-ok response', async () => {
		global.fetch = mockFetch({ error: 'not found' }, 404) as unknown as typeof fetch;
		await expect(fetchShopReports(999)).rejects.toThrow('API error: 404');
	});
});

describe('postReport', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('posts to correct URL with JSON body', async () => {
		global.fetch = mockFetch({ id: 1 }, 201) as unknown as typeof fetch;
		await postReport(1, 2, 'test comment');
		expect(global.fetch).toHaveBeenCalledWith('/api/shops/1/reports', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ wait_level: 2, comment: 'test comment' })
		});
	});

	it('returns ok:true on 201', async () => {
		global.fetch = mockFetch({ id: 1 }, 201) as unknown as typeof fetch;
		const result = await postReport(1, 0);
		expect(result.ok).toBe(true);
		expect(result.status).toBe(201);
	});

	it('returns ok:false on 429', async () => {
		global.fetch = mockFetch({ error: 'RATE_LIMIT_EXCEEDED', retry_after: 60 }, 429) as unknown as typeof fetch;
		const result = await postReport(1, 2);
		expect(result.ok).toBe(false);
		expect(result.status).toBe(429);
	});

	it('returns ok:false on 400', async () => {
		global.fetch = mockFetch({ error: 'INVALID_WAIT_LEVEL' }, 400) as unknown as typeof fetch;
		const result = await postReport(1, 99);
		expect(result.ok).toBe(false);
	});

	it('omits comment when not provided', async () => {
		global.fetch = mockFetch({ id: 1 }, 201) as unknown as typeof fetch;
		await postReport(1, 0);
		const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		const body = JSON.parse(call[1].body);
		expect(body.comment).toBeUndefined();
	});
});
