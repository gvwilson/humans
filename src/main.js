import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";
import {
  generateMap,
  CellType,
  GRID_ROWS,
  GRID_COLS,
  CELL_SIZE,
} from "./map.js";
import { spawnActors } from "./actors.js";

kaplay({
  background: "#1a1a1a",
  width: GRID_COLS * CELL_SIZE,
  height: GRID_ROWS * CELL_SIZE,
});

const { grid } = generateMap();

const CELL_COLORS = {
  [CellType.PATH]: "#4a4a4a",
  [CellType.OBSTACLE]: "#000000",
  [CellType.EXIT]: "#00e676",
};

for (let r = 0; r < GRID_ROWS; r++) {
  for (let c = 0; c < GRID_COLS; c++) {
    add([
      rect(CELL_SIZE - 2, CELL_SIZE - 2),
      pos(c * CELL_SIZE + 1, r * CELL_SIZE + 1),
      color(CELL_COLORS[grid[r][c]]),
    ]);
  }
}

const ACTOR_RADIUS = CELL_SIZE / 2 - 3; // inset so circles sit inside their cells
const ACTOR_TEXT_SIZE = CELL_SIZE / 2;

function renderActor(actor) {
  const px = actor.c * CELL_SIZE + CELL_SIZE / 2;
  const py = actor.r * CELL_SIZE + CELL_SIZE / 2;
  add([
    circle(ACTOR_RADIUS),
    color(actor.color),
    outline(2, "#000000"),
    pos(px, py),
    anchor("center"),
  ]);
  add([
    text(actor.letter, { size: ACTOR_TEXT_SIZE }),
    color(actor.textColor),
    pos(px, py),
    anchor("center"),
  ]);
}

for (const actor of spawnActors(grid)) {
  renderActor(actor);
}
