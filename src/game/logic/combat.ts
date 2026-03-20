import type { GameState, GameAction, Unit } from "../types/gameTypes";
type AttackAction = Extract<GameAction, { type: "attack" }>;


export function handleAttack(state: GameState, action: AttackAction): GameState {
  if (state.phase !== "combat") return state;

  const attacker = state.units.find(u => u.id === action.attackerId);
  if (!attacker || attacker.hasAttacked) return state;
  if (attacker.ownerId !== state.currentPlayerId) return state;

  let newUnits = state.units.map(u => ({ ...u }));
  let kills = 0;

  const log: string[] = state.combatLog ? [...state.combatLog] : [];

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
        const damage = Math.max(attacker.baseStats.attack - u.baseStats.defence, 0);

        const prevHp = u.currentHp;
        u.currentHp = Math.max(u.currentHp - damage, 0);

        if (prevHp > 0 && u.currentHp === 0) {
          kills++;
        }

        if (damage > 0) {
          log.push(`${attacker.name} colpisce ${u.name} per ${damage} danni!`);
        }
      }
    }
  });

  // assegna punti dopo il loop
  const newPlayers = kills > 0
    ? state.players.map(p =>
      p.id === attacker.ownerId
        ? { ...p, winPoints: p.winPoints + kills }
        : p
    )
    : state.players;

  newUnits = newUnits
    .filter(u => u.currentHp > 0)
    .map(u => (u.id === attacker.id ? { ...u, hasAttacked: true } : u));

  return {
    ...state,
    units: newUnits,
    players: newPlayers,
    combatLog: log
  };
}

export function resolveCombat(state: GameState): GameState {
  let newUnits: Unit[] = [...state.units];
  const log: string[] = [];

  // Mappa posizioni
  const positionsMap: Record<string, Unit[]> = {};
  newUnits.forEach(u => {
    const key = `${u.position.x},${u.position.y}`;
    if (!positionsMap[key]) positionsMap[key] = [];
    positionsMap[key].push(u);
  });

  Object.values(positionsMap).forEach(unitsInHex => {
    unitsInHex.forEach(attacker => {
      let killsPerPlayer: Record<number, number> = {};
      if (attacker.currentHp <= 0) return;

      newUnits.forEach(target => {
        if (attacker.ownerId !== target.ownerId && target.currentHp > 0) {
          const distance =
            Math.abs(attacker.position.x - target.position.x) +
            Math.abs(attacker.position.y - target.position.y);

          if (distance <= attacker.baseStats.range && distance > 0) {

            const damage = Math.max(attacker.baseStats.attack - target.baseStats.defence, 0);
            target.currentHp = Math.max(target.currentHp - damage, 0);

            if (damage > 0) {
              const prevHp = target.currentHp;

              target.currentHp = Math.max(target.currentHp - damage, 0);

              if (prevHp > 0 && target.currentHp === 0) {
                killsPerPlayer[attacker.ownerId] =
                  (killsPerPlayer[attacker.ownerId] || 0) + 1;
              }
              log.push(`${attacker.name} colpisce ${target.name} per ${damage} danni!`);
            }
            const newPlayers = state.players.map(p => ({
              ...p,
              winPoints: p.winPoints + (killsPerPlayer[p.id] || 0)
            }));
            return {
              ...state,
              units: newUnits.filter(u => u.currentHp > 0),
              players: newPlayers,
              combatLog: log
            };
          }

        }

      });

    });

  });

  newUnits = newUnits.filter(u => u.currentHp > 0);

  return { ...state, units: newUnits, combatLog: log };
}

export const getAttackableCells = (unit: Unit, units: Unit[]) => {
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