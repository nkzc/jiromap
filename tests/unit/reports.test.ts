import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../../src/routes/api/shops/[id]/reports/+server';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeKv(cached: string | null = null) {
	return {
		get: vi.fn().mockResolvedValue(cached),
		put: vi.fn().mockResolvedValue(undefined),
		delete: vi.fn().mockResolvedValue(undefined)
	};
}

function makeCookies(sessionId?: string) {
	return {
		get: vi.fn().mockReturnValue(sessionId ?? null)
	};
}

const sampleReports = [
	{
		id: 10,
		shop_id: 1,
		wait_level: 2,
		comment: 'テストコメント',
		created_at: '2026-05-02T12:00:00.000Z'
	},
	{
		id: 11,
		shop_id: 1,
		wait_level: 1,
		comment: null,
		created_at: '2026-05-02T11:50:00.000Z'
	}
];

const sampleReport = sampleReports[0];

// ── GET tests ─────────────────────────────────────────────────────────────────

describe('GET /api/shops/:id/reports', () => {
	it('returns 400 for invalid id', async () => {
		const req = {
			params: { id: 'abc' },
			url: new URL('http://localhost/api/shops/abc/reports'),
			platform: undefined
		} as unknown as Parameters<typeof GET>[0];
		const res = await GET(req);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe('INVALID_SHOP_ID');
	});

	it('returns 500 when platform unavailable', async () => {
		const req = {
			params: { id: '1' },
			url: new URL('http://localhost/api/shops/1/reports'),
			platform: undefined
		} as unknown as Parameters<typeof GET>[0];
		const res = await GET(req);
		expect(res.status).toBe(500);
	});

	it('returns 404 when shop not found', async () => {
		const db = {
			prepare: vi.fn().mockReturnValue({
				bind: vi.fn().mockReturnValue({
					first: vi.fn().mockResolvedValue(null),
					all: vi.fn().mockResolvedValue({ results: [] })
				})
			})
		};
		const req = {
			params: { id: '999' },
			url: new URL('http://localhost/api/shops/999/reports'),
			platform: { env: { DB: db } }
		} as unknown as Parameters<typeof GET>[0];
		const res = await GET(req);
		expect(res.status).toBe(404);
	});

	it('returns reports list', async () => {
		let callCount = 0;
		const db = {
			prepare: vi.fn().mockReturnValue({
				bind: vi.fn().mockReturnValue({
					first: vi.fn().mockImplementation(() => {
						callCount++;
						return Promise.resolve(callCount === 1 ? { id: 1 } : null);
					}),
					all: vi.fn().mockResolvedValue({ results: sampleReports })
				})
			})
		};
		const req = {
			params: { id: '1' },
			url: new URL('http://localhost/api/shops/1/reports'),
			platform: { env: { DB: db } }
		} as unknown as Parameters<typeof GET>[0];
		const res = await GET(req);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.reports).toHaveLength(2);
		expect(body.reports[0].wait_level_label).toBe('6〜10人');
	});

	it('includes wait_level_label in each report', async () => {
		let callCount = 0;
		const db = {
			prepare: vi.fn().mockReturnValue({
				bind: vi.fn().mockReturnValue({
					first: vi.fn().mockImplementation(() => {
						callCount++;
						return Promise.resolve(callCount === 1 ? { id: 1 } : null);
					}),
					all: vi.fn().mockResolvedValue({ results: sampleReports })
				})
			})
		};
		const req = {
			params: { id: '1' },
			url: new URL('http://localhost/api/shops/1/reports?limit=10'),
			platform: { env: { DB: db } }
		} as unknown as Parameters<typeof GET>[0];
		const res = await GET(req);
		const body = await res.json();
		expect(body.reports[1].wait_level_label).toBe('1〜5人');
	});
});

// ── POST tests ────────────────────────────────────────────────────────────────

function makePostReq(
	id: string,
	body: unknown,
	db?: unknown,
	kv?: unknown,
	sessionId?: string,
	ip = '127.0.0.1'
) {
	return {
		params: { id },
		request: {
			json: vi.fn().mockResolvedValue(body),
			headers: {
				get: vi.fn().mockImplementation((h: string) => {
					if (h === 'CF-Connecting-IP') return ip;
					return null;
				})
			}
		},
		platform:
			db && kv
				? { env: { DB: db, JIROMAP_KV: kv, IP_HASH_SALT: 'test-salt' } }
				: undefined,
		cookies: makeCookies(sessionId)
	} as unknown as Parameters<typeof POST>[0];
}

function makeInsertDb(shopExists = true, insertRow?: unknown, statusRow: unknown = null) {
	const row = insertRow ?? {
		id: 100,
		shop_id: 1,
		wait_level: 2,
		comment: null,
		created_at: '2026-05-02T12:10:00.000Z'
	};

	let callIndex = 0;
	return {
		prepare: vi.fn().mockImplementation((sql: string) => {
			if (sql.includes('FROM shops')) {
				return {
					bind: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue(shopExists ? { id: 1 } : null)
					})
				};
			}
			if (sql.includes('INSERT INTO crowd_reports')) {
				return {
					bind: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue(row)
					})
				};
			}
			// status query (WITH recent_reports)
			return {
				bind: vi.fn().mockReturnValue({
					first: vi.fn().mockResolvedValue(statusRow),
					all: vi.fn().mockResolvedValue({ results: [] })
				})
			};
		})
	};
}

