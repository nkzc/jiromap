import type { RequestHandler } from './$types';

export const GET: RequestHandler = () =>
	new Response('google-site-verification: googled6c3660b134714e9.html', {
		headers: { 'Content-Type': 'text/html; charset=utf-8' }
	});
