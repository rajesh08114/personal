# Template concepts and design audit

Every template is a self-contained experience built on the shared `BirthdayConfig` data model (names, messages, photos with framing, memories with date/place, timeline, theme, music). Templates do **not** share a section structure: each one decides which content it shows, in what order, and through which interaction.

This document records, for every template, the concept and the real-world object it is modelled on, plus the result of the design audit.

## The audit

Each template was checked against five questions:

1. **Reference.** Is it modelled on a real object, place or medium that someone could point to?
2. **Without effects.** Does it still read clearly with the glows, gradients, blur and particles taken away?
3. **Motion.** Does every animation have a physical reason (paper unfolds, film advances, a lid lifts), or is it decoration?
4. **Type.** Does the typography belong to the reference (newsprint, typewriter, terminal, engraving), or is it a generic web font?
5. **Photos.** Are photos treated the way the reference would treat them (halftone, print border, two-ink cover, phosphor), and do they respect the creator's framing?

Results:

- **Redesigned:** failed several questions, rebuilt around a new reference.
- **Restrained:** the concept was sound, but the effects were reduced.
- **Pass:** no changes needed.
- **Follow-up:** passes, but still leans on glow or gradient more than ideal. Candidates for the next pass.

| Result | Templates |
| --- | --- |
| Redesigned | The Birthday Edition (replaces Aurora Surprise), Time Capsule, Parallel Universes, Our Little Universe, Terminal 1983 (was Digital Future) |
| Restrained | Two Souls, Neon Party; glassmorphism (`backdrop-blur`) removed from every template |
| Pass | A Year Around You, Love Letter, Polaroid Memories, Scrapbook, Film Roll, Cinematic Film, Coffee & Memories, Comic Book, Minimal Luxury, Balloon Festival, Garden of Wishes, Game Night, Our Story, Memory Gallery, Polaroid Wall, Forever Timeline, Vinyl Love, Candlelight Dinner, Gift Box, Cinema Date, Forever Letterbox, Handwritten Journal, Rose Garden, Secret Garden, Midnight Date, Constellation of Us |
| Follow-up | Cosmic Journey, Starry Night, Message in the Stars, Digital Heartbeat, Festival of Memories, Fairytale |

Studio chrome was audited too:

- The template gallery is now an editorial catalogue: paper, numbered entries, ruled lines, no glows or badges.
- The loading screen is a thin rule instead of a glowing orb.
- The editor's preview backdrop is a flat colour instead of a purple radial gradient.
- Sample photos are muted procedural landscapes in faded film tones instead of saturated gradient blobs.

---

## Birthday templates

### The Birthday Edition — `birthday-edition` (default) · Redesigned
- **Concept:** a one-copy broadsheet printed for the birthday person.
- **Inspiration:** mid-century newspaper front pages; the "front page from the day you were born" gift.
- **Emotional goal:** witty, warm pride ("you made the news").
- **Layout:**
  - Desktop: masthead, a lead story with sidebar, the letter in 2–3 justified columns with a drop cap, then the archive, chronology, classifieds and a stop-press slip.
  - Mobile: a single column, in the same reading order.
- **Typography:** UnifrakturMaguntia masthead, Old Standard TT headlines, Libre Caslon Text body.
- **Colour:** newsprint `#efe9dc`, ink `#1d1b18`, one red for the rubber stamp (theme accent).
- **Photo treatment:** monochrome with a halftone screen; captions in newspaper style ("Pictured: …").
- **Interaction:** unfold the folded paper on the doormat; tear off wish tabs from a classified notice; press "Stop the presses".
- **Animation:** the paper unfolds (rotateX from the fold), tabs drop under gravity, the slip is pasted down with a spring, the stamp thumps in.
- **Final reveal:** a "Late Extra" slip carrying the surprise message, the final photo and the sign-off.
- **Why the change:** Aurora Surprise used blurred purple/pink blobs, glass cards and glow, with no real-world reference. Old configs using `aurora` migrate to `birthday-edition` automatically.

