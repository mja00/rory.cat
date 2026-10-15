import { Hono, type Context } from 'hono';
import { resolveLocale } from '../shared/i18n';
import type { AppState, Image, PageName } from '../shared/types';
import { api } from './api';
import { findImage, listImages, pickRandom } from './db';
import { renderPage } from './render';

type AppContext = Context<{ Bindings: Env }>;

// Non-strict because Rails ignored trailing slashes and shared links like /id/5/ must keep working.
const app = new Hono<{ Bindings: Env }>({ strict: false });

async function page(c: AppContext, name: PageName, image: Image | null = null, total = 0, status: 200 | 404 = 200) {
	const state: AppState = {
		page: name,
		locale: resolveLocale(c.req.query('locale')),
		image,
		total,
	};
	return c.html(await renderPage(state, c.req.url), status);
}

app.get('/', async (c) => {
	const images = await listImages(c);
	const image = pickRandom(images);
	if (!image) {
		return page(c, 'notFound', null, images.length, 404);
	}
	return page(c, 'home', image, images.length);
});

app.get('/id/:id', async (c) => {
	const images = await listImages(c);
	const image = findImage(images, c.req.param('id'));
	if (!image) {
		return page(c, 'notFound', null, images.length, 404);
	}
	return page(c, 'byId', image, images.length);
});

app.get('/license', (c) => page(c, 'license'));
app.get('/offline', (c) => page(c, 'offline'));

app.get('/sitemap.xml', async (c) => {
	const images = await listImages(c);
	const lastmod = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
	const entries = images.map(({ id }) => `<url><loc>https://rory.cat/id/${id}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`);
	const xml = [
		'<?xml version="1.0"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		'<url><loc>https://rory.cat</loc><changefreq>daily</changefreq><priority>1.0</priority></url>',
		...entries,
		'</urlset>',
	].join('\n');
	return c.body(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8' });
});

app.route('/', api);

export default app;
