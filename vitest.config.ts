import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		vue(),
		cloudflareTest(async () => {
			const migrations = await readD1Migrations(path.join(import.meta.dirname, 'migrations'));
			return {
				wrangler: { configPath: './wrangler.jsonc' },
				miniflare: {
					bindings: { API_KEY: 'test-key', TEST_MIGRATIONS: migrations },
				},
			};
		}),
	],
	test: {
		setupFiles: ['./test/apply-migrations.ts'],
	},
});
