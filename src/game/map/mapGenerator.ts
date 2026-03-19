import type { MapCell } from "../types/gameTypes";

export function generateRandomMap(width: number, height: number): MapCell[][] {
  const map: MapCell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: MapCell[] = [];
    for (let x = 0; x < width; x++) {
      const type = randomCellType();
      row.push({
        x,
        y,
        type,
        walkable: type === "grass" || type === "chest"
      });
    }
    map.push(row);
  }
  return map;
}

function randomCellType(): MapCell["type"] {
  const rnd = Math.random();
  if (rnd < 0.6) return "grass";       // 60% walkable
  if (rnd < 0.8) return "tree";        // 20% ostacolo
  if (rnd < 0.95) return "wall";       // 15% ostacolo
  return "chest";                       // 5% oggetto speciale
}