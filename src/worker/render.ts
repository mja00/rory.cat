import { renderToString } from 'vue/server-renderer';
import { createApp } from '../app/createApp';
import type { AppState } from '../shared/types';

const APPLE_ICON_SIZES = [57, 60, 72, 76, 114, 144, 152, 180];

// Production client files have fixed names (see vite.config.ts) so the Worker can link them without the client manifest, which is built after the Worker.
const CLIENT_ASSETS = import.meta.env.DEV
	? {
		scripts: ['/@vite/client', '/src/client/main.ts'],
		styles: ['/src/client/style.css'],
	}
	: {
		scripts: ['/assets/client.js'],
		styles: ['/assets/client.css'],
	};

const HTML_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	'\'': '&#39;',
};

export function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

// Escaping < stops "</script>" or "<!--" in data from ending the script element early; JSON.parse reads < back as <.
export function serializeState(state: AppState): string {
	return JSON.stringify(state).replace(/</g, '\\u003c');
}

function imageMeta(url: string): string {
	const content = escapeHtml(url);
	return [
		`<meta property="og:image:secure_url" content="${content}">`,
		`<meta property="og:image" content="${content}">`,
		`<meta property="twitter:image" content="${content}">`,
	].join('\n\t');
}

export async function renderPage(state: AppState, requestUrl: string): Promise<string> {
	const appHtml = await renderToString(createApp(state));
	const appleIcons = APPLE_ICON_SIZES
		.map((size) => `<link rel="apple-touch-icon" sizes="${size}x${size}" href="/apple-icon-${size}x${size}.png">`)
		.join('\n\t');
	const styles = CLIENT_ASSETS.styles.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n\t');
	const scripts = CLIENT_ASSETS.scripts.map((src) => `<script type="module" src="${src}"></script>`).join('\n');
	let extraMeta = '';
	if (state.image) {
		extraMeta = imageMeta(state.image.url);
	}

	return `<!DOCTYPE html>
<html lang="${state.locale}">
<head>
	<title>rory the cat</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1">

	<meta property="og:image:alt" content="a picture of rory the cat">
	<meta property="og:description" content="the one stop spot for all things rory">
	<meta name="description" content="the one stop spot for all things rory!" itemprop="description">
	<meta property="article:author" content="Chew">
	<meta name="keywords" content="rory cat" itemprop="keywords">
	<meta name="medium" content="image">
	<meta property="twitter:card" content="summary_large_image">
	<meta property="og:title" content="rory the cat!">
	<meta property="twitter:title" content="rory the cat">
	<meta property="og:url" content="${escapeHtml(requestUrl)}">
	<meta name="msapplication-TileColor" content="#d1ae86">
	<meta name="theme-color" content="#d1ae86">

	${appleIcons}
	<link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
	<meta name="msapplication-TileImage" content="/ms-icon-144x144.png">

	<link rel="manifest" href="/manifest.json">
	${styles}
	${extraMeta}
</head>
<body>
<div id="app" class="container">${appHtml}</div>
<script type="application/json" id="app-state">${serializeState(state)}</script>
${scripts}
</body>
</html>
`;
}
