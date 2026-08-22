"use strict";

// ---------------------------------------------------------------------------
// Tiger: the player-controlled animal that Humans flee from, like a Zombie
// (design.txt §5.3, §7.3).
//
// Pure data and construction only — no DOM access — so it can run both in the
// browser and under Node. Rendering and input wiring live in game.js.
// ---------------------------------------------------------------------------

// Visual style (design.txt §10.2) and paint-order layer.
const TIGER_STYLE = { color: "#ff8c00", shape: "square" };
const TIGER_Z = 1;

// Create a Tiger actor at (row, col). `id` must be unique across all actors.
function makeTiger(row, col, id) {
  return { id, type: "tiger", row, col };
}

// Expose the API to Node's `require()` when running under CommonJS; in the
// browser, the top-level declarations above are already global to later
// scripts.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TIGER_STYLE, TIGER_Z, makeTiger };
}
