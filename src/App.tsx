import { useReducer, useEffect, useState } from "react";
import type { Unit, MapCell } from "./game/types/gameTypes";
import { getReachableCells } from "./game/logic/movement";
import { applyAction } from "./game/logic/reducer";
import { getAttackableCells } from "./game/logic/combat";
import { createInitAction, createStartCombatAction, createResolveCombatAction, createEndTurnAction, createMoveAction } from "./game/actions/actionCreators";
import grass from "./assets/tile-grass.png";
import tree from "./assets/tile-tree.png";
import wall from "./assets/tile-wall.png";
import chest from "./assets/tile-chest.png";
import './App.css'
import humanCommander from "./assets/human-commander-icon.webp";
import humanArcher from "./assets/human-archer-icon.webp";
import humanSwordsman from "./assets/human-swordsman-icon.png";
import orcCommander from "./assets/orc-commander-icon.webp";
import orcSwordsman from "./assets/orc-swordsman-icon.webp";
import orcArcher from "./assets/orc-archer-icon.webp"

const tileMap: Record<string, string> = {
  grass,
  tree,
  wall,
  chest
};

const GRID_SIZE = 8;
const CELL_SIZE = 60;

export default function App() {
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  const [state, dispatch] = useReducer(applyAction, {
    map: [],
    units: [],
    players: [],
    combatLog: [],
    turn: 1,
    phase: "movement",
    isGameOver: false,
    currentPlayerId: 1
  });

  const unitImages: Record<string, string> = {
    "human-commander-icon.webp": humanCommander,
    "human-archer-icon.webp": humanArcher,
    "human-swordsman-icon.png": humanSwordsman,
    "orc-commander-icon.webp": orcCommander,
    "orc-archer-icon.webp": orcArcher,
    "orc-swordsman-icon.webp": orcSwordsman,

  };

  useEffect(() => {
    dispatch(createInitAction());
  }, []);

  const startCombat = () => {
    dispatch(createStartCombatAction());
    dispatch(createResolveCombatAction());
  };

  const endTurn = () => dispatch(createEndTurnAction());

  const unitsMap: Record<string, Unit[]> = {};
  state.units.forEach(u => {
    const key = `${u.position.x},${u.position.y}`;
    if (!unitsMap[key]) unitsMap[key] = [];
    unitsMap[key].push(u);
  });

  const selectedUnit = state.units.find(u => u.id === selectedUnitId);

  const reachable = selectedUnit && !selectedUnit.hasMoved
    ? getReachableCells(selectedUnit, state.map)
    : [];

  const attackable =
    selectedUnit &&
      state.phase === "combat" &&
      !selectedUnit.hasAttacked
      ? getAttackableCells(selectedUnit, state.units)
      : [];


  return (
    <div className="container">
      <div className="info-displayer">
        <h1>Turno: {state.turn}</h1>
        <h2>Fase: {state.phase}</h2>
        <h3>Giocatore attivo: {state.currentPlayerId}</h3>

        <h3>
          {selectedUnitId
            ? "Scegli: muovi (giallo) o attacca (rosso)"
            : "Seleziona un'unità"}
        </h3>
        <div className="combat-log">
        <h2>Combat Log</h2>
        <div style={{ maxHeight: "150px", overflowY: "auto", background: "#eee", padding: "5px" }}>
          {(state.combatLog || []).map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      </div>
      </div>

      <div className="army-container">
        {state.units.map(u => (
          <div key={u.id} className="unit-card">
              <strong>{u.name}</strong>
              <img src={unitImages[u.image]} alt="" />
              HP: {u.currentHp}
              <br />
              Pos: ({u.position.x}, {u.position.y})
              <br />
              Move: {u.baseStats.speed}
              <br />
              Range: {u.baseStats.range}
              <br />
            {state.phase === "movement" &&
              u.ownerId === state.currentPlayerId}
          </div>
        ))}
      </div>

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

      <div
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        }}
        className="map"
      >
        {state.map.flat().map((cell: MapCell) => {
          const key = `${cell.x},${cell.y}`;
          const unitsInCell = unitsMap[key] || [];

          const isReachable = reachable.some(
            c => c.x === cell.x && c.y === cell.y
          );

          const isAttackable = attackable.some(
            c => c.x === cell.x && c.y === cell.y
          );

          const isSelected = unitsInCell.some(u => u.id === selectedUnitId);

          return (
            <div
              key={key}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                border: "1px solid black",
                position: "relative",
                backgroundImage: `url(${tileMap[cell.type]})`,
                backgroundSize: "cover"
              }}
              onClick={() => {
                const clickedUnit = unitsInCell[0];

                if (
                  clickedUnit &&
                  clickedUnit.ownerId === state.currentPlayerId
                ) {
                  setSelectedUnitId(clickedUnit.id);
                  return;
                }

                if (!selectedUnit) return;


                if (isAttackable) {
                  const targetUnit = unitsInCell.find(
                    u => u.ownerId !== selectedUnit.ownerId
                  );

                  if (!targetUnit) return;

                  dispatch({
                    type: "attack",
                    attackerId: selectedUnit.id,
                    targetId: targetUnit.id,
                    targetPosition: { x: cell.x, y: cell.y }
                  });

                  setSelectedUnitId(null);
                  return;
                }

                if (isReachable && !selectedUnit.hasMoved) {
                  dispatch(
                    createMoveAction(selectedUnit.id, {
                      x: cell.x,
                      y: cell.y
                    })
                  );

                  setSelectedUnitId(null);
                  return;
                }

                setSelectedUnitId(null);
              }}
            >
              {unitsInCell.map((u, i) => (
                <div
                  key={u.id}
                  style={{
                    width: "90%",
                    height: "20px",
                    backgroundColor:
                      u.ownerId === 1 ? "blue" : "red",
                    color: "white",
                    fontSize: "12px",
                    textAlign: "center",
                    borderRadius: "3px",
                    position: "absolute",
                    top: `${i * 22}px`,
                    left: "5%",
                    border: isSelected ? "3px solid yellow" : "1px solid black",
                  }}
                >
                  {u.name[0]}:{u.currentHp}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}