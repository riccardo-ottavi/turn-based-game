import type { GameState, GameAction, Unit, Position, Faction, Player } from "./types/gameTypes";
import { createInitialArmy } from "./gameUtils";

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case "init":
      return action.state;

    case "move": {
      const unit = state.units.find(u => u.id === action.unitId);
      if (!unit) return state;

      if (state.phase !== "movement") return state;
      if (unit.ownerId !== state.currentPlayerId) return state;
      if (unit.hasMoved) return state;

      const distance =
        Math.abs(unit.position.x - action.to.x) +
        Math.abs(unit.position.y - action.to.y);

      if (distance > unit.baseStats.speed || distance === 0) return state;

      const newUnits = state.units.map(u =>
        u.id === action.unitId
          ? { ...u, position: { ...action.to }, hasMoved: true }
          : u
      );

      return { ...state, units: newUnits };
    }

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
        units: state.units.map(u => ({ ...u, hasMoved: false }))
      };

    default:
      return state;
  }
}

function resolveCombat(state: GameState): GameState {
  const damageMap: Record<number, number> = {}; 

  const positionsMap: Record<string, Unit[]> = {};
  state.units.forEach(u => {
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
          if (!damageMap[target.id]) damageMap[target.id] = 0;
          damageMap[target.id] += damage;
        }
      });
    });
  });

  const newUnits = state.units
    .map(u => ({
      ...u,
      currentHp: u.currentHp - (damageMap[u.id] || 0)
    }))
    .filter(u => u.currentHp > 0); 

  return { ...state, units: newUnits };
}

// Azioni
export function createInitAction(playerFaction: Faction): GameAction {
  const enemyFaction: Faction = playerFaction === "humans" ? "orcs" : "humans";

  const newPlayers: Player[] = [
    { id: 1, name: "Player", faction: playerFaction, gold: 10, winPoints: 0 },
    { id: 2, name: "Enemy", faction: enemyFaction, gold: 10, winPoints: 0 }
  ];

  const newUnits: Unit[] = [
    ...createInitialArmy(newPlayers[0].id, playerFaction),
    ...createInitialArmy(newPlayers[1].id, enemyFaction)
  ];

  return {
    type: "init",
    state: {
      players: newPlayers,
      units: newUnits,
      turn: 1,
      phase: "movement",
      isGameOver: false,
      currentPlayerId: 1
    }
  };
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

export function getReachableCells(unit: Unit, gridSize: number) {
  const cells: { x: number; y: number }[] = [];

  for (let dx = -unit.baseStats.speed; dx <= unit.baseStats.speed; dx++) {
    for (let dy = -unit.baseStats.speed; dy <= unit.baseStats.speed; dy++) {

      if (Math.abs(dx) + Math.abs(dy) <= unit.baseStats.speed) {
        const x = unit.position.x + dx;
        const y = unit.position.y + dy;

        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
          
          if (x === unit.position.x && y === unit.position.y) continue;
          cells.push({ x, y });
        }
      }
    }
  }

  return cells;
}