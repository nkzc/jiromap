/**
 * Unified error response builder.
 */
export function errorResponse(
	code: string,
	message: string,
	status: number,
	extra?: Record<string, unknown>
): Response {
	return new Response(
		JSON.stringify({
			error: { code, message, status, ...extra }
		}),
		{
			status,
			headers: { 'Content-Type': 'application/json' }
		}
	);
}
