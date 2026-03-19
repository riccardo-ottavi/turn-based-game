import { createInitialArmy } from "../gameUtils";
import type { MapCell, Unit } from "../types/gameTypes";

export function getSpawnCells(map: MapCell[][], side: "left" | "right", count: number): MapCell[] {
  const width = map[0].length;
  const height = map.length;
  const xRange = side === "left" ? [0, 1] : [width - 2, width - 1];

  const walkable: MapCell[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = xRange[0]; x <= xRange[1]; x++) {
      if (map[y][x].type === "grass") walkable.push(map[y][x]);
    }
  }

  const selected: MapCell[] = [];
  while (selected.length < count && walkable.length > 0) {
    const idx = Math.floor(Math.random() * walkable.length);
    selected.push(walkable[idx]);
    walkable.splice(idx, 1);
  }

  return selected;
}

export function initUnits(map: MapCell[][]): Unit[] {
   const p1Army = createInitialArmy(1, "humans");
  const p2Army = createInitialArmy(2, "orcs");

  const p1Cells = getSpawnCells(map, "left", p1Army.length);
  const p2Cells = getSpawnCells(map, "right", p2Army.length);

  const positionedP1 = p1Army.map((unit, i) => ({
    ...unit,
    position: { x: p1Cells[i].x, y: p1Cells[i].y }
  }));

  const positionedP2 = p2Army.map((unit, i) => ({
    ...unit,
    position: { x: p2Cells[i].x, y: p2Cells[i].y }
  }));

  return [...positionedP1, ...positionedP2];
}