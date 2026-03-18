export type Faction = "humans" | "orcs";

export type Player = {
    id: number;
    name: string;
    gold: number;
    winPoints: number;
    faction: Faction;
}

export type Position = {
    x: number;
    y: number;

}

type UnitCategory = "melee" | "ranged" | "tank";

export type Unit = {
    id: number;
    name: string;
    category: UnitCategory;
    currentHp: number;
    baseStats: {
        hp: number;
        attack: number;
        defence: number;
        speed: number;
    };
    position: Position;
    ownerId: number;
    hasMoved: boolean;
}

export type GamePhase = "movement" | "combat";

export type GameState = {
    turn: number;
    isGameOver: boolean;
    players: Player[];
    units: Unit[];
    phase: GamePhase;
    currentPlayerId: number;
    combatLog?: string[];
}

export type GameAction =
  | { type: "init"; state: GameState }
  | { type: "move"; unitId: number; to: Position }
  | { type: "startCombat" }
  | { type: "resolveCombat" }
  | { type: "endTurn" };