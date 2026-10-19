# Birthday Studio

Build a cinematic, personal birthday website in minutes. Pick one of **39 different experiences**, including a 20-template **Love & Romance** collection. Add your photos and words, preview it live, and share a link.

Each template is its own experience, not a colour swap. Starry Night spells their name in constellations, Game Night has three mini-games, Love Letter opens with a wax seal, and so on. The same photos and messages work in every template, so switching never loses content.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server. Set `NEXT_PUBLIC_BIRTHDAY_API_URL=/api` to try server mode: the API runs in the same process |
| `npm run build` | Type-check and build the app (and its API routes) into `.next/` |
| `npm run start` | Run the production build: app + API on one port (see [Deployment](#deployment)) |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Unit and API tests (Vitest) |
| `npm run test:e2e` | End-to-end tests in Chromium, desktop and mobile (Playwright, server mode) |
| `npm run check` | Everything CI runs: typecheck, lint, tests, build |

Requires Node 20.19+ or 22.12+ (CI and the Docker image use Node 22). It is a Next.js (App Router) app. Copy `.env.example` to `.env.local` for the optional settings below.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | The landing page: what Birthday Studio is, how it works, a taste of the templates, why to make an account. Its buttons follow who is looking: new visitor, signed-in user, or a server without accounts |
| `/templates` | "Choose your birthday experience" gallery, with category filters |
| `/templates/:id` | Full preview of a template using fictional sample content |
| `/create` | The studio: customise everything with a live desktop, tablet or mobile preview. With accounts on it needs a login and saves to the account |
| `/preview` | Full-screen preview of your draft (`?embed=1` runs inside the studio's preview frame) |
| `/birthday/:id` | The shared link the recipient opens. It has no creator controls |
| `/login`, `/register` | Sign in or create an account (only when the server has accounts on) |
| `/forgot-password`, `/reset-password`, `/verify-email` | The email flows: ask for a reset link, choose the new password, confirm an address |
| `/dashboard` | The signed-in user's birthdays (`?tab=library` for the media library) |
| `/profile` | Who you are, what you're using, rename, change password, sign out other devices, delete the account |
| `/privacy` | What is stored, where, and how to remove it |

**The flow.** A visitor lands on `/`, browses `/templates` freely, and signs up when they start building (or straight from the landing page, which sends them on to the templates). The account menu in every header (initial → My birthdays, library, the studio, Profile & settings, Log out) is the way around. A brand-new account's dashboard walks through the three steps; later it lists their birthdays, each with Edit, View, Duplicate, Rename and Delete. Logging out or deleting the account returns to `/`. Without accounts there is no login: the landing page and header open the studio directly, and `/preview` shows the draft.

## How to make one (no code needed)

1. Start on the home page, then go to **/templates** and click **Preview** or **Use template**. With accounts on, you sign up (free) at this point; the template you chose is waiting for you after.
2. In **/create**, fill in the steps: basics, photos, messages, memories, story, colours and music. Everything autosaves, to your account (or to your browser, when the server has no accounts).
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
| 🌳 | A Year Around You | Draw the curtains on one tree and watch a whole year turn: blossoms open on photos, catch summer fireflies, brush away autumn leaves, wipe winter frost off the glass. The year ends on their birthday season |

Every template is modelled on a real object or medium (a newspaper, a biscuit tin, a CRT terminal, a paperback, an orrery) rather than a generic web layout. The concept, references and design audit for all 39 are in [docs/template-concepts.md](docs/template-concepts.md).

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
├── app/                    Next.js App Router: layout + providers, one thin page per route, API and media route handlers
├── proxy.ts                CSP (per-request nonce) and security headers for pages
├── instrumentation.ts      Opens the store and starts the media garbage collector at boot
├── views/                  The pages themselves (Experience, Create, Preview, Templates, TemplatePreview, Birthday); client-only
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

Switching templates never touches the content, so a creator can try all 39 without losing anything.

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

The API lives in the same Next.js app (`src/app/api/`, `src/app/media/`, with the logic in `server/`), so one process serves the pages and the API from one origin. Build with the API path and start it:

```bash
NEXT_PUBLIC_BIRTHDAY_API_URL=/api npm run build
PUBLIC_ORIGIN=https://birthday.example.com npm run start   # or use the Dockerfile
```

Share links now open on any device. The Share dialog switches to "Your birthday experience is ready to share" with **Copy share link**, **Open experience**, **Update with latest changes** and **Unpublish**. Backup download and import stay available.

For development, run `NEXT_PUBLIC_BIRTHDAY_API_URL=/api npm run dev`.

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

**Storage.** Two backends, chosen at start-up. Both are covered by the same API test suite.

- **Files (default).** `server/store.ts` keeps one JSON file per birthday and one file per upload under `DATA_DIR`, with atomic writes. This suits a single instance with a persistent volume.
- **MongoDB.** Set `MONGODB_URI`, and optionally `MONGODB_DB`. `server/mongoStore.ts` stores birthdays in the `birthdays` collection and photos and songs in the `media` **GridFS** bucket (`media.files` / `media.chunks`). GridFS splits files into chunks, so uploads aren't limited by MongoDB's 16 MB document size. Uploads are still named by content hash and stored once, and byte-range requests stream directly from GridFS. Nothing is written to local disk, so several server instances can share one database (MongoDB Atlas works as-is). `docker compose up` runs the app with a local MongoDB.

  ```bash
  MONGODB_URI="mongodb+srv://user:pass@cluster.example.mongodb.net" MONGODB_DB=birthday_studio \
  PUBLIC_ORIGIN=https://birthday.example.com npm run start
  ```

With several instances, rate limits are still counted per instance (in memory). Swap `RateLimiter` for a shared one, such as Redis, if you need exact global limits.

**Using a different backend.** On the server, implement the `Store` interface in `server/store.ts` (for Postgres, S3 and so on). In the browser, UI code only talks to the `ExperienceRepository` interface in `src/data/repository.ts` (`save`, `get`, `remove`). For Firebase, Supabase or Postgres, write an implementation and assign it to `experienceRepository`; nothing else changes.

## Accounts, works and the media library

With a server and a database, people sign up and keep their own birthdays ("works") and a private library of photos and songs. It is on by default whenever `MONGODB_URI` is set.

| Setting | Meaning |
| --- | --- |
| `ACCOUNTS` | `mongodb` (the default when `MONGODB_URI` is set), `memory` (development and tests: everything is lost on restart) or `off` |
| `REGISTRATION` | `closed` stops new sign-ups; existing accounts keep working |
| `SESSION_DAYS` | How long a login lasts (default 30) |
| `MAX_WORKS_PER_USER`, `MAX_LIBRARY_MB` | Per-user limits (default 50 birthdays, 200 MB of media) |
| `RATE_LIMIT_AUTH` | Login and sign-up attempts a minute, per address and per email (default 10) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Turn on email through [Resend](https://resend.com): password reset and address confirmation. `EMAIL_FROM` is like `Birthday Studio <hello@birthday.example.com>` on a domain verified in Resend. With neither set, the "Forgot your password?" link is hidden |
| `EMAIL=log` | Development: write each email to the server log instead of sending it |
| `RATE_LIMIT_EMAIL_PER_HOUR`, `RATE_LIMIT_EMAIL_IP_PER_HOUR` | Emails one address may be sent (default 3), and one visitor may ask for (default 10), per hour |
| `EMAIL_DAILY_LIMIT` | A ceiling on all emails a day (default 500), so abuse can't exhaust the Resend quota |
| `RESET_LINK_MINUTES`, `VERIFY_LINK_HOURS` | How long the emailed links work (default 60 minutes, 24 hours) |
| `RESEND_API_URL` | Only to point tests or a proxy at a different Resend endpoint |

**What changes for people.**
- `/create` and `/dashboard` need a login. Templates and published birthdays stay public.
- The studio autosaves to the server, as one of the user's works. Photos and songs go into their library the moment they are chosen, and the work holds only `/api/library/<id>/file` references, so saving stays light. Anything already in the library can be picked again from **Library** in any photo or music slot.
- **Share** publishes the work: the files it uses are copied to the public store and a share link is created. Editing afterwards stays private until **Update with latest changes**. Unpublishing, or deleting the work, takes the link down.
- Anonymous publishing (`POST /api/birthdays`, `POST /api/media`) is switched off, so every public birthday belongs to someone. Links that already exist keep working.

**How media is stored.** Files are kept as BSON `Binary` in the `userMedia` collection (up to the 13 MB song limit, under MongoDB's 16 MB document cap), once per user by SHA-256. This holds the same bytes a base64 string would, without base64's 33% overhead, which would push a 12 MB song past the cap. The browser still handles photos as base64 data URLs while editing; the server decodes them to bytes on upload. Library files are served only to their owner (`Cache-Control: private`, revalidated with an `ETag`, byte ranges for audio).

**Isolation.** Every query on works and media includes the owner's id taken from the session, never from the request, so another person's data can't be reached rather than being checked after the fact. Someone else's work or file answers `404`, the same as one that doesn't exist. A work can only reference files from its owner's library (anything else is dropped on save), and `server/accountsApi.test.ts` and `e2e/accounts.spec.ts` try to read, change, delete and publish each other's things.

**Security.** Passwords are hashed with scrypt (N=32768) and a per-user salt; login takes as long for an unknown email as for a wrong password and says the same thing; password guesses are limited per account as well as per address. Sessions are random tokens, stored only as a hash, in an `HttpOnly`, `SameSite=Lax` cookie (`__Host-` prefixed and `Secure` on https). Every write must come with a known `Origin`. Changing a password signs out the other devices. Deleting an account removes its works, library and share links.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/auth/me` | `{ accountsEnabled, user }`; `accountsEnabled: false` on servers without accounts |
| `POST` | `/api/auth/register`, `/login`, `/logout`, `/password` | |
| `POST` | `/api/auth/forgot`, `/api/auth/reset` | Email a one-time reset link; set the new password with it |
| `POST` | `/api/auth/verify`, `/api/auth/resend-verification` | Confirm the address from the emailed link; send the link again |
| `DELETE` | `/api/auth/account` | Needs the password |
| `GET`, `POST` | `/api/works` | List, create |
| `GET`, `PUT`, `DELETE` | `/api/works/:id` | |
| `POST` | `/api/works/:id/publish`, `/unpublish` | Publish returns `{ shareId }` |
| `POST` | `/api/works/:id/duplicate` | A private copy |
| `POST` | `/api/works/claim` | `{ id, editToken }`: moves a birthday published before accounts into the account, keeping its link |
| `GET`, `POST` | `/api/library` | Upload sends the bytes, with the name in `X-File-Name` |
| `GET`, `DELETE` | `/api/library/:id/file`, `/api/library/:id` | Delete is refused while a birthday still uses the file |

Accounts need the API on the app's own origin (`NEXT_PUBLIC_BIRTHDAY_API_URL=/api`), so the login cookie is sent. Social login isn't built: it needs OAuth credentials from each provider.

**Forgot password.** `/forgot-password` asks for an address and emails a link to `/reset-password`. The link carries a random 256-bit token that is stored only as a hash, works once, expires after an hour, and is replaced by any newer request. Using it signs the account out everywhere, revokes any other link, confirms the address, and emails a "your password was changed" notice. The page removes the token from the address bar once read, and the pages send no `Referer`. A request gets the same `202` whether or not the address has an account, and the email is sent after the response, so neither the answer nor its timing says who is registered.

**Email limits.** All of these apply to reset and confirmation emails: 10 attempts a minute per visitor (`RATE_LIMIT_AUTH`); 3 emails an hour to one address, counted whether or not it has an account; 10 an hour requested by one visitor; and a daily ceiling on everything sent. Guessing reset tokens is limited per visitor too. A Resend outage never blocks signing up or leaks into a response; it is logged and the dashboard offers to send the confirmation again.

**Confirming the address.** Sign-up emails a link to `/verify-email`, which asks for a click before confirming (so a mail scanner opening the link can't use it up). Confirming isn't required to use the app; the dashboard just reminds people until they do.

**Moving earlier birthdays in.** If the browser still holds the edit token from publishing before accounts, the dashboard offers to add that birthday to the account: it copies the photos and song into the library, keeps the same share link, and stops the token being used a second time.

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

**Deploy safety.** After a deploy, an open tab may request chunk files that no longer exist. `lazyChunk` / `loadChunk` (`src/utils/lazyChunk.ts`) and the chunk-error handler in `src/app/providers.tsx` detect this and reload the page **once**, to pick up the new build. A second failure within 30 seconds shows the error screen instead of looping.

## Production checklist

- **Environment:** see `.env.example`. Client settings (`NEXT_PUBLIC_*`) are baked in at build time; `NEXT_PUBLIC_BIRTHDAY_API_URL` is validated and must be an http(s) URL or a same-origin path. Server settings are read at start-up; `PUBLIC_ORIGIN` is required when `NODE_ENV=production`.
- **Security headers:** `src/proxy.ts` sets a Content-Security-Policy with a fresh nonce on every page (so Next.js's inline scripts run and everything else is blocked), with `connect-src`, `img-src` and `media-src` limited to the app's own origin, plus `Cross-Origin-Opener-Policy`. Pages are rendered per request for this reason. The API and media routes are excluded from the proxy and set their own headers. Also: `X-Content-Type-Options`, `Referrer-Policy`, HSTS (on https origins), and a `Permissions-Policy` that allows the microphone for this origin only (the cake can be blown out by voice).
- **Caching:** `/_next/static/*` and uploaded media are `immutable` for a year; pages are never cached, so new deploys are picked up immediately.
- **Privacy:** a `/privacy` page explains what is stored and how to remove it (set `NEXT_PUBLIC_CONTACT_EMAIL` to show a takedown contact). Creators can unpublish a link. `/birthday/:id` pages send `noindex, nofollow`, and `robots.txt` (generated by `src/app/robots.ts`, with a sitemap) disallows `/birthday/`, `/preview` and `/create`.
- **Errors and logs:** a root error boundary and global `error` / `unhandledrejection` listeners call `reportError`. With `NEXT_PUBLIC_ERROR_REPORT_URL=/api/errors` (the Docker default) reports land in the server log. Reports never include birthday content and are capped per page load. The server writes one JSON line per request and per error to stdout/stderr.
- **Operations:** `/api/health` for load balancers, a Docker `HEALTHCHECK`, the store is opened and the media garbage collector started when the server boots (`src/instrumentation.ts`), and a non-root container user. Back up `DATA_DIR`.
- **App shell:** a web app manifest with PNG and maskable icons, an Apple touch icon, a 1200×630 social image (`scripts/generate-icons.mjs` regenerates them), theme colour, a `noscript` message and a loading screen until the page is ready.
- **CI:** `.github/workflows/ci.yml` runs typecheck, lint, unit and API tests, the build and `npm audit` on every push and pull request. It also runs the Playwright suite and builds and smoke-tests the Docker image. Dependabot keeps npm packages, Actions and the base image up to date.

## Deployment

**Recommended: one container (server mode).** Links work on every device.

```bash
docker build --build-arg NEXT_PUBLIC_CONTACT_EMAIL=hello@example.com -t birthday-studio .
docker run -p 8787:8787 \
  -e PUBLIC_ORIGIN=https://birthday.example.com \
  -e TRUST_PROXY=1 \
  -v birthday-data:/data birthday-studio
```

With MongoDB instead of a volume, add `-e MONGODB_URI=…`, or run `docker compose up` (app + MongoDB).

Put it behind any HTTPS proxy or platform (Fly.io, Railway, Render, a VM with Caddy…), and mount a persistent volume at `/data`. Set `TRUST_PROXY=1` only when a proxy you control sets `X-Forwarded-For`, so rate limits apply per visitor. Next.js route handlers can't see the socket address and fill `X-Forwarded-For` themselves when it is missing, so a server exposed directly (no proxy) can have its per-IP limits dodged by a spoofed header; always run it behind a proxy.

**Serverless hosts (Vercel and similar).** Not supported in server mode: the file store needs a persistent disk, and uploads of up to 13 MB exceed the usual request-body limits. Local share mode (no `NEXT_PUBLIC_BIRTHDAY_API_URL`, links open only in the creator's browser) has no such needs, and MongoDB storage removes the disk requirement; uploads would still need a direct-to-storage flow.

## Testing

`npm run test:e2e` builds the app in server mode (into `.next-e2e`) and starts two real servers with throwaway data (`scripts/e2e-servers.mjs`): one with accounts on, which MongoDB backs when `MONGODB_URI` is set and memory otherwise, and one with accounts off for the anonymous flow. `e2e/accounts.spec.ts` signs up, builds a birthday with a photo in the library, publishes, checks another account can't see or reach any of it, deletes, logs out and in, and deletes the account. `e2e/anonymous.spec.ts` drives the original flow. All of it runs in Chromium at desktop and phone sizes. The anonymous spec creates a birthday, uploads a photo and publishes it, then opens the link in a separate browser context (a different "device") and checks the title, link preview and hosted photo. Both specs fail on any console error or CSP violation, and finish by unpublishing or deleting and checking that the link returns 404. A second spec loads every template (found from the `meta.tsx` files) and fails on a blank page, horizontal overflow or any console error. Set `PLAYWRIGHT_CHROMIUM_PATH` to use an already-installed Chromium, and `MONGODB_URI` to run it against MongoDB storage. CI runs it with both backends.

Set `MONGODB_TEST_URI=mongodb://127.0.0.1:27017` to also run the API tests against MongoDB. CI does this with a MongoDB service.

`npm test` covers the API through its Web `Request` / `Response` core (the same code the route handlers run): edit tokens, validation, media sniffing, byte ranges, garbage collection, link previews, 404s and rate limits. It also covers the client's publish flow (uploads, token fallback), and runs unit tests for stale-chunk detection, the template registry (every template has lazy experience and thumbnail chunks), config validation and migration, photo framing (clamping, focal-point CSS), backup round-trips (including framing and share ids, legacy files and newer-version rejection), age and date logic, readiness checks and placeholder fallbacks. During development, every template was also exercised in a real browser at 1366 px and 390 px: opening interaction, a full scroll, console errors and horizontal overflow. The create → upload → share → open-link flow and reduced-motion mode were checked the same way. The production build is checked by the e2e suite with the production CSP: no policy violations.