### Time Capsule — `time-capsule` · Redesigned
- **Concept:** an old biscuit tin buried in the garden and dug up today.
- **Inspiration:** school time capsules, label-maker labels, masking tape, tissue paper.
- **Emotional goal:** reflective nostalgia; "someone kept this for you".
- **Layout:** the tin seen from above, then the objects inside in the order you'd find them: photo on top, typed letter, wrapped photos, ticket stubs, and an envelope marked "open last".
- **Typography:** Special Elite (typewriter), Caveat (handwriting), Lora body; embossed black label-maker tape.
- **Colour:** soil beige, painted teal tin, kraft paper, a red wax seal (theme accent).
- **Photo treatment:** prints with white borders and slight tilts, wrapped in tissue until tapped.
- **Interaction:** peel the tape off, lift the lid, unwrap each photo, open the last envelope.
- **Animation:** tape peels away and falls, the lid lifts and tilts, tissue slides off upward, the envelope's letter rises out.
- **Final reveal:** the "open last" letter, then a label-maker strip reading "NEXT OPENING IN N DAYS".
- **Why the change:** it was a glowing sci-fi capsule with neon rings, a cyan grid, gradient text and glass cards.

### Terminal 1983 — `digital-future` · Redesigned
- **Concept:** an amber-phosphor computer terminal in a beige case, late at night.
- **Inspiration:** early-80s monochrome CRTs, DOS prompts, BIOS boot screens.
- **Emotional goal:** nerdy affection; an in-joke for people who grew up with computers.
- **Layout:**
  - Desktop: the whole page is the screen, with a beige bezel and corner vignette from the tube's curvature.
  - Mobile: the screen alone, without the bezel.
  - Content arrives as commands: `WHOAMI`, `TYPE MESSAGE.TXT`, `DIR MEMORIES`, `RUN BIRTHDAY.EXE`.
- **Typography:** VT323 for system text, IBM Plex Mono for long reading.
- **Colour:** a single phosphor colour (`#ffb000`) on brown-black. No second hue.
- **Photo treatment:** monochrome amber, with scanlines over the image.
- **Interaction:** press Return to log in; type out the message; open files; run the program.
- **Animation:** the boot text appears line by line, the cursor blinks, the screen collapses to a line like a CRT powering off, and a text cake prints row by row.
- **Final reveal:** an ASCII cake, the surprise message, then "PROGRAM TERMINATED NORMALLY."
- **Why the change:** it was a cyan/magenta "holographic" HUD with glass panels, glitch effects, gradient bars and confetti cannons.

### The Love Letter — `love-letter` · Pass
- **Concept:** an ivory envelope sealed with wax.
- **Inspiration:** handwritten letters and wax seals.
- **Emotional goal:** intimacy.
- **Layout:** the envelope, the letter unfolding, photos sliding in.
- **Typography:** script for the handwriting, serif for the body.
- **Colour:** ivory, oxblood, warm brown.
- **Photo treatment:** prints slid between the pages.
- **Interaction:** break the seal, read line by line.
- **Animation:** unfold and ink.
- **Final reveal:** the letter folds back into the envelope.

### Polaroid Memories — `polaroid-memories` · Pass
- **Concept:** a memory box of polaroids on a desk.
- **Inspiration:** instant-film prints and a clothesline of photos.
- **Interaction:** drag and shuffle the photos; follow the clothesline story.
- **Final reveal:** the photos fly together to spell Happy Birthday. The letter tiles now honour photo framing.

### Birthday Scrapbook — `scrapbook` · Pass
- **Concept:** a handmade scrapbook.
- **Inspiration:** craft paper, tape, stickers, doodles.
- **Interaction:** turn the pages, move the stickers, lift the sticky notes.
- **Final reveal:** an envelope to open.

### Film Roll — `film-roll` · Pass
- **Concept:** a darkroom.
- **Inspiration:** 35mm negatives and contact sheets.
- **Interaction:** scroll sideways along the strip; negatives develop into colour; fire the shutter.
- **Final reveal:** flip the final print.

### Cinematic Film — `cinematic-film` · Pass
- **Concept:** their life as a feature film.
- **Inspiration:** projector leader countdowns, subtitles, end credits.
- **Final reveal:** end credits starring the birthday person.

