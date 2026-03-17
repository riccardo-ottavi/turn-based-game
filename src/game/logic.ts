import type { GameState, GameAction, Faction, Unit, Player, Position } from "./types/gameTypes";

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case "init":
      return action.state;

    case "move": {
      if (state.phase !== "movement") return state;

      const unit = state.units.find(u => u.id === action.unitId);
      if (!unit) return state;

      if (unit.ownerId !== state.currentPlayerId) {
        console.warn("Non puoi muovere unità nemiche");
        return state;
      }

      const newUnits = state.units.map(u =>
        u.id === action.unitId ? { ...u, position: action.to } : u
      );

      return { ...state, units: newUnits };
    }

    case "startCombat": {
      if (state.phase !== "movement") return state;
      return { ...state, phase: "combat" };
    }

    case "resolveCombat": {
      if (state.phase !== "combat") return state;

      let newUnits = [...state.units];

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
              const damage = Math.max(
                attacker.baseStats.attack - target.baseStats.defence,
                0
              );

              newUnits = newUnits.map(u =>
                u.id === target.id
                  ? { ...u, currentHp: Math.max(u.currentHp - damage, 0) }
                  : u
              );
            }
          });
        });
      });

      newUnits = newUnits.filter(u => u.currentHp > 0);

      return { ...state, units: newUnits };
    }

    case "endTurn": {
      const nextPlayer = state.currentPlayerId === 1 ? 2 : 1;

      return {
        ...state,
        currentPlayerId: nextPlayer,
        turn: state.turn + 1,
        phase: "movement"
      };
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
 
    return [
      { id: ownerId * 10 + 1, name: "Orc Warrior", category: "melee", currentHp: 12, baseStats: { hp: 12, attack: 4, defence: 1, speed: 1 }, position: { x: 5, y: 5 }, ownerId },
      { id: ownerId * 10 + 2, name: "Orc Archer", category: "ranged", currentHp: 7, baseStats: { hp: 7, attack: 3, defence: 1, speed: 2 }, position: { x: 6, y: 5 }, ownerId },
      { id: ownerId * 10 + 3, name: "Orc Chieftain", category: "tank", currentHp: 18, baseStats: { hp: 18, attack: 3, defence: 3, speed: 1 }, position: { x: 5, y: 6 }, ownerId },
    ];
  }
}

export function createInitAction(playerFaction: Faction): GameAction {
  const enemyFaction: Faction =
    playerFaction === "humans" ? "orcs" : "humans";

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

export function createStartCombatAction(): GameAction {
  return { type: "startCombat" };
}

export function createResolveCombatAction(): GameAction {
  return { type: "resolveCombat" };
}

export function createEndTurnAction(): GameAction {
  return { type: "endTurn" };
}

export function createMoveAction(
  unitId: number,
  to: Position
): GameAction {
  return {
    type: "move",
    unitId,
    to
  };
}