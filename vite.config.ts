import { cloudflare } from '@cloudflare/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [vue(), cloudflare()],
	environments: {
		client: {
			build: {
				rollupOptions: {
					input: 'src/client/main.ts',
					// Stable names let the Worker link these without reading a manifest; static assets revalidate by ETag, so no hash is needed.
					output: {
						entryFileNames: 'assets/client.js',
						chunkFileNames: 'assets/[name]-[hash].js',
						assetFileNames: (asset) => {
							if (asset.names.some((name) => name.endsWith('.css'))) {
								return 'assets/client.css';
							}
							return 'assets/[name]-[hash][extname]';
						},
					},
				},
			},
		},
	},
});
