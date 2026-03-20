import type { GameAction, Player, GameState, Position } from "../types/gameTypes";
import { generateRandomMap } from "../map/mapGenerator";
import { initUnits } from "../map/spawn";


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
    currentPlayerId: 1,
    combatLog: [],
    usedChests: {} as Record<string, boolean>
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

export function createDeployAction(unitId: number, position: Position): GameAction {
  return { type: "deploy", unitId, position };
}