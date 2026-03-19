import type { GameState, GameAction, Unit, MapCell } from "../types/gameTypes";

type MoveAction = Extract<GameAction, { type: "move" }>;

export function handleMove(state: GameState, action: MoveAction): GameState {
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