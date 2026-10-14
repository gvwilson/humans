# Implementation Plan — Save the Humans!

Zombies have attacked the zoo; the visitors are panicking, and it is up to
the zoo animals to save them. A lightweight browser-based single-player
game: save as many humans as possible before they are turned into zombies.

## Engine

**KAPLAY** (formerly Kaboom.js). Loaded via a **pinned CDN** for now — no
vendored copy in the repo (avoids committing a large opaque minified blob).
Bundling/packaging via npm + a bundler is deferred to a later step, per the
README.

KAPLAY covers everything needed now (game loop, input, grid rendering) and
the deferred needs later (sprites via `loadSprite()`, audio via
`loadSound()`/`loadMusic()`).

## Design assumptions

- **Grid-based discrete movement.** An actor occupies one cell and steps
  orthogonally into an adjacent path cell; it cannot enter an obstacle
  cell. Speed = move interval per actor kind (all actors of a kind move at
  the same speed).
- **Centralized tuning.** All tunable values (speeds, infection time,
  flee/chase/pet ranges) live in one config object, so playtesting tweaks
  are one-line edits.
- **Single HTML page** (`index.html`) loads all JavaScript files directly;
  no bundler for now.
- **Rendering.** Circled characters for now (`H` human, `Z` zombie, etc.);
  sound and graphics later.

## Roadmap

Each item is a discrete worklist item, implemented and verified in a single
session, in dependency order.

1. **`scaffold-engine`** — single `index.html` + KAPLAY + empty game loop +
   blank canvas.
   *Done when:* the page opens showing an empty grid with no console errors.

2. **`map-grid-generator`** — grid/cell classes (`path`, `obstacle`,
   `exit`), random generation guaranteeing all paths are connected to one
   border Exit cell, and map rendering.
   *Done when:* every generated map is valid and fully connected (verified
   by a connectivity check).

3. **`actor-classes`** — `Actor` base + `Zombie`/`Human`/`Tiger`/`Bunny`,
   random placement on path cells, circled-letter rendering.
   *Done when:* actors appear at random valid positions on the map.

4. **`player-control`** — WASD (tiger) / IJKL (bunny) input + movement
   blocked by obstacles, each kind at its own speed.
   *Done when:* both animals move independently and can't enter obstacles.

5. **`zombie-ai`** — zombies move toward the nearest human each tick.
   *Done when:* zombies pursue the nearest human on the grid.

6. **`infection`** — contact infects a human; after a timed interval the
   human converts to a zombie.
   *Done when:* an infected human becomes a zombie after the configured
   delay.

7. **`human-ai`** — humans seek the Exit by default; tiger proximity →
   flee (too close → panic, may blunder into a zombie); bunny proximity →
   chase (catching it → pause to pet, letting zombies gain ground).
   *Done when:* seek/flee/panic and chase/pet are observable and driven by
   config ranges.

8. **`endgame-tuning`** — game ends when every human has exited or been
   infected; win/lose display, score (humans saved), restart; pull every
   magic number into the config object.
   *Done when:* a full game runs start-to-finish with a visible outcome and
   restart.
