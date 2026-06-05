export type Lang = 'ja' | 'en';

export const t = {
	ja: {
		siteTitle: '二郎マップ',
		tagline: '直系二郎を地図で検索 · 営業中かを確認',
		nav: {
			list: '一覧',
			about: 'About'
		},
		footer: {
			about: 'サービスについて',
			privacy: 'プライバシーポリシー'
		},
		map: {
			loading: '読み込み中...',
			currentMode: '現在地',
			mapMode: '地図中心'
		},
		shops: {
			pageTitle: '周辺の二郎',
			intro: '現在地周辺のラーメン二郎直系店舗を近い順に表示しています。赤いピンが営業中、グレーが閉店・定休日の目安です。',
			loading: '読み込み中...',
			empty: '周辺に店舗が見つかりませんでした',
			within: 'km圏内'
		},
		favorites: {
			add: 'お気に入り追加',
			remove: 'お気に入り解除',
			filter: 'お気に入りのみ表示',
			empty: 'お気に入りの店舗はまだありません',
			count: '件'
		},
		shopDetail: {
			back: '←',
			address: '住所',
			station: '最寄駅',
			hours: '営業時間',
			closedDays: '定休日',
			category: 'カテゴリ',
			jiro: '二郎',
			inspire: 'インスパイア系',
			rules: 'この店のルール',
			queue: '並び方',
			topping: 'トッピング',
			other: 'その他',
			rulesNote: '※ 参考情報です。実際のルールは店舗にてご確認ください。',
			recentReports: '直近の投稿',
			tabelogLink: '食べログで見る',
			mapsLink: '地図アプリで開く',
			notFound: '店舗が見つかりませんでした',
			backToList: '← 一覧に戻る',
			reportsCount: '件の報告',
			lastUpdated: '最終更新:',
			highConf: '高信頼度',
			midConf: '中信頼度',
			lowConf: '低信頼度',
			justNow: 'たった今',
			minutesAgo: '分前',
			hoursAgo: '時間前',
			daysAgo: '日前'
		}
	},
	en: {
		siteTitle: 'Jiro Map',
		tagline: 'Find Ramen Jiro · Check if open now',
		nav: {
			list: 'List',
			about: 'About'
		},
		footer: {
			about: 'About',
			privacy: 'Privacy Policy'
		},
		map: {
			loading: 'Loading...',
			currentMode: 'My Location',
			mapMode: 'Map Center'
		},
		shops: {
			pageTitle: 'Nearby Jiro',
			intro: 'Showing Ramen Jiro locations near you, sorted by distance. Red pins are open, grey pins are closed or on a regular holiday.',
			loading: 'Loading...',
			empty: 'No shops found nearby.',
			within: 'km radius'
		},
		favorites: {
			add: 'Add to Favorites',
			remove: 'Remove from Favorites',
			filter: 'Show Favorites Only',
			empty: 'No favorites yet.',
			count: ' saved'
		},
		shopDetail: {
			back: '←',
			address: 'Address',
			station: 'Nearest Station',
			hours: 'Hours',
			closedDays: 'Closed Days',
			category: 'Category',
			jiro: 'Jiro',
			inspire: 'Jiro-inspired',
			rules: 'Shop Rules',
			queue: 'Queue',
			topping: 'Toppings',
			other: 'Notes',
			rulesNote: '※ For reference only. Please confirm rules at the shop.',
			recentReports: 'Recent Reports',
			tabelogLink: 'View on Tabelog',
			mapsLink: 'Open in Maps',
			notFound: 'Shop not found.',
			backToList: '← Back to List',
			reportsCount: ' reports',
			lastUpdated: 'Updated:',
			highConf: 'High confidence',
			midConf: 'Medium confidence',
			lowConf: 'Low confidence',
			justNow: 'Just now',
			minutesAgo: 'm ago',
			hoursAgo: 'h ago',
			daysAgo: 'd ago'
		}
	}
} as const;