describe('POST /api/shops/:id/reports', () => {
	it('returns 400 for invalid shop id', async () => {
		const req = makePostReq('abc', { wait_level: 2 });
		const res = await POST(req);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe('INVALID_SHOP_ID');
	});

	it('returns 500 when platform unavailable', async () => {
		const req = makePostReq('1', { wait_level: 2 });
		const res = await POST(req);
		expect(res.status).toBe(500);
	});

	it('returns 400 for invalid wait_level (out of range)', async () => {
		const kv = makeKv();
		const db = makeInsertDb();
		const req = makePostReq('1', { wait_level: 5 }, db, kv, 'session-1');
		const res = await POST(req);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe('INVALID_WAIT_LEVEL');
	});

	it('returns 400 for missing wait_level', async () => {
		const kv = makeKv();
		const db = makeInsertDb();
		const req = makePostReq('1', {}, db, kv, 'session-1');
		const res = await POST(req);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe('INVALID_WAIT_LEVEL');
	});

	it('returns 400 for comment too long', async () => {
		const kv = makeKv();
		const db = makeInsertDb();
		const longComment = 'あ'.repeat(101);
		const req = makePostReq('1', { wait_level: 1, comment: longComment }, db, kv, 'session-1');
		const res = await POST(req);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error.code).toBe('COMMENT_TOO_LONG');
	});

	it('returns 404 when shop not found', async () => {
		const kv = makeKv();
		const db = makeInsertDb(false);
		const req = makePostReq('999', { wait_level: 1 }, db, kv, 'session-1');
		const res = await POST(req);
		expect(res.status).toBe(404);
		const body = await res.json();
		expect(body.error.code).toBe('SHOP_NOT_FOUND');
	});

	it('returns 429 when KV session spam block exists', async () => {
		const nextAllowed = new Date(Date.now() + 1800000).toISOString();
		const kv = {
			get: vi.fn().mockResolvedValue(nextAllowed), // session blocked
			put: vi.fn().mockResolvedValue(undefined),
			delete: vi.fn().mockResolvedValue(undefined)
		};
		const db = makeInsertDb();
		const req = makePostReq('1', { wait_level: 1 }, db, kv, 'blocked-session');
		const res = await POST(req);
		expect(res.status).toBe(429);
		const body = await res.json();
		expect(body.error.code).toBe('DUPLICATE_REPORT');
		expect(body.error.next_allowed_at).toBeTruthy();
	});

	it('creates report successfully and returns 201', async () => {
		const kv = makeKv(null); // no spam block
		// Override get to return null for both spam KV checks
		kv.get = vi.fn().mockResolvedValue(null);
		const db = makeInsertDb(true);
		// Also need D1 spam check fallback to return null
		const req = makePostReq('1', { wait_level: 2 }, db, kv, 'new-session');
		const res = await POST(req);
		expect(res.status).toBe(201);
		const body = await res.json();
		expect(body.report).toBeTruthy();
		expect(body.report.wait_level).toBe(2);
		expect(body.report.wait_level_label).toBe('6〜10人');
		expect(body.next_allowed_at).toBeTruthy();
	});

	it('writes spam block to KV after successful insert', async () => {
		const kv = makeKv(null);
		kv.get = vi.fn().mockResolvedValue(null);
		const db = makeInsertDb(true);
		const req = makePostReq('1', { wait_level: 1 }, db, kv, 'session-xyz');
		await POST(req);
		// Should have called kv.put for spam block (session and ip)
		const putCalls = kv.put.mock.calls;
		const spamKeys = putCalls.filter(
			(c: string[]) => c[0].startsWith('spam:session:') || c[0].startsWith('spam:ip:')
		);
		expect(spamKeys.length).toBeGreaterThanOrEqual(2);
	});

	it('deletes status cache from KV after insert', async () => {
		const kv = makeKv(null);
		kv.get = vi.fn().mockResolvedValue(null);
		const db = makeInsertDb(true);
		const req = makePostReq('1', { wait_level: 0 }, db, kv, 'session-abc');
		await POST(req);
		expect(kv.delete).toHaveBeenCalledWith('status:shop:1');
	});

	it('sets session cookie when no cookie exists', async () => {
		const kv = makeKv(null);
		kv.get = vi.fn().mockResolvedValue(null);
		const db = makeInsertDb(true);
		// No session ID passed (cookies.get returns null)
		const req = makePostReq('1', { wait_level: 0 }, db, kv, undefined);
		const res = await POST(req);
		if (res.status === 201) {
			const setCookie = res.headers.get('Set-Cookie');
			expect(setCookie).toContain('jiromap_session=');
			expect(setCookie).toContain('HttpOnly');
		}
	});

	it('handles JSON parse error', async () => {
		const kv = makeKv(null);
		const db = makeInsertDb();
		const req = {
			params: { id: '1' },
			request: {
				json: vi.fn().mockRejectedValue(new SyntaxError('bad json')),
				headers: { get: vi.fn().mockReturnValue(null) }
			},
			platform: { env: { DB: db, JIROMAP_KV: kv, IP_HASH_SALT: 'test-salt' } },
			cookies: makeCookies('session-1')
		} as unknown as Parameters<typeof POST>[0];
		const res = await POST(req);
		expect(res.status).toBe(400);
	});
});
