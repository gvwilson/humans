# Before

`src/main.js` only imports KAPLAY and calls `kaplay()`, showing a blank canvas. There is no map model, no generator, and no grid rendering.

# After

Add the map model and generator, and render the generated grid.

`src/map.js` (new):

- `CellType` — frozen set of cell kinds: `PATH`, `OBSTACLE`, `EXIT`.
- `GRID_ROWS = 15`, `GRID_COLS = 20`, `CELL_SIZE = 32`.
- `generateMap(rows, cols, fillRatio = 0.65)` — starts from an all-obstacle grid, marks a random border cell as the Exit, then grows a connected path region by repeatedly carving a random obstacle adjacent to an existing path cell until `fillRatio` of cells are path. Connectivity is guaranteed by construction: every carved cell is adjacent to an already-path cell. Returns `{ grid, exit }`.

`src/main.js` (modified):

- Import `generateMap`, the constants, and `CellType`.
- Set the canvas to `GRID_COLS * CELL_SIZE` by `GRID_ROWS * CELL_SIZE`.
- Generate a map, then render each cell as a rectangle (`rect(CELL_SIZE - 2, CELL_SIZE - 2)` at `pos(c * CELL_SIZE + 1, r * CELL_SIZE + 1)`), colored by type — path = gray, obstacle = black, exit = green (placeholder colors; icons come later).

Done when: reloading the page shows a new random, fully-connected grid each time, with a green Exit on the border and no console errors. Connectivity is guaranteed by the growth algorithm.
