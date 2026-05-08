import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/integration/**/*.test.ts'],
		environment: 'node',
		testTimeout: 10000,
		env: {
			// Default target for integration tests.
			// Override by setting INTEGRATION_BASE_URL before running:
			//   INTEGRATION_BASE_URL=https://b999380e.jiromap.pages.dev npm run test:integration
			INTEGRATION_BASE_URL: 'https://jiromap.pages.dev'
		}
	}
});
