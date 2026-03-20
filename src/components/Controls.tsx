import type { GamePhase } from "../game/types/gameTypes";

type Props = {
  phase: GamePhase;
  onStartCombat: () => void;
  onEndTurn: () => void;
};

export default function Controls({
  phase,
  onStartCombat,
  onEndTurn
}: Props) {
  return (
    <div className="phase-controls">
      {phase === "movement" && (
        <button onClick={onStartCombat}>
          Fine Movimento → Combattimento
        </button>
      )}

      {phase === "combat" && (
        <button onClick={onEndTurn}>
          Fine Combattimento → Fine Turno
        </button>
      )}
    </div>
  );
}