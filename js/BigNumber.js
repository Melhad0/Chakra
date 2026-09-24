/**
 * BigNumber.js - High-Level Math & Formatting Abstraction Layer
 * Encapsulates Decimal calculations, serialization and dual-mode formatting.
 */

import { Decimal } from './break_infinity.js';

export { Decimal };

export function D(val) {
    if (val instanceof Decimal) return val;
    return new Decimal(val);
}

export const SUFFIXES = [
    "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc",
    "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nvd", "Vg",
    "Uvg", "Dvg", "Tvg", "Qavg", "Qivg", "Sxvg", "Spvg", "Ocvg", "Nvg", "Tg",
    "Utg", "Dtg", "Ttg", "Qatg", "Qitg", "Sxtg", "Sptg", "Octg", "Nvtg", "Qd",
    "Uqd", "Dqd", "Tqd", "Qaqd", "Qiqd", "Sxqd", "Spqd", "Ocqd", "Nvqd", "Qid"
];

let notationMode = "suffix"; // "suffix" or "scientific"

export function setNotationMode(mode) {
    if (mode === "scientific" || mode === "suffix") {
        notationMode = mode;
        try {
            localStorage.setItem("chakra_notation", mode);
        } catch (_) {}
    }
}

export function getNotationMode() {
    return notationMode;
}

// Load saved notation preference
try {
    const saved = localStorage.getItem("chakra_notation");
    if (saved) notationMode = saved;
} catch (_) {}

/**
 * Modular Number Formatter supporting Standard Suffixes and Scientific Notation
 */
export function formatBigNumber(val, decimals = 2) {
    const d = D(val);

    if (d.isZero()) return "0";
    if (d.lt(0)) return "-" + formatBigNumber(d.abs(), decimals);

    // If small number (< 1,000)
    if (d.lt(1000)) {
        const num = d.toNumber();
        return num % 1 === 0 ? num.toLocaleString("pt-BR") : num.toFixed(decimals).replace(/\.?0+$/, "");
    }

    if (notationMode === "scientific" || d.exponent >= SUFFIXES.length * 3) {
        const m = d.mantissa.toFixed(decimals);
        return `${m}e+${d.exponent}`;
    }

    const tier = Math.floor(d.exponent / 3);
    if (tier < SUFFIXES.length) {
        const divisor = Math.pow(10, d.exponent % 3);
        const scaled = (d.mantissa * divisor).toFixed(decimals).replace(/\.00$/, "");
        return `${scaled} ${SUFFIXES[tier]}`;
    }

    return `${d.mantissa.toFixed(decimals)}e+${d.exponent}`;
}

export function serializeBigNumber(val) {
    return D(val).toString();
}

export function deserializeBigNumber(val, fallback = 0) {
    if (val === undefined || val === null || val === "") return D(fallback);
    return D(val);
}
