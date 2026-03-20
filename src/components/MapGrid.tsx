import type { MapCell, Unit } from "../game/types/gameTypes";

type Props = {
  map: MapCell[][];
  unitsMap: Record<string, Unit[]>;
  selectedUnitId: number | null;
  tileMap: Record<string, string>;
  unitImages: Record<string, string>;
  onCellClick: (cell: MapCell, units: Unit[]) => void;
};

const GRID_SIZE = 8;
const CELL_SIZE = 60;

export default function MapGrid({
  map,
  unitsMap,
  selectedUnitId,
  tileMap,
  unitImages,
  onCellClick
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
      }}
      className="map"
    >
      {map.flat().map(cell => {
        const key = `${cell.x},${cell.y}`;
        const unitsInCell = unitsMap[key] || [];
        const isSelected = unitsInCell.some(u => u.id === selectedUnitId);

        return (
          <div
            className="cell"
            key={key}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundImage: `url(${tileMap[cell.type]})`,
            }}
            onClick={() => onCellClick(cell, unitsInCell)}
          >
            {unitsInCell.map((u, i) => (
              <div className="map-unit-cell" key={u.id}>
                <div
                  className="map-unit-label"
                  style={{
                    backgroundColor: u.ownerId === 1 ? "blue" : "red",
                    top: `${i * 22}px`,
                    border: isSelected ? "3px solid yellow" : "1px solid black",
                  }}
                >
                  {u.name[0]}:{u.currentHp}
                </div>
                <img src={unitImages[u.image]} alt={u.name} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}