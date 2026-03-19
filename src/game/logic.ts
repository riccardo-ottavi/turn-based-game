import { createInitialArmy } from "./gameUtils";
import type { GameState, GameAction, Unit, Position, MapCell, Player } from "./types/gameTypes";
type MoveAction = Extract<GameAction, { type: "move" }>;
type AttackAction = Extract<GameAction, { type: "attack" }>;


export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case "init":
      return action.state;

    case "move":
      return handleMove(state, action);

    case "attack":
      return handleAttack(state, action);

    case "startCombat":
      if (state.phase !== "movement") return state;
      return { ...state, phase: "combat" };

    case "resolveCombat":
      if (state.phase !== "combat") return state;
      return resolveCombat(state);

    case "endTurn":
      return {
        ...state,
        currentPlayerId: state.currentPlayerId === 1 ? 2 : 1,
        turn: state.turn + 1,
        phase: "movement",
        units: state.units.map(u => ({
          ...u,
          hasMoved: false,
          hasAttacked: false
        }))
      };

    default:
      return state;
  }
}

function resolveCombat(state: GameState): GameState {
  let newUnits: Unit[] = [...state.units];
  const log: string[] = [];

  const positionsMap: Record<string, Unit[]> = {};
  newUnits.forEach(u => {
    const key = `${u.position.x},${u.position.y}`;
    if (!positionsMap[key]) positionsMap[key] = [];
    positionsMap[key].push(u);
  });

  Object.values(positionsMap).forEach(unitsInHex => {
    if (unitsInHex.length < 2) return;

    unitsInHex.forEach(attacker => {
      unitsInHex.forEach(target => {
        if (attacker.ownerId !== target.ownerId && target.currentHp > 0) {
          const damage = Math.max(attacker.baseStats.attack - target.baseStats.defence, 0);
          newUnits = newUnits.map(u =>
            u.id === target.id
              ? { ...u, currentHp: Math.max(u.currentHp - damage, 0) }
              : u
          );

          if (damage > 0) {
            log.push(`${attacker.name} colpisce ${target.name} per ${damage} danni!`);
          }
        }
      });
    });
  });

  newUnits = newUnits.filter(u => u.currentHp > 0);

  return { ...state, units: newUnits, combatLog: log };
}


function randomCellType(): MapCell["type"] {
  const rnd = Math.random();
  if (rnd < 0.6) return "grass";       // 60% walkable
  if (rnd < 0.8) return "tree";        // 20% ostacolo
  if (rnd < 0.95) return "wall";       // 15% ostacolo
  return "chest";                       // 5% oggetto speciale
}

export function generateRandomMap(width: number, height: number): MapCell[][] {
  const map: MapCell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: MapCell[] = [];
    for (let x = 0; x < width; x++) {
      const type = randomCellType();
      row.push({
        x,
        y,
        type,
        walkable: type === "grass" || type === "chest"
      });
    }
    map.push(row);
  }
  return map;
}

function getSpawnCells(map: MapCell[][], side: "left" | "right", count: number): MapCell[] {
  const width = map[0].length;
  const height = map.length;
  const xRange = side === "left" ? [0, 1] : [width - 2, width - 1];

  const walkable: MapCell[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = xRange[0]; x <= xRange[1]; x++) {
      if (map[y][x].type === "grass") walkable.push(map[y][x]);
    }
  }

  const selected: MapCell[] = [];
  while (selected.length < count && walkable.length > 0) {
    const idx = Math.floor(Math.random() * walkable.length);
    selected.push(walkable[idx]);
    walkable.splice(idx, 1);
  }

  return selected;
}

function initUnits(map: MapCell[][]): Unit[] {
  const p1Army = createInitialArmy(1, "humans");
  const p2Army = createInitialArmy(2, "orcs");

  const p1Cells = getSpawnCells(map, "left", p1Army.length);
  const p2Cells = getSpawnCells(map, "right", p2Army.length);

  const positionedP1 = p1Army.map((unit, i) => ({
    ...unit,
    position: { x: p1Cells[i].x, y: p1Cells[i].y }
  }));

  const positionedP2 = p2Army.map((unit, i) => ({
    ...unit,
    position: { x: p2Cells[i].x, y: p2Cells[i].y }
  }));

  return [...positionedP1, ...positionedP2];
}

