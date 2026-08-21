"use strict";

const assert = require("assert");
const {
  COLS,
  ROWS,
  PATH_RATIO,
  generateBoard,
  verifyConnectivity,
  hasFullBlock,
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
