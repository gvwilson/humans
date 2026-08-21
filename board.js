"use strict";

// ---------------------------------------------------------------------------
// Board: grid dimensions, terrain, and level generation.
//
// Pure logic only — no DOM access — so it can run both in the browser and
// under Node (for `npm test`). See design.txt §4 and §13.2.
// ---------------------------------------------------------------------------

// Grid dimensions (configurable). See design.txt §4.1 / §14.
const COLS = 20;          // width (columns)
const ROWS = 15;          // height (rows)
const PATH_RATIO = 0.6;   // fraction of the grid that should be walkable

// Terrain values. See design.txt §4.2 / §13.2.
const PATH = 0;
const OBSTACLE = 1;
const EXIT = 2;

function randomInt(lo, hi) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function isWalkable(terrain) {
  return terrain === PATH || terrain === EXIT;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// True if placing a walkable cell at (r, c) would complete any 2x2 block.
// Used to keep the walkable region corridor-like (never a filled 2x2 square).
function createsFullBlock(grid, r, c) {
  const rows = grid.length;
  const cols = grid[0].length;
  for (const [tr, tc] of [[r - 1, c - 1], [r - 1, c], [r, c - 1], [r, c]]) {
    if (tr < 0 || tr + 1 >= rows || tc < 0 || tc + 1 >= cols) continue;
    const others = [[tr, tc], [tr, tc + 1], [tr + 1, tc], [tr + 1, tc + 1]]
      .filter(([cr, cc]) => !(cr === r && cc === c));
    if (others.every(([cr, cc]) => isWalkable(grid[cr][cc]))) return true;
  }
  return false;
}

// True if any 2x2 block in the grid is entirely walkable.
function hasFullBlock(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let r = 0; r + 1 < rows; r++) {
    for (let c = 0; c + 1 < cols; c++) {
      if (isWalkable(grid[r][c]) &&
          isWalkable(grid[r][c + 1]) &&
          isWalkable(grid[r + 1][c]) &&
          isWalkable(grid[r + 1][c + 1])) {
        return true;
      }
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// generateBoard
//
// Returns `{ grid, exitRow, exitCol }`.
//
// Guarantees design.txt §4.3: every Path square is part of a single
// orthogonally-connected region, and the Exit (which sits on the border) is
// reachable from every Path square.
//
// Approach: grow the walkable region outward from the Exit. Start with a
// border Exit square, then repeatedly turn a random Obstacle that is
// orthogonally adjacent to the growing region into a Path. Because every Path
// is "grown" from the Exit, connectivity is guaranteed by construction.
// ---------------------------------------------------------------------------
function generateBoard(cols, rows, pathRatio) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(OBSTACLE));

  // Place the Exit on a random border cell.
  const side = randomInt(0, 3);
  let exitRow, exitCol;
  if (side === 0) {
    exitRow = 0;
    exitCol = randomInt(0, cols - 1);
  } else if (side === 1) {
    exitRow = rows - 1;
    exitCol = randomInt(0, cols - 1);
  } else if (side === 2) {
    exitRow = randomInt(0, rows - 1);
    exitCol = 0;
  } else {
    exitRow = randomInt(0, rows - 1);
    exitCol = cols - 1;
  }
  grid[exitRow][exitCol] = EXIT;

  const target = Math.max(1, Math.floor(cols * rows * pathRatio));
  let pathCount = 1; // the Exit counts as the first walkable square

  // Frontier of Obstacle squares that touch the walkable region.
  const frontier = new Set();
  const key = (r, c) => r + "," + c;

  function addFrontier(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (grid[r][c] === OBSTACLE) frontier.add(key(r, c));
  }

  addFrontier(exitRow - 1, exitCol);
  addFrontier(exitRow + 1, exitCol);
  addFrontier(exitRow, exitCol - 1);
  addFrontier(exitRow, exitCol + 1);

  while (pathCount < target && frontier.size > 0) {
    const candidates = shuffle(Array.from(frontier));
    let chosen = null;
    for (const cand of candidates) {
      const [r, c] = cand.split(",").map(Number);
      if (createsFullBlock(grid, r, c)) {
        // Cells only ever turn into Path, so a candidate that would complete
        // a 2x2 block now can never become valid; drop it for good.
        frontier.delete(cand);
      } else {
        chosen = cand;
        break;
      }
    }
    if (chosen === null) break; // no candidate avoids a 2x2 block
    frontier.delete(chosen);
    const [r, c] = chosen.split(",").map(Number);
    grid[r][c] = PATH;
    pathCount++;
    addFrontier(r - 1, c);
    addFrontier(r + 1, c);
    addFrontier(r, c - 1);
    addFrontier(r, c + 1);
  }

  return { grid, exitRow, exitCol };
}

// ---------------------------------------------------------------------------
// verifyConnectivity
//
// Independent check (not used by generation): breadth-first search from the
// Exit must reach every walkable square. Returns
// `{ pathCells, reached, connected }`.
// ---------------------------------------------------------------------------
function verifyConnectivity(grid, exitRow, exitCol) {
  const rows = grid.length;
  const cols = grid[0].length;

  let pathCells = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isWalkable(grid[r][c])) pathCells++;
    }
  }

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [[exitRow, exitCol]];
  visited[exitRow][exitCol] = true;
  let reached = 0;

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    reached++;
    for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited[nr][nc] || !isWalkable(grid[nr][nc])) continue;
      visited[nr][nc] = true;
      queue.push([nr, nc]);
    }
  }

  return { pathCells, reached, connected: reached === pathCells };
}

// ---------------------------------------------------------------------------
// randomPathSquare
//
// Returns a random Path square as `{ row, col }` for spawning actors
// (design.txt §5). Only plain Path squares are considered (not the Exit),
// though movement may enter either.
// ---------------------------------------------------------------------------
function randomPathSquare(grid) {
  const path = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === PATH) path.push({ row: r, col: c });
    }
  }
  return path[randomInt(0, path.length - 1)];
}

// ---------------------------------------------------------------------------
// canStep
//
// True if stepping from (row, col) by the orthogonal offset (dr, dc) lands on
// an in-bounds, walkable square (Path or Exit). Obstacles and the board edge
// block movement (design.txt §6).
// ---------------------------------------------------------------------------
function canStep(grid, row, col, dr, dc) {
  const rows = grid.length;
  const cols = grid[0].length;
  const nr = row + dr;
  const nc = col + dc;
  if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return false;
  return isWalkable(grid[nr][nc]);
}

// Expose the API to Node's `require()` when running under CommonJS; in the
// browser, the top-level declarations above are already global to later
// scripts.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    COLS,
    ROWS,
    PATH_RATIO,
    PATH,
    OBSTACLE,
    EXIT,
    randomInt,
    isWalkable,
    generateBoard,
    verifyConnectivity,
    hasFullBlock,
    randomPathSquare,
    canStep,
  };
}
