import { describe, it, expect } from 'vitest';
import { hashIp } from '../../src/lib/hash';

describe('hashIp', () => {
	it('returns a 64-character hex string', async () => {
		const hash = await hashIp('192.168.1.1', 'test-salt');
		expect(hash).toHaveLength(64);
		expect(hash).toMatch(/^[0-9a-f]{64}$/);
	});

	it('returns deterministic output for same input', async () => {
		const hash1 = await hashIp('192.168.1.1', 'test-salt');
		const hash2 = await hashIp('192.168.1.1', 'test-salt');
		expect(hash1).toBe(hash2);
	});

	it('returns different hash for different IP', async () => {
		const hash1 = await hashIp('192.168.1.1', 'test-salt');
		const hash2 = await hashIp('192.168.1.2', 'test-salt');
		expect(hash1).not.toBe(hash2);
	});

	it('returns different hash for different salt', async () => {
		const hash1 = await hashIp('192.168.1.1', 'salt-a');
		const hash2 = await hashIp('192.168.1.1', 'salt-b');
		expect(hash1).not.toBe(hash2);
	});

	it('handles empty IP string', async () => {
		const hash = await hashIp('', 'test-salt');
		expect(hash).toHaveLength(64);
	});

	it('handles "unknown" IP gracefully', async () => {
		const hash = await hashIp('unknown', 'test-salt');
		expect(hash).toHaveLength(64);
		expect(hash).toMatch(/^[0-9a-f]{64}$/);
	});
});
