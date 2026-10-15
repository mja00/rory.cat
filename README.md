# rory.cat

Website and API for [rory.cat](https://rory.cat). A Cloudflare Worker using Hono, Vue and TypeScript, with images in R2 and their ids in D1.

## Develop

```sh
pnpm install
cp .dev.vars.example .dev.vars   # set API_KEY
pnpm db:migrate:local
pnpm wrangler d1 execute DB --local --command "INSERT INTO images (url) VALUES ('https://i.rory.cat/Zd46PQ6BV4.jpeg')"
pnpm dev
```

Before pushing: `pnpm lint && pnpm typecheck && pnpm test`.

## Deploy

```sh
pnpm wrangler secret put API_KEY   # first time only
pnpm run deploy
```

- Use `pnpm run deploy`, not `pnpm deploy` (that is a built-in pnpm command).
- `wrangler deploy` needs `pnpm build` first, otherwise it errors about `assets.directory`.
- For dashboard Git builds, set the build command to `pnpm build`.
- Don't run `pnpm db:migrate:remote`. The `rory` D1 database already has its table.

## API

All `/purr` routes allow any origin.

- `GET /purr`: random image, `{ "id": 42, "url": "https://i.rory.cat/..." }`
- `GET /purr/:id`: that image, or 404 `{ "error": "this rory does not exist" }`
- `POST /new`: upload from a URL. Send `Authorization: <API_KEY>` and `rory=<image url>` as a query param, form field or JSON. Returns `{ "success": true, "url": "...", "id": 43 }`.

Pages accept `?locale=` with `en`, `zh`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`, `ru`, `id` or `ca`.

## License

Code: [AGPL v3](LICENSE). Images: [CC BY 4.0](https://rory.cat/license).
