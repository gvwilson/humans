import { CellType } from "./map.js";

export const ZOMBIE_COUNT = 4;
export const HUMAN_COUNT = 8;

export class Actor {
  constructor(r, c) {
    this.r = r;
    this.c = c;
  }

  get letter() {
    return "?";
  }

  get color() {
    return "#ffffff";
  }

  get textColor() {
    return "#ffffff";
  }
}

export class Zombie extends Actor {
  get letter() {
    return "Z";
  }

  get color() {
    return "#2e7d32";
  }
}

export class Human extends Actor {
  get letter() {
    return "H";
  }

  get color() {
    return "#fdd835";
  }

  get textColor() {
    return "#000000";
  }
}

export class Tiger extends Actor {
  get letter() {
    return "T";
  }

  get color() {
    return "#e65100";
  }
}

export class Bunny extends Actor {
  get letter() {
    return "B";
  }

  get color() {
    return "#d81b60";
  }
}

export function spawnActors(grid) {
  const cells = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === CellType.PATH) cells.push([r, c]);
    }
  }

  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const actors = [];
  const take = (Cls) => {
    const [r, c] = cells.pop();
    return new Cls(r, c);
  };

  for (let i = 0; i < ZOMBIE_COUNT; i++) actors.push(take(Zombie));
  for (let i = 0; i < HUMAN_COUNT; i++) actors.push(take(Human));
  actors.push(take(Tiger));
  actors.push(take(Bunny));

  return actors;
}
