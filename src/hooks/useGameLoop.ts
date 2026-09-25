import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { gameLoop } from '../engine/GameLoop';

export function useGameLoop() {
  const currentUser = useGameStore((state) => state.currentUser);
  const tick = useGameStore((state) => state.tick);
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);

  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Apenas inicializa o loop se o usuário estiver autenticado
    if (!currentUser) return;

    // Carrega o progresso salvo
    loadGame();

    // Registra os handlers de tick determinístico do GameLoop
    gameLoop.setHandlers((dt: number) => {
      tick(dt);
    });

    gameLoop.start();

    // Auto-save a cada 10 segundos
    saveTimerRef.current = window.setInterval(() => {
      saveGame();
    }, 10000);

    // Salva ao fechar ou recarregar a janela
    const handleBeforeUnload = () => {
      saveGame();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      gameLoop.stop();
      if (saveTimerRef.current !== null) {
        clearInterval(saveTimerRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveGame();
    };
  }, [currentUser, tick, saveGame, loadGame]);
}
