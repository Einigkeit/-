import React, { useState } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { GameConfig, AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config);
    setAppState(AppState.PLAYING);
  };

  const handleExitGame = () => {
    setAppState(AppState.SETUP);
    setGameConfig(null);
  };

  return (
    <div className="min-h-screen bg-red-900 flex items-center justify-center overflow-hidden relative">
      {/* Background Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-800 via-red-900 to-red-950"></div>
      
      {/* Subtle Gold Dust/Noise Texture */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* Decorative Light Beams */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none blur-3xl"></div>

      <div className="relative w-full h-full z-10 flex flex-col items-center">
        {appState === AppState.SETUP && (
          <SetupScreen onStartGame={handleStartGame} />
        )}

        {appState === AppState.PLAYING && gameConfig && (
          <GameScreen config={gameConfig} onExit={handleExitGame} />
        )}
      </div>
    </div>
  );
}

export default App;