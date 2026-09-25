import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { CockpitLayout } from './components/layout/CockpitLayout';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './store/useGameStore';
import { LoginPage } from './components/auth/LoginPage';
import { AuthModal } from './components/auth/AuthModal';

export const App: React.FC = () => {
  // Inicializa o motor desacoplado de Game Loop, delta time e auto-save (apenas se autenticado)
  useGameLoop();

  const currentUser = useGameStore((s) => s.currentUser);
  const setCurrentUser = useGameStore((s) => s.setCurrentUser);
  const guestLogin = useGameStore((s) => s.guestLogin);
  const logout = useGameStore((s) => s.logout);
  const isAuthModalOpen = useGameStore((s) => s.isAuthModalOpen);
  const closeAuthModal = useGameStore((s) => s.closeAuthModal);

  // GATE OBRIGATÓRIO: Se o usuário não estiver autenticado, exibe a página de login/cadastro
  if (!currentUser) {
    return <LoginPage onAuthSuccess={setCurrentUser} onGuestAccess={guestLogin} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-shinobi-bg text-shinobi-text overflow-hidden select-none">
      {/* HUD Superior Fixo (Global Cockpit) */}
      <Navbar />

      {/* Grid Principal em 3 Colunas Desacopladas */}
      <CockpitLayout />

      {/* Modal Modular de Perfil e Credenciais Shinobi */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        currentUser={currentUser}
        onAuthSuccess={setCurrentUser}
        onLogout={logout}
      />
    </div>
  );
};

export default App;
