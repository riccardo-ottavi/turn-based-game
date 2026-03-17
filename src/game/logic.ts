import type { GameState, GameAction } from "./types/gameTypes";

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "move": {
      if (state.phase !== "movement") {
        console.warn("Non puoi muovere unità in questa fase");
        return state;
      }

      const unitIndex = state.units.findIndex(u => u.id === action.unitId);
      if (unitIndex === -1) {
        console.warn(`Unità con id ${action.unitId} non trovata`);
        return state;
      }

      const unit = state.units[unitIndex];

      const updatedUnit = { ...unit, position: action.to };
      const newUnits = [...state.units];
      newUnits[unitIndex] = updatedUnit;

      return { ...state, units: newUnits };
    }

    case "attack":
 
      {
      if (state.phase !== "combat") {
        console.warn("Non puoi attaccare in questa fase");
        return state;
      }

      const attacker = state.units.find(u => u.id === action.attackerId);
      const target = state.units.find(u => u.id === action.targetId);
      if (!attacker || !target) return state;

      const damage = attacker.baseStats.attack - target.baseStats.defence;
      const newHp = Math.max(target.currentHp - Math.max(damage, 0), 0);
      const newUnits = state.units.map(u =>
        u.id === target.id ? { ...u, currentHp: newHp } : u
      );

      console.log(`${attacker.name} attacca ${target.name} e infligge ${Math.max(damage, 0)} danni`);

      return { ...state, units: newUnits };
    }

    default:
      return state;
  }
}