export function createInitAction(): GameAction {
  const width = 8;
  const height = 8;
  const map = generateRandomMap(width, height);
  const units = initUnits(map);

  const players: Player[] = [
    { id: 1, name: "Player 1", faction: "humans", gold: 10, winPoints: 0 },
    { id: 2, name: "Player 2", faction: "orcs", gold: 10, winPoints: 0 }
  ];

  const state: GameState = {
    map,
    units,
    players,
    turn: 1,
    phase: "movement",
    isGameOver: false,
    currentPlayerId: 1
  };

  return { type: "init", state };
}

export function createMoveAction(unitId: number, to: Position): GameAction {
  return { type: "move", unitId, to };
}

export function createStartCombatAction(): GameAction {
  return { type: "startCombat" };
}

export function createResolveCombatAction(): GameAction {
  return { type: "resolveCombat" };
}

export function createEndTurnAction(): GameAction {
  return { type: "endTurn" };
}

export function getReachableCells(unit: Unit, map: MapCell[][]) {
  const cells: { x: number; y: number }[] = [];

  const gridSize = map.length;

  for (let dx = -unit.baseStats.speed; dx <= unit.baseStats.speed; dx++) {
    for (let dy = -unit.baseStats.speed; dy <= unit.baseStats.speed; dy++) {

      if (Math.abs(dx) + Math.abs(dy) <= unit.baseStats.speed) {
        const x = unit.position.x + dx;
        const y = unit.position.y + dy;

        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
          const cell = map[y][x];

          if (!cell.walkable) continue;
          if (x === unit.position.x && y === unit.position.y) continue;

          cells.push({ x, y });
        }
      }
    }
  }

  return cells;
}

export const getAttackableCells = (unit: Unit, units: Unit[], map: MapCell[][]) => {
  const cells: { x: number; y: number }[] = [];

  units.forEach(u => {
    if (u.ownerId !== unit.ownerId) {
      const distance =
        Math.abs(u.position.x - unit.position.x) +
        Math.abs(u.position.y - unit.position.y);

      if (distance <= unit.baseStats.range && distance > 0) {
        cells.push({ x: u.position.x, y: u.position.y });
      }
    }
  });

  return cells;
};


function handleMove(state: GameState, action: MoveAction): GameState {
  const unit = state.units.find(u => u.id === action.unitId);
  if (!unit) return state;

  if (state.phase !== "movement") return state;
  if (unit.ownerId !== state.currentPlayerId) return state;
  if (unit.hasMoved) return state;

  const distance =
    Math.abs(unit.position.x - action.to.x) +
    Math.abs(unit.position.y - action.to.y);

  if (distance > unit.baseStats.speed || distance === 0) return state;

  const targetCell = state.map[action.to.y][action.to.x];
  if (!targetCell.walkable) return state;

  const occupied = state.units.some(
    u => u.position.x === action.to.x && u.position.y === action.to.y
  );
  if (occupied) return state;

  const newUnits = state.units.map(u =>
    u.id === unit.id
      ? { ...u, position: action.to, hasMoved: true }
      : u
  );

  return { ...state, units: newUnits };
}

function handleAttack(state: GameState, action: AttackAction): GameState {
  const attacker = state.units.find(u => u.id === action.attackerId);
  if (!attacker || attacker.hasAttacked) return state;

  let newUnits = state.units.map(u => ({ ...u }));

  newUnits.forEach(u => {
    if (
      u.ownerId !== attacker.ownerId &&
      u.position.x === action.targetPosition.x &&
      u.position.y === action.targetPosition.y
    ) {
      const distance =
        Math.abs(attacker.position.x - u.position.x) +
        Math.abs(attacker.position.y - u.position.y);

      if (distance <= attacker.baseStats.range) {
        const damage = Math.max(
          attacker.baseStats.attack - u.baseStats.defence,
          0
        );

        u.currentHp = Math.max(u.currentHp - damage, 0);
      }
    }
  });

  newUnits = newUnits
    .filter(u => u.currentHp > 0)
    .map(u =>
      u.id === attacker.id ? { ...u, hasAttacked: true } : u
    );

  return { ...state, units: newUnits };
}