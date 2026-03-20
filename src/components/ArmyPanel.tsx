// components/ArmyPanel.tsx
import type { Unit } from "../game/types/gameTypes";

type Props = {
  units: Unit[];
  currentPlayerId: number;
  phase: string;
  unitImages: Record<string, string>;
};

export default function ArmyPanel({
  units,
  currentPlayerId,
  phase,
  unitImages
}: Props) {
  return (
    <div className="army-container">
      {units.map(u => (
        <div key={u.id} className="unit-card">
          <strong>{u.name}</strong>
          <img src={unitImages[u.image]} alt={u.name} />
          
          <div>HP: {u.currentHp}</div>
          <div>Pos: ({u.position.x}, {u.position.y})</div>
          <div>Move: {u.baseStats.speed}</div>
          <div>Range: {u.baseStats.range}</div>

          {phase === "movement" && u.ownerId === currentPlayerId && (
            <div style={{ color: "green", fontSize: "12px" }}>
              Attiva
            </div>
          )}
        </div>
      ))}
    </div>
  );
}