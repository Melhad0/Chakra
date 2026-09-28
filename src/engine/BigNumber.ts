import Decimal from 'break_infinity.js';

export type NotationMode = 'suffix' | 'scientific';

let currentNotation: NotationMode = 'suffix';

const BASE_SUFFIXES = ['', 'K', 'M', 'B', 'T'];

/**
 * Retorna o sufixo numérico de acordo com a ordem de grandeza (exp / 3):
 * 0: '' (<1,000)
 * 1: 'K' (10^3)
 * 2: 'M' (10^6)
 * 3: 'B' (10^9)
 * 4: 'T' (10^12 - Teto da notação tradicional)
 * 5: 'AA' (10^15 - Início da notação alfabética simples)
 * 6: 'AB' (10^18)
 * ...
 * 30: 'AZ' (10^90)
 * 31: 'BA' (10^93)
 * ...
 * 680: 'ZZ' (10^2040)
 * >680: 'AAA', 'AAB'... (escala infinita)
 */
export function getSuffix(suffixIndex: number): string {
  if (suffixIndex <= 0) return '';
  if (suffixIndex < BASE_SUFFIXES.length) {
    return BASE_SUFFIXES[suffixIndex];
  }

  // A partir de suffixIndex = 5 (10^15), segue o alfabeto duplo: AA, AB, AC ... AZ, BA ... ZZ
  let offset = suffixIndex - BASE_SUFFIXES.length;

  if (offset < 26 * 26) {
    const firstChar = String.fromCharCode(65 + Math.floor(offset / 26));
    const secondChar = String.fromCharCode(65 + (offset % 26));
    return `${firstChar}${secondChar}`;
  }

  // Para valores extremos além de ZZ (> 10^2040): 3 ou mais letras dinamicamente
  let remaining = offset - 26 * 26;
  const chars: string[] = [];
  while (remaining >= 0) {
    chars.unshift(String.fromCharCode(65 + (remaining % 26)));
    remaining = Math.floor(remaining / 26) - 1;
  }
  while (chars.length < 3) {
    chars.unshift('A');
  }
  return chars.join('');
}

export function D(value: Decimal | number | string): Decimal {
  if (value instanceof Decimal) return value;
  return new Decimal(value);
}

export function setNotationMode(mode: NotationMode): void {
  currentNotation = mode;
}

export function getNotationMode(): NotationMode {
  return currentNotation;
}

export function toggleNotationMode(): NotationMode {
  currentNotation = currentNotation === 'suffix' ? 'scientific' : 'suffix';
  return currentNotation;
}

export function formatBigNumber(val: Decimal | number | string, forceScientific = false): string {
  if (val === null || val === undefined) return '0';
  const d = D(val);
  if (Number.isNaN(d.mantissa) || !Number.isFinite(d.mantissa) || !Number.isFinite(d.exponent)) {
    return '0';
  }

  if (d.lt(0)) {
    return '-' + formatBigNumber(d.abs(), forceScientific);
  }

  if (d.lt(1000)) {
    const num = d.toNumber();
    if (num > 0 && num < 10 && !Number.isInteger(num)) {
      return num.toFixed(1);
    }
    return Number.isInteger(num) ? num.toString() : num.toFixed(1);
  }

  if (currentNotation === 'scientific' || forceScientific) {
    const exp = d.exponent;
    const mantissa = d.mantissa;
    return `${mantissa.toFixed(2)}e${exp}`;
  }

  const exp = d.exponent;
  let suffixIndex = Math.floor(exp / 3);
  const scale = Math.pow(10, exp % 3);
  let scaled = d.mantissa * scale;

  // Evita erro de arredondamento onde 999.995+ renderizaria como "1000.00 K"
  if (scaled >= 999.995) {
    scaled /= 1000;
    suffixIndex += 1;
  }

  const suffix = getSuffix(suffixIndex);
  return `${scaled.toFixed(2)} ${suffix}`.trim();
}

