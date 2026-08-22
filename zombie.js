"use strict";

// ---------------------------------------------------------------------------
// Zombie: chases the nearest Human and attacks it (design.txt §5.2, §7.1, §8).
//
// Pure data and construction only — no DOM access — so it can run both in the
// browser and under Node. Zombies are not yet spawned onto the game board.
// ---------------------------------------------------------------------------

// Visual style (design.txt §10.2) and paint-order layer.
const ZOMBIE_STYLE = { color: "#8b1a1a", shape: "square" };
const ZOMBIE_Z = 3;

// Create a Zombie actor at (row, col). `id` must be unique across all actors.
function makeZombie(row, col, id) {
  return { id, type: "zombie", row, col };
}

// Expose the API to Node's `require()` when running under CommonJS; in the
// browser, the top-level declarations above are already global to later
// scripts.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ZOMBIE_STYLE, ZOMBIE_Z, makeZombie };
}
