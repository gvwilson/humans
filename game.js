"use strict";

// ---------------------------------------------------------------------------
// Rendering, input, and page wiring. Board logic lives in board.js.
//
// Actors are drawn from an occupancy map so any number of actors (of mixed
// types) can share a square and stay visible (design.txt §10.2).
// ---------------------------------------------------------------------------

const CELL = 32;        // pixels per square
const MAX_SLOTS = 4;    // how many actors get individual slots before a badge

// Visual style per actor type (design.txt §10.2).
const ACTOR_STYLE = {
  bunny: { color: "#ffffff", shape: "square" },
  tiger: { color: "#ff8c00", shape: "square" },
  human: { color: "#3b82f6", shape: "circle" },
  zombie: { color: "#8b1a1a", shape: "square" },
};

// Paint order: earlier is drawn first (bottom layer); the most consequential
// type ends up on top where the player can see it.
const Z_ORDER = { bunny: 0, tiger: 1, human: 2, zombie: 3 };

// Offsets (px) from the cell centre for 1..4 occupants.
const SLOTS = [
  [[0, 0]],
  [[-CELL / 4, 0], [CELL / 4, 0]],
  [[0, -CELL / 4], [-CELL / 4, CELL / 4], [CELL / 4, CELL / 4]],
  [[-CELL / 4, -CELL / 4], [CELL / 4, -CELL / 4],
   [-CELL / 4, CELL / 4], [CELL / 4, CELL / 4]],
];

// Shrink factor so shapes stay separable as a cell fills up.
const SCALE = [1, 0.8, 0.6, 0.5];

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");

canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;

// Current board and actors.
let grid = null;
let exitRow = 0;
let exitCol = 0;

// Actor records: { id, type, row, col } (design.txt §5). `actors` is the
// source of truth for drawing; `tiger`/`bunny` are named handles for input.
let actors = [];
let tiger = null;
let bunny = null;

const cellX = (col) => col * CELL;
const cellY = (row) => row * CELL;

function drawTerrain() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const terrain = grid[r][c];
      if (terrain === PATH) {
        ctx.fillStyle = "#e8d5a8";
      } else if (terrain === OBSTACLE) {
        ctx.fillStyle = "#2f4f3f";
      } else {
        ctx.fillStyle = "#3dc94a";
      }
      ctx.fillRect(cellX(c), cellY(r), CELL, CELL);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.strokeRect(cellX(c), cellY(r), CELL, CELL);
    }
  }

  // Exit marker.
  ctx.fillStyle = "#0b7a1e";
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("E", cellX(exitCol) + CELL / 2, cellY(exitRow) + CELL / 2);
}

// Draw one actor centred at (x, y) with the given diameter.
function drawActorShape(actor, x, y, size) {
  const style = ACTOR_STYLE[actor.type] ?? { color: "#eee", shape: "square" };
  ctx.fillStyle = style.color;
  if (style.shape === "circle") {
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
}

// Cell-level state highlight (x, y are the cell centre).
function drawRing(x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - CELL / 2 + 1, y - CELL / 2 + 1, CELL - 2, CELL - 2);
}

// Corner badge showing how many actors share the cell (x, y = badge centre).
function drawBadge(x, y, count) {
  const r = 8;
  ctx.fillStyle = "#111";
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(count), x, y + 0.5);
}

// Map "row,col" -> array of actors sharing that square.
function buildOccupancy() {
  const map = new Map();
  for (const actor of actors) {
    const key = actor.row + "," + actor.col;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(actor);
  }
  return map;
}

function drawCellActors(row, col, cellActors) {
  const has = (type) => cellActors.some((a) => a.type === type);
  const cx = cellX(col) + CELL / 2;
  const cy = cellY(row) + CELL / 2;

  // A shared square encodes game state: a human with a zombie or tiger is in
  // danger; a human with the bunny is calmly petting (§7.3, §7.4, §8.1).
  if (has("human") && (has("zombie") || has("tiger"))) {
    drawRing(cx, cy, "#e23c3c");
  } else if (has("human") && has("bunny")) {
    drawRing(cx, cy, "#7bd88f");
  }

  const ordered = [...cellActors].sort((a, b) =>
    (Z_ORDER[a.type] ?? 0) - (Z_ORDER[b.type] ?? 0) || a.id - b.id
  );

  const shown = ordered.slice(0, MAX_SLOTS);
  const slots = SLOTS[shown.length - 1];
  const size = (CELL / 2) * SCALE[shown.length - 1];

  shown.forEach((actor, i) => {
    const [dx, dy] = slots[i];
    drawActorShape(actor, cx + dx, cy + dy, size);
  });

  if (ordered.length > MAX_SLOTS) {
    drawBadge(cellX(col) + CELL - 9, cellY(row) + CELL - 9, ordered.length);
  }
}

function drawActors() {
  for (const [key, cellActors] of buildOccupancy()) {
    const [row, col] = key.split(",").map(Number);
    drawCellActors(row, col, cellActors);
  }
}

function draw() {
  drawTerrain();
  drawActors();
}

// Attempt one orthogonal step for an actor. Blocked by the board edge and by
// Obstacle squares; the Exit counts as walkable (design.txt §6).
function moveActor(actor, dr, dc) {
  if (canStep(grid, actor.row, actor.col, dr, dc)) {
    actor.row += dr;
    actor.col += dc;
  }
}

function newBoard() {
  ({ grid, exitRow, exitCol } = generateBoard(COLS, ROWS, PATH_RATIO));

  const tigerPos = randomPathSquare(grid);
  const bunnyPos = randomPathSquare(grid);
  tiger = { id: 1, type: "tiger", row: tigerPos.row, col: tigerPos.col };
  bunny = { id: 2, type: "bunny", row: bunnyPos.row, col: bunnyPos.col };
  actors = [tiger, bunny];

  const check = verifyConnectivity(grid, exitRow, exitCol);
  draw();

  if (check.connected) {
    statusEl.textContent =
      `Connected \u2713 \u2014 all ${check.pathCells} walkable cells reach the exit`;
    statusEl.className = "ok";
  } else {
    statusEl.textContent =
      `Disconnected \u2717 \u2014 only ${check.reached}/${check.pathCells} walkable cells reach the exit`;
    statusEl.className = "bad";
  }
}

// WASD = Tiger, IJKL = Bunny (design.txt §6.2). One square per key press.
const KEY_STEPS = {
  w: { actor: () => tiger, dr: -1, dc: 0 },
  s: { actor: () => tiger, dr: 1, dc: 0 },
  a: { actor: () => tiger, dr: 0, dc: -1 },
  d: { actor: () => tiger, dr: 0, dc: 1 },
  i: { actor: () => bunny, dr: -1, dc: 0 },
  k: { actor: () => bunny, dr: 1, dc: 0 },
  j: { actor: () => bunny, dr: 0, dc: -1 },
  l: { actor: () => bunny, dr: 0, dc: 1 },
};

document.addEventListener("keydown", (event) => {
  if (event.repeat) return; // one move per key press, not per auto-repeat
  const step = KEY_STEPS[event.key.toLowerCase()];
  if (!step) return;
  event.preventDefault();
  moveActor(step.actor(), step.dr, step.dc);
  draw();
});

document.getElementById("regen").addEventListener("click", newBoard);
newBoard();
