import type { GameAction, Faction, Position, GameState } from "./types/gameTypes";
import { createInitialArmy } from "./gameUtils";

export function createInitAction(playerFaction: Faction): GameAction {
  const enemyFaction: Faction = playerFaction === "humans" ? "orcs" : "humans";

  const newPlayers = [
    { id: 1, name: "Player", faction: playerFaction, gold: 10, winPoints: 0 },
    { id: 2, name: "Enemy", faction: enemyFaction, gold: 10, winPoints: 0 },
  ];

  const newUnits = [
    ...createInitialArmy(newPlayers[0].id, playerFaction),
    ...createInitialArmy(newPlayers[1].id, enemyFaction),
  ];

  const state: GameState = {
    players: newPlayers,
    units: newUnits,
    turn: 1,
    phase: "movement",
    isGameOver: false,
    currentPlayerId: 1,
    map: []
  };

  return { type: "init", state };
}

export const createMoveAction = (unitId: number, to: Position): GameAction => ({
  type: "move",
  unitId,
  to,
});

export function createAttackAction(attackerId: number, targetId: number) {
  return {
    type: "attack",
    attackerId,
    targetId
  } as const;
}

export const createStartCombatAction = (): GameAction => ({ type: "startCombat" });
export const createResolveCombatAction = (): GameAction => ({ type: "resolveCombat" });
export const createEndTurnAction = (): GameAction => ({ type: "endTurn" });