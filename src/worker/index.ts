import { Hono, type Context } from 'hono';
import { resolveLocale } from '../shared/i18n';
import type { AppState, Image, PageName } from '../shared/types';
import { api } from './api';
import { countImages, getImageById, getRandomImage, listImageIds } from './db';
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
	const [image, total] = await Promise.all([getRandomImage(c.env.DB), countImages(c.env.DB)]);
	if (!image) {
		return page(c, 'notFound', null, total, 404);
	}
	return page(c, 'home', image, total);
});

app.get('/id/:id', async (c) => {
	const [image, total] = await Promise.all([
		getImageById(c.env.DB, c.req.param('id')),
		countImages(c.env.DB),
	]);
	if (!image) {
		return page(c, 'notFound', null, total, 404);
	}
	return page(c, 'byId', image, total);
});

app.get('/license', (c) => page(c, 'license'));
app.get('/offline', (c) => page(c, 'offline'));

app.get('/sitemap.xml', async (c) => {
	const ids = await listImageIds(c.env.DB);
	const lastmod = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
	const entries = ids.map((id) => `<url><loc>https://rory.cat/id/${id}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`);
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
