/**
 * Calculate distance between two lat/lng points using the Haversine formula.
 * Returns distance in meters.
 */
export function haversineMeters(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number
): number {
	const R = 6371000; // Earth radius in meters
	const φ1 = (lat1 * Math.PI) / 180;
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate bounding box for a given center and radius.
 */
export function boundingBox(
	lat: number,
	lng: number,
	radiusM: number
): { latMin: number; latMax: number; lngMin: number; lngMax: number } {
	const latDelta = radiusM / 111320;
	const lngDelta = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
	return {
		latMin: lat - latDelta,
		latMax: lat + latDelta,
		lngMin: lng - lngDelta,
		lngMax: lng + lngDelta
	};
}
