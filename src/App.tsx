import { useReducer, useEffect } from "react";
import type { GameState, Position } from "./game/types/gameTypes";

import {
  applyAction,
  createInitAction,
  createMoveAction,
  createStartCombatAction,
  createResolveCombatAction,
  createEndTurnAction
} from "./game/logic";

const initialState: GameState = {
  units: [],
  players: [],
  turn: 1,
  phase: "movement",
  isGameOver: false,
  currentPlayerId: 1
};

export default function App() {
  const [state, dispatch] = useReducer(applyAction, initialState);

  useEffect(() => {
    dispatch(createInitAction("humans"));
  }, []);

  const moveUnit = (unitId: number, to: Position) => {
    dispatch(createMoveAction(unitId, to));
  };

  const startCombat = () => {
    dispatch(createStartCombatAction());
    dispatch(createResolveCombatAction());
  };

  const endTurn = () => {
    dispatch(createEndTurnAction());
  };

  return (
    <div>
      <h1>Turno: {state.turn}</h1>
      <h2>Fase: {state.phase}</h2>
      <h3>Giocatore attivo: {state.currentPlayerId}</h3>

      <hr />

      <h2>Unità</h2>
      {state.units.map(u => (
        <div key={u.id} style={{ marginBottom: "10px" }}>
          <strong>{u.name}</strong> (Player {u.ownerId})  
          <br />
          HP: {u.currentHp}  
          <br />
          Posizione: ({u.position.x}, {u.position.y})

          {/* 👇 Bottoni di test per movimento */}
          {state.phase === "movement" && u.ownerId === state.currentPlayerId && (
            <div>
              <button onClick={() => moveUnit(u.id, { x: u.position.x + 1, y: u.position.y })}>
                → Destra
              </button>
              <button onClick={() => moveUnit(u.id, { x: u.position.x, y: u.position.y + 1 })}>
                ↓ Giù
              </button>
            </div>
          )}
        </div>
      ))}

      <hr />

      {/* 👇 Controllo fasi */}
      {state.phase === "movement" && (
        <button onClick={startCombat}>
          Fine Movimento → Combattimento
        </button>
      )}

      {state.phase === "combat" && (
        <button onClick={endTurn}>
          Fine Combattimento → Fine Turno
        </button>
      )}
    </div>
  );
}