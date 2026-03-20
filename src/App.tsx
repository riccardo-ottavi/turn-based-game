import { useReducer, useEffect, useState } from "react";
import type { Unit, MapCell } from "./game/types/gameTypes";
import { getReachableCells } from "./game/logic/movement";
import { applyAction } from "./game/logic/reducer";
import { getAttackableCells } from "./game/logic/combat";
import { createInitAction, createStartCombatAction, createEndTurnAction, createMoveAction } from "./game/actions/actionCreators";
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
import MapGrid from "./components/MapGrid";
import InfoPanel from "./components/InfoPanel";

const tileMap: Record<string, string> = {
  grass,
  tree,
  wall,
  chest
};

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
    currentPlayerId: 1,
    usedChests: {},
    winnerId: 0
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

  const handleCellClick = (cell: MapCell, unitsInCell: Unit[]) => {
    if (!selectedUnitId) {

      const clickedUnit = unitsInCell.find(u => u.ownerId === state.currentPlayerId);
      if (clickedUnit) setSelectedUnitId(clickedUnit.id);
      return;
    }

    if (!selectedUnit) return;

    const isAttackable = attackable.some(c => c.x === cell.x && c.y === cell.y);
    if (isAttackable) {
      const targetUnit = unitsInCell.find(u => u.ownerId !== selectedUnit.ownerId);
      if (targetUnit) {
        dispatch({
          type: "attack",
          attackerId: selectedUnit.id,
          targetId: targetUnit.id,
          targetPosition: { x: cell.x, y: cell.y }
        });
      }
      setSelectedUnitId(null);
      return;
    }

    const isReachable = reachable.some(c => c.x === cell.x && c.y === cell.y);
    if (isReachable && !selectedUnit.hasMoved) {
      dispatch(createMoveAction(selectedUnit.id, { x: cell.x, y: cell.y }));
      setSelectedUnitId(null);
      return;
    }

    setSelectedUnitId(null);
  };

  return (
    <div className="container">
      
      <InfoPanel state={state} selectedUnitId={selectedUnitId} />

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

      <MapGrid
        map={state.map}
        unitsMap={unitsMap}
        selectedUnitId={selectedUnitId}
        tileMap={tileMap}
        unitImages={unitImages}
        onCellClick={handleCellClick}
      />
    </div>
  );
}