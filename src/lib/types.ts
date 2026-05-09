// Shared type definitions for 二郎マップ

export interface ShopStatus {
	current_wait_level: number | null;
	wait_level_label: string | null;
	report_count: number;
	confidence: number;
	last_reported_at: string | null;
	aggregated_at: string | null;
}

export interface Shop {
	id: number;
	name: string;
	lat: number;
	lng: number;
	address: string;
	nearest_station: string | null;
	category: 'jiro' | 'inspired';
	business_hours: string | null;
	closed_days: string | null;
	queue_notes: string | null;
	topping_notes: string | null;
	shop_notes: string | null;
	distance_m: number;
	status: ShopStatus | null;
}

export interface ShopDetail extends Shop {
	phone: string | null;
	tabelog_url: string | null;
	gurunavi_url: string | null;
	twitter_handle: string | null;
}

export interface Report {
	id: number;
	shop_id: number;
	wait_level: number;
	wait_level_label: string | null;
	comment: string | null;
	reported_at: string;
}

export interface ApiError {
	error: string;
	next_allowed_at?: string;
	retry_after?: number;
}

