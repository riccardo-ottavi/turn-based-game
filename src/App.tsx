import { useReducer, useEffect, useState } from "react";
import { getReachableCells } from "./game/logic";
import type { Unit } from "./game/types/gameTypes";
import {
  applyAction,
  createInitAction,
  createMoveAction,
  createStartCombatAction,
  createResolveCombatAction,
  createEndTurnAction
} from "./game/logic";

const GRID_SIZE = 8;
const CELL_SIZE = 60;

export default function App() {
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [state, dispatch] = useReducer(applyAction, {
    units: [],
    players: [],
    turn: 1,
    phase: "movement",
    isGameOver: false,
    currentPlayerId: 1
  });

  useEffect(() => {
    dispatch(createInitAction("humans"));
  }, []);

  const startCombat = () => {
    dispatch(createStartCombatAction());
    dispatch(createResolveCombatAction());
  };
  const endTurn = () => dispatch(createEndTurnAction());

  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      cells.push({ x, y });
    }
  }

  const unitsMap: Record<string, Unit[]> = {};
  state.units.forEach(u => {
    const key = `${u.position.x},${u.position.y}`;
    if (!unitsMap[key]) unitsMap[key] = [];
    unitsMap[key].push(u);
  });

  return (
    <div style={{ display: "flex", gap: "20px" }}>
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
            Movimento: {u.baseStats.speed}

            {state.phase === "movement" && u.ownerId === state.currentPlayerId && !u.hasMoved && (
              <button onClick={() => setSelectedUnitId(u.id)}>Seleziona</button>
            )}
          </div>
        ))}

        <hr />
        {state.phase === "movement" && (
          <button onClick={startCombat}>Fine Movimento → Combattimento</button>
        )}
        {state.phase === "combat" && (
          <button onClick={endTurn}>Fine Combattimento → Fine Turno</button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gap: "1px",
        }}
      >
        {cells.map(cell => {
          const key = `${cell.x},${cell.y}`;
          const unitsInCell = unitsMap[key] || [];

          const selectedUnit = state.units.find(u => u.id === selectedUnitId);
          const reachable = selectedUnit && !selectedUnit.hasMoved
            ? getReachableCells(selectedUnit, GRID_SIZE)
            : [];

          const isReachable = reachable.some(c => c.x === cell.x && c.y === cell.y);

          return (
            <div
              key={key}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                border: "1px solid black",
                position: "relative",
                backgroundColor: isReachable
                  ? "#a0e0a0"
                  : (cell.x + cell.y) % 2 === 0
                    ? "#eee"
                    : "#ccc",
              }}
              onClick={() => {
                if (!selectedUnit || selectedUnit.hasMoved) return;

                const distance =
                  Math.abs(selectedUnit.position.x - cell.x) +
                  Math.abs(selectedUnit.position.y - cell.y);

                if (distance > selectedUnit.baseStats.speed || distance === 0) return;

                dispatch(createMoveAction(selectedUnit.id, { x: cell.x, y: cell.y }));
                setSelectedUnitId(null);
              }}
            >
              {unitsInCell.map((u, i) => (
                <div
                  key={u.id}
                  style={{
                    width: "90%",
                    height: "20px",
                    backgroundColor: u.ownerId === 1 ? "blue" : "red",
                    color: "white",
                    fontSize: "12px",
                    textAlign: "center",
                    borderRadius: "3px",
                    position: "absolute",
                    top: `${i * 22}px`,
                    left: "5%",
                  }}
                >
                  {u.name[0]}:{u.currentHp}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "20px" }}>
        <h2>Log Combattimento</h2>
        {state.combatLog && state.combatLog.length > 0 ? (
          <ul>
            {state.combatLog.map((entry, i) => (
              <li key={i}>{entry}</li>
            ))}
          </ul>
        ) : (
          <p>Nessun combattimento ancora.</p>
        )}
      </div>
    </div>
  );
}