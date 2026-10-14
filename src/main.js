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
import { CONFIG } from "./config.js";

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
const INFECTED_TEXT_COLOR = "#ff1744"; // text color for infected humans

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
  { actor: tiger, keys: TIGER_KEYS, interval: CONFIG.tigerMoveInterval, timer: 0 },
  { actor: bunny, keys: BUNNY_KEYS, interval: CONFIG.bunnyMoveInterval, timer: 0 },
];

const isHumanCell = (r, c) => humans.some((h) => h.r === r && h.c === c);
let zombieTimer = 0;
let humanTimer = 0;
let saved = 0;
let gameOver = false;

function markInfected(human) {
  if (human.infectionTimer !== null) return;
  human.infectionTimer = CONFIG.infectionDelay;
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

function endGame() {
  gameOver = true;
  const won = saved > CONFIG.humanCount / 2;
  const cx = (GRID_COLS * CELL_SIZE) / 2;
  const cy = (GRID_ROWS * CELL_SIZE) / 2;
  add([
    rect(GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE),
    color("#000000"),
    pos(0, 0),
  ]);
  add([
    text(
      `You ${won ? "win" : "lose"} — saved ${saved} of ${CONFIG.humanCount} humans`,
      { size: 28 }
    ),
    color(won ? "#00e676" : "#ff1744"),
    pos(cx, cy - 20),
    anchor("center"),
  ]);
  add([
    text("Press R to restart", { size: 16 }),
    color("#cccccc"),
    pos(cx, cy + 20),
    anchor("center"),
  ]);
}

window.addEventListener("keydown", (e) => {
  if (gameOver && e.key.toLowerCase() === "r") location.reload();
});

onUpdate(() => {
  if (gameOver) return;

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
  if (zombieTimer >= CONFIG.zombieMoveInterval) {
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
  if (humanTimer >= CONFIG.humanMoveInterval) {
    humanTimer = 0;
    const exited = [];
    for (const human of humans) {
      if (human.petTimer > 0) {
        human.petTimer -= CONFIG.humanMoveInterval;
        continue;
      }
      if (human.r === exit.r && human.c === exit.c) {
        exited.push(human);
        continue;
      }
      const dTiger = manhattan(human, tiger);
      const dBunny = manhattan(human, bunny);
      let step = null;
      if (dTiger <= CONFIG.tigerPanicRange) {
        step = randomStep(human);
      } else if (dTiger <= CONFIG.tigerFleeRange) {
        step = fleeStep(human, tiger);
      } else if (dBunny <= CONFIG.bunnyChaseRange) {
        if (dBunny === 0) {
          human.petTimer = CONFIG.petDuration;
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
      saved++;
    }
  }

  if (!gameOver && humans.length === 0) endGame();
});
