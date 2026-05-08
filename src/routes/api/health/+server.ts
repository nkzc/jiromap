import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
	const results: Record<string, string> = {};

	// Check D1 connection
	try {
		await platform?.env.DB.prepare('SELECT 1').first();
		results.d1 = 'ok';
	} catch (e) {
		results.d1 = 'error';
	}

	// Check KV connection
	try {
		await platform?.env.JIROMAP_KV.put('health:check', '1', { expirationTtl: 60 });
		results.kv = 'ok';
	} catch (e) {
		results.kv = 'error';
	}

	const allOk = Object.values(results).every((v) => v === 'ok');

	return new Response(JSON.stringify({ status: allOk ? 'ok' : 'degraded', services: results }), {
		status: allOk ? 200 : 503,
		headers: { 'Content-Type': 'application/json' }
	});
};
