import { writable } from 'svelte/store';
import { RADIUS_DEFAULT_KM } from '$lib/config.js';

export const radiusKm = writable(RADIUS_DEFAULT_KM);
