import { describe, it, expect } from 'vitest';
import { haversineMeters, boundingBox } from '../../src/lib/haversine';

describe('haversineMeters', () => {
	it('returns 0 for identical points', () => {
		expect(haversineMeters(35.6585, 139.7454, 35.6585, 139.7454)).toBe(0);
	});

	it('calculates distance between Shinjuku and Shibuya (~3.5km)', () => {
		// Shinjuku: 35.6896, 139.7006 / Shibuya: 35.6598, 139.7023
		const dist = haversineMeters(35.6896, 139.7006, 35.6598, 139.7023);
		expect(dist).toBeGreaterThan(3000);
		expect(dist).toBeLessThan(4000);
	});

	it('calculates ~111km per degree of latitude', () => {
		const dist = haversineMeters(35.0, 139.0, 36.0, 139.0);
		expect(dist).toBeGreaterThan(110000);
		expect(dist).toBeLessThan(112000);
	});

	it('is symmetric', () => {
		const d1 = haversineMeters(35.6474, 139.7399, 35.6965, 139.7573);
		const d2 = haversineMeters(35.6965, 139.7573, 35.6474, 139.7399);
		expect(d1).toBeCloseTo(d2, 5);
	});

	it('returns positive distance for non-identical points', () => {
		const dist = haversineMeters(35.0, 139.0, 35.001, 139.001);
		expect(dist).toBeGreaterThan(0);
	});
});

describe('boundingBox', () => {
	it('returns a box containing the center point', () => {
		const box = boundingBox(35.6585, 139.7454, 3000);
		expect(box.latMin).toBeLessThan(35.6585);
		expect(box.latMax).toBeGreaterThan(35.6585);
		expect(box.lngMin).toBeLessThan(139.7454);
		expect(box.lngMax).toBeGreaterThan(139.7454);
	});

	it('box height equals 2 * latDelta', () => {
		const box = boundingBox(35.6585, 139.7454, 1000);
		const height = box.latMax - box.latMin;
		const expected = (2 * 1000) / 111320;
		expect(height).toBeCloseTo(expected, 6);
	});

	it('box is wider at equator than at higher latitudes', () => {
		const boxEquator = boundingBox(0, 0, 1000);
		const boxTokyo = boundingBox(35.6, 139.7, 1000);
		const widthEquator = boxEquator.lngMax - boxEquator.lngMin;
		const widthTokyo = boxTokyo.lngMax - boxTokyo.lngMin;
		expect(widthEquator).toBeLessThan(widthTokyo);
	});

	it('contains points at the exact radius on lat axis', () => {
		const box = boundingBox(35.6585, 139.7454, 3000);
		const latDelta = 3000 / 111320;
		expect(box.latMax).toBeCloseTo(35.6585 + latDelta, 6);
		expect(box.latMin).toBeCloseTo(35.6585 - latDelta, 6);
	});
});
