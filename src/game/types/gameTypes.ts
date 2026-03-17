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
}

type GamePhase = "start" | "movement" | "combat" | "end"

export type GameState = {
    turn: number;
    isGameOver: boolean;
    players: Player[];
    units: Unit[];
    phase: GamePhase;
    currentPlayerId: number;
}

export type GameAction =
  | { type: "move"; unitId: number; to: Position }
  | { type: "attack"; attackerId: number; targetId: number };