### Coffee & Memories — `coffee-memories` · Pass
- **Concept:** a corner café.
- **Inspiration:** chalkboard menus, latte art, paper receipts.
- **Final reveal:** a receipt marked "priceless".

### Comic Book — `comic-book` · Pass
- **Concept:** a collectible comic issue.
- **Inspiration:** Silver Age comics: halftone dots, speech bubbles, splash pages.
- **Final reveal:** a splash page announcing the next chapter.

### Minimal Luxury — `minimal-luxury` · Pass
- **Concept:** an invitation-grade tribute.
- **Inspiration:** letterpress invitations and fashion editorials.
- **Final reveal:** a single candle.

### Balloon Festival — `balloon-festival` · Pass
- **Concept:** a sky filling with balloons.
- **Inspiration:** hot-air balloon fiestas.
- **Final reveal:** the giant golden balloon.

### Garden of Wishes — `garden-of-wishes` · Pass
- **Concept:** a sunlit cottage garden.
- **Inspiration:** seed packets and pressed flowers.
- **Final reveal:** everything blooms. The glass cards are now solid paper.

### Game Night — `game-night` · Pass
- **Concept:** an arcade cabinet.
- **Inspiration:** 8-bit games, HUDs, boss levels.
- **Final reveal:** the level-up screen.

### Neon Party — `neon-party` · Restrained
- **Concept:** the birthday after-hours.
- **Inspiration:** neon signs on a painted-brick bar wall.
- **What changed:**
  - Background: brick wall instead of a purple void.
  - Panels: solid painted panels instead of glass.
  - Photo ring and cards: framed by a single bent neon tube, replacing the rotating conic gradients.
  - Main button: a chunky arcade push-button instead of a glowing radial orb.
  - Light beams: dimmed; violet replaced with amber.
- **Final reveal:** drop the beat.

### Cosmic Journey — `cosmic-journey` · Follow-up
- **Concept:** travel planet to planet through memories.
- **Note:** still uses Orbitron, purple space gradients and dense particles. Next step: ground it in a 1960s space-programme mission book (NASA flight plan typography, printed star charts).

### Starry Night — `starry-night` · Follow-up
- **Concept:** their name written in the stars.
- **Note:** the night sky is a legitimate reference, but the ambient density and gradient sky could be reduced. Candidate: a planisphere / star-wheel treatment.

### Festival of Memories — `festival` · Follow-up
- **Concept:** a whole festival for them, with a ticket and zones.
- **Note:** glass removed. Still uses a purple base and gradient panels; could move to a printed festival map and wristband.

### Fairytale — `fairytale` · Follow-up
- **Concept:** a living storybook.
- **Note:** glass removed. A good candidate for an illustrated-book treatment (deckled pages, engraved initials) in place of the remaining glow.

### A Year Around You — `four-seasons` · Pass
- **Concept:** one window, one tree, a whole year. The window frame never moves; the world outside it turns through four seasons and comes home to the season of their birthday.
- **Inspiration:** "the same tree, every season" photo series; Hiroshige's seasonal woodblock prints; a hand-kept almanac.
- **Emotional goal:** "Every season of the year was better with you in it."
- **Layout:**
  - Desktop: the window fills the screen and the tree stands to the right; almanac pages sit on the sill (left and centre) as the year scrolls past.
  - Mobile: one column of pages over a centred tree, in the same reading order.
