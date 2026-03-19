import type { GameState, GameAction, Unit } from "../types/gameTypes";
type AttackAction = Extract<GameAction, { type: "attack" }>;


export function handleAttack(state: GameState, action: AttackAction): GameState {
  if (state.phase !== "combat") return state;

  const attacker = state.units.find(u => u.id === action.attackerId);
  if (!attacker || attacker.hasAttacked) return state;

  if (attacker.ownerId !== state.currentPlayerId) return state;

  let newUnits = state.units.map(u => ({ ...u }));

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
        const damage = Math.max(
          attacker.baseStats.attack - u.baseStats.defence,
          0
        );

        u.currentHp = Math.max(u.currentHp - damage, 0);
      }
    }
  });

  newUnits = newUnits
    .filter(u => u.currentHp > 0)
    .map(u =>
      u.id === attacker.id ? { ...u, hasAttacked: true } : u
    );

  return { ...state, units: newUnits };
}

export function resolveCombat(state: GameState): GameState {
  let newUnits: Unit[] = [...state.units];
  const log: string[] = [];

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
          const damage = Math.max(attacker.baseStats.attack - target.baseStats.defence, 0);
          newUnits = newUnits.map(u =>
            u.id === target.id
              ? { ...u, currentHp: Math.max(u.currentHp - damage, 0) }
              : u
          );

          if (damage > 0) {
            log.push(`${attacker.name} colpisce ${target.name} per ${damage} danni!`);
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