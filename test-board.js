"use strict";

const assert = require("assert");
const {
  COLS,
  ROWS,
  PATH_RATIO,
  PATH,
  OBSTACLE,
  EXIT,
  generateBoard,
  verifyConnectivity,
  hasFullBlock,
  randomPathSquare,
  canStep,
} = require("./board.js");

function onBorder(row, col) {
  return row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1;
}

const ITERATIONS = 5000;
const target = Math.max(1, Math.floor(COLS * ROWS * PATH_RATIO));

let minWalkable = Infinity;
let maxWalkable = 0;
let sumWalkable = 0;

for (let i = 0; i < ITERATIONS; i++) {
  const { grid, exitRow, exitCol } = generateBoard(COLS, ROWS, PATH_RATIO);

  assert(onBorder(exitRow, exitCol), `board ${i}: exit is not on the border`);

  const check = verifyConnectivity(grid, exitRow, exitCol);
  assert(check.connected, `board ${i}: disconnected (${check.reached}/${check.pathCells})`);
  assert(check.pathCells <= target, `board ${i}: walkable count ${check.pathCells} exceeds target ${target}`);

  assert(!hasFullBlock(grid), `board ${i}: contains a 2x2 filled block`);

  minWalkable = Math.min(minWalkable, check.pathCells);
  maxWalkable = Math.max(maxWalkable, check.pathCells);
  sumWalkable += check.pathCells;
}

const avg = (sumWalkable / ITERATIONS).toFixed(1);
console.log(`OK: ${ITERATIONS} boards generated \u2014 connected, no 2x2 filled block, border exit.`);
console.log(`walkable cells: min ${minWalkable}, max ${maxWalkable}, avg ${avg} (target ${target})`);

// ---------------------------------------------------------------------------
// Actor spawning and movement helpers.
// ---------------------------------------------------------------------------

for (let i = 0; i < 1000; i++) {
  const { grid } = generateBoard(COLS, ROWS, PATH_RATIO);
  const pos = randomPathSquare(grid);
  assert(grid[pos.row][pos.col] === PATH, `spawn ${i}: not on a Path square`);
}

{
  const grid = [
    [OBSTACLE, PATH, OBSTACLE],
    [PATH, EXIT, PATH],
    [OBSTACLE, PATH, OBSTACLE],
  ];
  // From the Exit at (1,1): all four neighbors are walkable.
  assert(canStep(grid, 1, 1, -1, 0) === true, "step up to Path");
  assert(canStep(grid, 1, 1, 1, 0) === true, "step down to Path");
  assert(canStep(grid, 1, 1, 0, -1) === true, "step left to Path");
  assert(canStep(grid, 1, 1, 0, 1) === true, "step right to Path");
  // From the Path at (0,1): up is off-board, left/right are obstacles.
  assert(canStep(grid, 0, 1, -1, 0) === false, "step off board is blocked");
  assert(canStep(grid, 0, 1, 0, -1) === false, "step into obstacle is blocked");
  assert(canStep(grid, 0, 1, 0, 1) === false, "step into obstacle is blocked");
  assert(canStep(grid, 0, 1, 1, 0) === true, "step down to Exit is walkable");
}

console.log("OK: spawn placement and movement helpers verified.");
