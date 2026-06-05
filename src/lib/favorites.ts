import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'jiro_favorites';

function createFavoritesStore() {
	const initial: number[] = browser
		? JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
		: [];
	const { subscribe, update } = writable<number[]>(initial);

	return {
		subscribe,
		toggle(shopId: number) {
			update((ids) => {
				const next = ids.includes(shopId)
					? ids.filter((id) => id !== shopId)
					: [...ids, shopId];
				if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				return next;
			});
		},
		isFavorite(ids: number[], shopId: number): boolean {
			return ids.includes(shopId);
		}
	};
}

export const favorites = createFavoritesStore();
