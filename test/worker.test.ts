import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import app from '../src/worker/index';

const SEEDED = [
	{ id: 1, url: 'https://i.rory.cat/one.jpg' },
	{ id: 2, url: 'https://i.rory.cat/two.png' },
	{ id: 3, url: 'https://i.rory.cat/x.png?q="></script><script>alert(1)</script>' },
];

async function request(path: string, init?: RequestInit): Promise<Response> {
	const ctx = createExecutionContext();
	const response = await app.request(path, init, env, ctx);
	await waitOnExecutionContext(ctx);
	return response;
}

function postNew(body: unknown, headers: Record<string, string> = { Authorization: 'test-key' }): Promise<Response> {
	return request('/new', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...headers },
		body: JSON.stringify(body),
	});
}

beforeAll(async () => {
	await env.DB.batch(SEEDED.map((image) => env.DB.prepare('INSERT INTO images (id, url) VALUES (?, ?)').bind(image.id, image.url)));
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('GET /purr', () => {
	it('returns a random seeded rory with open CORS', async () => {
		const response = await request('/purr');
		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
		const body = await response.json<{ id: number; url: string }>();
		expect(SEEDED).toContainEqual(body);
	});

	it('returns a rory by id', async () => {
		const response = await request('/purr/2');
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual(SEEDED[1]);
	});

	it('accepts the Rails-era .json suffix and trailing slash', async () => {
		const random = await request('/purr.json');
		expect(random.status).toBe(200);
		expect(random.headers.get('Access-Control-Allow-Origin')).toBe('*');
		expect(SEEDED).toContainEqual(await random.json());

		for (const path of ['/purr/2.json', '/purr/2/']) {
			const response = await request(path);
			expect(response.status).toBe(200);
			expect(await response.json()).toEqual(SEEDED[1]);
		}
	});

	it('returns 404 with the error body for an unknown id', async () => {
		const response = await request('/purr/999');
		expect(response.status).toBe(404);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
		expect(await response.json()).toEqual({ error: 'this rory does not exist' });
	});
});

describe('POST /new', () => {
	it('rejects a missing or wrong key', async () => {
		const missing = await postNew({ rory: 'https://example.com/a.png' }, {});
		expect(missing.status).toBe(401);
		expect(await missing.json()).toEqual({ success: false, message: 'invalid key' });

		const wrong = await postNew({ rory: 'https://example.com/a.png' }, { Authorization: 'nope' });
		expect(wrong.status).toBe(401);
	});

	it('rejects a rory that is not an http(s) url without fetching', async () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch');
		for (const rory of ['not a url', 'ftp://example.com/a.png', undefined]) {
			const response = await postNew({ rory });
			expect(response.status).toBe(400);
		}
		expect((await postNew(null)).status).toBe(400);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('rejects a rory whose fetch fails', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('gone', { status: 404 }));
		const response = await postNew({ rory: 'https://example.com/a.png' });
		expect(response.status).toBe(400);
	});

	it('stores the image in R2 and records it', async () => {
		const bytes = new Uint8Array([137, 80, 78, 71]);
		const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(bytes, { headers: { 'Content-Type': 'image/png' } }),
		);

		const response = await postNew({ rory: 'https://example.com/path/cat.png?size=large' });
		expect(response.status).toBe(200);
		const body = await response.json<{ success: boolean; url: string; id: number }>();
		expect(body.success).toBe(true);
		expect(body.url).toMatch(/^https:\/\/i\.rory\.cat\/[a-zA-Z0-9]{10}\.png$/);
		expect(String(fetchSpy.mock.calls[0]?.[0])).toBe('https://example.com/path/cat.png?size=large');

		const object = await env.BUCKET.get(body.url.replace('https://i.rory.cat/', ''));
		expect(object?.httpMetadata?.contentType).toBe('image/png');
		expect(new Uint8Array(await object!.arrayBuffer())).toEqual(bytes);

		const stored = await request(`/purr/${body.id}`);
		expect(await stored.json()).toEqual({ id: body.id, url: body.url });
	});

	it('accepts the rory as a query param and handles urls without an extension', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('img'));
		const response = await request(`/new?rory=${encodeURIComponent('https://example.com/image')}`, {
			method: 'POST',
			headers: { Authorization: 'test-key' },
		});
		expect(response.status).toBe(200);
		const body = await response.json<{ url: string }>();
		expect(body.url).toMatch(/^https:\/\/i\.rory\.cat\/[a-zA-Z0-9]{10}$/);
	});
});

