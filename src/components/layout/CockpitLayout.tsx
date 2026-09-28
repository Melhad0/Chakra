import React from 'react';
import { EconomyPanel } from '../economy/EconomyPanel';
import { ActionStage } from '../core/ActionStage';
import { OperationsPanel } from '../challenges/OperationsPanel';
import { useGameStore } from '../../store/useGameStore';

export const CockpitLayout: React.FC = () => {
  const isEightGatesSidebarOpen = useGameStore((s) => s.isEightGatesSidebarOpen);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100vh-4rem)] p-3 overflow-hidden bg-shinobi-bg">
      {/* Coluna Esquerda: Economia & Recrutamento (3 cols) */}
      <div className="lg:col-span-3 h-full overflow-hidden">
        <EconomyPanel />
      </div>

      {/* Coluna Central: Palco de Ação Heroica (Adapta Dinamicamente: 5 cols fechada / 6 cols com sidebar aberta) */}
      <div
        className={`h-full overflow-hidden transition-all duration-300 ease-in-out ${
          isEightGatesSidebarOpen ? 'lg:col-span-6' : 'lg:col-span-5'
        }`}
      >
        <ActionStage />
      </div>

      {/* Coluna Direita: Central de Operações & Módulos (Adapta Dinamicamente: 4 cols fechada / 3 cols aberta) */}
      <div
        className={`h-full overflow-hidden transition-all duration-300 ease-in-out ${
          isEightGatesSidebarOpen ? 'lg:col-span-3' : 'lg:col-span-4'
        }`}
      >
        <OperationsPanel />
      </div>
    </div>
  );
};
