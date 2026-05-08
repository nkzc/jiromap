/**
 * Integration tests — page smoke tests (疎通確認).
 * Verifies that each public page returns HTTP 200.
 * Uses real HTTP fetch against BASE_URL (default: https://jiromap.pages.dev).
 */

import { describe, it, expect } from 'vitest';

const BASE_URL = process.env['INTEGRATION_BASE_URL'] || process.env['BASE_URL'] || 'https://jiromap.pages.dev';

const pages = [
	{ path: '/', label: 'トップページ' },
	{ path: '/shops', label: '店舗一覧ページ' },
	{ path: '/shops/1', label: '店舗詳細ページ (id=1)' },
	{ path: '/privacy', label: 'プライバシーポリシーページ' },
	{ path: '/terms', label: '利用規約ページ' }
];

describe('Page smoke tests', () => {
	for (const { path, label } of pages) {
		it(`GET ${path} (${label}) returns 200`, async () => {
			const res = await fetch(`${BASE_URL}${path}`);
			expect(res.status).toBe(200);
		});
	}
});
