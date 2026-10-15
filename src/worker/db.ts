import type { Context } from 'hono';
import type { Image } from '../shared/types';

type AppContext = Context<{ Bindings: Env }>;

// Each D1 round trip costs ~55ms and the table is small, so every read shares one cached list per data center.
const CACHE_TTL_SECONDS = 300;
const CACHE_PATH = '/__cache/images-v1';

// The shared tsconfig's DOM lib shadows the Workers CacheStorage type, which is the only one declaring `default`.
function cache(): Cache {
	return (caches as unknown as { default: Cache }).default;
}

function cacheKey(c: AppContext): Request {
	return new Request(new URL(CACHE_PATH, c.req.url));
}

export async function listImages(c: AppContext): Promise<Image[]> {
	const key = cacheKey(c);
	const cached = await cache().match(key);
	if (cached) {
		return cached.json<Image[]>();
	}

	const { results } = await c.env.DB.prepare('SELECT id, url FROM images ORDER BY id').all<Image>();
	const response = Response.json(results, { headers: { 'Cache-Control': `max-age=${CACHE_TTL_SECONDS}` } });
	c.executionCtx.waitUntil(cache().put(key, response));
	return results;
}

export function pickRandom(images: Image[]): Image | null {
	if (images.length === 0) {
		return null;
	}
	return images[Math.floor(Math.random() * images.length)] ?? null;
}

export function findImage(images: Image[], rawId: string): Image | null {
	// Mirrors Rails' to_i, which read the leading integer so "1.json" and "1-slug" found image 1.
	const match = /^\d{1,15}/.exec(rawId);
	if (!match) {
		return null;
	}
	const id = Number(match[0]);
	return images.find((image) => image.id === id) ?? null;
}

export async function insertImage(c: AppContext, url: string): Promise<number> {
	const row = await c.env.DB.prepare('INSERT INTO images (url) VALUES (?) RETURNING id').bind(url).first<{ id: number }>();
	if (!row) {
		throw new Error('insert returned no row');
	}
	// Other data centers pick up the new image when their copy expires.
	await cache().delete(cacheKey(c));
	return row.id;
}
