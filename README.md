# Birthday Studio

Build a cinematic, personal birthday website in minutes. Pick one of **19 different experiences**, add your photos and words, preview it live, and share a link.

Each template is its own experience, not a colour swap. Starry Night spells their name in constellations, Game Night has three mini-games, Love Letter opens with a wax seal, and so on. The same photos and messages work in every template, so switching never loses content.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Unit tests (Vitest) |

Requires Node 20.19+ (tested on Node 23).

## Routes

| Route | Purpose |
| --- | --- |
| `/` | The birthday website built from your current draft, with a small creator toolbar you can dismiss |
| `/templates` | "Choose your birthday experience" gallery, with category filters |
| `/templates/:id` | Full preview of a template using fictional sample content |
| `/create` | The studio: customise everything with a live desktop, tablet or mobile preview |
| `/preview` | Full-screen preview of your draft (`?embed=1` runs inside the studio's preview frame) |
| `/birthday/:id` | The shared link the recipient opens. It has no creator controls |

## How to make one (no code needed)

1. Go to **/templates**, then click **Preview** or **Use template**.
2. In **/create**, fill in the steps: basics, photos, messages, memories, story, colours and music. Everything autosaves to your browser.
3. Watch the live preview. Switch device sizes, replay the opening, or open it full screen.
4. Click **Share**. The studio lists any personal touches still missing, then creates the link.

Anything you leave empty shows a clearly marked placeholder such as `[BIRTHDAY PERSON NAME]` or `[UPLOAD PHOTO]`. The site never invents personal details.

## The templates

| | Template | Signature moment |
| --- | --- | --- |
| ✨ | Aurora Surprise | Magnetic opening, floating portrait, tilt gallery, blow-out cake, 3D gift box |
| 🌙 | Starry Night | Name drawn as a constellation, moon phases, wish on a shooting star |
| 📷 | Polaroid Memories | Memory box, draggable photos, clothesline story, photos spell "Happy Birthday" |
| 🎬 | Cinematic Film | Projector countdown, scroll subtitles, film-strip gallery, end credits |
| 🎈 | Balloon Festival | Pop balloons to reveal memories, golden-balloon finale |
| 📒 | Birthday Scrapbook | Page-turning book, movable stickers, hidden notes, envelope |
| 🕯️ | Minimal Luxury | Masked photography, editorial index, a single candle |
| 🎮 | Game Night | Pop balloons, catch stars, boss charge, then "Level [AGE] unlocked" |
| 💌 | Love Letter | Wax-seal envelope, handwriting reveal, tucked-in photos |
| 🪩 | Neon Party | Neon signs, light board, audio visualizer, "drop the beat" |
| 🌸 | Garden of Wishes | Plant seeds that bloom into memory flowers; fireflies follow the cursor |
| 🎞️ | Film Roll | Sideways film strip where each negative develops; flip the final print |
| ⏳ | Time Capsule | Unseal the capsule, open memory pods, countdown to the next birthday |
| 💥 | Comic Book | Collectible cover, speech bubbles, POW! effects, splash page |
| 🏰 | Fairytale | Parallax storybook, royal decree, hidden stars, birthday spell |
| 🎪 | Festival of Memories | Ticket gate, zones, photo booth, wish lanterns, headline finale |
| 🪐 | Cosmic Journey | Launch countdown, memories as orbiting planets, planet alignment |
| ☕ | Coffee & Memories | Chalkboard menu, orders served to the table, cupcake candle, receipt |
| 🛰️ | Digital Future | Boot sequence, holographic scan, decrypting logs, "Mission: complete" |

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
│   ├── repository.ts       Persistence boundary (local IndexedDB or REST)
│   └── storage/idb.ts      Small IndexedDB wrapper
├── store/DraftProvider.tsx Draft state and debounced autosave
├── themes/                 7 mood presets, custom colours, CSS variables
├── templates/
│   ├── registry.ts         List of all templates (metadata loads up front)
│   └── <id>/meta.tsx       Name, moods, fonts, palette, animated thumbnail
│       <id>/index.tsx      The experience itself (separate lazy-loaded chunk)
├── components/
│   ├── experience/         ExperienceShell, Lightbox, BirthdayCake, PhotoSlot, Fill, MusicPlayer…
│   ├── effects/            Confetti/fireworks engine, Particles, PointerTrail, Magnetic, Tilt…
│   ├── customization/      ImageUploader, MessageEditor, MemoryEditor, ThemeSelector, LivePreview…
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

Each template owns its own layout and story, so the contract is one lazy-loaded root component plus metadata, rather than fixed slots such as hero, gallery and timeline.

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
  finalImage: undefined,             // falls back to heroImage
  messages: { intro, main, wish, surprise, final },
  memories: [{ id, image, title, description }],   // up to 12
  timeline: [{ id, image, title, description }],   // up to 6
  theme: { preset: 'template' | 'romantic' | … | 'custom', primary, secondary, accent },
  music: { url, name, enabled, volume },
}
```

`src/data/sampleConfig.ts` is a complete sample. You can also download any birthday as a JSON backup from the Share dialog and import it again.

## Photos and music

- Photos: JPG, PNG or WEBP, up to 20 MB. They are resized (longest edge 1600 px) and re-encoded to WEBP in the browser, so drafts stay small.
- Music: MP3 or WAV, up to 12 MB. The file is checked for playability before it is accepted.
- Drafts and links are stored in IndexedDB, because photos and music quickly exceed localStorage's ~5 MB limit.

## Sharing and connecting a backend

Without a backend, **share links only open in the browser that created them**. They are stored in that browser's IndexedDB, and the Share dialog says so. To send a birthday to another device today, use **Download backup** and **Import backup**.

To make links work everywhere, set one environment variable:

```bash
# .env.local
VITE_BIRTHDAY_API_URL=https://api.example.com
```

The app then uses `createRestRepository` in `src/data/repository.ts`, which expects:

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| `POST` | `/birthdays` | `BirthdayConfig` | `{ id }` |
| `PUT` | `/birthdays/:id` | `BirthdayConfig` | `{ id }` |
| `GET` | `/birthdays/:id` | — | `BirthdayConfig` (404 if missing) |

For Firebase, Supabase or Postgres, implement the small `BirthdayRepository` interface (`save`, `get`) and export it as `birthdayRepository`; no UI code needs to change. For production, consider uploading images to object storage and storing URLs instead of data URLs. `normalizeConfig` already accepts `https://` media URLs.

