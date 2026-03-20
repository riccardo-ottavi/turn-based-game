import type { GameState } from "../game/types/gameTypes";

type Props = {
  state: GameState;
  selectedUnitId: number | null;
};

export default function InfoPanel({ state, selectedUnitId }: Props) {
  return (
    <div className="info-displayer">
      <h2>Punteggio</h2>
      {state.players.map(p => (
        <div key={p.id}>
          {p.faction.toUpperCase()} - {p.winPoints}
        </div>
      ))}

      <h1>Turno: {state.turn}</h1>
      <h2>Fase: {state.phase}</h2>
      <h3>Giocatore attivo: {state.currentPlayerId === 1 ? "UMANI" : "ORCHI"}</h3>

      <h3>
        {selectedUnitId
          ? "Scegli: muovi o attacca"
          : "Seleziona un'unità"}
      </h3>

      <div className="combat-log">
        <h2>Combat Log</h2>
        <div
        className="log-text"
        >
          {state.combatLog.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      </div>

      {state.isGameOver && (
        <h1>Game Over! Ha vinto il giocatore {state.winnerId}</h1>
      )}
    </div>
  );
}