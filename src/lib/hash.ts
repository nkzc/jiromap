/**
 * Hash an IP address with a salt using Web Crypto API (SHA-256).
 * Returns a 64-character hex string.
 */
export async function hashIp(ip: string, salt: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(ip + salt);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	return Array.from(new Uint8Array(hashBuffer))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}
