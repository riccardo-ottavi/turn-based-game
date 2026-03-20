import type { GameState, GameAction, Unit } from "../types/gameTypes";
import { handleMove } from "./movement";
import { handleAttack, resolveCombat } from "./combat";

export function applyAction(state: GameState, action: GameAction): GameState {

  if (state.isGameOver) return state;

  switch (action.type) {

    case "init":
      return action.state;

    case "move":
      return handleMove(state, action);

    case "attack":
      return handleAttack(state, action);

    case "selectUnit":
      return {
        ...state,
        selectedUnitId: action.unitId
      };

    case "clearSelection":
      return {
        ...state,
        selectedUnitId: null
      };

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