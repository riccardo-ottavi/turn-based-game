import type { Faction, Unit } from "./types/gameTypes";

export function createInitialArmy(ownerId: number, faction: Faction): Unit[] {
  if (faction === "humans") {
    return [
      {
        id: ownerId * 10 + 1,
        name: "Swordsman",
        category: "melee",
        currentHp: 10,
        baseStats: { hp: 10, attack: 3, defence: 2, speed: 1, range: 1 },
        position: { x: 0, y: 0 }, // placeholder
        ownerId,
        hasMoved: false,
        hasAttacked: false
      },
      {
        id: ownerId * 10 + 2,
        name: "Archer",
        category: "ranged",
        currentHp: 8,
        baseStats: { hp: 8, attack: 4, defence: 1, speed: 2, range: 3 },
        position: { x: 0, y: 0 },
        ownerId,
        hasMoved: false,
        hasAttacked: false
      },
      {
        id: ownerId * 10 + 3,
        name: "Knight",
        category: "tank",
        currentHp: 15,
        baseStats: { hp: 15, attack: 2, defence: 4, speed: 1, range: 1 },
        position: { x: 0, y: 0 },
        ownerId,
        hasMoved: false,
        hasAttacked: false
      },
    ];
  }

  return [
    {
      id: ownerId * 10 + 1,
      name: "Orc Warrior",
      category: "melee",
      currentHp: 12,
      baseStats: { hp: 12, attack: 4, defence: 1, speed: 1, range: 1 },
      position: { x: 0, y: 0 },
      ownerId,
      hasMoved: false,
      hasAttacked: false
    },
    {
      id: ownerId * 10 + 2,
      name: "Orc Archer",
      category: "ranged",
      currentHp: 7,
      baseStats: { hp: 7, attack: 3, defence: 1, speed: 2, range: 3 },
      position: { x: 0, y: 0 },
      ownerId,
      hasMoved: false,
      hasAttacked: false
    },
    {
      id: ownerId * 10 + 3,
      name: "Orc Chieftain",
      category: "tank",
      currentHp: 18,
      baseStats: { hp: 18, attack: 3, defence: 3, speed: 1, range: 1 },
      position: { x: 0, y: 0 },
      ownerId,
      hasMoved: false,
      hasAttacked: false
    },
  ];
}