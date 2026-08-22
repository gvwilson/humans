"use strict";

// ---------------------------------------------------------------------------
// Human: flees Zombies and Tigers, and follows and pets a nearby Bunny
// (design.txt §5.1, §7.2, §7.4).
//
// Pure data and construction only — no DOM access — so it can run both in the
// browser and under Node. Humans are not yet spawned onto the game board.
// ---------------------------------------------------------------------------

// Visual style (design.txt §10.2) and paint-order layer.
const HUMAN_STYLE = { color: "#3b82f6", shape: "circle" };
const HUMAN_Z = 2;

// Create a Human actor at (row, col). `id` must be unique across all actors.
function makeHuman(row, col, id) {
  return { id, type: "human", row, col };
}

// Expose the API to Node's `require()` when running under CommonJS; in the
// browser, the top-level declarations above are already global to later
// scripts.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { HUMAN_STYLE, HUMAN_Z, makeHuman };
}
