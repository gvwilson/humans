"use strict";

// ---------------------------------------------------------------------------
// Rendering and page wiring. Board logic lives in board.js.
// ---------------------------------------------------------------------------

const CELL = 32; // pixels per square

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");

canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;

function draw(grid, exitRow, exitCol) {
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
      ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
    }
  }

  // Exit marker.
  ctx.fillStyle = "#0b7a1e";
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("E", exitCol * CELL + CELL / 2, exitRow * CELL + CELL / 2);
}

function newBoard() {
  const { grid, exitRow, exitCol } = generateBoard(COLS, ROWS, PATH_RATIO);
  const check = verifyConnectivity(grid, exitRow, exitCol);
  draw(grid, exitRow, exitCol);

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

document.getElementById("regen").addEventListener("click", newBoard);
newBoard();
