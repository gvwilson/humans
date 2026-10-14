export const CellType = Object.freeze({
  PATH: "path",
  OBSTACLE: "obstacle",
  EXIT: "exit",
});

export const GRID_ROWS = 15;
export const GRID_COLS = 20;
export const CELL_SIZE = 32;

// fraction of grid cells carved as path; the rest stay obstacles
const FILL_RATIO = 0.65;

function neighbors(r, c, rows, cols) {
  const out = [];
  if (r > 0) out.push([r - 1, c]);
  if (r < rows - 1) out.push([r + 1, c]);
  if (c > 0) out.push([r, c - 1]);
  if (c < cols - 1) out.push([r, c + 1]);
  return out;
}

export function generateMap(rows = GRID_ROWS, cols = GRID_COLS, fillRatio = FILL_RATIO) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push(new Array(cols).fill(CellType.OBSTACLE));
  }

  const border = [];
  for (let c = 0; c < cols; c++) {
    border.push([0, c]);
    border.push([rows - 1, c]);
  }
  for (let r = 1; r < rows - 1; r++) {
    border.push([r, 0]);
    border.push([r, cols - 1]);
  }
  const [er, ec] = border[Math.floor(Math.random() * border.length)];
  grid[er][ec] = CellType.EXIT;

  const target = Math.floor(rows * cols * fillRatio);
  let pathCells = 1;
  const frontier = [[er, ec]];

  while (pathCells < target && frontier.length > 0) {
    const i = Math.floor(Math.random() * frontier.length);
    const [r, c] = frontier[i];
    const open = [];
    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      if (grid[nr][nc] === CellType.OBSTACLE) open.push([nr, nc]);
    }
    if (open.length === 0) {
      frontier.splice(i, 1);
      continue;
    }
    const [nr, nc] = open[Math.floor(Math.random() * open.length)];
    grid[nr][nc] = CellType.PATH;
    pathCells++;
    frontier.push([nr, nc]);
  }

  return { grid, exit: { r: er, c: ec } };
}