## Adding a template

1. Create `src/templates/my-template/meta.tsx` with a `BirthdayTemplate` object (name, moods, palette, fonts, `Thumbnail`, `component: lazy(() => import('./index'))`).
2. Build `index.tsx`. Use `useExperience()` and `useBirthdayText()` for content, `<Fill>` and `<PhotoSlot>` for placeholder-aware text and images, `getMemories` / `getTimeline` for lists, and call `open()` from your opening screen.
3. Add the id to `TemplateId` in `src/types/birthday.ts` and to the list in `src/data/normalizeConfig.ts`.
4. Register it in `src/templates/registry.ts`.

## Accessibility and performance

- Semantic sections and headings, visible focus rings, and labelled icon buttons. Dialogs and the lightbox trap focus and close with Esc. The lightbox supports ← / → and swipe; the scrapbook supports arrow keys.
- Every interaction has a keyboard or button alternative: "Blow them all out", "Skip level", "Plant every seed", "Pop them all at once", and so on.
- `prefers-reduced-motion` is respected throughout: Motion is set to `reducedMotion="user"`, CSS animations are neutralised, effects are disabled, and scroll-driven sections fall back to plain layouts.
- Each template and page is its own chunk (≈4–7 KB gzipped per template) and loads only its own Google Fonts.
- Particles pause when off-screen or in a background tab, and their count scales with device capability. The effects canvas only runs while particles exist.
- Images are lazy-loaded, fade in, and fall back gracefully when missing or broken.
- Neon and strobe-style effects stay below photosensitivity-safe flash rates.

## Deployment

It is a static single-page app. Run `npm run build` and deploy `dist/`.

- **Vercel:** `vercel.json` already rewrites all routes to `index.html`.
- **Netlify:** `public/_redirects` is included.
- **Other hosts:** configure a fallback to `/index.html` so deep links like `/birthday/:id` work.

## Testing

`npm test` runs unit tests for config validation, age and date logic, readiness checks and placeholder fallbacks. During development, every template was also exercised in a real browser at 1366 px and 390 px: opening interaction, a full scroll, console errors and horizontal overflow. The create → upload → share → open-link flow and reduced-motion mode were checked the same way.
