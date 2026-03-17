import { applyAction } from './src/game/logic';
import type { GameState, GameAction, Player, Unit } from './src/game/types/gameTypes';

const players: Player[] = [
  { id: 1, name: "Alice", gold: 10, winPoints: 0 },
  { id: 2, name: "Bob", gold: 8, winPoints: 0 },
];

const units: Unit[] = [
  { id: 1, name: "Swordsman", category: "melee", currentHp: 10, baseStats: { hp: 10, attack: 3, defence: 2, speed: 1 }, position: { x: 0, y: 0 }, ownerId: 1 },
  { id: 2, name: "Archer", category: "ranged", currentHp: 8, baseStats: { hp: 8, attack: 4, defence: 1, speed: 2 }, position: { x: 1, y: 0 }, ownerId: 2 },
];

let state: GameState = {
    currentPlayerId: 1,
    turn: 1,
    isGameOver: false,
    players,
    units,
    phase: "movement"
};

const action: GameAction = { type: "move", unitId: 1, to: { x: 2, y: 3 } };
state = applyAction(state, action);

console.log(state.units.find(u => u.id === 1)?.position); // {x:2, y:3}