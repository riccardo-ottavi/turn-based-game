import { useReducer, useEffect, useMemo } from "react";
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
import ArmyPanel from "./components/ArmyPanel";
import Controls from "./components/Controls";

const tileMap: Record<string, string> = {
  grass,
  tree,
  wall,
  chest
};

export default function App() {

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
    winnerId: 0,
    selectedUnitId: null
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

  const unitsMap = useMemo(() => {
    const map: Record<string, Unit[]> = {};

    state.units.forEach(u => {
      const key = `${u.position.x},${u.position.y}`;
      if (!map[key]) map[key] = [];
      map[key].push(u);
    });

    return map;
  }, [state.units]);

  const selectedUnitId = state.selectedUnitId;
  const selectedUnit = state.units.find(
  u => u.id === selectedUnitId
);

  const reachable = useMemo(() => {
    if (!selectedUnit || selectedUnit.hasMoved) return [];
    return getReachableCells(selectedUnit, state.map);
  }, [selectedUnit, state.map]);

  const attackable = useMemo(() => {
    if (
      !selectedUnit ||
      state.phase !== "combat" ||
      selectedUnit.hasAttacked
    ) return [];

    return getAttackableCells(selectedUnit, state.units);
  }, [selectedUnit, state.phase, state.units]);

  const handleCellClick = (cell: MapCell, unitsInCell: Unit[]) => {
  if (!selectedUnitId) {
    const clickedUnit = unitsInCell.find(
      u => u.ownerId === state.currentPlayerId
    );

    if (clickedUnit) {
      dispatch({ type: "selectUnit", unitId: clickedUnit.id });
    }
    return;
  }

  if (!selectedUnit) return;

  const isAttackable = attackable.some(
    c => c.x === cell.x && c.y === cell.y
  );

  if (isAttackable) {
    const targetUnit = unitsInCell.find(
      u => u.ownerId !== selectedUnit.ownerId
    );

    if (targetUnit) {
      dispatch({
        type: "attack",
        attackerId: selectedUnit.id,
        targetId: targetUnit.id,
        targetPosition: { x: cell.x, y: cell.y }
      });
    }

    dispatch({ type: "clearSelection" });
    return;
  }

  const isReachable = reachable.some(
    c => c.x === cell.x && c.y === cell.y
  );

  if (isReachable && !selectedUnit.hasMoved) {
    dispatch(
      createMoveAction(selectedUnit.id, {
        x: cell.x,
        y: cell.y
      })
    );

    dispatch({ type: "clearSelection" });
    return;
  }

  dispatch({ type: "clearSelection" });
};

  return (
    <div className="container">

      <InfoPanel state={state} selectedUnitId={selectedUnitId} />

      <ArmyPanel
        units={state.units}
        currentPlayerId={state.currentPlayerId}
        phase={state.phase}
        unitImages={unitImages}
      />

      <Controls
        phase={state.phase}
        onStartCombat={startCombat}
        onEndTurn={endTurn}
      />

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