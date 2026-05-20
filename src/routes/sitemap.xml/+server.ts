import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
	const baseUrl = 'https://jiromap.pages.dev';

	// 固定ページ（ja + en）
	const staticPages = [
		{ url: '/', priority: '1.0', changefreq: 'always' },
		{ url: '/map', priority: '0.9', changefreq: 'always' },
		{ url: '/shops', priority: '0.9', changefreq: 'always' },
		{ url: '/about', priority: '0.5', changefreq: 'monthly' },
		{ url: '/privacy', priority: '0.3', changefreq: 'yearly' },
		{ url: '/en', priority: '1.0', changefreq: 'always' },
		{ url: '/en/map', priority: '0.9', changefreq: 'always' },
		{ url: '/en/shops', priority: '0.9', changefreq: 'always' },
		{ url: '/en/about', priority: '0.5', changefreq: 'monthly' },
		{ url: '/en/privacy', priority: '0.3', changefreq: 'yearly' }
	];

	// 店舗ページ（D1 から取得）
	let shopUrls: { id: number; updated_at: string }[] = [];
	try {
		if (platform?.env.DB) {
			const result = await platform.env.DB.prepare(
				'SELECT id, updated_at FROM shops ORDER BY id'
			).all<{ id: number; updated_at: string }>();
			shopUrls = result.results ?? [];
		}
	} catch {
		// DB unavailable: static pages only
	}

	const urls = [
		...staticPages.map(
			(p) => `
  <url>
    <loc>${baseUrl}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
		),
		...shopUrls.flatMap(
			(shop) => [
				`
  <url>
    <loc>${baseUrl}/shops/${shop.id}</loc>
    <lastmod>${shop.updated_at.slice(0, 10)}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`,
				`
  <url>
    <loc>${baseUrl}/en/shops/${shop.id}</loc>
    <lastmod>${shop.updated_at.slice(0, 10)}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`
			]
		)
	].join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
