import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";
import {
  generateMap,
  CellType,
  GRID_ROWS,
  GRID_COLS,
  CELL_SIZE,
} from "./map.js";

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
