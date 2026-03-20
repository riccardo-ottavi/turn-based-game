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

export type UnitCategory = "melee" | "ranged" | "tank";

export type Unit = {
  hasAttacked: any;
  id: number;
  name: string;
  category: UnitCategory;
  currentHp: number;
  baseStats: {
    hp: number;
    attack: number;
    defence: number;
    speed: number;
    range: number; 
  };
  position: Position;
  ownerId: number;
  hasMoved: boolean;
  image :string;
};

export type GamePhase = "movement" | "combat";

export type GameState = {
    winnerId: number;
    turn: number;
    isGameOver: boolean;
    players: Player[];
    units: Unit[];
    phase: GamePhase;
    currentPlayerId: number;
    combatLog: string[]
    map: MapCell[][],
    usedChests: Record<string, boolean>;
    selectedUnitId: number | null;
}

export type GameAction =
  | { type: "init"; state: GameState }
  | { type: "move"; unitId: number; to: Position }
  | { type: "startCombat" }
  | { type: "resolveCombat" }
  | { type: "endTurn" }
  | {
      type: "attack";
      attackerId: number;
      targetId: number;
      targetPosition: Position;
    }
  | { type: "collectChest"; unitId: number; position: Position }
  | { type: "selectUnit"; unitId: number }
  | { type: "clearSelection" }

  export type TileType = "wall" | "tree" | "chest" | "grass";

export type MapCell = {
  x: number;
  y: number;
  type: TileType;
  walkable: boolean;  
};