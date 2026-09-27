import React, { useMemo } from 'react';

interface BattlefieldBackgroundProps {
  bossId: number;
  isFighting: boolean;
}

export const BattlefieldBackground: React.FC<BattlefieldBackgroundProps> = ({
  bossId,
  isFighting,
}) => {
  // Determina o estágio de devastação e poluição da guerra com base na força do chefe
  const tier = useMemo(() => {
    if (bossId >= 51) return 4; // Guerra Divina / Fim do Mundo Shinobi
    if (bossId >= 26) return 3; // Grande Guerra Shinobi / Ruína Total
    if (bossId >= 11) return 2; // Invasão Hostil / Fumaça & Trincheiras
    return 1;                   // Conflito Inicial / Névoa & Brasas
  }, [bossId]);

  // Partículas de fagulhas/cinzas dinâmicas geradas deterministicamente
  const particles = useMemo(() => {
    const count = tier === 4 ? 28 : tier === 3 ? 20 : tier === 2 ? 14 : 8;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 17 + 7) % 100}%`,
      size: (i % 3) + 2,
      duration: `${4 + (i % 5) * 1.5}s`,
      delay: `${(i % 7) * 0.7}s`,
      color:
        tier === 4
          ? i % 3 === 0
            ? '#c084fc' // Púrpura divino / Chibaku
            : '#f87171' // Vermelho sangue
          : tier === 3
          ? i % 2 === 0
            ? '#fb923c' // Laranja fogo
            : '#ef4444' // Vermelho chama
          : tier === 2
          ? '#f97316' // Laranja brasa
          : '#94a3b8', // Cinza fuligem
    }));
  }, [tier]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Base Gradient de Atmosfera Conforme a Intensidade da Guerra */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          tier === 4
            ? 'bg-gradient-to-b from-[#180424] via-[#21092a] to-[#0d0213]'
            : tier === 3
            ? 'bg-gradient-to-b from-[#250d0a] via-[#1a0a09] to-[#0c0505]'
            : tier === 2
            ? 'bg-gradient-to-b from-[#1c120c] via-[#140e0b] to-[#0a0706]'
            : 'bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#05080e]'
        }`}
      />

      {/* 2. Iluminação de Fundo & Clarões de Explosão / Tempestade */}
      <div
        className={`absolute inset-0 opacity-40 transition-opacity duration-1000 ${
          isFighting ? 'animate-pulse' : ''
        }`}
      >
        {tier >= 3 && (
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/20 blur-[130px] rounded-full" />
        )}
        {tier === 4 && (
          <div className="absolute top-10 left-1/4 w-[500px] h-[300px] bg-purple-600/25 blur-[120px] rounded-full animate-pulse" />
        )}
        {tier <= 2 && (
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-amber-500/15 blur-[100px] rounded-full" />
        )}
      </div>

      {/* 3. Nuvens de Fumaça e Fuligem (Billing Smoke Waves) */}
      <div className="absolute inset-0 opacity-45 mix-blend-screen overflow-hidden">
        {/* Camada de Fumaça 1 */}
        <div
          className={`absolute bottom-0 w-[200%] h-80 bg-gradient-to-t ${
            tier >= 3
              ? 'from-red-950/60 via-stone-900/40 to-transparent'
              : 'from-stone-900/50 via-slate-900/30 to-transparent'
          } blur-2xl transform -translate-x-1/4 animate-[driftSmoke_25s_linear_infinite]`}
        />
        {/* Camada de Fumaça 2 (Mais densa em tiers altos) */}
        {tier >= 2 && (
          <div
            className={`absolute bottom-10 w-[200%] h-64 bg-gradient-to-t ${
              tier === 4
                ? 'from-purple-950/70 via-red-950/40 to-transparent'
                : 'from-amber-950/40 via-stone-900/30 to-transparent'
            } blur-3xl transform translate-x-1/4 animate-[driftSmokeReverse_35s_linear_infinite]`}
          />
        )}
      </div>

      {/* 4. Silhuetas de Terreno Devastado / Guerra no Horizonte */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-44 opacity-25 object-cover pointer-events-none"
        viewBox="0 0 1440 280"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Cadeia de montanhas escarpadas / terra rachada */}
        <path
          d={
            tier >= 3
              ? 'M0,280 L0,210 L80,185 L190,230 L320,150 L450,210 L580,130 L720,200 L860,110 L1020,190 L1180,140 L1320,220 L1440,170 L1440,280 Z'
              : 'M0,280 L0,230 L120,210 L260,240 L400,195 L550,235 L700,180 L880,225 L1060,190 L1220,230 L1360,205 L1440,220 L1440,280 Z'
          }
          fill={tier >= 3 ? '#150608' : '#080c14'}
        />
        {/* Espigões de rocha / Chibaku Tensei flutuando em Tiers altos */}
        {tier >= 3 && (
          <>
            <polygon points="210,140 235,50 250,145" fill="#1b080a" opacity="0.6" />
            <polygon points="820,130 840,40 865,135" fill="#1b080a" opacity="0.7" />
            <polygon points="1120,150 1150,60 1175,160" fill="#1b080a" opacity="0.5" />
          </>
        )}
        {tier === 4 && (
          <>
            {/* Detritos flutuantes de Chibaku Tensei */}
            <circle cx="350" cy="80" r="14" fill="#3b0764" opacity="0.5" />
            <circle cx="680" cy="55" r="22" fill="#2e1065" opacity="0.6" />
            <circle cx="1040" cy="70" r="18" fill="#4a044e" opacity="0.5" />
          </>
        )}
      </svg>

      {/* 5. Chuva de Brasas e Fagulhas Subindo */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <span
            key={p.id}
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
            className="absolute bottom-0 rounded-full opacity-0 animate-[riseEmber_linear_infinite]"
          />
        ))}
      </div>

      {/* 6. Vinheta Escura de Bordas de Campo de Batalha */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />

      {/* Estilos CSS Inline de Keyframes para garantir execução suave sem depender de plugin externo */}
      <style>{`
        @keyframes driftSmoke {
          0% { transform: translateX(-15%) scaleY(1); }
          50% { transform: translateX(5%) scaleY(1.15); }
          100% { transform: translateX(-15%) scaleY(1); }
        }
        @keyframes driftSmokeReverse {
          0% { transform: translateX(10%) scaleY(1.1); }
          50% { transform: translateX(-10%) scaleY(0.95); }
          100% { transform: translateX(10%) scaleY(1.1); }
        }
        @keyframes riseEmber {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.9;
          }
          85% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-85vh) scale(0.3) rotate(180deg);
            opacity: 0;
          }
        }
        .bg-radial-vignette {
          background: radial-gradient(circle at center, transparent 40%, rgba(5, 5, 8, 0.75) 100%);
        }
      `}</style>
    </div>
  );
};