- **Order:** a full year ending on the birthday season (from `birthdayDate`, with an optional southern-hemisphere setting). Each act gets the next message: intro, the letter, the wish (with the story chapters as almanac entries), the surprise. Memories are shared evenly across the four seasons (12 → 3 each).
- **Typography:** IM Fell English for headings, EB Garamond for text, small-caps season lines ("II · Spring").
- **Colour:** a palette per season (dawn pink, high blue, amber, steel grey) blended continuously; theme colours tint the candle, the name and the letter.
- **Photo treatment:** prints with a white border, slightly rotated. Spring photos sit inside blossoms (circle crop), summer photos stay dark until the fireflies light them, autumn photos lie under leaves, winter's message is behind frosted glass. All go through `PhotoSlot`, so framing is respected.
- **Interaction:** pull the curtains apart; tap buds to bloom; catch fireflies to fill a jar; brush leaves aside; wipe frost off the glass; blow out one candle on the sill. Each has a button alternative ("Let every bud bloom", "Light the jar", "Rake all the leaves", "Clear the window"), and fireflies hold still under the pointer or focus.
- **Animation:** every motion has a physical cause: the curtains part, petals and leaves fall and tumble, fireflies hover then dart, snow settles on the limbs, frost creeps in from the corners. Seasons never cut: the sky, light, ground and each leaf cluster blend over 2.6 seconds, and clusters turn one by one the way a real tree does.
- **Final reveal:** after the candle, petals, fireflies, leaves and snow burst up together, and the lights gather into their name at dusk, above the final photo and the closing line.
- **Performance and accessibility:** one weather canvas whose particle count scales with the device; the scene updates outside React. Under reduced motion there is no weather and every reveal starts open.

---

## Love & Romance templates

### Parallel Universes — `parallel-universes` · Redesigned
- **Concept:** four vintage science-fiction paperbacks: the same two characters in four editions.
- **Inspiration:** 1960s–70s paperback covers (Penguin SF grid, pulp, Ace-style double, modernist).
- **Emotional goal:** playful, then profound: "every version of the story ends the same way".
- **Layout:**
  - Opening: a shelf of four spines.
  - Opened: four covers on the shelf; a cover swings open to a two-page spread (plate and chapter).
  - Ending: the four books stack, then the shared last page.
  - Mobile: the spread collapses to one page with the plate inline.
- **Typography:** Crimson Pro body, Jost (Futura-like) for imprints, Anton for pulp titles.
- **Colour:** paper `#e8dfcc`, with period cover inks: orange, teal, brick, black/gold.
- **Photo treatment:** photos printed as two-ink cover art (black over a flat colour); a plain monochrome plate inside.
- **Interaction:** pull a book off the shelf, open each edition, turn to the last page.
- **Animation:** spines lift on hover, the cover rotates on its spine hinge, the books slide together into a stack.
- **Final reveal:** "Out of every possible universe, I'd still choose you", plus the surprise message: "The end · to be continued".
- **Why the change:** it was a blurred rainbow blob ("rift") with glowing gradient orbs, colour-shifting space and fireworks.

### Our Little Universe — `our-little-universe` · Redesigned
- **Concept:** a hand-made brass orrery under a desk lamp.
- **Inspiration:** 18th-century orreries and instrument makers' brass plaques.
- **Emotional goal:** "I built this for us", with a crafted, patient feeling.
- **Layout:**
  - The orrery fills the stage; six painted planets ride brass arms around a brass sun engraved with both names.
  - Touching a planet opens the maker's reference card.
  - A plaque closes the experience.
  - Mobile: tilted more steeply, so the orbits fit a narrow screen.
- **Typography:** IM Fell English and IM Fell English SC (engraving).
- **Colour:** walnut-black desk, brass `#c9a467`, enamel planets (oxblood, verdigris, ivory, slate, ochre, navy).
- **Photo treatment:** plain prints on the cream reference card.
- **Interaction:** turn the orrery by hand (drag spins it, vertical drag tilts it), touch a planet, read the plaque.
- **Animation:** clockwork orbits with perspective depth; arms track their planets; momentum decays like a real mechanism.
- **Final reveal:** an engraved plaque, "Our Little Universe — made for X by Y", with the surprise message.
- **Why the change:** it was a glowing pink/purple orb in a starfield, glass panels, and star-confetti rain.

### Two Souls — `two-souls` · Restrained
- **Concept:** two lanterns on dark water drifting until they meet.
- **Inspiration:** lantern festivals (Yi Peng, tōrō nagashi).
- **What changed:**
  - Colour: amber and ivory on blue-black, instead of the pink/purple radial glows and blurred halos.
  - The lights: the two dots are now paper lanterns lit from inside.
  - Motion: the blur-in transitions are now gentle rises.
  - Type: Cormorant Garamond and Karla replace Syne and Inter.
- **Final reveal:** the light settles into a heart, then their name.

