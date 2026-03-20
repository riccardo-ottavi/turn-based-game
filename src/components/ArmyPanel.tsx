import type { Unit } from "../game/types/gameTypes";

type Props = {
  units: Unit[];
  currentPlayerId: number;
  phase: string;
  unitImages: Record<string, string>;
};

export default function ArmyPanel({
  units,
  unitImages
}: Props) {
  return (
    <div className="army-container">
      {units.map(u => (
        <div key={u.id} className="unit-card">
          <strong>{u.name}</strong>
          <img src={unitImages[u.image]} alt={u.name} />
          
          <div>HP: {u.currentHp}</div>
          <div>Move: {u.baseStats.speed}</div>
          <div>Range: {u.baseStats.range}</div>
          <div>Attack: {u.baseStats.attack}</div>
          <div>Defence: {u.baseStats.defence}</div>
        </div>
      ))}
    </div>
  );
}