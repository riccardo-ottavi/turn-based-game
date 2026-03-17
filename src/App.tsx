import './App.css'
import { applyAction } from './game/logic';
import type { GameState, GameAction, Player, Unit } from './game/types/gameTypes';



function App() {

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

  while (!state.isGameOver && state.turn <= 3) { // simuliamo 3 turni
  console.log(`\n=== Turno ${state.turn}, Giocatore ${state.currentPlayerId} ===`);
  
  // fase movement
  state.phase = "movement";
  console.log("--- Movement Phase ---");
  const moveAction: GameAction = { type: "move", unitId: state.currentPlayerId, to: { x: state.turn, y: state.turn } };
  state = applyAction(state, moveAction);
  console.log("Posizione unità:", state.units.find(u => u.id === state.currentPlayerId)?.position);
  
  // fase combat
  state.phase = "combat";
  console.log("--- Combat Phase ---");
  const targetId = state.currentPlayerId === 1 ? 2 : 1;
  const attackAction: GameAction = { type: "attack", attackerId: state.currentPlayerId, targetId };
  state = applyAction(state, attackAction);
  console.log("HP target:", state.units.find(u => u.id === targetId)?.currentHp);
  
  // fine turno
  state.phase = "end";
  console.log("--- End Phase ---");
  
  // passa al prossimo giocatore
  state.currentPlayerId = state.currentPlayerId === 1 ? 2 : 1;
  if (state.currentPlayerId === 1) state.turn++;
  
  // check game over
  if (state.units.some(u => u.currentHp <= 0)) {
    console.log("Game Over!");
    state.isGameOver = true;
  }
}

  return (
    <>
      <h1>Ciao</h1>
    </>
  )
}

export default App
