import type { GameState, GameAction } from "./types/gameTypes";

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "move":
      
      return state;
    case "attack":

      return state;
    default:

      return state;
  }
}