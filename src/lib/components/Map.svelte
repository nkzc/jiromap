<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Map as LeafletMap, Marker } from 'leaflet';
	import type { Shop } from '../types.js';
	import { isShopLikelyOpen } from '../shop-hours.js';

	export let shops: Shop[] = [];
	export let centerLat: number = 35.6585;
	export let centerLng: number = 139.7454;
	export let zoom: number = 11;
	export let onShopClick: (shop: Shop) => void = () => {};
	export let userLat: number | null = null;
	export let userLng: number | null = null;
	export let onMapMove: ((lat: number, lng: number) => void) | null = null;
	export let radiusM: number = 0;
	export let circleLat: number = 0;
	export let circleLng: number = 0;
	export let mapMode: 'gps' | 'map' = 'gps';

	let mapEl: HTMLDivElement;
	let map: LeafletMap | null = null;
	let markers: Marker[] = [];
	let userMarker: import('leaflet').Marker | null = null;
	let centerMarker: import('leaflet').Marker | null = null;
	let radiusCircle: import('leaflet').Circle | null = null;
	let L: typeof import('leaflet') | null = null;

	function createPinIcon(leaflet: typeof import('leaflet'), color: string): import('leaflet').DivIcon {
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
          fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="#ffffff"/>
  </svg>`;
		return leaflet.divIcon({
			html: svg,
			className: '',
			iconSize: [24, 36],
			iconAnchor: [12, 36],
			popupAnchor: [0, -36]
		});
	}

	function createUserIcon(leaflet: typeof import('leaflet')): import('leaflet').DivIcon {
		const html = `<div style="width:16px;height:16px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(37,99,235,0.3)"></div>`;
		return leaflet.divIcon({
			html,
			className: '',
			iconSize: [16, 16],
			iconAnchor: [8, 8],
			popupAnchor: [0, -8]
		});
	}

	function clearMarkers() {
		for (const marker of markers) {
			marker.remove();
		}
		markers = [];
	}

	function addShopMarkers(leaflet: typeof import('leaflet'), shopList: Shop[]) {
		if (!map) return;
		clearMarkers();
		for (const shop of shopList) {
			const color = isShopLikelyOpen(shop) ? '#dc2626' : '#64748b';
			const icon = createPinIcon(leaflet, color);
			const marker = leaflet
				.marker([shop.lat, shop.lng], { icon })
				.addTo(map);
			marker.on('click', () => onShopClick(shop));
			markers.push(marker);
		}
	}

	function createCenterIcon(leaflet: typeof import('leaflet')): import('leaflet').DivIcon {
		const html = `<div style="width:16px;height:16px;background:#16a34a;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(22,163,74,0.3)"></div>`;
		return leaflet.divIcon({ html, className: '', iconSize: [16, 16], iconAnchor: [8, 8] });
	}

	function updateCenterMarker(leaflet: typeof import('leaflet'), lat: number, lng: number, mode: 'gps' | 'map') {
		if (!map) return;
		centerMarker?.remove();
		centerMarker = null;
		if (mode === 'map' && lat !== 0 && lng !== 0) {
			centerMarker = leaflet.marker([lat, lng], { icon: createCenterIcon(leaflet), zIndexOffset: 999, interactive: false }).addTo(map);
		}
	}

	function updateRadiusCircle(leaflet: typeof import('leaflet'), lat: number, lng: number, radius: number, mode: 'gps' | 'map') {
		if (!map) return;
		radiusCircle?.remove();
		radiusCircle = null;
		if (radius > 0 && lat !== 0 && lng !== 0) {
			const color = mode === 'map' ? '#16a34a' : '#2563eb';
			radiusCircle = leaflet.circle([lat, lng], {
				radius,
				color,
				weight: 2,
				opacity: 0.6,
				fillColor: color,
				fillOpacity: 0.15,
				interactive: false
			}).addTo(map);
		}
	}

	function updateUserMarker(leaflet: typeof import('leaflet'), lat: number | null, lng: number | null) {
		if (!map) return;
		if (userMarker) {
			userMarker.remove();
			userMarker = null;
		}
		if (lat !== null && lng !== null) {
			userMarker = leaflet
				.marker([lat, lng], { icon: createUserIcon(leaflet), zIndexOffset: 1000 })
				.addTo(map);
		}
	}

	onMount(async () => {
		// Leaflet must be dynamically imported inside onMount to avoid SSR issues
		L = await import('leaflet');

		// Fix default icon paths for Vite build
		// @ts-expect-error
		delete L.Icon.Default.prototype._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
		});

		map = L.map(mapEl, { zoomControl: false }).setView([centerLat, centerLng], zoom);

		// Zoom control at bottom-right (avoids hamburger menu on mobile)
		L.control.zoom({ position: 'bottomright' }).addTo(map);

		// OpenStreetMap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 19
		}).addTo(map);

		map.on('moveend', () => {
			if (map) onMapMove?.(map.getCenter().lat, map.getCenter().lng);
		});

		addShopMarkers(L, shops);
		updateUserMarker(L, userLat, userLng);
		updateCenterMarker(L, circleLat, circleLng, mapMode);
		updateRadiusCircle(L, circleLat, circleLng, radiusM, mapMode);
	});

	onDestroy(() => {
		clearMarkers();
		userMarker?.remove();
		centerMarker?.remove();
		radiusCircle?.remove();
		map?.remove();
		map = null;
	});

	$: if (L && map) {
		addShopMarkers(L, shops);
	}
	$: if (L && map) {
		updateUserMarker(L, userLat, userLng);
	}
	$: if (L && map) {
		updateCenterMarker(L, circleLat, circleLng, mapMode);
	}
	$: if (L && map) {
		updateRadiusCircle(L, circleLat, circleLng, radiusM, mapMode);
	}

	export function panTo(lat: number, lng: number) {
		map?.panTo([lat, lng]);
	}
</script>

<div bind:this={mapEl} class="map-container"></div>

<style>
	.map-container {
		width: 100%;
		height: 100%;
		min-height: 300px;
	}
</style>
