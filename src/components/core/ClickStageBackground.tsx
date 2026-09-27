import React, { useState, useEffect } from 'react';
import { Leaf, Moon, Play, Pause } from 'lucide-react';

interface ClickStageBackgroundProps {
  clickExhaustion?: boolean;
}

export type SceneryTheme = 'konoha' | 'valedofim';

const THEME_DURATION_SECONDS = 25;

export const ClickStageBackground: React.FC<ClickStageBackgroundProps> = ({
  clickExhaustion = false,
}) => {
  const [theme, setTheme] = useState<SceneryTheme>('konoha');
  const [timeLeft, setTimeLeft] = useState<number>(THEME_DURATION_SECONDS);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Ciclo automático com contagem regressiva
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTheme((curr) => (curr === 'konoha' ? 'valedofim' : 'konoha'));
          return THEME_DURATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Alterna manualmente o tema
  const handleToggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme((curr) => (curr === 'konoha' ? 'valedofim' : 'konoha'));
    setTimeLeft(THEME_DURATION_SECONDS);
  };

  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused((p) => !p);
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* ========================================================
          CENÁRIO 1: FLORESTA DA FOLHA (KONOHA FOREST)
          ======================================================== */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          theme === 'konoha' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Gradiente de Base da Floresta */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-zinc-950/90 to-zinc-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(16,185,129,0.12)_0%,transparent_65%)]" />

        {/* Raios de Sol através da Copa das Árvores (God Rays / Sunbeams) */}
        <div className="absolute -top-10 -left-10 w-96 h-96 pointer-events-none animate-sunbeam origin-top-left">
          <svg className="w-full h-full opacity-40" viewBox="0 0 400 400" fill="none">
            <defs>
              <linearGradient id="sunbeamGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
                <stop offset="40%" stopColor="#fef08a" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="sunbeamGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#fde047" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="20,0 70,0 260,400 180,400" fill="url(#sunbeamGrad1)" />
            <polygon points="100,0 150,0 340,400 280,400" fill="url(#sunbeamGrad2)" />
            <polygon points="170,0 210,0 390,320 350,320" fill="url(#sunbeamGrad1)" />
          </svg>
        </div>

        {/* Emblema Espiral de Konoha Translúcido no Fundo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
          <svg className="w-80 h-80 text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 C 27.9 10 10 27.9 10 50 C 10 72.1 27.9 90 50 90 C 72.1 90 90 72.1 90 50 C 90 35 78 22 63 22 C 48 22 36 34 36 49 C 36 61 46 71 58 71 C 68 71 76 63 76 53 C 76 45 69 39 61 39 C 55 39 50 44 50 50 C 50 54 53 57 57 57 C 59 57 61 55 61 53" />
          </svg>
        </div>

        {/* Silhueta de Árvores Gigantes e Troncos de Konoha na Base */}
        <div className="absolute bottom-0 inset-x-0 h-44 pointer-events-none opacity-45">
          <svg
            className="w-full h-full"
            viewBox="0 0 600 200"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="treeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#02140d" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#052e1f" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Tronco e copa esquerda */}
            <path
              d="M-20 200 L-10 70 Q 20 40 40 90 Q 60 30 90 80 Q 120 40 140 120 L160 200 Z"
              fill="url(#treeGrad)"
            />
            {/* Árvores de fundo ao centro */}
            <path
              d="M130 200 Q 170 110 210 140 Q 250 85 290 130 Q 330 95 370 150 Q 420 100 460 200 Z"
              fill="url(#treeGrad)"
              opacity="0.6"
            />
            {/* Tronco e copa direita */}
            <path
              d="M440 200 L460 100 Q 490 35 520 80 Q 550 25 580 75 Q 610 50 630 140 L640 200 Z"
              fill="url(#treeGrad)"
            />
          </svg>
        </div>

        {/* Folhas de Konoha Caindo e Dançando com o Vento (Folhas SVG Animadas) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Folha 1 - Verde Esmeralda */}
          <div
            className="absolute left-[15%] -top-6 animate-leaf-1"
            style={{ animationDelay: '0s' }}
          >
            <svg className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>

          {/* Folha 2 - Verde Musgo Dourado */}
          <div
            className="absolute left-[38%] -top-6 animate-leaf-2"
            style={{ animationDelay: '2.5s' }}
          >
            <svg className="w-4 h-4 text-lime-400 drop-shadow-[0_0_6px_rgba(163,230,53,0.3)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>

          {/* Folha 3 - Âmbar Outonal de Konoha */}
          <div
            className="absolute left-[62%] -top-6 animate-leaf-3"
            style={{ animationDelay: '5s' }}
          >
            <svg className="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>

          {/* Folha 4 - Verde Floresta */}
          <div
            className="absolute left-[80%] -top-6 animate-leaf-1"
            style={{ animationDelay: '3.8s' }}
          >
            <svg className="w-4 h-4 text-emerald-300 drop-shadow-[0_0_5px_rgba(110,231,183,0.35)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>

          {/* Folha 5 - Pequena Folha Dançante */}
          <div
            className="absolute left-[24%] -top-6 animate-leaf-2"
            style={{ animationDelay: '7.2s' }}
          >
            <svg className="w-3 h-3 text-teal-300 opacity-80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>
        </div>

        {/* Vagalumes de Chakra Natural (Senjutsu Particles) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[35%] left-[20%] w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#34d399] animate-twinkle" style={{ animationDelay: '0.4s' }} />
          <div className="absolute top-[55%] left-[78%] w-2 h-2 rounded-full bg-lime-300 shadow-[0_0_10px_#a3e635] animate-twinkle" style={{ animationDelay: '1.6s' }} />
          <div className="absolute top-[68%] left-[28%] w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#fde047] animate-twinkle" style={{ animationDelay: '2.8s' }} />
          <div className="absolute top-[22%] left-[65%] w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_#5eead4] animate-twinkle" style={{ animationDelay: '3.5s' }} />
        </div>
      </div>

      {/* ========================================================
          CENÁRIO 2: VALE DO FIM - NOTURNO (VALLEY OF THE END)
          ======================================================== */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          theme === 'valedofim' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Gradiente Noturno Profundo */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/80 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(99,102,241,0.18)_0%,transparent_70%)]" />

        {/* Lua Noturna Majestosa e Resplendor */}
        <div className="absolute top-5 right-12 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 via-sky-200 to-indigo-300/40 opacity-75 animate-moon-pulse pointer-events-none">
          {/* Detalhes da cratera lunar suave */}
          <div className="absolute top-3 left-4 w-3.5 h-3.5 rounded-full bg-indigo-300/30 blur-[1px]" />
          <div className="absolute bottom-4 right-5 w-4 h-4 rounded-full bg-indigo-300/25 blur-[1px]" />
        </div>

        {/* Nuvens Noturnas Translúcidas ao Redor da Lua */}
        <div className="absolute top-7 right-4 w-40 h-10 rounded-full bg-indigo-950/40 blur-xl pointer-events-none" />

        {/* Constelações & Céu Estrelado */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[12%] left-[18%] w-1 h-1 rounded-full bg-white animate-twinkle" style={{ animationDelay: '0.2s' }} />
          <div className="absolute top-[8%] left-[45%] w-1.5 h-1.5 rounded-full bg-cyan-200 shadow-[0_0_6px_#38bdf8] animate-twinkle" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-[26%] left-[32%] w-1 h-1 rounded-full bg-indigo-200 animate-twinkle" style={{ animationDelay: '2.1s' }} />
          <div className="absolute top-[16%] left-[75%] w-1 h-1 rounded-full bg-white animate-twinkle" style={{ animationDelay: '0.8s' }} />
          <div className="absolute top-[32%] left-[86%] w-1.5 h-1.5 rounded-full bg-sky-200 animate-twinkle" style={{ animationDelay: '1.8s' }} />
          <div className="absolute top-[40%] left-[12%] w-1 h-1 rounded-full bg-indigo-300 animate-twinkle" style={{ animationDelay: '2.9s' }} />
        </div>

        {/* Silhueta Majestosa das Estátuas do Vale do Fim (Hashirama Senju & Madara Uchiha) */}
        <div className="absolute bottom-0 inset-x-0 h-48 pointer-events-none opacity-60">
          <svg
            className="w-full h-full"
            viewBox="0 0 600 220"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="statueGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#030712" stopOpacity="0.98" />
                <stop offset="65%" stopColor="#0f172a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="waterfallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Estátua Esquerda: Hashirama Senju (Ombreiras de batalha, braço estendido com selo) */}
            <path
              d="M-20 220 L-10 60 Q 35 45 70 85 Q 90 95 120 120 Q 145 130 165 145 L 165 220 Z"
              fill="url(#statueGrad)"
            />
            {/* Detalhe da mão estendida de Hashirama para o centro */}
            <path
              d="M120 120 Q 170 125 195 130 Q 170 145 145 150 Z"
              fill="#090d16"
              opacity="0.85"
            />

            {/* Cachoeira Central Colossal entre os despenhadeiros */}
            <rect x="275" y="70" width="50" height="150" fill="url(#waterfallGrad)" opacity="0.35" />
            <path
              d="M270 90 L275 220 L325 220 L330 90 Q 300 100 270 90 Z"
              fill="#38bdf8"
              opacity="0.25"
            />

            {/* Estátua Direita: Madara Uchiha (Cabelo longo espetado, gola alta, braço estendido) */}
            <path
              d="M620 220 L610 50 Q 560 30 520 80 Q 500 95 470 115 Q 445 130 435 145 L 435 220 Z"
              fill="url(#statueGrad)"
            />
            {/* Detalhe da mão e manto de Madara estendido para o centro */}
            <path
              d="M480 115 Q 430 125 405 130 Q 430 145 455 150 Z"
              fill="#090d16"
              opacity="0.85"
            />
          </svg>
        </div>

        {/* Bruma da Cachoeira (Névoa fluida no fundo do desfiladeiro) */}
        <div className="absolute -bottom-6 inset-x-0 h-28 pointer-events-none animate-mist-slow">
          <div className="w-full h-full bg-gradient-to-t from-cyan-950/60 via-indigo-950/40 to-transparent blur-md" />
        </div>

        {/* Faíscas Elétricas de Chidori (Relâmpagos Sutis) */}
        <div className="absolute inset-0 pointer-events-none animate-lightning-arc">
          <svg className="w-full h-full opacity-60" viewBox="0 0 400 400" fill="none">
            <path
              d="M170 140 L195 180 L185 200 L220 240 L210 260 L235 300"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M230 130 L215 165 L225 185 L200 225 L215 245 L190 280"
              stroke="#a855f7"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Brasas e Centelhas de Kyūbi / Rasengan Subindo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute bottom-4 left-[46%] w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ember"
            style={{ animationDelay: '0.3s' }}
          />
          <div
            className="absolute bottom-6 left-[52%] w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ember"
            style={{ animationDelay: '1.8s' }}
          />
          <div
            className="absolute bottom-2 left-[50%] w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_#fb923c] animate-ember"
            style={{ animationDelay: '3.4s' }}
          />
        </div>
      </div>

      {/* ========================================================
          HUD INTERATIVO & SELETOR DE CENÁRIO (TOPO DO QUADRADO)
          ======================================================== */}
      <div className="absolute top-2.5 right-2.5 z-20 pointer-events-auto flex items-center gap-1.5">
        <button
          onClick={handleToggleTheme}
          title="Clique para alternar entre Floresta de Konoha e Vale do Fim"
          className="group flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700/60 backdrop-blur-md shadow-md text-[10px] font-mono transition-all duration-200 cursor-pointer active:scale-95"
        >
          {theme === 'konoha' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <Leaf className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Floresta da Folha</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              <Moon className="w-3 h-3 text-cyan-300" />
              <span className="text-cyan-200 font-semibold">Vale do Fim</span>
            </>
          )}

          {/* Contador de Transição */}
          <span className="text-zinc-500 text-[9px] pl-0.5 border-l border-zinc-700/70">
            {isPaused ? 'Fixado' : `${timeLeft}s`}
          </span>
        </button>

        {/* Botão de Fixar / Pausar Transição Automática */}
        <button
          onClick={handleTogglePause}
          title={isPaused ? 'Retomar rotação automática de cenários' : 'Fixar este cenário permanentemente'}
          className={`p-1 rounded-full border backdrop-blur-md transition-all cursor-pointer ${
            isPaused
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
              : 'bg-zinc-900/70 border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {isPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
        </button>
      </div>

      {/* Sombra de Vinheta nas Bordas para Enquadrar o Selo Central */}
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.85)] pointer-events-none" />

      {/* Efeito Vermelho Sutil em Caso de Exaustão Muscular */}
      {clickExhaustion && (
        <div className="absolute inset-0 bg-rose-950/20 pointer-events-none transition-opacity duration-300" />
      )}
    </div>
  );
};
