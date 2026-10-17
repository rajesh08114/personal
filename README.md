# Birthday Studio

Build a cinematic, personal birthday website in minutes. Pick one of **38 different experiences**, including a 20-template **Love & Romance** collection. Add your photos and words, preview it live, and share a link.

Each template is its own experience, not a colour swap. Starry Night spells their name in constellations, Game Night has three mini-games, Love Letter opens with a wax seal, and so on. The same photos and messages work in every template, so switching never loses content.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run dev:server` | Run the API on :8787 for server mode in development (the dev server proxies `/api` and `/media` to it) |
| `npm run build` | Type-check and build the app into `dist/` and the server into `dist-server/` |
| `npm run start` | Run the production server: app + API on one port (see [Deployment](#deployment)) |
| `npm run preview` | Serve the production build on :4173 with the production security headers (CSP etc.) |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Unit and API tests (Vitest) |
| `npm run test:e2e` | End-to-end tests in Chromium, desktop and mobile (Playwright, server mode) |
| `npm run check` | Everything CI runs: typecheck, lint, tests, build |

Requires Node 20.19+ or 22.12+ (tested on Node 23). Copy `.env.example` to `.env.local` for the optional settings below.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | The birthday website built from your current draft, with a small creator toolbar you can dismiss |
| `/templates` | "Choose your birthday experience" gallery, with category filters |
| `/templates/:id` | Full preview of a template using fictional sample content |
| `/create` | The studio: customise everything with a live desktop, tablet or mobile preview |
| `/preview` | Full-screen preview of your draft (`?embed=1` runs inside the studio's preview frame) |
| `/birthday/:id` | The shared link the recipient opens. It has no creator controls |
| `/privacy` | What is stored, where, and how to remove it |

A first-time visitor to `/` (no draft yet) is sent to `/templates`.

## How to make one (no code needed)

1. Go to **/templates**, then click **Preview** or **Use template**.
2. In **/create**, fill in the steps: basics, photos, messages, memories, story, colours and music. Everything autosaves to your browser.
3. Watch the live preview. Switch device sizes, replay the opening, or open it full screen.
4. Click **Share**. The studio lists any personal touches still missing, then gives you a link, plus a backup file you can move to another device (see [Sharing](#sharing-local-mode-and-server-mode)).

Anything you leave empty shows a clearly marked placeholder such as `[BIRTHDAY PERSON NAME]` or `[UPLOAD PHOTO]`. The site never invents personal details.

## The templates

| | Template | Signature moment |
| --- | --- | --- |
| 📰 | The Birthday Edition (default) | A one-copy broadsheet: unfold the paper, the letter set in columns, tear-off wish tabs, a “stop the presses” late extra |
| 🌙 | Starry Night | Name drawn as a constellation, moon phases, wish on a shooting star |
| 📷 | Polaroid Memories | Memory box, draggable photos, clothesline story, photos spell "Happy Birthday" |
| 🎬 | Cinematic Film | Projector countdown, scroll subtitles, film-strip gallery, end credits |
| 🎈 | Balloon Festival | Pop balloons to reveal memories, golden-balloon finale |
| 📒 | Birthday Scrapbook | Page-turning book, movable stickers, hidden notes, envelope |
| 🕯️ | Minimal Luxury | Masked photography, editorial index, a single candle |
| 🎮 | Game Night | Pop balloons, catch stars, boss charge, then "Level [AGE] unlocked" |
| 🪩 | Neon Party | Neon signs on a brick bar wall, light board, audio visualizer, an arcade button to drop the beat |
| 🌸 | Garden of Wishes | Plant seeds that bloom into memory flowers; fireflies follow the cursor |
| 🎞️ | Film Roll | Sideways film strip where each negative develops; flip the final print |
| ⏳ | Time Capsule | A biscuit tin dug up from the garden: peel the tape, unwrap photos from tissue, ticket stubs, “open last” envelope |
| 💥 | Comic Book | Collectible cover, speech bubbles, POW! effects, splash page |
| 🏰 | Fairytale | Parallax storybook, royal decree, hidden stars, birthday spell |
| 🎪 | Festival of Memories | Ticket gate, zones, photo booth, wish lanterns, headline finale |
| 🪐 | Cosmic Journey | Launch countdown, memories as orbiting planets, planet alignment |
| ☕ | Coffee & Memories | Chalkboard menu, orders served to the table, cupcake candle, receipt |
| 🖥️ | Terminal 1983 | Amber CRT: boot and log in, the letter decodes on screen, memories as files, BIRTHDAY.EXE prints a text cake |

Every template is modelled on a real object or medium (a newspaper, a biscuit tin, a CRT terminal, a paperback, an orrery) rather than a generic web layout. The concept, references and design audit for all 38 are in [docs/template-concepts.md](docs/template-concepts.md).

## The Love & Romance collection

A dedicated category (`/templates?c=love`) with its own mood filters: Romantic, Emotional, Cinematic, Cute, Elegant, Magical, Cozy, Creative and Premium. Love previews use romantic sample content (Emma & Noah) with dates and places.

| | Template | Signature moment |
| --- | --- | --- |
| 01 | The Love Letter | Ivory envelope, line-by-line handwriting, photos slide in, folds back up |
| 02 | Our Story | Pinned film chapters; photos open from a small window to full screen |
| 03 | Two Souls | Two paper lanterns drift together on dark water; the light settles into a heart, then their name |
| 04 | The Memory Gallery | One photo at a time with museum placards, distortion transitions, collage |
| 05 | Midnight Date | Explore a moonlit city; windows light up to spell I LOVE YOU |
| 06 | Rose Garden | Buds bloom into memories; the whole garden blooms at the end |
| 07 | Our Polaroid Wall | Drag, rotate and flip photos for hidden messages; photos form a heart |
| 08 | Forever Timeline | Scroll-following timeline; milestones expand at centre stage |
| 09 | Constellation of Us | Stars hold memories, then rearrange to spell both names |
| 10 | The Secret Garden | Four gates; catch fireflies for keys; a glowing clearing: “You.” |
| 11 | Vinyl Love | Turntable plays a five-track story; needle lifts at the end |
| 12 | Candlelight Dinner | Objects on the table open memories, the menu, a love note and a gift |
| 13 | Parallel Universes | Four vintage sci-fi paperbacks of the same story; every edition has the same last page: “I’d still choose you.” |
| 14 | Message in the Stars | Each sentence becomes a star; the sky spells their name |
| 15 | The Gift Box | 3D box, then five gifts that each unwrap differently |
| 16 | Cinema Date | Private screening, scene menu, credits starring you both |
| 17 | Digital Heartbeat | Live ECG reacts to cursor, clicks and music; becomes a heart |
| 18 | Forever Letterbox | Pinned 21:9 frame, slow pans, dip-to-black: “To be continued…” |
| 19 | Handwritten Journal | Notebook pages turn as you scroll; folded-corner secrets |
| 20 | Our Little Universe | A brass orrery you turn by hand; six painted planets, an engraved plaque finale |

Every love template reads the same `BirthdayConfig`, so switching between them, or back to a birthday template, keeps all content. Memories and story chapters have optional **date** and **place** fields, used by placards, timelines and star captions. The upgraded Love Letter keeps its original id, so existing drafts that used it still load.

Shared engine pieces added for the collection:

- `MorphParticles` + `shapes.ts`: glowing particles that drift freely or spring into a heart, a heart outline or any text. Frame-rate independent; under reduced motion they snap straight to the shape.
- `audio.play()` / `audio.pause()` on `useExperience()`, so a template (Vinyl Love) can start and stop the song from its own controls.

## Architecture

```
src/
├── App.tsx                 Router (every page lazy-loaded)
├── pages/                  Experience, Create, Preview, Templates, TemplatePreview, Birthday
├── types/                  BirthdayConfig (data model) and BirthdayTemplate (template contract)
├── data/
│   ├── defaultConfig.ts    A new, empty birthday (placeholders everywhere)
│   ├── sampleConfig.ts     Fictional sample content for template previews
│   ├── sampleArt.ts        Generated "sample photo" art (no stock photos)
│   ├── normalizeConfig.ts  Validates and repairs any stored, imported or API config
│   ├── repository.ts       ExperienceRepository: local (IndexedDB) or server mode
│   ├── api/birthdayApi.ts  REST client used in server mode
│   ├── backup.ts           Self-contained JSON backup export / import
│   └── storage/idb.ts      Small IndexedDB wrapper
├── store/DraftProvider.tsx Draft state and debounced autosave
├── themes/                 7 mood presets, custom colours, CSS variables
├── templates/
│   ├── registry.ts         List of all templates (metadata loads up front)
│   └── <id>/meta.tsx       Name, moods, fonts, palette (small; loads with the registry)
│       <id>/thumbnail.tsx  Animated gallery thumbnail (own lazy chunk)
│       <id>/index.tsx      The experience itself (own lazy chunk)
├── components/
│   ├── experience/         ExperienceShell, Lightbox, BirthdayCake, PhotoSlot, photoFraming, Fill, MusicPlayer…
│   ├── effects/            Confetti/fireworks engine, Particles, PointerTrail, MorphParticles, Tilt…
│   ├── customization/      ImageUploader, PhotoEditor, MessageEditor, MemoryEditor, ShareDialog, LivePreview…
│   └── ui/                 Button, Field, Modal, Toast, Layout primitives
├── hooks/                  device tier, media queries, focus trap, audio, typewriter/scramble
├── animations/tokens.ts    Shared timing, easing and reveal variants
└── utils/                  image compression, dates, readiness checks
```

**How a template runs.** `ExperienceShell` loads the template's fonts and sets its colours as CSS variables (`--bd-primary`, `--bd-secondary`, `--bd-accent`). It also provides these shared services through `useExperience()`:

- **Opening state:** `open()` dismisses the opening screen and starts music; `restart()` goes back to the start.
- **Effects:** confetti cannons, falling confetti, fireworks and themed bursts (hearts, stars, petals, pixels).
- **Music:** never autoplays; starts on the recipient's first interaction. Templates can read frequency data for visualizers.
- **Effects level:** particle density scales with the device and the chosen mood.
- **Reduced motion:** the setting is passed to every template.

**Templates are self-contained experiences.** The contract is one lazy-loaded root component plus metadata, not fixed slots such as hero, gallery and timeline. All templates read the same data model, but each decides:

- which pieces of content it uses, and in what order (the newspaper puts the letter in columns; the time capsule hides photos in tissue paper);
- its own opening interaction and final reveal;
- its own typography, palette, photo treatment and motion language;
- its own mobile composition (for example, the cinema templates switch to a vertical frame on phones instead of shrinking a widescreen strip).

Switching templates never touches the content, so a creator can try all 38 without losing anything.

**Live preview.** The studio renders the experience in an iframe (`/preview?embed=1`) and sends the config with `postMessage` on every change. Because it is a real iframe, phone and tablet breakpoints behave exactly as they will on a real device.

## Configuration model

Everything the templates show comes from one `BirthdayConfig` (see `src/types/birthday.ts`):

```ts
{
  version: 1,
  templateId: 'starry-night',
  birthdayPerson: 'Maya',
  senderName: 'Alex',
  relationship: 'Best friend',
  birthdayDate: '1999-10-12',        // used for date, age and countdowns
  age: 27,                           // optional override
  heroImage: 'data:image/webp;base64,…',
  heroFraming: { fit: 'cover', position: { x: 50, y: 30 }, zoom: 1.4, rotation: 0 },
  finalImage: undefined,             // falls back to heroImage
  finalFraming: undefined,
  messages: { intro, main, wish, surprise, final },
  memories: [{ id, image, framing?, title, description, date?, place? }],   // up to 12
  timeline: [{ id, image, framing?, title, description, date?, place? }],   // up to 6
  theme: { preset: 'template' | 'romantic' | … | 'custom', primary, secondary, accent },
  music: { url, name, enabled, volume },
}
```

`src/data/sampleConfig.ts` is a complete sample. Older configs are migrated on load by `normalizeConfig` (for example, the retired `aurora` template id becomes `birthday-edition`).

## Photos and music

- Photos: JPG, PNG or WEBP, up to 20 MB. They are resized (longest edge 1600 px) and re-encoded to WEBP in the browser, so drafts stay small.
- Music: MP3 or WAV, up to 12 MB. The file is checked for playability before it is accepted.
- Drafts and links are stored in IndexedDB, because photos and music quickly exceed localStorage's ~5 MB limit.

### Photo framing

Every uploaded photo has an **Adjust** button that opens the photo editor:

- **Drag** to reposition (touch drag on phones), **scroll or pinch** to zoom, or use the zoom slider.
- **Fill frame** (`cover`) or **Show whole photo** (`contain`).
- **Rotate** to straighten (−45° to 45°), **Reset**, then **Done**. Arrow keys move the photo and +/− zoom, so it works without a mouse.
- Small previews show how the photo will sit in a square, a portrait print and a wide frame.

Framing is stored per photo as `PhotoFraming { fit, position: { x, y }, zoom, rotation? }`, on `heroFraming`, `finalFraming` and each memory/timeline item's `framing`. It uses a **focal-point model**: the position is the point of the photo to keep in view, and zoom closes in on that point. That is why one setting works in every frame shape a template uses (square, 4:5 print, circle, 2.39:1 letterbox).

Templates don't need to do anything: `ExperienceShell` builds a photo URL → framing map, and `<PhotoSlot>` applies it automatically. Templates that add their own look (halftone, phosphor, two-ink cover art) apply it on top of the framed image. The lightbox opts out with `framing={false}`, so the whole photo is always viewable. Replacing a photo resets its framing, and framing is included in backups.

## Sharing: local mode and server mode

The app picks its storage mode at build time, and the Share dialog says which one is active.

### Local Share Mode (default, no backend)

With no backend configured, a shared birthday is saved **only in the browser that created it** (IndexedDB). The link works on that device, but it won't open on anyone else's. The Share dialog makes this explicit:

> Share your birthday experience. This version is stored only in this browser.
> 1. Download the backup 2. Open the website on the other device 3. Import the backup

with **Copy local link** and **Download backup** buttons.

To move a birthday to another device (Browser A → backup file → Browser B → experience restored):

- In the studio, open **Share → Import backup** and pick the file. The draft is replaced, and the original link id is restored in this browser, so the old local link works here too.
- Or open the local link on the other device. When the birthday isn't found, the page offers **Import backup file**, which restores it under that same link.

### Backup format

A backup is one self-contained `.json` file (`<name>-experience.json`). Photos and music are embedded as data URLs, so the file alone rebuilds everything: names, messages, template, theme, photos, **photo framing**, memories with dates and places, timeline and music settings.

```json
{
  "format": "birthday-studio-backup",
  "version": 1,
  "exportedAt": "2026-10-04T12:00:00.000Z",
  "shareId": "abc123xyz0",
  "config": { "version": 1, "templateId": "birthday-edition", "...": "..." }
}
```

On import, the file goes through `normalizeConfig`, so unknown fields are dropped, unsafe URLs are rejected and values are clamped. Bare config files from older exports are also accepted. Backups from a newer format version are refused with a clear message.

### Server mode

The repo includes a production server (`server/`, no runtime dependencies) that serves the app and the API from one origin. Build the client with the API path and start it:

```bash
VITE_BIRTHDAY_API_URL=/api npm run build
PUBLIC_ORIGIN=https://birthday.example.com npm run start   # or use the Dockerfile
```

Share links now open on any device. The Share dialog switches to "Your birthday experience is ready to share" with **Copy share link**, **Open experience**, **Update with latest changes** and **Unpublish**. Backup download and import stay available.

For development, run `npm run dev:server` in one terminal and `VITE_BIRTHDAY_API_URL=/api npm run dev` in another.

**API** (`src/data/api/birthdayApi.ts` is the client):

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| `POST` | `/api/media` | Photo or song bytes (JPG, PNG, WEBP, MP3, WAV) | `{ url }` (201) |
| `POST` | `/api/birthdays` | `BirthdayConfig` | `{ id, editToken }` (201) |
| `GET` | `/api/birthdays/:id` | — | `BirthdayConfig` (404 if missing) |
| `PUT` | `/api/birthdays/:id` | `BirthdayConfig`, with `Authorization: Bearer <editToken>` | `{ id }` |
| `DELETE` | `/api/birthdays/:id` | `Authorization: Bearer <editToken>` | 204 |
| `POST` | `/api/errors` | Client error report | 204 (written to the server log) |
| `GET` | `/api/health` | — | `{ ok: true }` |

How it stays safe:

- **Ownership.** Creating a birthday returns a random edit token, shown only once. The server stores only its SHA-256 hash and compares it in constant time. The token lives in the creator's draft. A browser without it, such as one that imported a backup, publishes a new link instead of overwriting the old one. Backups never contain the token.
- **Small payloads, real files.** The draft keeps photos and music embedded (so backups stay self-contained). On publish, each one is uploaded once to `/api/media` and the published config points at the hosted file. Uploads are content-addressed (identical files are stored once), and the server checks the file's signature, not its claimed type.
- **Validation.** Every config passes through the same `normalizeConfig` as the client. The server then keeps only media URLs it hosts, so a published page can't load third-party images or tracking pixels. JSON bodies are capped at 512 KB, photos at 8 MB, songs at 13 MB.
- **Abuse limits.** Per-IP rate limits for reads, writes and uploads (configurable). Cross-site writes are refused unless the origin is in `CORS_ORIGINS`. Uploads that no birthday references are deleted after 24 hours.
- **Privacy.** Shared pages send `X-Robots-Tag: noindex` and birthday ids are redacted from access logs.
- **Link previews.** `/birthday/:id` is served with its own title, description and `og:image` (the hero photo), so WhatsApp, iMessage and Slack show "Happy Birthday, Maya!" instead of a generic card. Missing links return a real 404.
- **Media playback.** Byte-range requests are supported, which Safari needs for audio.

**Storage and scaling.** `server/store.ts` keeps one JSON file per birthday and one file per upload under `DATA_DIR`, with atomic writes. That suits a single instance with a persistent volume. To run several instances, replace `FileStore` with a database and object storage, and the in-memory `RateLimiter` with a shared one (e.g. Redis). The HTTP layer doesn't change.

**Using a different backend.** UI code only talks to the `ExperienceRepository` interface in `src/data/repository.ts` (`save`, `get`, `remove`). For Firebase, Supabase or Postgres, write an implementation and assign it to `experienceRepository`; nothing else changes.

## Adding a template

1. Create `src/templates/my-template/` with `index.tsx` (the experience), `thumbnail.tsx` (default-exported gallery thumbnail) and `meta.tsx`:

   ```ts
   const load = loadChunk(() => import('./index'));
   export const myTemplate: BirthdayTemplate = {
     id: 'my-template', name: '…', /* moods, palette, fonts … */
     Thumbnail: lazyChunk(() => import('./thumbnail')),
     load,
     component: lazy(load),
   };
   ```
2. Build `index.tsx`. Use `useExperience()` and `useBirthdayText()` for content, `<Fill>` and `<PhotoSlot>` for placeholder-aware text and images (`PhotoSlot` applies photo framing for you), `getMemories` / `getTimeline` for lists, and call `open()` from your opening screen. Start from a real-world reference and run the five audit questions in [docs/template-concepts.md](docs/template-concepts.md).
3. Add the id to `TEMPLATE_IDS` in `src/data/templateIds.ts` (the single source of truth for `TemplateId` and validation). For a love template, add `'love'` to `categories` and set `loveTags`.
4. Register it in `src/templates/registry.ts`.

## Accessibility and performance

- Semantic sections and headings, visible focus rings, and labelled icon buttons. Dialogs and the lightbox trap focus and close with Esc. The lightbox supports ← / → and swipe; the scrapbook supports arrow keys.
- Every interaction has a keyboard or button alternative: "Blow them all out", "Skip level", "Plant every seed", "Pop them all at once", and so on.
- `prefers-reduced-motion` is respected throughout: Motion is set to `reducedMotion="user"`, CSS animations are neutralised, effects are disabled, and scroll-driven sections fall back to plain layouts.
- Particles pause when off-screen or in a background tab, and their count scales with device capability. The effects canvas only runs while particles exist.
- Neon and strobe-style effects stay below photosensitivity-safe flash rates.

## Performance and lazy loading

Nothing is downloaded before it's needed. What each kind of visitor loads:

| Loaded | When |
| --- | --- |
| React, router, Motion, icons, app shell | First visit. Separate vendor chunks with content-hashed names, cached for a year, so a new deploy doesn't re-download React or Motion |
| Each page (`/create`, `/templates`, `/birthday/:id`, …) | When the route is opened (`src/routes.ts`) |
| A template's experience (3–7 KB gzipped) and its CSS | When that template is played; prefetched when its card is hovered or focused |
| A template's gallery thumbnail | Only in the gallery and template picker, when the card scrolls within 400 px of the viewport. Recipients never download thumbnails |
| Template fonts | When the template mounts (`useGoogleFonts`); studio fonts are preloaded but never block the first paint |
| Confetti / fireworks engine | When the browser is idle after the page loads, or on the first effect, whichever comes first |
| Music player | Only when the birthday has a song |
| Photo editor, Share dialog | The first time the creator presses **Adjust** or **Share** |
| Photos | `loading="lazy"` and `decoding="async"`, except the hero photo |

On `/templates`, the Preview and Studio pages are prefetched while the browser is idle (skipped on Save-Data or 2G connections).

**Deploy safety.** After a deploy, an open tab may request chunk files that no longer exist. `lazyChunk` / `loadChunk` (`src/utils/lazyChunk.ts`) and the `vite:preloadError` handler detect this and reload the page **once**, to pick up the new build. A second failure within 30 seconds shows the error screen instead of looping.

## Production checklist

- **Environment:** see `.env.example`. Client settings (`VITE_*`) are baked in at build time; `VITE_BIRTHDAY_API_URL` is validated and must be an http(s) URL or a same-origin path. Server settings are read at start-up; `PUBLIC_ORIGIN` is required when `NODE_ENV=production`.
- **Security headers:** the bundled server, `vercel.json` and `public/_headers` set the same policy, and `npm run preview` applies it locally. The bundled server is stricter: `connect-src`, `img-src` and `media-src` are limited to its own origin, plus `Cross-Origin-Opener-Policy`. Also: `X-Content-Type-Options`, `Referrer-Policy`, HSTS (on https origins), and a `Permissions-Policy` that allows the microphone for this origin only (the cake can be blown out by voice).
- **Caching:** `/assets/*` and uploaded media are `immutable` for a year; `index.html` is `no-cache`, so new deploys are picked up immediately. The server gzips text assets.
- **Privacy:** a `/privacy` page explains what is stored and how to remove it (set `VITE_CONTACT_EMAIL` to show a takedown contact). Creators can unpublish a link. `/birthday/:id` pages send `noindex, nofollow`, and `robots.txt` disallows `/birthday/`, `/preview` and `/create`.
- **Errors and logs:** a root error boundary and global `error` / `unhandledrejection` listeners call `reportError`. With `VITE_ERROR_REPORT_URL=/api/errors` (the Docker default) reports land in the server log. Reports never include birthday content and are capped per page load. The server writes one JSON line per request and per error to stdout/stderr.
- **Operations:** `/api/health` for load balancers, a Docker `HEALTHCHECK`, graceful shutdown on `SIGTERM`, request timeouts, and a non-root container user. Back up `DATA_DIR`.
- **App shell:** a web app manifest with PNG and maskable icons, an Apple touch icon, a 1200×630 social image (`scripts/generate-icons.mjs` regenerates them), theme colour, a `noscript` message and a lightweight boot placeholder.
- **CI:** `.github/workflows/ci.yml` runs typecheck, lint, unit and API tests, the build and `npm audit` on every push and pull request. It also runs the Playwright suite and builds and smoke-tests the Docker image. Dependabot keeps npm packages, Actions and the base image up to date.

## Deployment

**Recommended: one container (server mode).** Links work on every device.

```bash
docker build --build-arg VITE_CONTACT_EMAIL=hello@example.com -t birthday-studio .
docker run -p 8787:8787 \
  -e PUBLIC_ORIGIN=https://birthday.example.com \
  -e TRUST_PROXY=1 \
  -v birthday-data:/data birthday-studio
```

Put it behind any HTTPS proxy or platform (Fly.io, Railway, Render, a VM with Caddy…), and mount a persistent volume at `/data`. Set `TRUST_PROXY=1` only when a proxy you control sets `X-Forwarded-For`, so rate limits apply per visitor.

**Static only (local share mode).** Run `npm run build` and deploy `dist/`. Links only open in the creator's browser.

- **Vercel:** `vercel.json` rewrites routes to `index.html` and sets the headers above.
- **Netlify / Cloudflare Pages:** `public/_redirects` and `public/_headers` are included.
- **Other hosts:** configure a fallback to `/index.html` so deep links like `/birthday/:id` work, serve `/assets/*` with long-lived caching, and copy the headers from `public/_headers`.

## Testing

`npm run test:e2e` builds the app in server mode, starts the real server with a throwaway data directory, and drives Chromium at desktop and phone sizes. It creates a birthday, uploads a photo and publishes it, then opens the link in a separate browser context (a different "device") and checks the title, link preview and hosted photo. It fails on any console error or CSP violation. Finally it unpublishes and checks that the link returns 404. Set `PLAYWRIGHT_CHROMIUM_PATH` to use an already-installed Chromium.

`npm test` covers the API end to end over HTTP: edit tokens, validation, media sniffing, byte ranges, garbage collection, link previews, 404s and rate limits. It also covers the client's publish flow (uploads, token fallback), and runs unit tests for stale-chunk detection, the template registry (every template has lazy experience and thumbnail chunks), config validation and migration, photo framing (clamping, focal-point CSS), backup round-trips (including framing and share ids, legacy files and newer-version rejection), age and date logic, readiness checks and placeholder fallbacks. During development, every template was also exercised in a real browser at 1366 px and 390 px: opening interaction, a full scroll, console errors and horizontal overflow. The create → upload → share → open-link flow and reduced-motion mode were checked the same way. The production build was also checked under `npm run preview` with the production CSP: no policy violations, lazy chunks loading on demand, and a missing chunk triggering exactly one reload.
