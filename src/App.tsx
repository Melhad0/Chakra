import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { CockpitLayout } from './components/layout/CockpitLayout';
import { useGameLoop } from './hooks/useGameLoop';

export const App: React.FC = () => {
  // Inicializa o motor desacoplado de Game Loop, delta time e auto-save
  useGameLoop();

  return (
    <div className="w-screen h-screen flex flex-col bg-shinobi-bg text-shinobi-text overflow-hidden select-none">
      {/* HUD Superior Fixo (Global Cockpit) */}
      <Navbar />

      {/* Grid Principal em 3 Colunas Desacopladas */}
      <CockpitLayout />
    </div>
  );
};

export default App;
