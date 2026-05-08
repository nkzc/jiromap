import { describe, it, expect } from 'vitest';
import { WAIT_LEVEL_COLORS, getWaitLevelColor } from '../../src/lib/colors.js';

describe('WAIT_LEVEL_COLORS', () => {
	it('has a color for each wait level 0-4', () => {
		for (let i = 0; i <= 4; i++) {
			expect(WAIT_LEVEL_COLORS[i]).toBeDefined();
			expect(typeof WAIT_LEVEL_COLORS[i]).toBe('string');
		}
	});

	it('has a fallback color for null', () => {
		expect(WAIT_LEVEL_COLORS['null']).toBeDefined();
		expect(typeof WAIT_LEVEL_COLORS['null']).toBe('string');
	});
});

describe('getWaitLevelColor', () => {
	it('returns green for level 0 (no queue)', () => {
		expect(getWaitLevelColor(0)).toBe('#22c55e');
	});

	it('returns yellow-green for level 1 (1-5 people)', () => {
		expect(getWaitLevelColor(1)).toBe('#84cc16');
	});

	it('returns yellow for level 2 (6-10 people)', () => {
		expect(getWaitLevelColor(2)).toBe('#eab308');
	});

	it('returns orange for level 3 (11+ people)', () => {
		expect(getWaitLevelColor(3)).toBe('#f97316');
	});

	it('returns red for level 4 (closed/sold out)', () => {
		expect(getWaitLevelColor(4)).toBe('#ef4444');
	});

	it('returns gray for null', () => {
		expect(getWaitLevelColor(null)).toBe('#9ca3af');
	});

	it('returns gray for undefined', () => {
		expect(getWaitLevelColor(undefined)).toBe('#9ca3af');
	});

	it('returns gray for unknown level', () => {
		expect(getWaitLevelColor(99)).toBe('#9ca3af');
	});

	it('returns gray for negative level', () => {
		expect(getWaitLevelColor(-1)).toBe('#9ca3af');
	});
});
