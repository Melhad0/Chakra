import Decimal from 'break_infinity.js';

export type NotationMode = 'suffix' | 'scientific';

let currentNotation: NotationMode = 'suffix';

const SUFFIXES = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
  'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg',
  'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg', 'Tg',
  'UTg', 'DTg', 'TTg', 'QaTg', 'QiTg', 'SxTg', 'SpTg', 'OcTg', 'NoTg', 'Qd',
  'UQd', 'DQd', 'TQd', 'QaQd', 'QiQd', 'SxQd', 'SpQd', 'OcQd', 'NoQd', 'Qn',
  'SxG', 'SpG', 'OcG', 'NoG', 'Cent'
];

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
  const d = D(val);
  if (Number.isNaN(d.mantissa) || !Number.isFinite(d.mantissa) || !Number.isFinite(d.exponent)) {
    return '0';
  }

  if (d.lt(1000)) {
    const num = d.toNumber();
    return num < 10 && num > 0 && !Number.isInteger(num)
      ? num.toFixed(1)
      : Math.floor(num).toString();
  }

  if (currentNotation === 'scientific' || forceScientific) {
    const exp = d.exponent;
    const mantissa = d.mantissa;
    return `${mantissa.toFixed(2)}e${exp}`;
  }

  const exp = d.exponent;
  const suffixIndex = Math.floor(exp / 3);

  if (suffixIndex < SUFFIXES.length) {
    const scale = Math.pow(10, exp % 3);
    const scaled = d.mantissa * scale;
    return `${scaled.toFixed(2)} ${SUFFIXES[suffixIndex]}`;
  }

  return `${d.mantissa.toFixed(2)}e${exp}`;
}