describe('image cache', () => {
	it('serves the cached list until an upload refreshes it', async () => {
		await request('/sitemap.xml');
		await env.DB.prepare('INSERT INTO images (id, url) VALUES (500, ?)').bind('https://i.rory.cat/sneaky.jpg').run();
		expect((await request('/purr/500')).status).toBe(404);

		vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('img'));
		await postNew({ rory: 'https://example.com/fresh.jpg' });
		expect((await request('/purr/500')).status).toBe(200);
	});
});

describe('GET /sitemap.xml', () => {
	it('lists the home page and every rory', async () => {
		const response = await request('/sitemap.xml');
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toContain('application/xml');
		const xml = await response.text();
		expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(xml).toContain('<url><loc>https://rory.cat</loc><changefreq>daily</changefreq><priority>1.0</priority></url>');
		for (const image of SEEDED) {
			expect(xml).toContain(`<loc>https://rory.cat/id/${image.id}</loc>`);
		}
		expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z<\/lastmod>/);
	});
});

describe('pages', () => {
	it('renders a random rory with its og:image in the server html', async () => {
		const response = await request('/');
		expect(response.status).toBe(200);
		const html = await response.text();
		const ogImage = /<meta property="og:image" content="([^"]*)">/.exec(html)?.[1];
		expect(ogImage).toBeDefined();
		const decoded = ogImage!.replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
		const { results } = await env.DB.prepare('SELECT url FROM images').all<{ url: string }>();
		expect(results.map((row) => row.url)).toContain(decoded);
		expect(html).toContain('<meta property="og:url" content="http://localhost/">');
	});

	it('escapes image urls in meta tags and serialized state', async () => {
		const html = await (await request('/id/3')).text();
		expect(html).not.toContain('"></script><script>alert(1)');
		expect(html).toContain('content="https://i.rory.cat/x.png?q=&quot;&gt;&lt;/script&gt;');
		const state = /<script type="application\/json" id="app-state">(.*?)<\/script>/.exec(html)?.[1];
		expect(JSON.parse(state!)).toMatchObject({ page: 'byId', image: SEEDED[2] });
	});

	it('returns 404 with the message inside the layout for an unknown rory', async () => {
		const response = await request('/id/999');
		expect(response.status).toBe(404);
		const html = await response.text();
		expect(html).toContain('<title>rory the cat</title>');
		expect(html).toContain('this rory does not exist');
		expect(html).not.toContain('og:image"');
	});

	it('translates to russian and falls back to english for missing keys', async () => {
		const html = await (await request('/id/1?locale=ru')).text();
		expect(html).toContain('Рори по ID');
		expect(html).toContain('ID Рори: 1');
		expect(html).toContain('About Rory');
		expect(html).toContain('>License<');
	});

	it('translates to catalan and sets the html lang', async () => {
		const html = await (await request('/id/1?locale=ca')).text();
		expect(html).toContain('<html lang="ca" dir="ltr">');
		expect(html).toContain('Rory per ID');
		expect(html).toContain('ID del Rory: 1');
		expect(html).toContain('Sobre el Rory');
	});

	it('falls back to english for unknown locales', async () => {
		const html = await (await request('/id/1?locale=toString')).text();
		expect(html).toContain('<html lang="en" dir="ltr">');
		expect(html).toContain('Rory By ID');
	});

	it('renders arabic right to left', async () => {
		const html = await (await request('/id/1?locale=ar')).text();
		expect(html).toContain('<html lang="ar" dir="rtl">');
		expect(html).toContain('روري حسب المعرّف');
	});
});
