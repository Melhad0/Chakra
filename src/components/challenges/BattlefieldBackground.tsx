import React, { useMemo } from 'react';

interface BattlefieldBackgroundProps {
  bossId: number;
  isFighting: boolean;
}

export const BattlefieldBackground: React.FC<BattlefieldBackgroundProps> = ({
  bossId,
  isFighting,
}) => {
  // 4 Tiers de devastação e poluição da guerra com base no poder do chefe
  const tier = useMemo(() => {
    if (bossId >= 51) return 4; // Tier 4: Ruína Dimensional / Cataclismo Otsutsuki
    if (bossId >= 26) return 3; // Tier 3: Grande Guerra Shinobi / Terra Arrasada & Céu Carmesim
    if (bossId >= 11) return 2; // Tier 2: Invasão Hostil / Fumaça & Trincheiras de Guerra
    return 1;                   // Tier 1: Conflito Inicial / Bosque Tenebroso & Névoa
  }, [bossId]);

  // Partículas dinâmicas de cinzas e brasas incandescentes
  const particles = useMemo(() => {
    const count = tier === 4 ? 36 : tier === 3 ? 26 : tier === 2 ? 18 : 10;
    return Array.from({ length: count }, (_, i) => {
      const horizontalOffset = ((i * 37) % 60) - 30; // Deslocamento de vento
      return {
        id: i,
        left: `${(i * 13 + 5) % 98}%`,
        size: (i % 3) + 2.5,
        duration: `${3.5 + (i % 5) * 1.2}s`,
        delay: `${(i % 8) * 0.5}s`,
        driftX: `${horizontalOffset}px`,
        color:
          tier === 4
            ? i % 3 === 0
              ? '#d8b4fe' // Lilás plasma divino
              : i % 3 === 1
              ? '#f43f5e' // Rubi sangue
              : '#c084fc' // Púrpura Chibaku
            : tier === 3
            ? i % 3 === 0
              ? '#ef4444' // Vermelho carmesim
              : i % 3 === 1
              ? '#f97316' // Laranja fogo
              : '#fbbf24' // Âmbar brasa
            : tier === 2
            ? i % 2 === 0
              ? '#f97316' // Laranja brasa
              : '#fdba74' // Âmbar fuligem
            : '#94a3b8', // Cinza cinza fria de emboscada
      };
    });
  }, [tier]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* =================================================================== */}
      {/* CAMADA 0: CÉU DINÂMICO & PALETA TRANSICIONAL DE GUERRA             */}
      {/* =================================================================== */}
      <div
        className={`absolute inset-0 transition-colors duration-1200 ${
          tier === 4
            ? 'bg-gradient-to-b from-[#20052e] via-[#15031e] to-[#08010c]' // Púrpura Abissal Otsutsuki
            : tier === 3
            ? 'bg-gradient-to-b from-[#2c0a0d] via-[#1c0709] to-[#0d0304]' // Céu Carmesim Sangue
            : tier === 2
            ? 'bg-gradient-to-b from-[#1e130c] via-[#160d08] to-[#0b0604]' // Marrom Fuligem e Trincheiras
            : 'bg-gradient-to-b from-[#0a0f1d] via-[#060913] to-[#04060b]'  // Azul Ardósia Sombrio
        }`}
      />

      {/* =================================================================== */}
      {/* CAMADA 1: CLARÕES DE RELÂMPAGO & TEMPESTADE DE CHAKRA               */}
      {/* =================================================================== */}
      {/* Lampejos de tempestade ninja e explosões no horizonte */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          tier >= 3 ? (isFighting ? 'opacity-80' : 'opacity-40') : 'opacity-20'
        }`}
      >
        {/* Iluminação difusa ambiente */}
        {tier === 4 && (
          <div className="absolute -top-24 left-1/3 w-[650px] h-[350px] bg-purple-600/20 blur-[140px] rounded-full animate-pulse" />
        )}
        {tier === 3 && (
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/25 blur-[140px] rounded-full animate-pulse" />
        )}
        {tier <= 2 && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-amber-500/10 blur-[110px] rounded-full" />
        )}

        {/* Efeito estocástico de Relâmpago / Clarão Carmesim nos Tiers 3 e 4 */}
        {tier >= 3 && (
          <div
            className={`absolute inset-0 bg-gradient-to-b ${
              tier === 4
                ? 'from-purple-400/20 via-rose-500/10 to-transparent'
                : 'from-amber-200/25 via-red-500/15 to-transparent'
            } animate-[lightningFlash_7s_infinite]`}
          />
        )}
      </div>

      {/* =================================================================== */}
      {/* CAMADA 2: TERRENO DEVASTADO, CRATERAS & ROCHAS CHIBAKU TENSEI (SVG) */}
      {/* =================================================================== */}
      <div className="absolute bottom-0 left-0 right-0 w-full pointer-events-none">
        <svg
          className="w-full h-52 opacity-35 object-cover"
          viewBox="0 0 1440 320"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* Fenda incandescente de Chakra/Lava no solo (Tiers 3 e 4) */}
          {tier >= 3 && (
            <path
              d="M120,290 Q380,260 620,285 T1100,265 T1440,290"
              stroke={tier === 4 ? '#c084fc' : '#f97316'}
              strokeWidth="4"
              strokeOpacity="0.75"
              className="animate-pulse"
              filter="url(#glowFissure)"
            />
          )}

          {/* Filtro SVG de brilho para a fenda */}
          <defs>
            <filter id="glowFissure" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Cordilheira de rochas escarpadas e terra arrasada */}
          <path
            d={
              tier >= 3
                ? 'M0,320 L0,230 L90,195 L210,245 L340,160 L480,225 L610,135 L750,210 L890,120 L1040,205 L1190,145 L1330,235 L1440,180 L1440,320 Z'
                : 'M0,320 L0,250 L140,225 L290,260 L430,210 L580,250 L730,195 L910,240 L1090,200 L1250,245 L1380,220 L1440,235 L1440,320 Z'
            }
            fill={tier >= 3 ? '#120406' : '#05070d'}
          />

          {/* Espigões de rocha afiados cravados na terra (Tiers 3 e 4) */}
          {tier >= 3 && (
            <>
              <polygon points="190,165 215,65 230,170" fill="#180508" opacity="0.8" />
              <polygon points="460,175 480,90 500,185" fill="#180508" opacity="0.7" />
              <polygon points="850,150 870,50 895,160" fill="#180508" opacity="0.85" />
              <polygon points="1140,165 1170,75 1195,175" fill="#180508" opacity="0.6" />
            </>
          )}

          {/* Detritos de Chibaku Tensei flutuando em gravidade zero (Tier 4) */}
          {tier === 4 && (
            <g className="animate-[levitateDebris_6s_ease-in-out_infinite]">
              <circle cx="320" cy="90" r="16" fill="#3b0764" opacity="0.65" />
              <polygon points="640,65 670,45 660,85" fill="#2e1065" opacity="0.75" />
              <circle cx="980" cy="80" r="22" fill="#4a044e" opacity="0.7" />
              <polygon points="1260,95 1285,70 1275,110" fill="#2e1065" opacity="0.6" />
            </g>
          )}
        </svg>
      </div>

      {/* =================================================================== */}
      {/* CAMADA 3: NÉVOA DE GUERRA & FUMAÇA VOLUMÉTRICA DUPLA (DUAL WAVES)  */}
      {/* =================================================================== */}
      <div className="absolute inset-0 opacity-45 mix-blend-screen overflow-hidden pointer-events-none">
        {/* Onda 1 de Fumaça: Movimento Lento para Esquerda */}
        <div
          className={`absolute bottom-0 w-[220%] h-88 bg-gradient-to-t ${
            tier >= 3
              ? 'from-red-950/70 via-stone-900/50 to-transparent'
              : tier === 2
              ? 'from-amber-950/50 via-stone-900/35 to-transparent'
              : 'from-stone-900/40 via-slate-900/20 to-transparent'
          } blur-3xl transform -translate-x-1/4 animate-[driftSmoke_28s_linear_infinite]`}
        />

        {/* Onda 2 de Fumaça: Movimento Oposto com Maior Turbulência */}
        {tier >= 2 && (
          <div
            className={`absolute bottom-8 w-[220%] h-72 bg-gradient-to-t ${
              tier === 4
                ? 'from-purple-950/75 via-rose-950/45 to-transparent'
                : 'from-orange-950/45 via-stone-950/40 to-transparent'
            } blur-3xl transform translate-x-1/4 animate-[driftSmokeReverse_36s_linear_infinite]`}
          />
        )}
      </div>

      {/* =================================================================== */}
      {/* CAMADA 4: CHUVA DE BRASAS & CINZAS INCANDESCENTES (PARTÍCULAS)     */}
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
      {/* CAMADA 5: VINHETA CINEMATOGRÁFICA & CONTRASTE PARA A HUD           */}
      {/* =================================================================== */}
      <div className="absolute inset-0 bg-radial-vignette opacity-85 pointer-events-none" />

      {/* ESTILOS CSS INLINE DE KEYFRAMES DE ALTA PERFORMANCE (GPU ONLY) */}
      <style>{`
        @keyframes driftSmoke {
          0% { transform: translateX(-15%) scaleY(1); }
          50% { transform: translateX(5%) scaleY(1.18); }
          100% { transform: translateX(-15%) scaleY(1); }
        }
        @keyframes driftSmokeReverse {
          0% { transform: translateX(10%) scaleY(1.12); }
          50% { transform: translateX(-10%) scaleY(0.92); }
          100% { transform: translateX(10%) scaleY(1.12); }
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
            transform: translate(var(--drift-x, 0px), -88vh) scale(0.25) rotate(220deg);
            opacity: 0;
          }
        }
        @keyframes levitateDebris {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-16px) rotate(6deg);
          }
        }
        @keyframes lightningFlash {
          0%, 88%, 92%, 96%, 100% {
            opacity: 0;
          }
          89%, 94% {
            opacity: 0.85;
            filter: brightness(1.7);
          }
          90%, 95% {
            opacity: 0.15;
          }
        }
        .bg-radial-vignette {
          background: radial-gradient(circle at center, transparent 35%, rgba(4, 6, 12, 0.82) 100%);
        }
      `}</style>
    </div>
  );
};
