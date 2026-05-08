// Mock data for development (API fallback)
import type { Shop } from './types.js';

export const MOCK_SHOPS: Shop[] = [
	{
		id: 1,
		name: 'ラーメン二郎 三田本店',
		lat: 35.6474,
		lng: 139.7399,
		address: '東京都港区三田2-16-4',
		nearest_station: '都営三田線 三田駅 徒歩5分',
		category: 'jiro',
		business_hours: '11:00-14:00, 17:00-20:00',
		closed_days: '月曜日・祝日',
		distance_m: 1331,
		status: {
			current_wait_level: 2,
			wait_level_label: '6〜10人',
			report_count: 3,
			confidence: 1.0,
			last_reported_at: null,
			aggregated_at: null
		}
	},
	{
		id: 2,
		name: 'ラーメン二郎 神田神保町店',
		lat: 35.6965,
		lng: 139.7573,
		address: '東京都千代田区神田神保町2-10',
		nearest_station: '都営新宿線 神保町駅 徒歩3分',
		category: 'jiro',
		business_hours: '11:00-15:00',
		closed_days: '日曜日・祝日',
		distance_m: 3584,
		status: null
	},
	{
		id: 3,
		name: 'ラーメン二郎 新宿歌舞伎町店',
		lat: 35.6938,
		lng: 139.7034,
		address: '東京都新宿区歌舞伎町1-1-1',
		nearest_station: 'JR新宿駅 東口 徒歩5分',
		category: 'jiro',
		business_hours: '11:30-15:00, 17:00-21:00',
		closed_days: '水曜日',
		distance_m: 4200,
		status: {
			current_wait_level: 1,
			wait_level_label: '1〜5人',
			report_count: 1,
			confidence: 0.5,
			last_reported_at: null,
			aggregated_at: null
		}
	},
	{
		id: 4,
		name: 'ラーメン二郎 目黒店',
		lat: 35.6328,
		lng: 139.7155,
		address: '東京都目黒区目黒1-3-14',
		nearest_station: 'JR目黒駅 徒歩3分',
		category: 'jiro',
		business_hours: '11:00-14:30',
		closed_days: '日曜日・月曜日',
		distance_m: 2800,
		status: {
			current_wait_level: 3,
			wait_level_label: '11人以上',
			report_count: 5,
			confidence: 1.0,
			last_reported_at: null,
			aggregated_at: null
		}
	},
	{
		id: 5,
		name: '二郎インスパイア系 渋谷店',
		lat: 35.6591,
		lng: 139.7006,
		address: '東京都渋谷区道玄坂2-10-7',
		nearest_station: 'JR渋谷駅 徒歩5分',
		category: 'inspired',
		business_hours: '11:00-22:00',
		closed_days: 'なし',
		distance_m: 3100,
		status: {
			current_wait_level: 4,
			wait_level_label: '麺切れ/臨時休業',
			report_count: 2,
			confidence: 0.8,
			last_reported_at: null,
			aggregated_at: null
		}
	}
];
