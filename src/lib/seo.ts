// JSON-LD 生成ユーティリティ

export function buildRestaurantJsonLd(shop: {
	id: number;
	name: string;
	address: string;
	lat: number;
	lng: number;
	business_hours: string | null;
	closed_days?: string | null;
	phone?: string | null;
}): string {
	const jsonLd: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Restaurant',
		name: shop.name,
		address: {
			'@type': 'PostalAddress',
			streetAddress: shop.address,
			addressCountry: 'JP'
		},
		geo: {
			'@type': 'GeoCoordinates',
			latitude: shop.lat,
			longitude: shop.lng
		},
		url: `https://jiromap.pages.dev/shops/${shop.id}`,
		servesCuisine: 'Japanese Ramen'
	};

	if (shop.business_hours) {
		jsonLd.openingHours = shop.business_hours;
	}
	if (shop.phone) {
		jsonLd.telephone = shop.phone;
	}

	return JSON.stringify(jsonLd);
}

export function buildWebsiteJsonLd(): string {
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: '二郎マップ',
		url: 'https://jiromap.pages.dev/',
		description: 'ラーメン二郎の店舗を地図で探せるサービス',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: 'https://jiromap.pages.dev/shops?q={search_term_string}'
			},
			'query-input': 'required name=search_term_string'
		}
	};
	return JSON.stringify(jsonLd);
}
