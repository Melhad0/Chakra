import React, { useMemo } from 'react';

interface BattlefieldBackgroundProps {
  bossId: number;
  isFighting: boolean;
}

export const BattlefieldBackground: React.FC<BattlefieldBackgroundProps> = ({
  bossId,
  isFighting,
}) => {
  // 4 Tiers temáticos de ambiente de guerra com base no chefe
  const tier = useMemo(() => {
    if (bossId >= 51) return 4;
    if (bossId >= 26) return 3;
    if (bossId >= 11) return 2;
    return 1;
  }, [bossId]);

  // Partículas dinâmicas de cinzas e brasas incandescentes
  const particles = useMemo(() => {
    const count = tier === 4 ? 30 : tier === 3 ? 24 : tier === 2 ? 16 : 10;
    return Array.from({ length: count }, (_, i) => {
      const horizontalOffset = ((i * 31) % 50) - 25;
      return {
        id: i,
        left: `${(i * 13 + 7) % 96}%`,
        size: (i % 3) + 2.5,
        duration: `${3.5 + (i % 5) * 1.2}s`,
        delay: `${(i % 8) * 0.45}s`,
        driftX: `${horizontalOffset}px`,
        color:
          tier === 4
            ? i % 3 === 0
              ? '#d8b4fe'
              : i % 3 === 1
              ? '#f43f5e'
              : '#c084fc'
            : tier === 3
            ? i % 3 === 0
              ? '#ef4444'
              : i % 3 === 1
              ? '#f97316'
              : '#fbbf24'
            : tier === 2
            ? i % 2 === 0
              ? '#f97316'
              : '#fdba74'
            : '#6ee7b7',
      };
    });
  }, [tier]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* =================================================================== */}
      {/* 1. GRADIENTE DE BASE ATMOSFÉRICO (ILUMINAÇÃO RICA)                  */}
      {/* =================================================================== */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          tier === 4
            ? 'bg-gradient-to-b from-[#240638] via-[#160424] to-[#0a0112]'
            : tier === 3
            ? 'bg-gradient-to-b from-[#320a0e] via-[#1e0709] to-[#0e0304]'
            : tier === 2
            ? 'bg-gradient-to-b from-[#23150d] via-[#170e08] to-[#0b0604]'
            : 'bg-gradient-to-b from-[#062017] via-[#04130e] to-[#020906]'
        }`}
      />

      {/* Brilho radial central difuso de alta luminosidade */}
      <div
        className={`absolute inset-0 ${
          tier === 4
            ? 'bg-[radial-gradient(circle_at_50%_35%,rgba(192,132,252,0.18)_0%,transparent_65%)]'
            : tier === 3
            ? 'bg-[radial-gradient(circle_at_50%_35%,rgba(239,68,68,0.18)_0%,transparent_65%)]'
            : tier === 2
            ? 'bg-[radial-gradient(circle_at_50%_35%,rgba(249,115,22,0.16)_0%,transparent_65%)]'
            : 'bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.16)_0%,transparent_65%)]'
        }`}
      />

      {/* =================================================================== */}
      {/* 2. FEIXES DE LUZ DIAGONAIS (GOD RAYS & WAR BEAMS - ESTILO PRINT 2) */}
      {/* =================================================================== */}
      <div className="absolute -top-10 -left-10 w-[550px] h-[550px] pointer-events-none animate-sunbeam origin-top-left opacity-45">
        <svg className="w-full h-full" viewBox="0 0 450 450" fill="none">
          <defs>
            <linearGradient id="warBeam1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor={
                  tier === 4
                    ? '#c084fc'
                    : tier === 3
                    ? '#f87171'
                    : tier === 2
                    ? '#fb923c'
                    : '#34d399'
                }
                stopOpacity="0.5"
              />
              <stop
                offset="45%"
                stopColor={
                  tier === 4
                    ? '#e879f9'
                    : tier === 3
                    ? '#fca5a5'
                    : tier === 2
                    ? '#fde047'
                    : '#a7f3d0'
                }
                stopOpacity="0.2"
              />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="warBeam2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor={
                  tier === 4
                    ? '#a855f7'
                    : tier === 3
                    ? '#ef4444'
                    : tier === 2
                    ? '#f97316'
                    : '#10b981'
                }
                stopOpacity="0.4"
              />
              <stop
                offset="55%"
                stopColor={
                  tier === 4
                    ? '#c084fc'
                    : tier === 3
                    ? '#fb923c'
                    : tier === 2
                    ? '#fcd34d'
                    : '#6ee7b7'
                }
                stopOpacity="0.15"
              />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="15,0 65,0 280,450 190,450" fill="url(#warBeam1)" />
          <polygon points="90,0 145,0 370,450 300,450" fill="url(#warBeam2)" />
          <polygon points="160,0 205,0 420,380 375,380" fill="url(#warBeam1)" />
        </svg>
      </div>

      {/* =================================================================== */}
      {/* 3. ANÉIS CONCÊNTRICOS DE RADAR TÁTICO & MIRA (CENTRALIZADOS)        */}
      {/* =================================================================== */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Anel Externo Giratório Tracejado */}
        <div
          className={`w-[320px] h-[320px] rounded-full border border-dashed animate-spin-slow transition-colors duration-1000 ${
            tier === 4
              ? 'border-purple-500/25'
              : tier === 3
              ? 'border-rose-500/25'
              : tier === 2
              ? 'border-orange-500/25'
              : 'border-emerald-500/25'
          }`}
        />
        {/* Anel Interno em Rotação Reversa */}
        <div
          className={`absolute w-[240px] h-[240px] rounded-full border animate-spin-reverse transition-colors duration-1000 ${
            tier === 4
              ? 'border-purple-400/20'
              : tier === 3
              ? 'border-rose-400/20'
              : tier === 2
              ? 'border-orange-400/20'
              : 'border-emerald-400/20'
          }`}
        />
        {/* Halo Suave Luminoso Central */}
        <div
          className={`absolute w-[180px] h-[180px] rounded-full blur-3xl transition-colors duration-1000 ${
            tier === 4
              ? 'bg-purple-600/15'
              : tier === 3
              ? 'bg-rose-600/15'
              : tier === 2
              ? 'bg-orange-600/15'
              : 'bg-emerald-600/15'
          }`}
        />
      </div>

      {/* =================================================================== */}
      {/* 4. ORBES RADIANTES DE CHAKRA FLUTUANTES (ESTILO VAGALUMES/ENERGIA) */}
      {/* =================================================================== */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-[28%] left-[16%] w-2 h-2 rounded-full animate-twinkle ${
            tier === 4
              ? 'bg-purple-300 shadow-[0_0_12px_#c084fc]'
              : tier === 3
              ? 'bg-rose-400 shadow-[0_0_12px_#ef4444]'
              : tier === 2
              ? 'bg-orange-300 shadow-[0_0_12px_#f97316]'
              : 'bg-emerald-300 shadow-[0_0_12px_#34d399]'
          }`}
          style={{ animationDelay: '0.3s' }}
        />
        <div
          className={`absolute top-[52%] left-[82%] w-2.5 h-2.5 rounded-full animate-twinkle ${
            tier === 4
              ? 'bg-pink-300 shadow-[0_0_14px_#f43f5e]'
              : tier === 3
              ? 'bg-amber-300 shadow-[0_0_14px_#f59e0b]'
              : tier === 2
              ? 'bg-amber-200 shadow-[0_0_14px_#fbbf24]'
              : 'bg-teal-300 shadow-[0_0_14px_#2dd4bf]'
          }`}
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className={`absolute top-[68%] left-[24%] w-1.5 h-1.5 rounded-full animate-twinkle ${
            tier === 4
              ? 'bg-violet-200 shadow-[0_0_10px_#a855f7]'
              : tier === 3
              ? 'bg-red-400 shadow-[0_0_10px_#dc2626]'
              : tier === 2
              ? 'bg-yellow-300 shadow-[0_0_10px_#fde047]'
              : 'bg-lime-300 shadow-[0_0_10px_#a3e635]'
          }`}
          style={{ animationDelay: '2.7s' }}
        />
        <div
          className={`absolute top-[22%] left-[72%] w-2 h-2 rounded-full animate-twinkle ${
            tier === 4
              ? 'bg-fuchsia-300 shadow-[0_0_12px_#d946ef]'
              : tier === 3
              ? 'bg-orange-400 shadow-[0_0_12px_#fb923c]'
              : tier === 2
              ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b]'
              : 'bg-emerald-200 shadow-[0_0_12px_#6ee7b7]'
          }`}
          style={{ animationDelay: '3.4s' }}
        />
      </div>

      {/* =================================================================== */}
      {/* 5. RELÂMPAGOS & CLARÕES NO HORIZONTE (TIERS 3 & 4)                  */}
      {/* =================================================================== */}
      {tier >= 3 && (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${
            tier === 4
              ? 'from-purple-400/20 via-pink-500/10 to-transparent'
              : 'from-amber-200/25 via-red-500/15 to-transparent'
          } ${isFighting ? 'animate-[lightningFlash_4s_infinite]' : 'animate-[lightningFlash_7.5s_infinite]'} pointer-events-none`}
        />
      )}

      {/* =================================================================== */}
      {/* 6. SILHUETAS DE TERRENO DE GUERRA & CRATERAS NA BASE (SVG)          */}
      {/* =================================================================== */}
      <div className="absolute bottom-0 inset-x-0 h-44 pointer-events-none opacity-40">
        <svg
          className="w-full h-full"
          viewBox="0 0 700 200"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Fenda Incandescente de Chakra/Lava (Tiers 2, 3 e 4) */}
          {tier >= 2 && (
            <path
              d="M30,185 Q180,165 320,180 T560,165 T690,185"
              stroke={tier === 4 ? '#c084fc' : tier === 3 ? '#ef4444' : '#f97316'}
              strokeWidth="3.5"
              strokeOpacity="0.8"
              className="animate-pulse"
            />
          )}

          {/* Relevo Escarpado de Guerra */}
          <path
            d={
              tier >= 3
                ? 'M0,200 L0,150 L50,130 L110,160 L180,105 L260,155 L340,90 L420,145 L500,80 L580,140 L650,100 L700,120 L700,200 Z'
                : 'M0,200 L0,160 L60,145 L130,170 L210,130 L300,160 L390,120 L480,155 L570,125 L640,150 L700,135 L700,200 Z'
            }
            fill={tier === 4 ? '#08010d' : tier === 3 ? '#0c0203' : tier === 2 ? '#0c0704' : '#010c07'}
          />

          {/* Espigões de Rocha ou Troncos Destruídos */}
          {tier >= 3 && (
            <>
              <polygon points="90,115 105,45 115,120" fill="#130305" opacity="0.85" />
              <polygon points="280,100 295,35 310,110" fill="#130305" opacity="0.85" />
              <polygon points="460,110 475,25 490,115" fill="#130305" opacity="0.85" />
              <polygon points="620,105 635,40 650,110" fill="#130305" opacity="0.85" />
            </>
          )}

          {/* Detritos de Chibaku Tensei em Levitação (Tier 4) */}
          {tier === 4 && (
            <g className="animate-[levitateDebris_6s_ease-in-out_infinite]">
              <circle cx="160" cy="55" r="11" fill="#3b0764" opacity="0.75" />
              <polygon points="340,40 360,25 350,55" fill="#2e1065" opacity="0.8" />
              <circle cx="530,50" r="14" fill="#4a044e" opacity="0.75" />
            </g>
          )}
        </svg>
      </div>

      {/* =================================================================== */}
      {/* 7. NÉVOA E FUMAÇA VOLUMÉTRICA DUPLA COM TURBULÊNCIA                */}
      {/* =================================================================== */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen overflow-hidden pointer-events-none">
        <div
          className={`absolute bottom-0 w-[220%] h-64 bg-gradient-to-t ${
            tier === 4
              ? 'from-purple-950/70 via-stone-900/40 to-transparent'
              : tier === 3
              ? 'from-red-950/70 via-stone-900/40 to-transparent'
              : tier === 2
              ? 'from-amber-950/50 via-stone-900/30 to-transparent'
              : 'from-emerald-950/40 via-stone-900/20 to-transparent'
          } blur-2xl transform -translate-x-1/4 animate-[driftSmoke_25s_linear_infinite]`}
        />
        {tier >= 2 && (
          <div
            className={`absolute bottom-6 w-[220%] h-52 bg-gradient-to-t ${
              tier === 4
                ? 'from-fuchsia-950/60 via-stone-950/30 to-transparent'
                : 'from-orange-950/45 via-stone-950/30 to-transparent'
            } blur-3xl transform translate-x-1/4 animate-[driftSmokeReverse_32s_linear_infinite]`}
          />
        )}
      </div>

      {/* =================================================================== */}
      {/* 8. CHUVA DE BRASAS & FAGULHAS INCANDESCENTES                       */}
      {/* =================================================================== */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <span
            key={p.id}
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2.5}px ${p.color}`,
              animationDuration: p.duration,
              animationDelay: p.delay,
              '--drift-x': p.driftX,
            } as React.CSSProperties}
            className="absolute bottom-0 rounded-full opacity-0 animate-[riseEmber_linear_infinite]"
          />
        ))}
      </div>



      {/* =================================================================== */}
      {/* 10. VINHETA CINEMATOGRÁFICA SUAVE DE PROFUNDIDADE                  */}
      {/* =================================================================== */}
      <div className="absolute inset-0 bg-radial-vignette opacity-70 pointer-events-none" />

      {/* KEYFRAMES CSS INLINE OTIMIZADOS PELA GPU */}
      <style>{`
        @keyframes driftSmoke {
          0% { transform: translateX(-15%) scaleY(1); }
          50% { transform: translateX(5%) scaleY(1.15); }
          100% { transform: translateX(-15%) scaleY(1); }
        }
        @keyframes driftSmokeReverse {
          0% { transform: translateX(8%) scaleY(1.1); }
          50% { transform: translateX(-8%) scaleY(0.95); }
          100% { transform: translateX(8%) scaleY(1.1); }
        }
        @keyframes riseEmber {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0;
          }
          12% {
            opacity: 0.95;
          }
          80% {
            opacity: 0.65;
          }
          100% {
            transform: translate(var(--drift-x, 0px), -80vh) scale(0.2) rotate(220deg);
            opacity: 0;
          }
        }
        @keyframes levitateDebris {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(5deg);
          }
        }
        @keyframes lightningFlash {
          0%, 88%, 92%, 96%, 100% {
            opacity: 0;
          }
          89%, 94% {
            opacity: 0.8;
            filter: brightness(1.7);
          }
          90%, 95% {
            opacity: 0.15;
          }
        }
        .bg-radial-vignette {
          background: radial-gradient(circle at center, transparent 40%, rgba(3, 4, 8, 0.75) 100%);
        }
      `}</style>
    </div>
  );
};
