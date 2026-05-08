// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface Platform {
			env: {
				DB: D1Database;
				JIROMAP_KV: KVNamespace;
				IP_HASH_SALT: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
