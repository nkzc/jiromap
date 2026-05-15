import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) return { shop: null, recentReports: [] };

	try {
		const [shopRes, reportsRes] = await Promise.all([
			fetch(`/api/shops/${id}`),
			fetch(`/api/shops/${id}/reports?limit=5`)
		]);
		const shopData = shopRes.ok ? await shopRes.json() : null;
		const reportsData = reportsRes.ok ? await reportsRes.json() : { reports: [] };
		return {
			shop: shopData?.shop ?? null,
			recentReports: reportsData.reports ?? []
		};
	} catch {
		return { shop: null, recentReports: [] };
	}
};
