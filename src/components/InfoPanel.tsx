import type { GameState } from "../game/types/gameTypes";

type Props = {
  state: GameState;
  selectedUnitId: number | null;
};

export default function InfoPanel({ state, selectedUnitId }: Props) {
  return (
    <div className="info-displayer">
      <h2>Players</h2>
      {state.players.map(p => (
        <div key={p.id}>
          Player {p.id} - VP: {p.winPoints}
        </div>
      ))}

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
        <div
          style={{
            maxHeight: "150px",
            overflowY: "auto",
            background: "#eee",
            padding: "5px"
          }}
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