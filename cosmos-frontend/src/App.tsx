import Game from "./components/Game"

const App = () => {
  const currentTime = new Date().toLocaleTimeString();

  return (
    <div id="root">
      <header>
        <h1 className="glitch-text">COSMOS SYSTEM v1.0.4</h1>
        <div className="status-indicator">
          <div className="pulse-dot"></div>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.1rem' }}>ENCRYPTION: AES-256 // ACTIVE</span>
        </div>
      </header>

      <main className="game-viewport">
        <div className="viewport-corners"></div>
        <div className="viewport-decor"></div>
        <Game />
      </main>

      <footer className="hud-footer">
        <div className="data-stream">
          COORD_TRK: [24.91, -122.34] // SIGNAL_STG: 98% // BUFFER: OPTIMAL
        </div>
        <div className="status-indicator">
          <span>TIME: {currentTime}</span>
          <span style={{ marginLeft: '1rem', opacity: 0.5 }}>// SCANNING_SECTOR_7G</span>
        </div>
      </footer>
    </div>
  );
};
export default App;