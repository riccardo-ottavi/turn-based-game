import './App.css'
import { initializeGame } from './game/logic';



function App() {
  const gameState = initializeGame("Alice", "humans");
  console.log(gameState.players);
  console.log(gameState.units);

  return (
    <>
      <h1>Ciao</h1>
    </>
  )
}

export default App
