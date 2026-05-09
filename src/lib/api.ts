// API client for 二郎マップ
import type { Shop, ShopDetail, ShopStatus, Report } from './types.js';

export type { Shop, ShopDetail, ShopStatus, Report };

export async function fetchNearbyShops(
	lat: number,
	lng: number,
	radius = 5000
): Promise<Shop[]> {
	const res = await fetch(`/api/shops?lat=${lat}&lng=${lng}&radius=${radius}`);
	if (!res.ok) throw new Error(`API error: ${res.status}`);
	const data = await res.json();
	return data.shops;
}

export async function fetchShopDetail(id: number): Promise<ShopDetail> {
	const res = await fetch(`/api/shops/${id}`);
	if (!res.ok) throw new Error(`API error: ${res.status}`);
	const data = await res.json();
	return data.shop;
}

export async function fetchShopStatus(id: number): Promise<ShopStatus> {
	const res = await fetch(`/api/shops/${id}/status`);
	if (!res.ok) throw new Error(`API error: ${res.status}`);
	return res.json();
}

export async function fetchShopReports(id: number, limit = 20): Promise<{ reports: Report[] }> {
	const res = await fetch(`/api/shops/${id}/reports?limit=${limit}`);
	if (!res.ok) throw new Error(`API error: ${res.status}`);
	return res.json();
}
