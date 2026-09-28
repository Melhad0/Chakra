import React from 'react';
import { EconomyPanel } from '../economy/EconomyPanel';
import { ActionStage } from '../core/ActionStage';
import { OperationsPanel } from '../challenges/OperationsPanel';
import { useGameStore } from '../../store/useGameStore';

export const CockpitLayout: React.FC = () => {
  const isLeftSidebarOpen = useGameStore((s) => s.isLeftSidebarOpen);
  const isRightSidebarOpen = useGameStore((s) => s.isRightSidebarOpen);

  return (
    <div className="flex flex-row gap-3 h-[calc(100vh-4rem)] p-3 overflow-hidden bg-shinobi-bg w-full">
      {/* Coluna Esquerda: Economia & Recrutamento (Sidebar Toggleable) */}
      <div
        className={`h-full overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0 ${
          isLeftSidebarOpen
            ? 'w-72 lg:w-80 xl:w-[340px] opacity-100'
            : 'w-0 -mr-3 opacity-0 pointer-events-none'
        }`}
      >
        <EconomyPanel />
      </div>

      {/* Coluna Central: Palco de Ação Heroica - ADAPTA DINAMICAMENTE A QUALQUER COMBINAÇÃO */}
      <div className="flex-1 h-full min-w-0 overflow-hidden transition-all duration-300 ease-in-out">
        <ActionStage />
      </div>

      {/* Coluna Direita: Central de Operações & Módulos (Sidebar Toggleable) */}
      <div
        className={`h-full overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0 ${
          isRightSidebarOpen
            ? 'w-80 lg:w-96 xl:w-[410px] opacity-100'
            : 'w-0 -ml-3 opacity-0 pointer-events-none'
        }`}
      >
        <OperationsPanel />
      </div>
    </div>
  );
};