### Our Story — `our-story` · Pass
- **Concept:** a film in six chapters.
- **Inspiration:** title cards and slow mask reveals.
- **Final reveal:** a cinematic finale.

### The Memory Gallery — `memory-gallery` · Pass
- **Concept:** a private photography exhibition.
- **Inspiration:** museum placards and gallery hangs.
- **Final reveal:** a collage.

### Our Polaroid Wall — `polaroid-wall` · Pass
- **Concept:** a wall of photos under string lights.
- **Interaction:** flip photos to find hidden messages.
- **Final reveal:** step back to see the heart they make.

### Forever Timeline — `forever-timeline` · Pass
- **Concept:** a minimal, luxurious milestone line.
- **Inspiration:** editorial timelines.
- **Final reveal:** the line continues past the edge.

### Vinyl Love — `vinyl-love` · Pass
- **Concept:** a record player.
- **Inspiration:** side-A track listings, needle drops.
- **Final reveal:** the needle lifts.

### Candlelight Dinner — `candlelight-dinner` · Pass
- **Concept:** a private dinner for two.
- **Inspiration:** a restaurant table, menu cards, candles.
- **Final reveal:** a gift box. Glass removed from the dialogs.

### The Gift Box — `gift-box` · Pass
- **Concept:** gifts nested inside gifts.
- **Inspiration:** wrapping paper, drawers, hinges.
- **Final reveal:** the biggest gift last.

### Cinema Date — `cinema-date` · Pass
- **Concept:** a private screening.
- **Inspiration:** velvet curtains, projector burns, scene-selection menus.
- **Mobile:** the screen becomes a vertical 4:5 frame (it was a letterboxed 16:9 strip).
- **Final reveal:** credits starring both of you.

### Forever Letterbox — `forever-letterbox` · Pass
- **Concept:** a widescreen love story.
- **Inspiration:** 2.39:1 cinema, dip-to-black cuts.
- **Mobile:** the pinned frame becomes a 3:4 vertical composition, so scenes fill the phone instead of a thin strip.
- **Final reveal:** "To be continued…".

### Handwritten Journal — `handwritten-journal` · Pass
- **Concept:** a private lined notebook.
- **Inspiration:** taped photos, doodles, folded corners.
- **Final reveal:** a page still being written.

### Rose Garden — `rose-garden` · Pass
- **Concept:** a candlelit rose garden.
- **Final reveal:** the whole garden blooms. Glass removed from the dialog.

### The Secret Garden — `secret-garden` · Pass
- **Concept:** a foggy walled garden with four gates.
- **Final reveal:** a glowing clearing.

### Midnight Date — `midnight-date` · Pass
- **Concept:** a moonlit city to explore.
- **Final reveal:** lit windows spell I LOVE YOU. Glass removed from the labels and dialogs.

### Constellation of Us — `constellation-of-us` · Pass
- **Concept:** your relationship as a star chart.
- **Inspiration:** classical star atlases (Cinzel, EB Garamond).
- **Final reveal:** the stars rearrange into both names.

### Message in the Stars — `message-in-the-stars` · Follow-up
- **Concept:** each sentence is sent up to become a star.
- **Note:** the CSS aurora is still a soft gradient wash. Candidate: replace it with a darker sky and handwritten paper slips that rise and ignite.

### Digital Heartbeat — `digital-heartbeat` · Follow-up
- **Concept:** an ECG line that reacts to cursor, clicks and music.
- **Note:** the reference (a cardiac monitor) is sound, but the neon glow could become a true green-phosphor monitor treatment, like Terminal 1983.

---

## Photo framing in templates

Every photo rendered through `<PhotoSlot>` automatically applies the creator's framing:

- `fit`: cover or contain
- focal point `position`
- `zoom`
- `rotation`

The framing is looked up by photo URL from `FramingContext`, which `ExperienceShell` provides. The focal-point model means one setting works in every frame shape a template uses: square, 4:5 print, 2.39:1 letterbox, circle.

Templates that apply their own photo look do so with CSS filters on top of the framed image, so framing is never lost:

- Birthday Edition: halftone
- Terminal 1983: phosphor
- Parallel Universes: two-ink cover art

The lightbox opts out (`framing={false}`) so the full photo is always viewable.
