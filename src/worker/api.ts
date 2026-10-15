import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { getImageById, getRandomImage, insertImage } from './db';

const NAME_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const IMAGE_HOST = 'https://i.rory.cat';

type AppContext = Context<{ Bindings: Env }>;

export const api = new Hono<{ Bindings: Env }>();

api.use('/purr/*', cors());
api.use('/purr.json', cors());

// Rails accepted an optional .json format suffix, so existing API clients may still call /purr.json.
api.on('GET', ['/purr', '/purr.json'], async (c) => {
	return c.json(await getRandomImage(c.env.DB));
});

api.get('/purr/:id', async (c) => {
	const image = await getImageById(c.env.DB, c.req.param('id'));
	if (!image) {
		return c.json({ error: 'this rory does not exist' }, 404);
	}
	return c.json(image);
});

api.post('/new', async (c) => {
	if (!isAuthorized(c.req.header('Authorization'), c.env.API_KEY)) {
		return c.json({ success: false, message: 'invalid key' }, 401);
	}

	const source = parseImageUrl(await readRoryParam(c));
	if (!source) {
		return c.json({ success: false, message: 'rory must be an http(s) url' }, 400);
	}

	let image: Response;
	try {
		image = await fetch(source);
	} catch {
		return c.json({ success: false, message: 'could not fetch rory' }, 400);
	}
	if (!image.ok) {
		return c.json({ success: false, message: 'could not fetch rory' }, 400);
	}

	const name = randomName() + extensionOf(source);
	// Buffered because R2 rejects streams without a known length, such as chunked responses.
	const body = await image.arrayBuffer();
	const contentType = image.headers.get('Content-Type');
	if (contentType) {
		await c.env.BUCKET.put(name, body, { httpMetadata: { contentType } });
	} else {
		await c.env.BUCKET.put(name, body);
	}

	const url = `${IMAGE_HOST}/${name}`;
	const id = await insertImage(c.env.DB, url);
	return c.json({ success: true, url, id });
});

function isAuthorized(header: string | undefined, key: string): boolean {
	// An unset secret must never match an empty Authorization header.
	if (!key || header === undefined) {
		return false;
	}
	const encoder = new TextEncoder();
	const a = encoder.encode(header);
	const b = encoder.encode(key);
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	// The shared tsconfig's DOM lib shadows the Workers SubtleCrypto type, which is the only one declaring this method.
	const subtle = crypto.subtle as unknown as { timingSafeEqual(a: ArrayBufferView, b: ArrayBufferView): boolean };
	return subtle.timingSafeEqual(a, b);
}

// Rails merged query, form and JSON params, so existing clients may send "rory" in any of them.
async function readRoryParam(c: AppContext): Promise<string | undefined> {
	const fromQuery = c.req.query('rory');
	if (fromQuery) {
		return fromQuery;
	}
	const contentType = c.req.header('Content-Type') ?? '';
	let body: unknown = null;
	try {
		if (contentType.includes('application/json')) {
			body = await c.req.json();
		} else if (contentType.includes('form')) {
			body = await c.req.parseBody();
		}
	} catch {
		return undefined;
	}
	if (body && typeof body === 'object' && 'rory' in body && typeof body.rory === 'string') {
		return body.rory;
	}
	return undefined;
}

function parseImageUrl(value: string | undefined): URL | null {
	if (!value || !URL.canParse(value)) {
		return null;
	}
	const url = new URL(value);
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		return null;
	}
	return url;
}

function extensionOf(url: URL): string {
	const lastSegment = url.pathname.split('/').pop() ?? '';
	const match = /\.([a-zA-Z0-9]+)$/.exec(lastSegment);
	if (!match) {
		return '';
	}
	return `.${match[1]}`;
}

function randomName(): string {
	const bytes = crypto.getRandomValues(new Uint32Array(10));
	return Array.from(bytes, (byte) => NAME_ALPHABET[byte % NAME_ALPHABET.length]).join('');
}
