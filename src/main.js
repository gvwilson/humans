import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";
import {
  generateMap,
  nextStepToward,
  CellType,
  GRID_ROWS,
  GRID_COLS,
  CELL_SIZE,
} from "./map.js";
import { spawnActors, Tiger, Bunny, Zombie, Human } from "./actors.js";

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
const TIGER_MOVE_INTERVAL = 0.12; // seconds between steps (tuning value)
const BUNNY_MOVE_INTERVAL = 0.2; // seconds between steps (tuning value)
const ZOMBIE_MOVE_INTERVAL = 0.4; // seconds between steps (tuning value)

const TIGER_KEYS = { w: [-1, 0], a: [0, -1], s: [1, 0], d: [0, 1] };
const BUNNY_KEYS = { i: [-1, 0], j: [0, -1], k: [1, 0], l: [0, 1] };

function cellCenter(r, c) {
  return { x: c * CELL_SIZE + CELL_SIZE / 2, y: r * CELL_SIZE + CELL_SIZE / 2 };
}

function renderActor(actor) {
  const { x, y } = cellCenter(actor.r, actor.c);
  const circleObj = add([
    circle(ACTOR_RADIUS),
    color(actor.color),
    outline(2, "#000000"),
    pos(x, y),
    anchor("center"),
  ]);
  const textObj = add([
    text(actor.letter, { size: ACTOR_TEXT_SIZE }),
    color(actor.textColor),
    pos(x, y),
    anchor("center"),
  ]);
  actor.sprites = [circleObj, textObj];
}

function reposition(actor) {
  const { x, y } = cellCenter(actor.r, actor.c);
  for (const sprite of actor.sprites) sprite.pos = vec2(x, y);
}

const actors = spawnActors(grid);
for (const actor of actors) renderActor(actor);

const tiger = actors.find((actor) => actor instanceof Tiger);
const bunny = actors.find((actor) => actor instanceof Bunny);
const zombies = actors.filter((actor) => actor instanceof Zombie);
const humans = actors.filter((actor) => actor instanceof Human);

const players = [
  { actor: tiger, keys: TIGER_KEYS, interval: TIGER_MOVE_INTERVAL, timer: 0 },
  { actor: bunny, keys: BUNNY_KEYS, interval: BUNNY_MOVE_INTERVAL, timer: 0 },
];

const isHumanCell = (r, c) => humans.some((h) => h.r === r && h.c === c);
let zombieTimer = 0;

onUpdate(() => {
  for (const player of players) {
    player.timer += dt();
    if (player.timer < player.interval) continue;
    for (const [key, [dr, dc]] of Object.entries(player.keys)) {
      if (isKeyDown(key)) {
        if (player.actor.tryMove(grid, dr, dc)) {
          player.timer = 0;
          reposition(player.actor);
        }
        break;
      }
    }
  }

  zombieTimer += dt();
  if (zombieTimer >= ZOMBIE_MOVE_INTERVAL) {
    zombieTimer = 0;
    for (const zombie of zombies) {
      const step = nextStepToward(grid, zombie.r, zombie.c, isHumanCell);
      if (step) {
        if (zombie.tryMove(grid, step[0], step[1])) reposition(zombie);
      }
    }
  }
});
