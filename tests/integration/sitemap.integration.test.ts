/**
 * Integration tests for GET /sitemap.xml.
 * Uses real HTTP fetch against BASE_URL (default: https://jiromap.pages.dev).
 */

import { describe, it, expect } from 'vitest';

const BASE_URL = process.env['INTEGRATION_BASE_URL'] || process.env['BASE_URL'] || 'https://jiromap.pages.dev';

describe('GET /sitemap.xml', () => {
	it('returns 200 with XML content-type', async () => {
		const res = await fetch(`${BASE_URL}/sitemap.xml`);
		expect(res.status).toBe(200);

		const contentType = res.headers.get('content-type') ?? '';
		expect(contentType).toContain('application/xml');
	});

	it('contains <urlset and required page URLs', async () => {
		const res = await fetch(`${BASE_URL}/sitemap.xml`);
		const text = await res.text();

		expect(text).toContain('<urlset');

		// Static pages must be present
		expect(text).toContain(`${BASE_URL}/`);
		expect(text).toContain(`${BASE_URL}/shops`);
		expect(text).toContain(`${BASE_URL}/privacy`);
		expect(text).toContain(`${BASE_URL}/terms`);
	});
});
