# Before

Actors render as static circled letters; there is no input handling or
movement. `src/actors.js`'s `Actor` base class holds only `r`/`c` plus letter
and color accessors.

# After

- Add `Actor#tryMove(grid, dr, dc)` in `src/actors.js`: returns false (no move)
  if the target is out of bounds or an `OBSTACLE`, otherwise updates `r`/`c` and
  returns true. This is the shared movement primitive the zombie/human AI will
  reuse later.
- In `src/main.js`: keep references to each actor's circle/text game objects,
  then drive movement in `onUpdate` with `isKeyDown`. WASD moves the tiger,
  IJKL moves the bunny; each has its own move interval (`TIGER_MOVE_INTERVAL`,
  `BUNNY_MOVE_INTERVAL`) so they step at different speeds. On a successful
  `tryMove`, reposition the actor's sprites via `vec2`.

KAPLAY API confirmed: `onUpdate(cb)` + `dt()`, `isKeyDown(key)`,
`obj.pos = vec2(x, y)`.
