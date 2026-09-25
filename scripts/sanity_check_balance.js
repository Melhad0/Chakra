import Decimal from 'break_infinity.js';

console.log('=== TESTES DE SANIDADE: HARDCORE PROGRESSION OVERHAUL ===\n');

// 1. NERF NA CURVA DE CUSTOS DOS GERADORES (EXPONENCIAL ESCALONADA)
console.log('--- 1. ESCALONAMENTO DE CUSTO DOS GERADORES ---');
function oldCost(base, level) {
  return new Decimal(base).mul(Decimal.pow(1.15, level));
}

function newCost(base, level) {
  let mult = new Decimal(1);
  if (level <= 50) {
    mult = Decimal.pow(1.18, level);
  } else if (level <= 100) {
    const t1 = Decimal.pow(1.18, 50);
    const t2 = Decimal.pow(1.22, level - 50);
    mult = t1.mul(t2);
  } else {
    const t1 = Decimal.pow(1.18, 50);
    const t2 = Decimal.pow(1.22, 50);
    const t3 = Decimal.pow(1.28, level - 100);
    mult = t1.mul(t2).mul(t3);
  }
  return new Decimal(base).mul(mult);
}

const baseGen = 100;
console.log(`Nível 10:   Antigo = ${oldCost(baseGen, 10).toExponential(2)} | Novo = ${newCost(baseGen, 10).toExponential(2)}`);
console.log(`Nível 50:   Antigo = ${oldCost(baseGen, 50).toExponential(2)} | Novo = ${newCost(baseGen, 50).toExponential(2)}`);
console.log(`Nível 100:  Antigo = ${oldCost(baseGen, 100).toExponential(2)} | Novo = ${newCost(baseGen, 100).toExponential(2)}`);
console.log(`Nível 200:  Antigo = ${oldCost(baseGen, 200).toExponential(2)} | Novo = ${newCost(baseGen, 200).toExponential(2)}`);
const ratio200 = newCost(baseGen, 200).div(oldCost(baseGen, 200)).toNumber();
console.log(`Fator de inflação no nível 200: ${(ratio200).toExponential(2)}x mais caro!\n`);

// 2. NERF NO CLIQUE MANUAL (SUB-LINEAR 0.65)
console.log('--- 2. EQUAÇÃO DE CLIQUE SUB-LINEAR COM SCALING 0.65 ---');
function oldClick(cps) {
  // Alpha antigo = 0.05
  return new Decimal(1).add(new Decimal(cps).mul(0.05));
}
function newClick(cps) {
  // Alpha novo = 0.02 (nerf de 60%) + CPS^0.65
  return new Decimal(1).add(new Decimal(cps).pow(0.65).mul(0.02));
}

[100, 10_000, 1_000_000, 100_000_000, 1e12].forEach((cps) => {
  const o = oldClick(cps);
  const n = newClick(cps);
  console.log(`CPS ${new Decimal(cps).toExponential(1)}: Antigo = ${o.toExponential(2)} | Novo = ${n.toExponential(2)} (Redução de ${((1 - n.div(o).toNumber()) * 100).toFixed(1)}%)`);
});
console.log('');

// 3. CALIBRAÇÃO DOS CHEFES (1.42^N E ARMADURA SHIPPUDEN)
console.log('--- 3. HP DOS CHEFES E DPS CHECK ---');
function oldBossHP(n) {
  return new Decimal(500).mul(Decimal.pow(1.28, n - 1));
}
function newBossHP(n) {
  return new Decimal(500).mul(Decimal.pow(1.42, n - 1));
}

[1, 10, 20, 30, 40].forEach((n) => {
  const o = oldBossHP(n);
  const nb = newBossHP(n);
  const armorStr = n >= 30 ? ' [Blindagem -40% CPS]' : '';
  console.log(`Chefe #${n}: Antigo HP = ${o.toExponential(2)} | Novo HP = ${nb.toExponential(2)} (Aumento: ${(nb.div(o).toNumber()).toFixed(1)}x)${armorStr}`);
});
console.log('');

// 4. PRESTÍGIO E CHAKRA ANCESTRAL
console.log('--- 4. PATAMAR DE PRESTÍGIO E CHAKRA ANCESTRAL ---');
const oldThreshold = new Decimal(1e9);
const newThreshold = new Decimal(1e13);
console.log(`Patamar de Desbloqueio: Antigo = 1e9 (1 Bilhão) | Novo = 1e13 (10 Trilhões) [10.000x mais exigente]`);

function calcAncestral(runChakra) {
  if (runChakra.lt(newThreshold)) return 0;
  return Math.floor(runChakra.div(newThreshold).pow(0.35).toNumber());
}

[1e13, 2e13, 1e14, 1e15, 1e16].forEach((c) => {
  const chakra = new Decimal(c);
  console.log(`Chakra Acumulado ${chakra.toExponential(1)} => Chakra Ancestral: +${calcAncestral(chakra)}`);
});

console.log('\n=== TODOS OS TESTES DE SANIDADE MATEMÁTICA CONCLUÍDOS COM SUCESSO ===');
