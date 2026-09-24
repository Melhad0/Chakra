import React from 'react';
import { EconomyPanel } from '../economy/EconomyPanel';
import { ActionStage } from '../core/ActionStage';
import { OperationsPanel } from '../challenges/OperationsPanel';

export const CockpitLayout: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100vh-4rem)] p-3 overflow-hidden bg-shinobi-bg">
      {/* Coluna Esquerda: Economia & Recrutamento (3 cols) */}
      <div className="lg:col-span-3 h-full overflow-hidden">
        <EconomyPanel />
      </div>

      {/* Coluna Central: Palco de Ação Heroica (5 cols) */}
      <div className="lg:col-span-5 h-full overflow-hidden">
        <ActionStage />
      </div>

      {/* Coluna Direita: Central de Operações & Módulos (4 cols) */}
      <div className="lg:col-span-4 h-full overflow-hidden">
        <OperationsPanel />
      </div>
    </div>
  );
};
