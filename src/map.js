export const CellType = Object.freeze({
  PATH: 'path',
  OBSTACLE: 'obstacle',
  EXIT: 'exit',
});

export const GRID_ROWS = 15;
export const GRID_COLS = 21;
export const CELL_SIZE = 32;

const cellKey = (r, c, cols) => r * cols + c;

export function generateMap(rows = GRID_ROWS, cols = GRID_COLS) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push(new Array(cols).fill(CellType.OBSTACLE));
  }

  const visited = new Set([cellKey(1, 1, cols)]);
  grid[1][1] = CellType.PATH;
  const stack = [[1, 1]];
  const dirs = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ];

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];
    const candidates = [];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 1 &&
        nr < rows - 1 &&
        nc >= 1 &&
        nc < cols - 1 &&
        !visited.has(cellKey(nr, nc, cols))
      ) {
        candidates.push([nr, nc]);
      }
    }
    if (candidates.length > 0) {
      const [nr, nc] = candidates[Math.floor(Math.random() * candidates.length)];
      grid[(r + nr) / 2][(c + nc) / 2] = CellType.PATH;
      grid[nr][nc] = CellType.PATH;
      visited.add(cellKey(nr, nc, cols));
      stack.push([nr, nc]);
    } else {
      stack.pop();
    }
  }

  const border = [];
  for (let c = 1; c < cols - 1; c += 2) {
    border.push([0, c]);
    border.push([rows - 1, c]);
  }
  for (let r = 1; r < rows - 1; r += 2) {
    border.push([r, 0]);
    border.push([r, cols - 1]);
  }
  const [er, ec] = border[Math.floor(Math.random() * border.length)];
  grid[er][ec] = CellType.EXIT;

  return { grid, exit: { r: er, c: ec } };
}

export function nextStepToward(grid, startR, startC, isTarget) {
  const rows = grid.length;
  const cols = grid[0].length;
  const key = (r, c) => r * cols + c;
  const firstStep = new Map([[key(startR, startC), null]]);
  const queue = [[startR, startC]];
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === CellType.OBSTACLE) continue;
      const k = key(nr, nc);
      if (firstStep.has(k)) continue;
      const step = firstStep.get(key(r, c)) ?? [dr, dc];
      if (isTarget(nr, nc)) return step;
      firstStep.set(k, step);
      queue.push([nr, nc]);
    }
  }

  return null;
}
