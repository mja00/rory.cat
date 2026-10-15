# rory.cat

Website and API for [rory.cat](https://rory.cat), the one stop spot for all things Rory the cat.

The site shows a random picture of Rory on every visit, has a permanent page for each picture, and exposes a small public JSON API. It runs entirely on Cloudflare Workers.

## Contents

- [Stack](#stack)
- [How it works](#how-it-works)
- [Routes](#routes)
- [API](#api)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Local development](#local-development)
- [Scripts](#scripts)
- [Testing](#testing)
- [Configuration](#configuration)
- [D1 setup and import from MySQL](#d1-setup-and-import-from-mysql)
- [Deploying](#deploying)
- [Translations](#translations)
- [License](#license)

## Stack

| Piece | Used for |
| --- | --- |
| [Cloudflare Workers](https://developers.cloudflare.com/workers/) | Runs the app at the edge |
| [Workers static assets](https://developers.cloudflare.com/workers/static-assets/) | Serves `public/` and the client build |
| [D1](https://developers.cloudflare.com/d1/) | Stores image rows (`id`, `url`) |
| [R2](https://developers.cloudflare.com/r2/) | Stores the image files (bucket `rorycat`, served at `i.rory.cat`) |
| [Hono](https://hono.dev) | Routing and the JSON API |
| [Vue 3](https://vuejs.org) | Pages, server-side rendered per request and hydrated in the browser |
| [Vite](https://vite.dev) + [`@cloudflare/vite-plugin`](https://developers.cloudflare.com/workers/vite-plugin/) | Dev server and builds for both the Worker and the client |
| TypeScript, ESLint, [Vitest](https://vitest.dev) + `@cloudflare/vitest-plugin` | Types, linting and tests running inside `workerd` |

## How it works

1. A request first checks Workers static assets. Files in `public/` (icons, `manifest.json`, `robots.txt`, `service-worker.js`) and the built client bundle (`assets/client.js`, `assets/client.css`) are returned directly without running the Worker.
2. Anything else falls through to the Worker (`not_found_handling: "none"` in `wrangler.jsonc`).
3. Page routes load data from D1, then render the Vue app to HTML with `renderToString`. All Open Graph and Twitter meta tags, including the image, are in that server HTML so link previews work.
4. The page state is embedded as JSON in a `<script type="application/json" id="app-state">` tag, and `src/client/main.ts` hydrates the same Vue app from it. The install button, HTTPS warning and service worker registration only run in the browser.
5. The service worker caches `/offline` and shows it when navigation fails while offline.

In `npm run dev` the HTML links Vite's dev scripts (`/@vite/client`, `/src/client/main.ts`) so hot reload works. In a build it links the fixed `assets/client.js` and `assets/client.css` names, because the Cloudflare Vite plugin builds the Worker before the client and cannot read the client manifest.

## Routes

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Random Rory. The image links to its permanent `/id/:id` page. |
| GET | `/id/:id` | A specific Rory. Unknown ids return a 404 page. |
| GET | `/license` | Image license (CC BY 4.0). |
| GET | `/offline` | Page shown by the service worker when offline. |
| GET | `/sitemap.xml` | Sitemap with the home page and every `/id/:id` page. |
| GET | `/purr`, `/purr.json` | Random image as JSON. |
| GET | `/purr/:id` | Image by id as JSON. |
| POST | `/new` | Upload a new Rory (requires the API key). |

Trailing slashes are ignored, and ids are read like Rails' `to_i`, so `/id/5/`, `/purr/5.json` and `/id/5-anything` all resolve to image 5. Add `?locale=<code>` to any page to change the language. Supported codes: `en` (default), `zh`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`, `ru`, `id` and `ca`.

## API

All `/purr` responses send `Access-Control-Allow-Origin: *`, so they can be called from any website.

### `GET /purr`

Returns a random image.

```sh
curl https://rory.cat/purr
```

```json
{ "id": 42, "url": "https://i.rory.cat/AbC123xYz9.jpg" }
```

### `GET /purr/:id`

Returns the image with that id.

```sh
curl https://rory.cat/purr/42
```

Unknown ids return `404`:

```json
{ "error": "this rory does not exist" }
```

### `POST /new`

Downloads an image from a URL, stores it in R2 under a random 10 character name (keeping the original file extension), and adds it to D1.

The `Authorization` header must exactly match the `API_KEY` secret. The `rory` parameter can be sent as a query string, a form field, or JSON:

```sh
curl -X POST https://rory.cat/new \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"rory": "https://example.com/rory.png"}'
```

| Status | Body |
| --- | --- |
| `200` | `{ "success": true, "url": "https://i.rory.cat/AbC123xYz9.png", "id": 43 }` |
| `400` | `{ "success": false, "message": "rory must be an http(s) url" }` or `"could not fetch rory"` |
| `401` | `{ "success": false, "message": "invalid key" }` |

If `API_KEY` is not set, every request is rejected with `401`.

## Project structure

```
src/
  worker/
    index.ts      Hono app: page routes and sitemap
    api.ts        /purr and /new
    db.ts         D1 queries
    render.ts     HTML shell, meta tags and Vue SSR
  app/            Vue components shared by server and client
    App.vue
    ImagePage.vue   home and /id/:id
    LicensePage.vue
    createApp.ts
  client/
    main.ts       Hydration entry, PWA install button, service worker registration
    style.css
  shared/
    i18n.ts       Messages for every locale, t() helper
    types.ts
public/           Static assets served as-is
migrations/       D1 schema
scripts/
  import-images.ts  MySQL export to D1 import converter
test/             Vitest tests running in workerd
wrangler.jsonc    Worker config and bindings
worker-configuration.d.ts  Generated by `npm run cf-typegen`
```

## Requirements

- Node.js 22.18 or newer (the import script uses built-in TypeScript type stripping)
- A Cloudflare account with access to Workers, D1 and R2 (only needed for remote commands and deploys)

## Local development

```sh
npm install
cp .dev.vars.example .dev.vars   # set API_KEY to anything for local testing
npm run db:migrate:local
npx wrangler d1 execute rorycat --local --command "INSERT INTO images (url) VALUES ('https://i.rory.cat/example.jpg')"
npm run dev
```

Vite prints the local URL. Local D1 and R2 data live in `.wrangler/` and are gitignored. Delete that folder to start fresh.

To try an upload locally:

```sh
curl -X POST "http://localhost:5173/new?rory=https://example.com/rory.png" -H "Authorization: <your local API_KEY>"
```

To check the production build locally:

```sh
npm run preview
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with the Worker running in `workerd` |
| `npm run build` | Builds the Worker and client into `dist/` |
| `npm run preview` | Builds, then serves the production output locally |
| `npm run deploy` | Builds, then deploys with `wrangler deploy` |
| `npm run lint` / `npm run lint:fix` | ESLint, optionally with auto-fix |
| `npm run typecheck` | `vue-tsc --noEmit` |
| `npm test` | Runs the Vitest suite |
| `npm run cf-typegen` | Regenerates `worker-configuration.d.ts`. Rerun after changing `wrangler.jsonc`. |
| `npm run db:migrate:local` | Applies migrations to the local D1 |
| `npm run db:migrate:remote` | Applies migrations to the production D1 |

## Testing

```sh
npm test
```

Tests live in `test/worker.test.ts` and run inside `workerd` through `@cloudflare/vitest-plugin`, using real local D1 and R2 bindings. Migrations are applied before the tests run, and outbound fetches for `/new` are mocked. They cover the API contract (CORS, response shapes, 404s, auth, bad input, successful upload), the sitemap, page meta tags, 404 pages, `.json` suffixes, trailing slashes, translations, locale fallback and right-to-left rendering.

The run may print `Missing required secrets: API_KEY`. That warning is harmless because the test config sets the key.

Before pushing, run:

```sh
npm run lint && npm run typecheck && npm test && npm run build
```

## Configuration

Bindings are defined in `wrangler.jsonc`:

| Binding | Type | Notes |
| --- | --- | --- |
| `DB` | D1 database `rorycat` | Replace `database_id` with the real id (see below) |
| `BUCKET` | R2 bucket `rorycat` | Files are served publicly from `https://i.rory.cat` |
| `API_KEY` | Secret | Required by `POST /new` |

Set the production secret with:

```sh
npx wrangler secret put API_KEY
```

Locally it is read from `.dev.vars`, which is gitignored.

`i.rory.cat` is a public custom domain on the R2 bucket, set up in the Cloudflare dashboard under R2, `rorycat`, Settings, Custom Domains. The Worker only writes to the bucket and builds URLs on that domain.

## D1 setup and import from MySQL

This is a one-time move from the old Rails MySQL database. Image ids are kept so existing `/id/:id` links and sitemap entries keep working.

1. Create the database and copy the printed `database_id` into `wrangler.jsonc`:

   ```sh
   npx wrangler d1 create rorycat
   ```

2. Apply the schema:

   ```sh
   npm run db:migrate:remote
   ```

3. Export the existing rows from MySQL:

   ```sh
   mysql --batch -e "SELECT id, url FROM images ORDER BY id" rory_prod > images.tsv
   ```

4. Preview the import. The dry run prints the row count, id range, malformed lines, duplicate ids, empty or invalid URLs, and the first and last 3 statements, without writing anything:

   ```sh
   node scripts/import-images.ts images.tsv images-import.sql --dry-run
   ```

5. Generate the SQL file. The script refuses to write if the dry run found problems:

   ```sh
   node scripts/import-images.ts images.tsv images-import.sql
   ```

6. Import and check the count matches MySQL:

   ```sh
   npx wrangler d1 execute rorycat --remote --file images-import.sql
   npx wrangler d1 execute rorycat --remote --command "SELECT COUNT(*), MAX(id) FROM images"
   ```

New uploads continue from the highest imported id because the table uses `AUTOINCREMENT`. `images.tsv` and `images-import.sql` are gitignored.

## Deploying

1. Make sure `database_id` in `wrangler.jsonc` is set, migrations are applied, and `API_KEY` is set.
2. To serve on `rory.cat`, uncomment the custom domain route at the bottom of `wrangler.jsonc`. The `rory.cat` zone must be on the same Cloudflare account.
3. Deploy:

   ```sh
   npm run deploy
   ```

Logs are available in the Cloudflare dashboard (observability is enabled) or live with `npx wrangler tail`.

## Translations

Messages live in `src/shared/i18n.ts`. English is the default and every key must exist there. Other locales are partial, and missing keys fall back to English. To add a locale, add a messages object and include it in `messages`. `resolveLocale` accepts any code listed there. Right-to-left languages also go in `RTL_LOCALES` so the page gets `dir="rtl"`.

## License

The code is licensed under the [GNU AGPL v3](LICENSE). The Rory images are licensed separately under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.en), see [rory.cat/license](https://rory.cat/license).
