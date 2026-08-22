"use strict";

// ---------------------------------------------------------------------------
// Bunny: the player-controlled animal that attracts and calms Humans
// (design.txt §5.3, §7.4).
//
// Pure data and construction only — no DOM access — so it can run both in the
// browser and under Node. Rendering and input wiring live in game.js.
// ---------------------------------------------------------------------------

// Visual style (design.txt §10.2) and paint-order layer.
const BUNNY_STYLE = { color: "#ffffff", shape: "square" };
const BUNNY_Z = 0;

// Create a Bunny actor at (row, col). `id` must be unique across all actors.
function makeBunny(row, col, id) {
  return { id, type: "bunny", row, col };
}

// Expose the API to Node's `require()` when running under CommonJS; in the
// browser, the top-level declarations above are already global to later
// scripts.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { BUNNY_STYLE, BUNNY_Z, makeBunny };
}
