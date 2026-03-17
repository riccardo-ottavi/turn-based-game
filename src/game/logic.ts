import type { GameState, GameAction, Faction, Unit, Player } from "./types/gameTypes";

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

export function createInitialArmy(ownerId: number, faction: Faction): Unit[] {
  if (faction === "humans") {
    return [
      { id: ownerId * 10 + 1, name: "Swordsman", category: "melee", currentHp: 10, baseStats: { hp: 10, attack: 3, defence: 2, speed: 1 }, position: { x: 0, y: 0 }, ownerId },
      { id: ownerId * 10 + 2, name: "Archer", category: "ranged", currentHp: 8, baseStats: { hp: 8, attack: 4, defence: 1, speed: 2 }, position: { x: 1, y: 0 }, ownerId },
      { id: ownerId * 10 + 3, name: "Knight", category: "tank", currentHp: 15, baseStats: { hp: 15, attack: 2, defence: 4, speed: 1 }, position: { x: 0, y: 1 }, ownerId },
    ];
  } else {
    // orcs
    return [
      { id: ownerId * 10 + 1, name: "Orc Warrior", category: "melee", currentHp: 12, baseStats: { hp: 12, attack: 4, defence: 1, speed: 1 }, position: { x: 5, y: 5 }, ownerId },
      { id: ownerId * 10 + 2, name: "Orc Archer", category: "ranged", currentHp: 7, baseStats: { hp: 7, attack: 3, defence: 1, speed: 2 }, position: { x: 6, y: 5 }, ownerId },
      { id: ownerId * 10 + 3, name: "Orc Chieftain", category: "tank", currentHp: 18, baseStats: { hp: 18, attack: 3, defence: 3, speed: 1 }, position: { x: 5, y: 6 }, ownerId },
    ];
  }
}

export function initializeGame(playerName: string, chosenFaction: Faction): GameState {
  const player: Player = { id: 1, name: playerName, faction: chosenFaction, gold: 10, winPoints: 0 };
  const enemyFaction: Faction = chosenFaction === "humans" ? "orcs" : "humans";
  const enemy: Player = { id: 2, name: "Enemy", faction: enemyFaction, gold: 10, winPoints: 0 };

  const units = [
    ...createInitialArmy(player.id, chosenFaction),
    ...createInitialArmy(enemy.id, enemyFaction)
  ];

  return {
    turn: 1,
    isGameOver: false,
    players: [player, enemy],
    units,
    phase: "movement",
    currentPlayerId: 1
  };
}