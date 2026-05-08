import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['tests/unit/**/*.test.ts'],
		environment: 'node',
		testTimeout: 10000,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/lib/**/*.ts', 'src/routes/api/**/*.ts', 'src/hooks.server.ts'],
			exclude: ['node_modules/', '.svelte-kit/']
		}
	}
});
