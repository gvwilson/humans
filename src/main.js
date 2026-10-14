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

const { grid, exit } = generateMap();

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
const INFECTION_DELAY = 3; // seconds from infection to conversion (tuning value)
const INFECTED_TEXT_COLOR = "#ff1744"; // text color for infected humans
const HUMAN_MOVE_INTERVAL = 0.3; // seconds between steps (tuning value)
const TIGER_FLEE_RANGE = 4; // humans flee when a tiger is within this many cells (Manhattan)
const TIGER_PANIC_RANGE = 2; // humans panic when a tiger is this close (Manhattan)
const BUNNY_CHASE_RANGE = 3; // humans chase the bunny within this many cells (Manhattan)
const PET_DURATION = 1.5; // seconds a human pauses to pet the bunny (tuning value)

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

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function manhattan(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

function legalSteps(actor) {
  return DIRS.filter(([dr, dc]) => {
    const nr = actor.r + dr;
    const nc = actor.c + dc;
    return (
      nr >= 0 &&
      nr < grid.length &&
      nc >= 0 &&
      nc < grid[0].length &&
      grid[nr][nc] !== CellType.OBSTACLE
    );
  });
}

function randomStep(actor) {
  const steps = legalSteps(actor);
  if (steps.length === 0) return null;
  return steps[Math.floor(Math.random() * steps.length)];
}

function fleeStep(actor, from) {
  const steps = legalSteps(actor);
  if (steps.length === 0) return null;
  let best = steps[0];
  let bestDist = -1;
  for (const [dr, dc] of steps) {
    const d = Math.abs(actor.r + dr - from.r) + Math.abs(actor.c + dc - from.c);
    if (d > bestDist) {
      bestDist = d;
      best = [dr, dc];
    }
  }
  return best;
}

const actors = spawnActors(grid);
for (const actor of actors) renderActor(actor);

const tiger = actors.find((actor) => actor instanceof Tiger);
const bunny = actors.find((actor) => actor instanceof Bunny);
const zombies = actors.filter((actor) => actor instanceof Zombie);
const humans = actors.filter((actor) => actor instanceof Human);
for (const human of humans) {
  human.infectionTimer = null;
  human.petTimer = 0;
}

const players = [
  { actor: tiger, keys: TIGER_KEYS, interval: TIGER_MOVE_INTERVAL, timer: 0 },
  { actor: bunny, keys: BUNNY_KEYS, interval: BUNNY_MOVE_INTERVAL, timer: 0 },
];

const isHumanCell = (r, c) => humans.some((h) => h.r === r && h.c === c);
let zombieTimer = 0;
let humanTimer = 0;

function markInfected(human) {
  if (human.infectionTimer !== null) return;
  human.infectionTimer = INFECTION_DELAY;
  human.sprites[1].destroy();
  const { x, y } = cellCenter(human.r, human.c);
  human.sprites[1] = add([
    text(human.letter, { size: ACTOR_TEXT_SIZE }),
    color(INFECTED_TEXT_COLOR),
    pos(x, y),
    anchor("center"),
  ]);
}

function convertToZombie(human) {
  const idx = humans.indexOf(human);
  if (idx !== -1) humans.splice(idx, 1);
  const zombie = new Zombie(human.r, human.c);
  zombies.push(zombie);
  for (const sprite of human.sprites) sprite.destroy();
  renderActor(zombie);
}

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

  for (const zombie of zombies) {
    for (const human of humans) {
      if (zombie.r === human.r && zombie.c === human.c) markInfected(human);
    }
  }

  const toConvert = [];
  for (const human of humans) {
    if (human.infectionTimer === null) continue;
    human.infectionTimer -= dt();
    if (human.infectionTimer <= 0) toConvert.push(human);
  }
  for (const human of toConvert) convertToZombie(human);

  humanTimer += dt();
  if (humanTimer >= HUMAN_MOVE_INTERVAL) {
    humanTimer = 0;
    const exited = [];
    for (const human of humans) {
      if (human.petTimer > 0) {
        human.petTimer -= HUMAN_MOVE_INTERVAL;
        continue;
      }
      if (human.r === exit.r && human.c === exit.c) {
        exited.push(human);
        continue;
      }
      const dTiger = manhattan(human, tiger);
      const dBunny = manhattan(human, bunny);
      let step = null;
      if (dTiger <= TIGER_PANIC_RANGE) {
        step = randomStep(human);
      } else if (dTiger <= TIGER_FLEE_RANGE) {
        step = fleeStep(human, tiger);
      } else if (dBunny <= BUNNY_CHASE_RANGE) {
        if (dBunny === 0) {
          human.petTimer = PET_DURATION;
          continue;
        }
        step = nextStepToward(grid, human.r, human.c, (r, c) => r === bunny.r && c === bunny.c);
      } else {
        step = nextStepToward(grid, human.r, human.c, (r, c) => r === exit.r && c === exit.c);
      }
      if (step && human.tryMove(grid, step[0], step[1])) reposition(human);
    }
    for (const human of exited) {
      const idx = humans.indexOf(human);
      if (idx !== -1) humans.splice(idx, 1);
      for (const sprite of human.sprites) sprite.destroy();
    }
  }
});
