import React, { useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { CockpitLayout } from './components/layout/CockpitLayout';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './store/useGameStore';
import { LoginPage } from './components/auth/LoginPage';
import { AuthModal } from './components/auth/AuthModal';
import { OnlineRewardsModal } from './components/common/OnlineRewardsModal';
import { ChallengesView } from './components/views/ChallengesView';
import { ClanTreeView } from './components/views/ClanTreeView';
import { ChuninExamView } from './components/views/ChuninExamView';
import { RankingsView } from './components/views/RankingsView';
import { MissionsView } from './components/views/MissionsView';
import { InventoryView } from './components/views/InventoryView';

export const App: React.FC = () => {
  // Inicializa o motor desacoplado de Game Loop, delta time e auto-save (SEMPRE ATIVO EM SEGUNDO PLANO)
  useGameLoop();

  const currentView = useGameStore((s) => s.currentView);
  const setView = useGameStore((s) => s.setView);
  const currentUser = useGameStore((s) => s.currentUser);
  const setCurrentUser = useGameStore((s) => s.setCurrentUser);
  const guestLogin = useGameStore((s) => s.guestLogin);
  const logout = useGameStore((s) => s.logout);
  const isAuthModalOpen = useGameStore((s) => s.isAuthModalOpen);
  const closeAuthModal = useGameStore((s) => s.closeAuthModal);

  // Atalho global da tecla ESC para retornar ao cockpit principal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentView !== 'MAIN_COCKPIT') {
        setView('MAIN_COCKPIT');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, setView]);

  // GATE OBRIGATÓRIO: Se o usuário não estiver autenticado, exibe a página de login/cadastro
  if (!currentUser) {
    return <LoginPage onAuthSuccess={setCurrentUser} onGuestAccess={guestLogin} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-shinobi-bg text-shinobi-text overflow-hidden select-none">
      {/* 1. VISÃO PRINCIPAL DO COCKPIT SHINOBI (3 COLUNAS) */}
      {currentView === 'MAIN_COCKPIT' && (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-300">
          <Navbar />
          <CockpitLayout />
        </div>
      )}

      {/* 2. JANELA DEDICADA 1: ARENA DE DESAFIOS (BOSS GAUNTLET) */}
      {currentView === 'CHALLENGES' && (
        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-300">
          <ChallengesView />
        </div>
      )}

      {/* 3. JANELA DEDICADA 2: ÁRVORE GENEALÓGICA DE CLÃS (PRESTÍGIO) */}
      {currentView === 'CLAN_TREE' && (
        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-300">
          <ClanTreeView />
        </div>
      )}

      {/* 4. JANELA DEDICADA 3: PAVILHÃO DO EXAME CHŪNIN */}
      {currentView === 'CHUNIN_EXAM' && (
        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-300">
          <ChuninExamView />
        </div>
      )}

      {/* 5. JANELA DEDICADA 4: HALL DA FAMA E PATENTES (RANKINGS) */}
      {currentView === 'RANKINGS' && (
        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-300">
          <RankingsView />
        </div>
      )}

      {/* 6. JANELA DEDICADA 5: QUADRO OFICIAL DE MISSÕES SHINOBI (RANKS E A SS) */}
      {currentView === 'MISSIONS' && (
        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-300">
          <MissionsView />
        </div>
      )}

      {/* 7. JANELA DEDICADA 6: ARSENAL SHINOBI, INVENTÁRIO RPG & AFINIDADE ELEMENTAL */}
      {currentView === 'INVENTORY' && (
        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-300">
          <InventoryView />
        </div>
      )}

      {/* Modais Globais Modulares */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        currentUser={currentUser}
        onAuthSuccess={setCurrentUser}
        onLogout={logout}
      />

      <OnlineRewardsModal />
    </div>
  );
};

export default App;
